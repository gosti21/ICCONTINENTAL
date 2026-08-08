<?php

namespace App\Services\Api\v1\integrations;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SearchDNIService
{
    public function searchDNI(string $dni): ?array
    {
        if (! filled(config('integrations.apisnet.token'))) {
            Log::warning('Consulta DNI no configurada: falta APISNET_TOKEN');

            return null;
        }

        try {
            $response = Http::baseUrl(rtrim((string) config('integrations.apisnet.base_url'), '/'))
                ->withToken((string) config('integrations.apisnet.token'))
                ->acceptJson()
                ->withHeaders(['Referer' => 'https://apis.net.pe/api-consulta-dni'])
                ->connectTimeout(8)
                ->timeout(15)
                ->get('reniec/dni', ['numero' => $dni]);

            if (! $response->successful()) {
                Log::warning('APIS.NET rechazo la consulta DNI', [
                    'dni' => $dni,
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
                'name' => $responseData['nombres'] ?? null,
                'last_name' => trim(
                    ($responseData['apellidoPaterno'] ?? '').' '.
                    ($responseData['apellidoMaterno'] ?? '')
                ),
                'document_number' => $responseData['numeroDocumento'] ?? $dni,
            ];
        } catch (ConnectionException $e) {
            Log::error("No se pudo conectar con APIS.NET para consultar DNI {$dni}: {$e->getMessage()}");

            return null;
        } catch (\Throwable $e) {
            Log::error("APIS.NET error DNI {$dni}: {$e->getMessage()}");

            return null;
        }
    }
}
