<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('business_name', 200)->nullable()->change();
            $table->string('tax_address', 250)->nullable()->change();
        });
    }

    public function down(): void
    {
        // No se reducen las columnas para evitar truncar razones sociales
        // o direcciones fiscales que ya hayan sido almacenadas.
    }
};
