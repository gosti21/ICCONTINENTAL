<?php

namespace App\Services\Api\v1\integrations;

use App\Models\Order;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ApisPeruService
{
    public function generateVoucher(Order $order, array $customerData, string $voucherType): array
    {
        if (! $this->hasConfig()) {
            return [
                'success' => false,
                'error' => 'Configuracion APIsPERU incompleta. Define APISPERU_TOKEN y APISPERU_RUC.',
            ];
        }

        try {
            $payload = $this->buildPayload($order, $customerData, $voucherType);
            $client = Http::baseUrl(rtrim((string) config('integrations.apisperu.base_url'), '/'))
                ->withToken((string) config('integrations.apisperu.token'))
                ->acceptJson()
                ->timeout(60);

            $sendResponse = $client->post('invoice/send', $payload);

            if (! $sendResponse->successful()) {
                return $this->apiError($sendResponse->status(), $sendResponse->json(), $sendResponse->body());
            }

            $sendResult = $sendResponse->json();
            if (data_get($sendResult, 'success') === false || data_get($sendResult, 'cdrResponse.accepted') === false) {
                return [
                    'success' => false,
                    'error' => (string) (data_get($sendResult, 'error.message')
                        ?? data_get($sendResult, 'cdrResponse.description')
                        ?? 'APIsPERU rechazo el comprobante'),
                ];
            }

            $pdfResponse = $client->post('invoice/pdf', $payload);
            if (! $pdfResponse->successful()) {
                return $this->apiError($pdfResponse->status(), $pdfResponse->json(), $pdfResponse->body());
            }

            $fileName = sprintf(
                'vouchers/%s-%s.pdf',
                strtolower($voucherType),
                $order->order_number
            );
            $pdfContent = $pdfResponse->body();
            Storage::disk('public')->put($fileName, $pdfContent);
            $publicUrl = route('vouchers.download', ['order' => $order->id]);

            $order->voucher()->updateOrCreate([
                'order_id' => $order->id,
            ], [
                'type' => $voucherType,
                'voucher_number' => $order->order_number,
                'path' => $publicUrl,
                'content' => base64_encode($pdfContent),
                'order_id' => $order->id,
            ]);

            return ['success' => true, 'path' => $publicUrl];
        } catch (ConnectionException $e) {
            Log::error('No se pudo conectar con APIsPERU', ['order_id' => $order->id, 'error' => $e->getMessage()]);

            return ['success' => false, 'error' => 'No se pudo conectar con APIsPERU.'];
        } catch (\Throwable $e) {
            Log::error('Error al emitir comprobante en APIsPERU', ['order_id' => $order->id, 'error' => $e->getMessage()]);

            return ['success' => false, 'error' => 'Error APIsPERU: '.$e->getMessage()];
        }
    }

    protected function hasConfig(): bool
    {
        return filled(config('integrations.apisperu.base_url'))
            && filled(config('integrations.apisperu.token'))
            && filled(config('integrations.apisperu.ruc'));
    }

    protected function buildPayload(Order $order, array $customerData, string $voucherType): array
    {
        $order->loadMissing('branchVariants.variant');

        $details = [];
        $taxable = 0.0;
        $igv = 0.0;
        $saleValue = 0.0;

        foreach ($order->branchVariants as $item) {
            $price = (float) $item->pivot->unit_price;
            $quantity = (float) $item->pivot->quantity;
            $unitValue = round($price / 1.18, 6);
            $itemValue = round($unitValue * $quantity, 2);
            $itemIgv = round(($price * $quantity) - $itemValue, 2);

            $taxable += $itemValue;
            $igv += $itemIgv;
            $saleValue += $itemValue;

            $details[] = [
                'unidad' => 'NIU',
                'cantidad' => $quantity,
                'codProducto' => (string) $item->pivot->variant_sku,
                'descripcion' => (string) $item->variant->getFullNameAttribute(),
                'mtoValorUnitario' => $unitValue,
                'mtoPrecioUnitario' => $price,
                'mtoBaseIgv' => $itemValue,
                'porcentajeIgv' => 18,
                'igv' => $itemIgv,
                'tipAfeIgv' => '10',
                'totalImpuestos' => $itemIgv,
                'mtoValorVenta' => $itemValue,
            ];
        }

        $shipping = round((float) $order->shipment_cost, 2);
        $taxable = round($taxable, 2);
        $igv = round($igv, 2);
        $total = round($taxable + $igv + $shipping, 2);

        return [
            'ublVersion' => '2.1',
            'tipoOperacion' => '0101',
            'tipoDoc' => $this->mapVoucherType($voucherType),
            'serie' => $this->series($voucherType, (string) $order->type_sale),
            'correlativo' => (string) $this->orderNumber((string) $order->order_number),
            'fechaEmision' => now()->format('Y-m-d\TH:i:sP'),
            'formaPago' => ['moneda' => 'PEN', 'tipo' => 'Contado'],
            'tipoMoneda' => 'PEN',
            'client' => [
                'tipoDoc' => $this->mapDocumentType((string) ($customerData['document_type'] ?? 'DNI')),
                'numDoc' => (string) ($customerData['document_number'] ?? ''),
                'rznSocial' => data_get($customerData, 'customer.business_name')
                    ?: trim((string) data_get($customerData, 'customer.name', '').' '.(string) data_get($customerData, 'customer.last_name', '')),
                'address' => ['direccion' => (string) data_get($customerData, 'customer.tax_address', '')],
                'email' => (string) data_get($customerData, 'customer.email', ''),
            ],
            'company' => $this->company(),
            'mtoOperGravadas' => $taxable,
            'mtoIGV' => $igv,
            'totalImpuestos' => $igv,
            'valorVenta' => round($saleValue, 2),
            'subTotal' => round($taxable + $igv, 2),
            'sumOtrosCargos' => $shipping,
            'mtoImpVenta' => $total,
            'details' => $details,
            'legends' => [['code' => '1000', 'value' => 'SON '.number_format($total, 2, '.', '').' SOLES']],
        ];
    }

    protected function company(): array
    {
        return [
            'ruc' => (string) config('integrations.apisperu.ruc'),
            'razonSocial' => (string) config('integrations.apisperu.razon_social'),
            'nombreComercial' => (string) config('integrations.apisperu.nombre_comercial'),
            'address' => [
                'ubigueo' => (string) config('integrations.apisperu.ubigeo'),
                'departamento' => (string) config('integrations.apisperu.departamento'),
                'provincia' => (string) config('integrations.apisperu.provincia'),
                'distrito' => (string) config('integrations.apisperu.distrito'),
                'direccion' => (string) config('integrations.apisperu.direccion'),
            ],
        ];
    }

    protected function mapVoucherType(string $type): string
    {
        return strtolower($type) === 'factura' ? '01' : '03';
    }

    protected function mapDocumentType(string $type): string
    {
        return match (strtoupper($type)) {
            'RUC' => '6',
            'CE', 'CARNET_EXTRANJERIA' => '4',
            default => '1',
        };
    }

    protected function series(string $voucherType, string $saleType): string
    {
        $document = strtolower($voucherType) === 'factura' ? 'factura' : 'boleta';
        $channel = $saleType === 'online' ? 'online' : 'store';

        return (string) config("integrations.apisperu.serie_{$document}_{$channel}");
    }

    protected function orderNumber(string $orderNumber): int
    {
        $number = preg_replace('/[^0-9]/', '', $orderNumber);

        return (int) ltrim((string) $number, '0') ?: 1;
    }

    protected function apiError(int $status, mixed $json, string $body): array
    {
        $message = is_array($json)
            ? data_get($json, 'error.message', data_get($json, 'message'))
            : null;

        return [
            'success' => false,
            'error' => 'APIsPERU HTTP '.$status.': '.($message ?: $body),
        ];
    }
}
