<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('email', 'anttecshop@gmail.com')
            ->update(['email' => 'superadmin@gmail.com']);

        DB::table('branches')
            ->where('email', 'anttecshop@gmail.com')
            ->update(['email' => 'superadmin@gmail.com']);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('email', 'superadmin@gmail.com')
            ->update(['email' => 'anttecshop@gmail.com']);

        DB::table('branches')
            ->where('email', 'superadmin@gmail.com')
            ->update(['email' => 'anttecshop@gmail.com']);
    }
};
