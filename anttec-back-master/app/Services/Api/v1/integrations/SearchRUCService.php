<?php

namespace App\Services\Api\v1\integrations;

use App\Exceptions\IdentityLookupException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SearchRUCService
{
    public function searchRUC(string $ruc): ?array
    {
        if (! filled(config('integrations.apisperu_lookup.token'))) {
            Log::warning('Consulta RUC no configurada: falta APISPERU_LOOKUP_TOKEN');

            throw new IdentityLookupException('La consulta de RUC no está configurada en el servidor.');
        }

        try {
            $response = Http::baseUrl(rtrim((string) config('integrations.apisperu_lookup.base_url'), '/'))
                ->withToken((string) config('integrations.apisperu_lookup.token'))
                ->acceptJson()
                ->asJson()
                ->connectTimeout(8)
                ->timeout(15)
                ->post('ruc', ['ruc' => $ruc]);

            if (! $response->successful()) {
                Log::warning('APIsPerú rechazó la consulta RUC', [
                    'ruc' => $ruc,
                    'status' => $response->status(),
                    'message' => $response->json('message'),
                ]);

                if (in_array($response->status(), [401, 403], true)) {
                    throw new IdentityLookupException('APIsPerú rechazó el token configurado para consultar RUC.');
                }

                throw new IdentityLookupException('APIsPerú no está disponible para consultar RUC en este momento.');
            }

            $responseData = $response->json();
            if (! is_array($responseData)) {
                return null;
            }

            if (($responseData['success'] ?? false) !== true || ! is_array($responseData['data'] ?? null)) {
                Log::warning('APIsPerú no encontró datos para el RUC', [
                    'ruc' => $ruc,
                    'message' => $responseData['message'] ?? null,
                ]);

                return null;
            }

            $payload = $responseData['data'];
            $businessName = trim((string) ($payload['nombre_o_razon_social'] ?? $payload['razon_social'] ?? ''));
            $taxAddress = trim((string) ($payload['direccion_completa'] ?? $payload['direccion'] ?? ''));

            if ($businessName === '') {
                Log::warning('APIsPerú respondió sin razón social', ['ruc' => $ruc]);

                return null;
            }

            return [
                'business_name' => $businessName,
                'tax_address' => $taxAddress,
                'document_number' => (string) ($payload['ruc'] ?? $ruc),
            ];
        } catch (ConnectionException $e) {
            Log::error("No se pudo conectar con APIsPerú para consultar RUC {$ruc}: {$e->getMessage()}");

            throw new IdentityLookupException('No se pudo conectar con APIsPerú para consultar el RUC.', previous: $e);
        } catch (IdentityLookupException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error("APIsPerú error RUC {$ruc}: {$e->getMessage()}");

            throw new IdentityLookupException('Ocurrió un error al consultar el RUC en APIsPerú.', previous: $e);
        }
    }
}
