<?php

namespace App\Http\Controllers\Api\v1\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\CarbonInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardMController extends Controller
{
    public function show(): JsonResponse
    {
        $now = now();
        $todayStart = $now->copy()->startOfDay();
        $todayEnd = $now->copy()->endOfDay();

        $todayOrders = $this->paidOrdersBetween($todayStart, $todayEnd);

        $inventory = DB::table('branch_variant')
            ->join('variants', 'branch_variant.variant_id', '=', 'variants.id')
            ->selectRaw('COALESCE(SUM(branch_variant.stock), 0) as total_units')
            ->selectRaw('COALESCE(SUM(branch_variant.stock * variants.purcharse_price), 0) as estimated_value')
            ->selectRaw('SUM(CASE WHEN branch_variant.stock > 0 AND branch_variant.stock <= branch_variant.stock_min THEN 1 ELSE 0 END) as low_stock')
            ->selectRaw('SUM(CASE WHEN branch_variant.stock = 0 THEN 1 ELSE 0 END) as out_of_stock')
            ->first();

        $weekStart = $now->copy()->startOfWeek();
        $weekEnd = $now->copy()->endOfWeek();
        $previousWeekStart = $weekStart->copy()->subWeek();
        $previousWeekEnd = $weekEnd->copy()->subWeek();

        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();
        $previousMonthStart = $monthStart->copy()->subMonthNoOverflow()->startOfMonth();
        $previousMonthEnd = $monthStart->copy()->subMonthNoOverflow()->endOfMonth();

        $weeklySales = $this->paidSalesBetween($weekStart, $weekEnd);
        $previousWeeklySales = $this->paidSalesBetween($previousWeekStart, $previousWeekEnd);
        $monthlySales = $this->paidSalesBetween($monthStart, $monthEnd);
        $previousMonthlySales = $this->paidSalesBetween($previousMonthStart, $previousMonthEnd);

        $topProducts = DB::table('order_detail')
            ->join('orders', 'order_detail.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->where('orders.created_at', '>=', $now->copy()->subDays(30))
            ->select('order_detail.product_name as name')
            ->selectRaw('SUM(order_detail.quantity) as quantity')
            ->selectRaw('SUM(order_detail.subtotal) as sales')
            ->groupBy('order_detail.product_name')
            ->orderByDesc('quantity')
            ->limit(5)
            ->get()
            ->map(fn ($product) => [
                'name' => $product->name,
                'quantity' => (int) $product->quantity,
                'sales' => round((float) $product->sales, 2),
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'today' => [
                    'sales' => round((float) $todayOrders->sum('total'), 2),
                    'orders' => $todayOrders->count(),
                    'items_sold' => (int) DB::table('order_detail')
                        ->join('orders', 'order_detail.order_id', '=', 'orders.id')
                        ->where('orders.payment_status', 'paid')
                        ->whereBetween('orders.created_at', [$todayStart, $todayEnd])
                        ->sum('order_detail.quantity'),
                ],
                'inventory' => [
                    'total_units' => (int) ($inventory->total_units ?? 0),
                    'low_stock' => (int) ($inventory->low_stock ?? 0),
                    'out_of_stock' => (int) ($inventory->out_of_stock ?? 0),
                    'estimated_value' => round((float) ($inventory->estimated_value ?? 0), 2),
                ],
                'comparisons' => [
                    'week' => $this->comparison($weeklySales, $previousWeeklySales),
                    'month' => $this->comparison($monthlySales, $previousMonthlySales),
                ],
                'daily_sales' => $this->lastSevenDays(),
                'top_products' => $topProducts,
                'generated_at' => $now->toIso8601String(),
            ],
        ]);
    }

    private function paidOrdersBetween(CarbonInterface $from, CarbonInterface $to)
    {
        return Order::query()
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->get(['id', 'total']);
    }

    private function paidSalesBetween(CarbonInterface $from, CarbonInterface $to): float
    {
        return (float) Order::query()
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->sum('total');
    }

    private function comparison(float $current, float $previous): array
    {
        $percentage = $previous > 0
            ? (($current - $previous) / $previous) * 100
            : ($current > 0 ? 100 : 0);

        return [
            'current' => round($current, 2),
            'previous' => round($previous, 2),
            'percentage_change' => round($percentage, 2),
        ];
    }

    private function lastSevenDays(): array
    {
        $days = [];

        for ($offset = 6; $offset >= 0; $offset--) {
            $date = now()->subDays($offset);
            $days[] = [
                'date' => $date->toDateString(),
                'label' => $date->locale('es')->isoFormat('dd'),
                'sales' => round($this->paidSalesBetween(
                    $date->copy()->startOfDay(),
                    $date->copy()->endOfDay(),
                ), 2),
            ];
        }

        return $days;
    }
}
