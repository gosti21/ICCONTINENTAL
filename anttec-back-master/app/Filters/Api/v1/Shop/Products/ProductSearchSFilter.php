<?php

namespace App\Filters\Api\v1\Shop\Products;

use Closure;

class ProductSearchSFilter
{
    public function handle($query, Closure $next)
    {
        $search = trim((string) request('search', ''));

        if ($search !== '') {
            $term = '%'.mb_strtolower($search).'%';

            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(model) LIKE ?', [$term])
                    ->orWhereHas('brand', fn ($brand) =>
                        $brand->whereRaw('LOWER(name) LIKE ?', [$term])
                    )
                    ->orWhereHas('variants', fn ($variant) =>
                        $variant->whereRaw('LOWER(sku) LIKE ?', [$term])
                    );
            });
        }

        return $next($query);
    }
}
