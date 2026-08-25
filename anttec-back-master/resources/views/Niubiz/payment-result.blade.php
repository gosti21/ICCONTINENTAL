<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $success ? 'Pago Exitoso' : 'Error en el Pago' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            position: relative;
            background-image:
                linear-gradient(135deg, rgba(8, 15, 24, 0.76), rgba(20, 20, 20, 0.58)),
                url('/images/payment-machinery-bg.png');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            color: #172033;
        }

        body::before {
            content: '';
            position: fixed;
            inset: 0;
            pointer-events: none;
            background-image: linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
            background-size: 44px 44px;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
            body {
                background-image:
                    linear-gradient(135deg, rgba(3, 8, 15, 0.84), rgba(15, 15, 15, 0.68)),
                    url('/images/payment-machinery-bg.png');
                color: #f3f4f6;
            }

            .card {
                background: rgba(17, 24, 39, 0.96) !important;
                border-color: rgba(245, 158, 11, 0.3) !important;
            }

            .info-box {
                background: #374151 !important;
                border-color: #4b5563 !important;
            }

            .button {
                background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%) !important;
                color: #111827 !important;
            }

            .button:hover {
                background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%) !important;
            }

            .button.secondary {
                background: transparent !important;
                color: #e5e7eb !important;
                border-color: #4b5563 !important;
            }
        }

        .container {
            max-width: 680px;
            width: 100%;
            position: relative;
            z-index: 1;
        }

        .card {
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid rgba(255, 255, 255, 0.52);
            border-radius: 1.5rem;
            box-shadow: 0 32px 80px rgba(0, 0, 0, 0.48);
            backdrop-filter: blur(16px);
            overflow: hidden;
            animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .header {
            padding: 2.2rem 2rem 2rem;
            text-align: center;
            position: relative;
        }

        .header.success {
            background: linear-gradient(145deg, #111827 0%, #22262e 72%, #382817 100%);
            border-bottom: 4px solid #f59e0b;
        }

        .header.error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .icon-container {
            width: 74px;
            height: 74px;
            margin: 0 auto 1rem;
            background: rgba(16, 185, 129, 0.13);
            border: 2px solid #34d399;
            border-radius: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: bounce 1s ease-in-out;
        }

        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        .icon {
            font-size: 3rem;
        }

        .icon.success {
            color: #34d399;
        }

        .icon.error {
            color: #ef4444;
        }

        .header h1 {
            color: white;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
            line-height: 1.6;
            max-width: 510px;
            margin: 0 auto;
        }

        .brand-label {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            color: #fbbf24;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
        }

        .brand-label::before,
        .brand-label::after {
            content: '';
            width: 24px;
            height: 2px;
            background: #f59e0b;
        }

        .content {
            padding: 2rem;
        }

        .info-box {
            background: linear-gradient(145deg, #f8fafc, #eef1f4);
            border: 1px dashed #aeb5bf;
            border-left: 5px solid #f59e0b;
            border-radius: 0.9rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-label {
            font-weight: 600;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .info-value {
            font-weight: 700;
            font-size: 1rem;
        }

        .available {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            color: #047857;
            background: #d1fae5;
            border-radius: 999px;
            padding: 0.35rem 0.65rem;
            font-size: 0.8rem;
        }

        .available::before {
            content: '';
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
        }

        @media (prefers-color-scheme: dark) {
            .info-label {
                color: #9ca3af;
            }

            .info-row {
                border-bottom-color: #4b5563;
            }
        }

        .button {
            width: 100%;
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
            color: #111827;
            border: 1px solid transparent;
            border-radius: 0.75rem;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 10px 24px rgba(234, 88, 12, 0.24);
        }

        .button:hover {
            background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            transform: translateY(-2px);
        }

        .button.secondary {
            background: transparent;
            color: #374151;
            border-color: #cbd5e1;
            box-shadow: none;
        }

        .button.secondary:hover {
            background: #f1f5f9;
            border-color: #94a3b8;
        }

        .countdown {
            text-align: center;
            margin-top: 1rem;
            color: #6b7280;
            font-size: 0.875rem;
        }

        @media (prefers-color-scheme: dark) {
            .countdown {
                color: #9ca3af;
            }
        }

        .loader {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        @media (max-width: 640px) {
            .header h1 {
                font-size: 1.5rem;
            }

            .header p {
                font-size: 0.875rem;
            }

            .content {
                padding: 1.5rem;
            }

            body {
                align-items: flex-start;
                background-position: 38% center;
                padding-top: 1rem;
            }

            .icon-container {
                width: 60px;
                height: 60px;
            }

            .icon {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <!-- Header -->
            <div class="header {{ $success ? 'success' : 'error' }}">
                <div class="brand-label">El Mundo del Perno</div>
                <div class="icon-container">
                    @if($success)
                        <div class="icon success">✓</div>
                    @else
                        <div class="icon error">✕</div>
                    @endif
                </div>
                <h1>{{ $message }}</h1>
                <p>{{ $description  }}</p>
            </div>

            <!-- Content -->
            <div class="content">
                @if(isset($orderId) || isset($transactionId))
                    <div class="info-box">
                        @if(isset($orderId))
                            <div class="info-row">
                                <span class="info-label">Número de orden</span>
                                <span class="info-value">#{{ $orderId }}</span>
                            </div>
                        @endif

                        @if(isset($voucherPath))
                            <div class="info-row">
                                <span class="info-label">Comprobante electrónico</span>
                                <span class="info-value available">Disponible</span>
                            </div>
                        @endif

                        @if(isset($transactionId) && !str_starts_with((string) $transactionId, 'MOCK-'))
                            <div class="info-row">
                                <span class="info-label">ID de transacción</span>
                                <span class="info-value">{{ $transactionId }}</span>
                            </div>
                        @endif
                    </div>
                @endif

                @if(isset($voucherPath))
                    <button class="button" onclick="downloadVoucher()" style="margin-bottom:1rem;">
                        ↓&nbsp;&nbsp;Descargar comprobante
                    </button>
                @endif

                <button class="button secondary" onclick="redirectNow()">
                    {{ $success ? 'Volver a la tienda' : 'Reintentar' }}
                </button>

                <div class="countdown">
                    Redirección automática en <span id="countdown">15</span> segundos
                </div>
            </div>
        </div>
    </div>

    <script>
        const redirectUrl = "{{ $redirectUrl }}";
        const voucherDownloadUrl = @json(isset($orderId) ? route('vouchers.download', ['order' => $orderId]) : null);
        let countdown = 15;

        // Actualizar contador
        const countdownInterval = setInterval(() => {
            countdown--;
            document.getElementById('countdown').textContent = countdown;

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                window.location.href = redirectUrl;
            }
        }, 1000);

        // Función para redirigir inmediatamente
        function redirectNow() {
            clearInterval(countdownInterval);
            window.location.href = redirectUrl;
        }

        function downloadVoucher() {
            if (!voucherDownloadUrl) {
                return;
            }

            clearInterval(countdownInterval);
            window.location.href = voucherDownloadUrl;
        }
    </script>
</body>
</html>
