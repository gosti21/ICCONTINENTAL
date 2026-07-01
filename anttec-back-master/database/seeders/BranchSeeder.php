<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Prefix;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $branch = Branch::firstOrCreate([
            'name' => 'Sucursal Principal',
            'email' => 'anttecshop@gmail.com',
        ]);

        $preix = Prefix::first();

        if ($branch->phone === null) {
            $branch->phone()->create([
                'number' => 964645037,
                'prefix_id' => $preix->id
            ]);
        }
    }
}