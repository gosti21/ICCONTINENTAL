<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('phones')
            ->where('number', '964645037')
            ->update(['number' => '906660509']);
    }

    public function down(): void
    {
        DB::table('phones')
            ->where('number', '906660509')
            ->update(['number' => '964645037']);
    }
};
