<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Contracts\Api\v1\Shop\ShipmentSInterface;
use Illuminate\Support\Facades\Log;

class CreateShipmentListener
{
    /**
     * Número de intentos del listener
     */
    /**
     * Create the event listener.
     */
    public function __construct(
        private readonly ShipmentSInterface $repository,
    ) {}

    /**
     * Handle the event.
     */
    public function handle(OrderCreated $event): void
    {
        $this->repository->create($event->dataShipment);
    }

    public function failed(OrderCreated $event, \Throwable $exception): void
    {
        Log::error('Error en el listener de creación del envio', [
            'order_id' => $event->order->id,
            'error' => $exception->getMessage()
        ]);
    }
}
