<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use App\Mail\Api\v1\WelcomeEmail;
use App\Models\User;
use Symfony\Component\Console\Command\Command;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:test-welcome {email}', function (string $email) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->error('La dirección de correo no es válida.');

        return Command::FAILURE;
    }

    $user = new User([
        'name' => 'Usuario de prueba',
        'last_name' => 'Correo',
        'email' => $email,
    ]);

    Mail::to($email)->send(new WelcomeEmail($user));

    $this->info("Correo de bienvenida enviado a {$email}.");

    return Command::SUCCESS;
})->purpose('Envía un correo real para comprobar la configuración de bienvenida');
