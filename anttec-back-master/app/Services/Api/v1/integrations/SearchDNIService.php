<?php

namespace App\Services\Api\v1\integrations;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SearchDNIService
{
    public function searchDNI(string $dni): ?array
    {
        if (! filled(config('integrations.apisperu_lookup.token'))) {
            Log::warning('Consulta DNI no configurada: falta APISPERU_LOOKUP_TOKEN');

            return null;
        }

        try {
            $response = Http::baseUrl(rtrim((string) config('integrations.apisperu_lookup.base_url'), '/'))
                ->withToken((string) config('integrations.apisperu_lookup.token'))
                ->acceptJson()
                ->asJson()
                ->connectTimeout(8)
                ->timeout(15)
                ->post('dni', ['dni' => $dni]);

            if (! $response->successful()) {
                Log::warning('APIsPerú rechazó la consulta DNI', [
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

            if (($responseData['success'] ?? false) !== true || ! is_array($responseData['data'] ?? null)) {
                Log::warning('APIsPerú no encontró datos para el DNI', [
                    'dni' => $dni,
                    'message' => $responseData['message'] ?? null,
                ]);

                return null;
            }

            $payload = $responseData['data'];

            $name = trim((string) ($payload['nombres'] ?? $payload['name'] ?? ''));
            $lastName = trim((string) ($payload['apellidoCompleto'] ?? $payload['apellidos'] ?? $payload['last_name'] ?? ''));

            if ($lastName === '') {
                $lastName = trim(
                    (string) ($payload['apellidoPaterno'] ?? $payload['apellido_paterno'] ?? '').' '.
                    (string) ($payload['apellidoMaterno'] ?? $payload['apellido_materno'] ?? '')
                );
            }

            if ($name === '' || $lastName === '') {
                Log::warning('Proveedor DNI respondió sin nombres completos', [
                    'dni' => $dni,
                    'response_keys' => array_keys($payload),
                ]);

                return null;
            }

            return [
                'name' => $name,
                'last_name' => $lastName,
                'document_number' => (string) ($payload['numeroDocumento'] ?? $payload['numero_documento'] ?? $dni),
            ];
        } catch (ConnectionException $e) {
            Log::error("No se pudo conectar con APIsPerú para consultar DNI {$dni}: {$e->getMessage()}");

            return null;
        } catch (\Throwable $e) {
            Log::error("APIsPerú error DNI {$dni}: {$e->getMessage()}");

            return null;
        }
    }
}
