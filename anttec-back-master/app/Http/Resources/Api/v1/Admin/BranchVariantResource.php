<?php

namespace App\Http\Resources\Api\v1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class BranchVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'stock' => $this->stock,
            'stock_min' => $this->stock_min,
            'sku' => $this->variant?->sku,
            'selling_price' => $this->variant?->selling_price,
            'status' => $this->variant?->status,
            'product' => $this->whenLoaded('variant', function () {
                return [
                    'id' => $this->variant->product->id,
                    'variant_id' => $this->variant->id,
                    'name' => $this->variant->product->name,
                    'model' => $this->variant->product->model,
                    'brand' => $this->variant->product->brand?->name,
                    'status' => $this->variant->product->status,
                ];
            }),
            'features' => $this->whenLoaded('variant', function () {
                return $this->variant->optionProductValues->map(fn ($feature) => [
                    'id' => $feature->option_value_id,
                    'description' => $feature->optionValue->description,
                ]);
            }),
            'image' => $this->whenLoaded('variant', function () {
                $image = $this->variant->images->first();
                return $image ? Storage::url($image->path) : null;
            }),
        ];
    }
}
