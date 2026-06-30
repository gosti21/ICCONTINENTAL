<script setup lang="ts">
import logoDark from '@/assets/img/logo-dark.png'
import logo from '@/assets/img/logo.png'
</script>

<template>
  <div class="pt-4 bg-gray-100 dark:bg-gray-900 mt-4 mb-4">
    <div class="min-h-screen flex flex-col items-center pt-6 sm:pt-0 mx-4 md:mx-0">
      <div>
        <router-link :to="{ name: 'shop.home' }">
          <!-- Imagen para modo claro -->
          <img class="w-40 h-16 block dark:hidden" :src="logoDark" alt="Logo Light" />
          <!-- Imagen para modo oscuro -->
          <img class="w-40 h-16 hidden dark:block" :src="logo" alt="Logo Dark" />
        </router-link>
      </div>
      <h2 class="dark:text-white text-gray-800 mt-5 text-2xl font-semibold">
        Políticas de privacidad
      </h2>
      <div
        class="w-full sm:max-w-2xl mt-5 py-4 px-8 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg prose dark:prose-invert mb-4"
      >
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">1. Introducción</h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              En ANTTEC, tu privacidad es muy importante para nosotros. Esta Política de Privacidad
              describe cómo recopilamos, usamos, protegemos y compartimos la información personal
              que nos proporcionas al utilizar nuestro sitio web y servicios.
            </p>
          </div>
        </section>
        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-2">
            2. Información que Recopilamos
          </h3>
          <div class="mb-6 dark:text-gray-300">
            <p class="mb-3">
              Recopilamos la siguiente información personal cuando realizas una compra o interactúas
              con nuestro sitio web:
            </p>
            <ul class="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <li class="flex items-start gap-3">
                <span class="text-green-500 mt-1">✔</span>
                <span class="dark:text-gray-100 text-gray-800">Información personal:</span> Nombre,
                dirección de correo electrónico, número de teléfono y dirección de envío.
              </li>
              <li class="flex items-start gap-3">
                <span class="text-green-500 mt-1">✔</span>
                <span class="dark:text-gray-100 text-gray-800">Información de pago:</span> Datos
                relacionados con el pago de tus compras (procesados a través de Niubiz).
              </li>
            </ul>
          </div>
        </section>
        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">3. Uso de la Información</h3>
          <p class="mb-3 dark:text-gray-300">Utilizamos tu información para:</p>
          <ul class="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Información personal: Procesar y gestionar tus compras.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Responder a tus consultas y solicitudes de atención al cliente.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Mejorar la experiencia de usuario en nuestro sitio web.</span>
            </li>
          </ul>
        </section>
        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">
            4. Protección de la Información
          </h3>
          <p class="mb-6 dark:text-gray-300">
            Nos comprometemos a proteger tu información personal. Implementamos medidas de seguridad
            adecuadas para proteger tus datos contra accesos no autorizados, alteraciones o
            divulgaciones indebidas. Sin embargo, ninguna transmisión de datos a través de Internet
            puede garantizarse completamente segura, por lo que no podemos asegurar la seguridad
            total de tu información.
          </p>
        </section>
        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">
            5. Compartir Información con Terceros
          </h3>
          <p class="mb-3 dark:text-gray-300">
            No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en
            los siguientes casos:
          </p>
          <ul class="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span
                >Con proveedores de servicios como Niubiz para procesar los pagos y realizar las
                entregas.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span
                >Si es requerido por ley o para cumplir con procesos legales, como en caso de una
                investigación.</span
              >
            </li>
          </ul>
        </section>
        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">
            6. Cambios en la Política de Privacidad
          </h3>
          <p class="mb-6 dark:text-gray-300">
            Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento.
            Los cambios serán publicados en esta página, y los mismos entrarán en vigor de
            inmediato. Te recomendamos revisar periódicamente esta política para estar al tanto de
            cualquier actualización.
          </p>
        </section>
        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">7. Contacto</h3>
          <p class="mb-6 dark:text-gray-300">
            Si tienes alguna pregunta o inquietud sobre nuestra Política de Privacidad o cómo
            tratamos tus datos personales, puedes contactarnos a través del siguiente número:
            <br />
            <span
              >Teléfono:
              <a
                href="https://wa.me/51964645037"
                target="__blank"
                class="hover:text-gray-200 hover:underline"
                >+51 964 645 037</a
              ></span
            >
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
