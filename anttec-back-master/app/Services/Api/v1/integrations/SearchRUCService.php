<?php

namespace App\Services\Api\v1\integrations;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SearchRUCService
{
    public function searchRUC(string $ruc): ?array
    {
        if (! filled(config('integrations.apisnet.token'))) {
            Log::warning('Consulta RUC no configurada: falta APISNET_TOKEN');

            return null;
        }

        try {
            $response = Http::baseUrl(rtrim((string) config('integrations.apisnet.base_url'), '/'))
                ->withToken((string) config('integrations.apisnet.token'))
                ->acceptJson()
                ->withHeaders(['Referer' => 'https://apis.net.pe/api-consulta-ruc'])
                ->connectTimeout(8)
                ->timeout(15)
                ->get('sunat/ruc', ['numero' => $ruc]);

            if (! $response->successful()) {
                Log::warning('APIS.NET rechazo la consulta RUC', [
                    'ruc' => $ruc,
                    'status' => $response->status(),
                    'message' => $response->json('message'),
                ]);

                return null;
            }

            $responseData = $response->json();
            if (! is_array($responseData)) {
                return null;
            }

            return [
                'business_name' => $responseData['razonSocial'] ?? $responseData['nombre'] ?? null,
                'tax_address' => $responseData['direccion'] ?? null,
                'document_number' => $responseData['numeroDocumento'] ?? $ruc,
            ];
        } catch (ConnectionException $e) {
            Log::error("No se pudo conectar con APIS.NET para consultar RUC {$ruc}: {$e->getMessage()}");

            return null;
        } catch (\Throwable $e) {
            Log::error("APIS.NET error RUC {$ruc}: {$e->getMessage()}");

            return null;
        }
    }
}
