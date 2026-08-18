<?php

namespace App\Services\Api\v1\Auth;

use App\Contracts\Api\v1\Auth\AuthInterface;
use App\Events\UserRegistered;
use App\Exceptions\Api\v1\Auth\InvalidCredentialsException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthService
{
    public function __construct(
        protected AuthInterface $repository
    ){}

    public function login (array $credentials): array
    {
        $user = $this->repository->finByEmail($credentials['email']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw new InvalidCredentialsException();
        }

        // Revocar tokens anteriores
        /* $user->tokens()->delete(); */

        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $user,
        ];
    }

    public function logout ($user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function register (array $data): array
    {
        $user = $this->repository->register($data);
        $token = $user->createToken('api-token')->plainTextToken;

        try {
            event(new UserRegistered($user));
        } catch (\Throwable $exception) {
            // La cuenta ya fue creada. Un fallo temporal del proveedor de
            // correo no debe convertir el registro en un error ni provocar
            // que el usuario vuelva a intentarlo con el mismo email.
            Log::error('La cuenta fue creada, pero no se pudo enviar el correo de confirmación', [
                'user_id' => $user->id,
                'error' => $exception->getMessage(),
            ]);
        }

        return [
            'token' => $token,
            'user' => $user,
        ];
    }
}
