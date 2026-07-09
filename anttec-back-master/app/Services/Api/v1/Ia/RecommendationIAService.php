<?php

namespace App\Services\Api\v1\Ia;

use App\Contracts\Api\v1\Ia\ProductIaInterface;
use App\Http\Resources\Api\v1\Ia\ProductIaResource;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RecommendationIAService
{
    private ?string $aiApiUrl;
    private ?string $openAiKey;
    private string $openAiBaseUrl;
    private string $openAiModel;

    public function __construct(
        private ProductIaInterface $repository
    ) {
        // URL de tu API Python (desde .env)
        $this->aiApiUrl = config('integrations.ia.url_ia');
        $this->openAiKey = config('services.openai.api_key');
        $this->openAiBaseUrl = config('services.openai.base_url', 'https://api.openai.com/v1');
        $this->openAiModel = config('services.openai.model', 'gpt-3.5-turbo');
    }

    /**
     * Envía una consulta al sistema de IA para obtener recomendaciones.
     *
    * @param string $query Consulta del usuario ("necesito pernos M12 para maquinaria pesada")
     * @param string|null $conversationId ID de conversación (para seguimiento)
     * @return array Respuesta de la IA
     */
    public function recommend(string $query, ?string $conversationId = null): array
    {
        $queryLower = Str::lower($query);

        if ($this->isMostExpensiveIntent($queryLower)) {
            return $this->buildPriceExtremeResponse($query, $conversationId, true);
        }

        if ($this->isCheapestIntent($queryLower)) {
            return $this->buildPriceExtremeResponse($query, $conversationId, false);
        }

        $queryTokens = $this->tokenizeQuery($query);
        $requestedLimit = $this->resolveRequestedLimit($queryLower);

        $inStockRecommendations = $this->buildLocalRecommendations($query, $requestedLimit, true);
        $similarWithoutStock = $this->buildLocalRecommendations($query, min(3, $requestedLimit), false);

        if (empty($inStockRecommendations) && !empty($similarWithoutStock)) {
            return [
                'type' => 'local_similar_no_stock',
                'message' => $this->buildNoStockAlternativeMessage($similarWithoutStock, $query),
                'products' => $similarWithoutStock,
                'conversation_id' => $conversationId ?: Str::uuid()->toString(),
                'question_count' => 1,
            ];
        }

        $localRecommendations = $inStockRecommendations;

        if (empty($localRecommendations)) {
            return [
                'type' => 'local_no_match',
                'message' => $this->buildLocalMessage([], $query),
                'products' => [],
                'conversation_id' => $conversationId ?: Str::uuid()->toString(),
                'question_count' => 1,
            ];
        }

        $compatibilityQuestion = $this->buildCompatibilityQuestion($queryLower, $queryTokens);
        if ($compatibilityQuestion) {
            return [
                'type' => 'local_consultative',
                'message' => $this->buildConsultativeMessage($localRecommendations, $query, $compatibilityQuestion),
                'products' => $localRecommendations,
                'conversation_id' => $conversationId ?: Str::uuid()->toString(),
                'question_count' => 1,
            ];
        }

        try {
            if ($this->openAiKey) {
                $response = Http::timeout(160)
                    ->withHeaders([
                        'Authorization' => "Bearer {$this->openAiKey}",
                        'Content-Type' => 'application/json',
                    ])
                    ->post("{$this->openAiBaseUrl}/chat/completions", [
                        'model' => $this->openAiModel,
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'Eres un asesor comercial de FERREBOM especializado en pernos, tuercas, arandelas y maquinaria pesada. Responde en espanol y SOLO puedes recomendar productos listados en el catalogo entregado. No inventes productos ni especificaciones.',
                            ],
                            [
                                'role' => 'user',
                                'content' => $this->buildOpenAiPrompt($query, $localRecommendations),
                            ],
                        ],
                        'temperature' => 0.7,
                        'max_tokens' => 500,
                    ]);

                if ($response->failed()) {
                    Log::error('OpenAI API Error', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);

                    throw new Exception('Error al comunicarse con OpenAI');
                }

                $responseData = $response->json();
                $message = data_get($responseData, 'choices.0.message.content', 'No se recibió respuesta de OpenAI.');

                return [
                    'type' => 'openai',
                    'message' => trim($message),
                    'products' => $localRecommendations,
                    'conversation_id' => $conversationId ?: Str::uuid()->toString(),
                    'question_count' => 1,
                ];
            }

            if ($this->aiApiUrl) {
                $response = Http::timeout(160)
                    ->post("{$this->aiApiUrl}/recommend", [
                        'query' => $query,
                        'conversation_id' => $conversationId,
                    ]);

                if ($response->failed()) {
                    Log::error('AI API Error', [
                        'status' => $response->status(),
                        'body' => $response->body()
                    ]);

                    throw new Exception('Error al comunicarse con el sistema de IA');
                }

                $external = $response->json();

                return [
                    'type' => data_get($external, 'type', 'local'),
                    'message' => data_get($external, 'message', $this->buildLocalMessage($localRecommendations, $query)),
                    'products' => data_get($external, 'products') ?: $localRecommendations,
                    'conversation_id' => data_get($external, 'conversation_id', $conversationId ?: Str::uuid()->toString()),
                    'question_count' => data_get($external, 'question_count', 1),
                ];
            }

            return [
                'type' => 'local',
                'message' => $this->buildLocalMessage($localRecommendations, $query),
                'products' => $localRecommendations,
                'conversation_id' => $conversationId ?: Str::uuid()->toString(),
                'question_count' => 1,
            ];
        } catch (Exception $e) {
            Log::error('AI Recommendation Error', [
                'message' => $e->getMessage(),
                'query' => $query
            ]);

            return [
                'type' => 'local_fallback',
                'message' => $this->buildLocalMessage($localRecommendations, $query),
                'products' => $localRecommendations,
                'conversation_id' => $conversationId ?: Str::uuid()->toString(),
                'question_count' => 1,
            ];
        }
    }

    protected function buildLocalRecommendations(string $query, int $limit = 4, bool $onlyInStock = true): array
    {
        $tokens = $this->tokenizeQuery($query);
        $queryLower = Str::lower($query);
        $isUpgradeIntent = $this->isUpgradeIntent($queryLower);
        $queryContext = $this->buildQueryContext($queryLower, $tokens);
        $products = $this->repository->getAllForAI();

        $scored = $products->map(function ($product) use ($tokens, $isUpgradeIntent, $queryContext) {
            $name = (string) $product->name;
            $model = (string) $product->model;
            $brand = (string) ($product->brand?->name ?? '');
            $category = (string) ($product->subcategory?->category?->name ?? '');
            $subcategory = (string) ($product->subcategory?->name ?? '');
            $description = (string) ($product->description ?? '');

            $fields = [
                'name' => Str::lower($name),
                'model' => Str::lower($model),
                'brand' => Str::lower($brand),
                'category' => Str::lower($category),
                'subcategory' => Str::lower($subcategory),
                'description' => Str::lower($description),
            ];

            $score = 0.0;
            $relevanceSignals = 0;
            $reasons = [];

            foreach ($tokens as $token) {
                if (str_contains($fields['name'], $token)) {
                    $score += 3.0;
                    $relevanceSignals++;
                    $reasons[] = "coincide en nombre ({$token})";
                    continue;
                }

                if (str_contains($fields['brand'], $token) || str_contains($fields['model'], $token)) {
                    $score += 2.5;
                    $relevanceSignals++;
                    $reasons[] = "coincide en marca/modelo ({$token})";
                    continue;
                }

                if (str_contains($fields['category'], $token) || str_contains($fields['subcategory'], $token)) {
                    $score += 2.0;
                    $relevanceSignals++;
                    $reasons[] = "coincide en categoria ({$token})";
                    continue;
                }

                if (str_contains($fields['description'], $token)) {
                    $score += 1.2;
                    $relevanceSignals++;
                    $reasons[] = "coincide en descripcion ({$token})";
                }
            }

            $specText = Str::lower($product->specifications->pluck('pivot.value')->implode(' '));
            $featuresText = Str::lower(
                $product->variants
                    ->flatMap(fn ($variant) => $variant->optionProductValues)
                    ->map(fn ($feature) => (string) ($feature->optionValue->description ?? ''))
                    ->implode(' ')
            );

            foreach ($tokens as $token) {
                if (str_contains($specText, $token)) {
                    $score += 1.2;
                    $relevanceSignals++;
                    $reasons[] = "coincide en especificaciones ({$token})";
                }

                if (str_contains($featuresText, $token)) {
                    $score += 1.0;
                    $relevanceSignals++;
                    $reasons[] = "coincide en caracteristicas ({$token})";
                }
            }

            $categoryAffinity = $this->calculateCategoryAffinity($fields, $specText, $featuresText, $queryContext);
            if ($categoryAffinity > 0) {
                $score += $categoryAffinity;
                $relevanceSignals++;
                $reasons[] = 'coincide con el tipo de producto que buscas';
            }

            if ($isUpgradeIntent) {
                $performanceScore = $this->estimatePerformanceScore($specText . ' ' . $featuresText);
                if ($performanceScore > 0) {
                    $score += $performanceScore;
                    $reasons[] = 'tiene especificaciones de mayor rendimiento';
                }
            }

            $variants = $product->variants->map(function ($variant) {
                return [
                    'id' => (int) $variant->id,
                    'sku' => (string) $variant->sku,
                    'price' => (float) $variant->selling_price,
                    'stock' => (int) $variant->branches->sum('pivot.stock'),
                    'features' => $variant->optionProductValues->map(function ($feature) {
                        return [
                            'option' => (string) ($feature->optionValue->option->name ?? ''),
                            'value' => (string) ($feature->optionValue->description ?? ''),
                            'type' => (string) ($feature->optionValue->option->type ?? ''),
                        ];
                    })->values()->toArray(),
                ];
            })->values()->toArray();

            $specifications = $product->specifications->map(function ($spec) {
                return [
                    'name' => (string) $spec->name,
                    'value' => (string) ($spec->pivot->value ?? ''),
                ];
            })->values()->toArray();

            $stockTotal = collect($variants)->sum('stock');
            if ($stockTotal > 0) {
                $score += 0.6;
            } else {
                $score -= 0.8;
            }

            $normalized = min(99, (int) round($score * 12));

            return [
                'id' => (int) $product->id,
                'name' => $name,
                'model' => $model,
                'description' => $description,
                'brand' => $brand ?: 'Sin marca',
                'category' => $category ?: 'Sin categoria',
                'subcategory' => $subcategory ?: 'Sin subcategoria',
                'specifications' => $specifications,
                'variants' => $variants,
                'similarity_score' => round($score, 2),
                'match_score' => $normalized,
                'relevance_signals' => $relevanceSignals,
                'match_reason' => $this->buildMatchReason($reasons),
            ];
        });

        $best = $scored
            ->sortByDesc('match_score')
            ->filter(fn ($item) => $item['match_score'] > 0)
            ->filter(fn ($item) => ($item['relevance_signals'] ?? 0) > 0)
            ->when(
                $onlyInStock,
                fn ($collection) => $collection->filter(fn ($item) => collect($item['variants'] ?? [])->sum('stock') > 0)
            )
            ->take($limit)
            ->values();

        if ($best->isNotEmpty()) {
            return $best->all();
        }

        return [];
    }

    protected function tokenizeQuery(string $query): array
    {
        $rawTokens = preg_split('/\\s+/u', Str::lower(trim($query))) ?: [];

        $stopWords = [
            'de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas',
            'para', 'por', 'con', 'sin', 'que', 'quiero', 'necesito', 'busco',
            'me', 'mi', 'y', 'o', 'en', 'es', 'al', 'a'
        ];

        return collect($rawTokens)
            ->map(fn ($token) => preg_replace('/[^\\p{L}\\p{N}]/u', '', (string) $token))
            ->filter(fn ($token) => filled($token) && mb_strlen($token) >= 2)
            ->reject(fn ($token) => in_array($token, $stopWords, true))
            ->flatMap(function ($token) {
                $expanded = [$token];

                if (in_array($token, ['perno', 'pernos', 'tuerca', 'tuercas', 'arandela', 'arandelas'], true)) {
                    $expanded = [...$expanded, 'rosca', 'diametro', 'metrico', 'mm', 'grado', '8.8', '10.9', '12.9'];
                }

                if (in_array($token, ['maquinaria', 'pesada', 'industrial'], true)) {
                    $expanded = [...$expanded, 'alta resistencia', 'grado', 'structural', 'estructural', 'ansi', 'din', 'iso'];
                }

                if (in_array($token, ['inoxidable', 'galvanizado', 'acero'], true)) {
                    $expanded = [...$expanded, 'material', 'corrosion', 'resistencia'];
                }

                if (in_array($token, ['din', 'iso', 'sae', 'ansi', 'astm'], true)) {
                    $expanded = [...$expanded, 'norma', 'estandar', 'estándar'];
                }

                if (in_array($token, ['88', '109', '129', '88.', '10.9', '12.9'], true)) {
                    $expanded = [...$expanded, 'grado', 'resistencia'];
                }

                return $expanded;
            })
            ->unique()
            ->values()
            ->all();
    }

    protected function isUpgradeIntent(string $query): bool
    {
        return $this->hasAnyKeyword($query, [
            'mas resistente', 'más resistente', 'mayor resistencia', 'grado superior', 'mas fuerte', 'más fuerte',
            'alto torque', 'trabajo pesado', 'maquinaria pesada', 'industrial'
        ]);
    }

    protected function hasAnyKeyword(string $text, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }

        return false;
    }

    protected function buildQueryContext(string $queryLower, array $tokens): array
    {
        $keywordGroups = [
            'pernos' => ['perno', 'pernos', 'bulon', 'esparrago', 'espárrago', 'anclaje'],
            'tuercas' => ['tuerca', 'tuercas', 'contratuerca', 'autofrenante'],
            'arandelas' => ['arandela', 'arandelas', 'plana', 'presion', 'presión'],
            'rosca_y_medida' => ['rosca', 'metrico', 'm6', 'm8', 'm10', 'm12', 'm16', 'paso', 'diametro', 'diametro'],
            'material' => ['acero', 'inoxidable', 'galvanizado', 'zincado'],
            'resistencia' => ['grado', '88', '109', '129', 'alta resistencia', 'estructural'],
            'normativa' => ['din', 'iso', 'sae', 'ansi', 'astm', 'norma', 'estandar', 'estándar'],
            'maquinaria_pesada' => ['maquinaria', 'pesada', 'excavadora', 'retroexcavadora', 'tractor', 'industrial'],
        ];

        $flatKeywords = [];
        foreach ($keywordGroups as $groupKeywords) {
            foreach ($groupKeywords as $keyword) {
                if (str_contains($queryLower, $keyword) || in_array($keyword, $tokens, true)) {
                    $flatKeywords[] = $keyword;
                }
            }
        }

        return [
            'keywords' => array_values(array_unique($flatKeywords)),
        ];
    }

    protected function calculateCategoryAffinity(array $fields, string $specText, string $featuresText, array $queryContext): float
    {
        $score = 0.0;
        $keywords = $queryContext['keywords'] ?? [];

        if (empty($keywords)) {
            return $score;
        }

        $fieldText = implode(' ', [
            $fields['name'] ?? '',
            $fields['model'] ?? '',
            $fields['brand'] ?? '',
            $fields['category'] ?? '',
            $fields['subcategory'] ?? '',
            $fields['description'] ?? '',
        ]);

        foreach ($keywords as $keyword) {
            if (str_contains($fieldText, $keyword)) {
                $score += 1.8;
            }

            if (str_contains($specText, $keyword)) {
                $score += 0.8;
            }

            if (str_contains($featuresText, $keyword)) {
                $score += 0.7;
            }
        }

        return $score;
    }

    protected function estimatePerformanceScore(string $text): float
    {
        $score = 0.0;

        if (preg_match_all('/(\d{1,3})\s?gb/u', $text, $gbMatches)) {
            $maxGb = max(array_map('intval', $gbMatches[1]));
            $score += min(2.5, $maxGb / 16);
        }

        if (preg_match_all('/(\d{3,5})\s?mhz/u', $text, $mhzMatches)) {
            $maxMhz = max(array_map('intval', $mhzMatches[1]));
            $score += min(2.0, max(0, ($maxMhz - 2400) / 1200));
        }

        if (str_contains($text, 'ddr5')) {
            $score += 1.5;
        } elseif (str_contains($text, 'ddr4')) {
            $score += 0.7;
        }

        return $score;
    }

    protected function buildMatchReason(array $reasons): string
    {
        if (empty($reasons)) {
            return 'Producto sugerido por disponibilidad en catalogo';
        }

        return 'Te lo sugiero porque ' . implode(', ', array_slice(array_unique($reasons), 0, 2)) . '.';
    }

    protected function buildLocalMessage(array $products, string $query): string
    {
        if (empty($products)) {
            return 'Por el momento no contamos con ese producto en nuestro catalogo, pero puedes mirar nuestros productos por si te animas por algo mas.';
        }

        $first = $products[0];
        $price = collect($first['variants'] ?? [])->min('price');
        $priceText = is_numeric($price) ? ' desde S/ ' . number_format((float) $price, 2) : '';

        $topSpecs = collect($first['specifications'] ?? [])
            ->filter(fn ($spec) => filled($spec['name'] ?? null) && filled($spec['value'] ?? null))
            ->take(2)
            ->map(fn ($spec) => ($spec['name'] ?? '') . ': ' . ($spec['value'] ?? ''))
            ->implode(' | ');

        $specText = $topSpecs ? " Especificaciones clave: {$topSpecs}." : '';

        return sprintf(
            'Para "%s" te sugiero %s%s.%s Tambien te dejo opciones similares de tu catalogo para que compares rendimiento/precio.',
            $query,
            $first['name'] ?? 'este producto',
            $priceText,
            $specText
        );
    }

    protected function buildNoStockAlternativeMessage(array $products, string $query): string
    {
        $first = $products[0] ?? null;

        if (!$first) {
            return 'Por el momento no contamos con ese producto en stock, pero puedes mirar nuestros productos por si te animas por algo mas.';
        }

        $brand = $first['brand'] ?? 'esa marca';
        $name = $first['name'] ?? 'este articulo';

        return sprintf(
            'Hay varios tipos para "%s" y te recomendaria revisar opciones de %s. Por el momento no contamos con stock inmediato, pero un articulo con especificaciones similares es %s y podria servirte como referencia tecnica para pernos/tuercas.',
            $query,
            $brand,
            $name
        );
    }

    protected function buildCompatibilityQuestion(string $queryLower, array $tokens): ?string
    {
        $hasFastenerIntent = $this->hasAnyKeyword($queryLower, [
            'perno', 'pernos', 'tuerca', 'tuercas', 'arandela', 'arandelas', 'bulon', 'espárrago', 'esparrago'
        ]) || count(array_intersect($tokens, ['perno', 'pernos', 'tuerca', 'tuercas', 'arandela', 'arandelas'])) > 0;

        if ($hasFastenerIntent) {
            $hasTechnicalData = $this->hasAnyKeyword($queryLower, [
                'm6', 'm8', 'm10', 'm12', 'm16', 'mm', 'pulg', 'rosca', 'paso', 'grado', 'material', 'inoxidable', 'galvanizado',
                'din', 'iso', 'sae', 'ansi', 'astm', '8.8', '10.9', '12.9'
            ]);

            if (!$hasTechnicalData) {
                return 'Para recomendarte el perno o tuerca correcto, confirmame medida (ej. M10x50), tipo de rosca, grado de resistencia, material y norma (DIN/ISO/SAE si aplica).';
            }
        }

        if ($this->hasAnyKeyword($queryLower, ['maquinaria', 'pesada', 'excavadora', 'retroexcavadora', 'tractor'])) {
            $hasMachineData = $this->hasAnyKeyword($queryLower, ['modelo', 'marca', 'aplicacion', 'aplicación', 'torque', 'grado', 'din', 'iso', 'sae']);
            if (!$hasMachineData) {
                return 'Para maquinaria pesada, dime marca/modelo del equipo, aplicacion del perno (chasis, balde, brazo, etc.), grado y norma tecnica requerida.';
            }
        }

        return null;
    }

    protected function buildConsultativeMessage(array $products, string $query, string $compatibilityQuestion): string
    {
        $baseMessage = $this->buildLocalMessage($products, $query);

        return $baseMessage . ' ' . $compatibilityQuestion;
    }

    protected function buildOpenAiPrompt(string $query, array $products): string
    {
        $catalogSummary = collect($products)
            ->map(function ($product) {
                $price = collect($product['variants'] ?? [])->min('price');
                $priceText = is_numeric($price) ? 'S/ ' . number_format((float) $price, 2) : 'precio no disponible';

                return sprintf(
                    '- %s (%s) %s, %s. %s',
                    $product['name'] ?? 'Producto',
                    $product['brand'] ?? 'Sin marca',
                    $priceText,
                    $product['subcategory'] ?? 'Sin subcategoria',
                    $product['match_reason'] ?? ''
                );
            })
            ->implode("\n");

        return "Consulta del cliente: {$query}\n" .
            "Productos recomendados desde base de datos:\n{$catalogSummary}\n" .
                'Responde con recomendacion breve, clara y tecnica orientada al rubro de pernos, tuercas, arandelas y maquinaria pesada. Prioriza compatibilidad (medida, rosca, grado, material, aplicacion). Usa unicamente productos del listado y no inventes datos.';
    }

    protected function isMostExpensiveIntent(string $queryLower): bool
    {
        return $this->hasAnyKeyword($queryLower, [
            'mas caro', 'más caro', 'mayor precio', 'precio mas alto', 'precio más alto', 'el mas caro', 'el más caro'
        ]);
    }

    protected function isCheapestIntent(string $queryLower): bool
    {
        return $this->hasAnyKeyword($queryLower, [
            'mas barato', 'más barato', 'menor precio', 'precio mas bajo', 'precio más bajo', 'el mas barato', 'el más barato',
            'economico', 'económico'
        ]);
    }

    protected function buildPriceExtremeResponse(string $query, ?string $conversationId, bool $highest): array
    {
        $products = $this->buildCatalogProductsForChat(true);

        if (empty($products)) {
            return [
                'type' => 'local_no_match',
                'message' => $this->buildLocalMessage([], $query),
                'products' => [],
                'conversation_id' => $conversationId ?: Str::uuid()->toString(),
                'question_count' => 1,
            ];
        }

        $sorted = collect($products)->sortBy(function ($product) use ($highest) {
            $prices = collect($product['variants'] ?? [])->pluck('price')->filter(fn ($price) => is_numeric($price));
            if ($prices->isEmpty()) {
                return $highest ? PHP_INT_MIN : PHP_INT_MAX;
            }

            return $highest ? -1 * $prices->max() : $prices->min();
        })->values();

        $selected = $sorted->first();
        $selectedPrices = collect($selected['variants'] ?? [])->pluck('price')->filter(fn ($price) => is_numeric($price));
        $selectedPrice = $highest ? $selectedPrices->max() : $selectedPrices->min();
        $priceText = is_numeric($selectedPrice) ? number_format((float) $selectedPrice, 2) : '0.00';

        $intro = $highest
            ? 'El producto de mayor precio disponible actualmente es'
            : 'El producto de menor precio disponible actualmente es';

        return [
            'type' => $highest ? 'local_max_price' : 'local_min_price',
            'message' => "{$intro} {$selected['name']} {$selected['model']}, con precio de S/ {$priceText}. Te dejo el atajo para abrir el producto y comprar.",
            'products' => [$selected],
            'conversation_id' => $conversationId ?: Str::uuid()->toString(),
            'question_count' => 1,
        ];
    }

    protected function buildCatalogProductsForChat(bool $onlyInStock = true): array
    {
        $products = $this->repository->getAllForAI();

        $mapped = $products->map(function ($product) {
            $name = (string) $product->name;
            $model = (string) $product->model;
            $brand = (string) ($product->brand?->name ?? 'Sin marca');
            $category = (string) ($product->subcategory?->category?->name ?? 'Sin categoria');
            $subcategory = (string) ($product->subcategory?->name ?? 'Sin subcategoria');
            $description = (string) ($product->description ?? '');

            $variants = $product->variants->map(function ($variant) {
                return [
                    'id' => (int) $variant->id,
                    'sku' => (string) $variant->sku,
                    'price' => (float) $variant->selling_price,
                    'stock' => (int) $variant->branches->sum('pivot.stock'),
                    'features' => $variant->optionProductValues->map(function ($feature) {
                        return [
                            'option' => (string) ($feature->optionValue->option->name ?? ''),
                            'value' => (string) ($feature->optionValue->description ?? ''),
                            'type' => (string) ($feature->optionValue->option->type ?? ''),
                        ];
                    })->values()->toArray(),
                ];
            })->values()->toArray();

            $specifications = $product->specifications->map(function ($spec) {
                return [
                    'name' => (string) $spec->name,
                    'value' => (string) ($spec->pivot->value ?? ''),
                ];
            })->values()->toArray();

            return [
                'id' => (int) $product->id,
                'name' => $name,
                'model' => $model,
                'description' => $description,
                'brand' => $brand,
                'category' => $category,
                'subcategory' => $subcategory,
                'specifications' => $specifications,
                'variants' => $variants,
                'similarity_score' => 0,
                'match_score' => 100,
                'relevance_signals' => 1,
                'match_reason' => 'Resultado consultado directamente desde el catalogo por precio.',
            ];
        });

        if ($onlyInStock) {
            $mapped = $mapped->filter(fn ($item) => collect($item['variants'] ?? [])->sum('stock') > 0);
        }

        return $mapped->values()->all();
    }

    protected function resolveRequestedLimit(string $queryLower): int
    {
        if (
            str_contains($queryLower, 'solo 1') ||
            str_contains($queryLower, 'una sugerencia') ||
            str_contains($queryLower, 'solo una') ||
            str_contains($queryLower, 'solo un producto')
        ) {
            return 1;
        }

        if (preg_match('/(\d+)\s+(sugerencia|sugerencias|producto|productos)/u', $queryLower, $matches)) {
            $requested = (int) ($matches[1] ?? 4);
            return max(1, min(6, $requested));
        }

        return 4;
    }

    /**
     * Sincroniza el catálogo completo con la IA.
     *
     * @return array Resultado de la sincronización
     */
    public function syncCatalog(): array
    {
        if (!$this->aiApiUrl) {
            throw new Exception('IA_API_URL no está configurado para sincronizar catálogo externo.');
        }

        try {
            // 1. Obtener todos los productos
            $products = $this->repository->getAllForAI();

            // 2. Transformar a formato AI
            $productsData = ProductIaResource::collection($products)->resolve();

            Log::info('Sincronizando catálogo con IA', [
                'total_products' => count($productsData)
            ]);

            // 3. Enviar a Python
            $response = Http::timeout(240) // 2 minutos para catálogos grandes
                ->post("{$this->aiApiUrl}/sync-catalog", [
                    'products' => $productsData
                ]);

            if ($response->failed()) {
                throw new Exception('Error al sincronizar catálogo: ' . $response->body());
            }

            $result = $response->json();

            Log::info('Catálogo sincronizado exitosamente', $result);

            return $result;
        } catch (Exception $e) {
            Log::error('Catalog Sync Error', [
                'message' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Sincroniza un producto específico con la IA.
     *
     * Útil cuando se crea/edita un solo producto.
     */
    public function syncProduct(int $productId): void
    {
        try {
            // En lugar de sincronizar solo 1, re-sincronizamos todo
            // Es más simple y asegura consistencia
            $this->syncCatalog();
        } catch (Exception $e) {
            Log::error('Product Sync Error', [
                'product_id' => $productId,
                'message' => $e->getMessage()
            ]);

            // No lanzamos excepción para no bloquear la creación/edición del producto
            // Solo logueamos el error
        }
    }
}
