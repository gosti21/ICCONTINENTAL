<?php

namespace Database\Seeders;

use App\Models\Prefix;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'anttecshop@gmail.com'],
            [
                'name' => 'Jhonny Stevens',
                'last_name' => 'Romero Linares',
                'password' => Hash::make('admin12R@'),
            ]
        );

        if ($user->employee === null) {
            $employee = $user->employee()->create([
                'salary' => '1500.00',
                'position' => 'admin',
                'branch_id' => 1,
            ]);

            $employee->documentNumber()->create([
                'number' => '71695916',
                'document_type_id' => 1
            ]);

            $preix = Prefix::first();

            $employee->phone()->create([
                'number' => 964645037,
                'prefix_id' => $preix->id
            ]);
        }
    }
}