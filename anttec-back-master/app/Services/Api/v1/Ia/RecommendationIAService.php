<?php

namespace App\Services\Api\v1\Ia;

use App\Contracts\Api\v1\Ia\ProductIaInterface;
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
     * @param string $query Consulta del usuario ("necesito un mouse gaming")
     * @param string|null $conversationId ID de conversación (para seguimiento)
     * @return array Respuesta de la IA
     */
    public function recommend(string $query, ?string $conversationId = null): array
    {
        $queryLower = Str::lower($query);
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
                                'content' => 'Eres un asistente de ventas especializado en recomendacion de productos informaticos. Responde en espanol y SOLO puedes recomendar productos listados en el catalogo entregado. No inventes productos ni caracteristicas.',
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

                if (in_array($token, ['memoria', 'ram'], true)) {
                    $expanded = [...$expanded, 'ram', 'memoria', 'ddr4', 'ddr5', 'mhz', 'gb'];
                }

                if (in_array($token, ['potente', 'rendimiento', 'rapida', 'rapido', 'mejor'], true)) {
                    $expanded = [...$expanded, 'rendimiento', 'rapido', 'frecuencia', 'mhz', 'latencia'];
                }

                if (in_array($token, ['gaming', 'gamer'], true)) {
                    $expanded = [...$expanded, 'gaming', 'gamer', 'rgb'];
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
            'mas potente', 'más potente', 'mas rapido', 'más rápido', 'mejor',
            'upgrade', 'actualizar', 'rendir', 'rendimiento', 'superior', 'mas fuerte', 'más fuerte'
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
            'ram' => ['ram', 'memoria', 'ddr4', 'ddr5', 'sodimm', 'dimm'],
            'almacenamiento' => ['ssd', 'nvme', 'm2', 'sata', 'hdd', 'disco'],
            'procesador' => ['procesador', 'cpu', 'ryzen', 'intel', 'core', 'i3', 'i5', 'i7', 'i9'],
            'gpu' => ['gpu', 'grafica', 'video', 'rtx', 'gtx', 'radeon'],
            'placa_madre' => ['placa', 'motherboard', 'mainboard', 'am4', 'am5', 'lga'],
            'fuente' => ['fuente', 'psu', 'watt', '80plus', 'bronze', 'gold'],
            'monitor' => ['monitor', 'pantalla', 'ips', 'hz', '144hz', '240hz'],
            'mouse' => ['mouse', 'raton', 'dpi'],
            'teclado' => ['teclado', 'keyboard', 'mecanico', 'switch'],
            'audio' => ['audifono', 'headset', 'auricular', 'microfono'],
            'laptop' => ['laptop', 'notebook', 'portatil'],
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
            'Hay varios tipos para "%s" y te recomendaria revisar opciones de %s. Por el momento no contamos con stock inmediato, pero un articulo con especificaciones similares es %s y podria servirte como referencia tecnica.',
            $query,
            $brand,
            $name
        );
    }

    protected function buildCompatibilityQuestion(string $queryLower, array $tokens): ?string
    {
        $hasRamIntent = $this->hasAnyKeyword($queryLower, ['ram', 'memoria'])
            || count(array_intersect($tokens, ['ram', 'memoria', 'ddr4', 'ddr5', 'sodimm', 'dimm'])) > 0;

        if ($hasRamIntent) {
            $hasRamCompatibilityData = $this->hasAnyKeyword($queryLower, [
                'ddr3', 'ddr4', 'ddr5', 'sodimm', 'dimm', 'laptop', 'notebook', 'portatil',
                'desktop', 'escritorio', 'pc de escritorio'
            ]);

            if (!$hasRamCompatibilityData) {
                return 'Antes de recomendarte la mejor RAM, dime si es para laptop o PC de escritorio y que tipo soporta tu placa (DDR4 o DDR5).';
            }
        }

        $hasStorageIntent = $this->hasAnyKeyword($queryLower, ['ssd', 'hdd', 'disco', 'almacenamiento', 'nvme']);
        if ($hasStorageIntent) {
            $hasStorageCompatibilityData = $this->hasAnyKeyword($queryLower, ['m2', 'm.2', 'nvme', 'sata', 'pcie', '2.5']);
            if (!$hasStorageCompatibilityData) {
                return 'Para recomendarte mejor almacenamiento, confirmame si buscas M.2 NVMe o SSD/HDD SATA de 2.5 pulgadas.';
            }
        }

        $hasCpuIntent = $this->hasAnyKeyword($queryLower, ['procesador', 'cpu', 'intel', 'ryzen']);
        if ($hasCpuIntent) {
            $hasCpuCompatibilityData = $this->hasAnyKeyword($queryLower, ['am4', 'am5', 'lga1200', 'lga1700', 'socket']);
            if (!$hasCpuCompatibilityData) {
                return 'Para evitar incompatibilidades, indicame el socket de tu placa madre (por ejemplo AM4, AM5 o LGA1700).';
            }
        }

        $hasMotherboardIntent = $this->hasAnyKeyword($queryLower, ['placa', 'placa madre', 'motherboard', 'mainboard']);
        if ($hasMotherboardIntent) {
            $hasMotherboardData = $this->hasAnyKeyword($queryLower, ['am4', 'am5', 'lga', 'ddr4', 'ddr5', 'chipset']);
            if (!$hasMotherboardData) {
                return 'Para sugerirte una placa madre correcta, cuentame que procesador usaras y si tu RAM es DDR4 o DDR5.';
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
                'Responde con recomendacion breve, clara y tecnica orientada a compra. Si el cliente pide algo mas potente, explica mejora de rendimiento y compatibilidad de forma simple. Usa unicamente productos del listado. No afirmes que algo es "lo mas nuevo del mercado" si ese dato no existe explicitamente en el catalogo.';
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
