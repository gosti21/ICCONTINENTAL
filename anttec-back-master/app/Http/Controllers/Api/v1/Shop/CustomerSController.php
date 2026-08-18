<?php

namespace App\Http\Controllers\Api\v1\Shop;

use App\Exceptions\IdentityLookupException;
use App\Http\Controllers\Controller;
use App\Services\Api\v1\Shop\CustomerSService;
use Illuminate\Http\Request;

class CustomerSController extends Controller
{
    public function __construct(
        protected CustomerSService $service
    ) {}

    public function searchDNI(string $dni)
    {
        if (!preg_match('/^\d{8}$/', $dni)) {
            return response()->json([
                'status'   => false,
                'message' => 'El DNI debe tener exactamente 8 dígitos',
            ], 422);
        }

        try {
            $result = $this->service->getByCustomerDNI($dni);
        } catch (IdentityLookupException $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 424);
        }

        // 👇 HTTP status según resultado
        $httpStatus = $result['status'] ? 200 : 404;

        return response()->json($result, $httpStatus);
    }

    public function searchRUC(string $ruc)
    {
        if (!preg_match('/^\d{11}$/', $ruc)) {
            return response()->json([
                'status'   => false,
                'message' => 'El RUC debe tener exactamente 11 dígitos',
            ], 422);
        }

        try {
            $result = $this->service->getBYCustomerRUC($ruc);
        } catch (IdentityLookupException $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 424);
        }

        // 👇 HTTP status según resultado
        $httpStatus = $result['status'] ? 200 : 404;

        return response()->json($result, $httpStatus);
    }
}
