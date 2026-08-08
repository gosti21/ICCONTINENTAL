<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Voucher extends Model
{
    protected $fillable = [
        'type',
        'voucher_number',
        'path',
        'order_id',
    ];

    protected function path(): Attribute
    {
        return Attribute::make(
            get: function (?string $value): ?string {
                if (! $value || Str::startsWith($value, ['http://', 'https://'])) {
                    return $value;
                }

                return rtrim((string) config('app.url'), '/').'/'.ltrim($value, '/');
            },
        );
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
