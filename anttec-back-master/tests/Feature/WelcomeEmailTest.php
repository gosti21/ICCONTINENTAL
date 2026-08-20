<?php

use App\Events\UserRegistered;
use App\Jobs\SendWelcomeEmail;
use App\Listeners\SendWelcomeEmailListener;
use App\Mail\Api\v1\WelcomeEmail;
use App\Models\User;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;

it('tiene registrado el listener del evento de usuario registrado', function () {
    Event::assertListening(UserRegistered::class, SendWelcomeEmailListener::class);
});

it('despacha el trabajo de bienvenida cuando un usuario se registra', function () {
    Bus::fake();

    $user = User::factory()->make(['email' => 'cliente@example.com']);

    (new SendWelcomeEmailListener())->handle(new UserRegistered($user));

    Bus::assertDispatched(SendWelcomeEmail::class, function (SendWelcomeEmail $job) use ($user) {
        return $job->user->is($user);
    });
});

it('envía el correo de bienvenida a la dirección del usuario', function () {
    Mail::fake();

    $user = User::factory()->make(['email' => 'cliente@example.com']);

    (new SendWelcomeEmail($user))->handle();

    Mail::assertSent(WelcomeEmail::class, function (WelcomeEmail $mail) use ($user) {
        return $mail->hasTo($user->email) && $mail->user->is($user);
    });
});
