<?php

namespace App\Services\Api\v1\integrations;

use App\Exceptions\IdentityLookupException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SearchDNIService
{
    public function searchDNI(string $dni): ?array
    {
        if (! filled(config('integrations.apisperu_lookup.token'))) {
            Log::warning('Consulta DNI no configurada: falta APISPERU_LOOKUP_TOKEN');

            throw new IdentityLookupException('La consulta de DNI no está configurada en el servidor.');
        }

        try {
            $response = Http::baseUrl(rtrim((string) config('integrations.apisperu_lookup.base_url'), '/'))
                ->acceptJson()
                ->connectTimeout(8)
                ->timeout(15)
                ->get("dni/{$dni}", [
                    'token' => (string) config('integrations.apisperu_lookup.token'),
                ]);

            if (! $response->successful()) {
                Log::warning('APIsPerú rechazó la consulta DNI', [
                    'dni' => $dni,
                    'status' => $response->status(),
                    'message' => $response->json('message'),
                ]);

                if (in_array($response->status(), [401, 403], true)) {
                    throw new IdentityLookupException('APIsPerú rechazó el token configurado para consultar DNI.');
                }

                throw new IdentityLookupException('APIsPerú no está disponible para consultar DNI en este momento.');
            }

            $responseData = $response->json();
            if (! is_array($responseData)) {
                return null;
            }

            if (array_key_exists('success', $responseData) && $responseData['success'] !== true) {
                Log::warning('APIsPerú no encontró datos para el DNI', [
                    'dni' => $dni,
                    'message' => $responseData['message'] ?? null,
                ]);

                return null;
            }

            $payload = is_array($responseData['data'] ?? null)
                ? $responseData['data']
                : $responseData;

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
                'document_number' => (string) ($payload['dni'] ?? $payload['numeroDocumento'] ?? $payload['numero_documento'] ?? $dni),
            ];
        } catch (ConnectionException $e) {
            Log::error("No se pudo conectar con APIsPerú para consultar DNI {$dni}: {$e->getMessage()}");

            throw new IdentityLookupException('No se pudo conectar con APIsPerú para consultar el DNI.', previous: $e);
        } catch (IdentityLookupException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error("APIsPerú error DNI {$dni}: {$e->getMessage()}");

            throw new IdentityLookupException('Ocurrió un error al consultar el DNI en APIsPerú.', previous: $e);
        }
    }
}
