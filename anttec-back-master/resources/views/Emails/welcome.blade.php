<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cuenta creada</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f97316;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #f97316;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>¡Bienvenido a EL MUNDO DEL PERNO!</h1>
    </div>

    <div class="content">
        <p>Hola <strong>{{ $user->name }} {{ $user->last_name }}</strong>,</p>

        <p>¡Gracias por registrarte! Confirmamos que tu cuenta fue creada correctamente.</p>

        <p>Correo registrado: <strong>{{ $user->email }}</strong></p>

        <p>Ya puedes consultar nuestro catálogo de pernos, tuercas, fijaciones, repuestos automotrices y productos para maquinaria pesada.</p>

        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>

        <center>
            <a href="{{ rtrim((string) config('app.url_front'), '/') }}" class="button">Ir a EL MUNDO DEL PERNO</a>
        </center>
    </div>

    <div class="footer">
        <p>Este es un correo automático, por favor no responder.</p>
        <p>&copy; {{ date('Y') }} EL MUNDO DEL PERNO. Todos los derechos reservados.</p>
    </div>
</body>
</html>
