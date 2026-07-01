<?php

namespace Database\Seeders;

use App\Models\Prefix;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PrefixSeeder extends Seeder
{
    public function run(): void
    {
        Prefix::firstOrCreate([
            'prefix' => '51'
        ]);
    }
}