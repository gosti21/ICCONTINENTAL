<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const VALUES = "'pending', 'preparing', 'ready_for_pickup', 'dispatched', 'in_transit', 'delivered', 'picked_up', 'failed', 'returned', 'cancelled'";

    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_status_check');
            DB::statement('ALTER TABLE shipments ADD CONSTRAINT shipments_status_check CHECK (status IN ('.self::VALUES.'))');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE shipments MODIFY status ENUM('.self::VALUES.") NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        // No se eliminan valores para evitar invalidar envios ya recogidos.
    }
};
