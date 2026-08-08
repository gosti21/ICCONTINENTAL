<?php

namespace App\Jobs;

use App\Mail\Api\v1\VoucherEmail;
use App\Models\Order;
use App\Models\User;
use App\Services\Api\v1\integrations\ElectronicInvoiceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SendVoucherEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Número de intentos del job
     */
    public $tries = 5;

    /**
     * Tiempo de espera antes de reintentar (en segundos)
     */
    public $backoff = [60, 120, 300, 450, 600];

    /**
     * Create a new job instance.
     */
    public function __construct(
        public User $user,
        public Order $order,
        public array $dataVoucher,
        public string $voucherType
    ) {
        $this->onQueue('emails');
    }

    /**
     * Execute the job.
     */
    public function handle(ElectronicInvoiceService $electronicInvoiceService): void
    {
        try {
            $voucher = $this->order->voucher;
            if (! $voucher || ! $voucher->path) {
                // 9. GENERAR COMPROBANTE EN NUBEFACT
                $voucherResult = $electronicInvoiceService->generateVoucher(
                    $this->order,
                    [
                        'document_type' => $this->dataVoucher['document_type'],
                        'document_number' => $this->dataVoucher['document_number'],
                        'customer' => $this->dataVoucher['customer'],
                    ],
                    $this->voucherType
                );

                if (! $voucherResult['success']) {
                    // Log el error pero no fallar la transacción
                    Log::error('Error generando comprobante NubeFact', [
                        'order_id' => $this->order->id,
                        'error' => $voucherResult['error'],
                    ]);

                    throw new \Exception('No se pudo generar el comprobante: '.($voucherResult['error'] ?? 'Error desconocido'));
                }

                $this->order->refresh();
                $voucher = $this->order->voucher;
            }

            // 3. VALIDAR QUE TENGAMOS LA URL DEL PDF
            if (! $voucher || ! $voucher->path) {
                throw new \Exception('No se encontró la URL del comprobante después de generarlo');
            }

            // Los comprobantes generados por APIsPERU se guardan localmente.
            // Esto tambien soporta registros anteriores cuya ruta sea relativa.
            if ($voucher->content) {
                $pdfContent = base64_decode((string) $voucher->content, true);
                if ($pdfContent === false) {
                    throw new \RuntimeException('El contenido almacenado del comprobante no es valido');
                }
            } else {
                $storagePath = $this->publicStoragePath((string) $voucher->path);
            }

            if (! isset($pdfContent) && $storagePath !== null && Storage::disk('public')->exists($storagePath)) {
                $pdfContent = Storage::disk('public')->get($storagePath);
            } elseif (! isset($pdfContent)) {
                $client = new \GuzzleHttp\Client([
                    'timeout' => 30,
                    'connect_timeout' => 10,
                    'http_errors' => true,
                ]);

                $pdfUrl = Str::startsWith((string) $voucher->path, ['http://', 'https://'])
                    ? (string) $voucher->path
                    : url((string) $voucher->path);
                $response = $client->get($pdfUrl);
                $pdfContent = $response->getBody()->getContents();
            }

            // 7. ENVIAR EMAIL CON EL PDF ADJUNTO
            Mail::to($this->user->email)->send(
                new VoucherEmail($pdfContent, $this->order)
            );

        } catch (\GuzzleHttp\Exception\ConnectException $e) {
            // Error de conexión - probablemente NubeFact no disponible
            Log::error('Error de conexión al descargar PDF de NubeFact', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Reintentar
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            // Error HTTP (404, 500, etc)
            Log::error('Error HTTP al descargar PDF de NubeFact', [
                'order_id' => $this->order->id,
                'status_code' => $e->getResponse()?->getStatusCode(),
                'error' => $e->getMessage(),
            ]);

            // Si es 404, tal vez el PDF aún no está listo
            if ($e->getResponse()?->getStatusCode() === 404) {
                Log::warning('PDF no encontrado (404), probablemente aún no está listo', [
                    'order_id' => $this->order->id,
                ]);
            }

            throw $e; // Reintentar
        } catch (\Exception $e) {
            Log::error('Error general al procesar envío de voucher', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e; // Reintentar
        }
    }

    protected function publicStoragePath(string $voucherPath): ?string
    {
        $path = parse_url($voucherPath, PHP_URL_PATH);
        if (! is_string($path) || ! Str::startsWith($path, '/storage/')) {
            return null;
        }

        return Str::after($path, '/storage/');
    }

    /**
     * Manejar el fallo del job
     */
    public function failed(\Throwable $exception): void
    {
        // Aquí puedes registrar el error o notificar a los administradores
        Log::error('Error al enviar correo del voucher', [
            'order_id' => $this->order->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
