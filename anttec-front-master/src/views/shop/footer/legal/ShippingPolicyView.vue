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
      <h2 class="dark:text-white text-gray-800 mt-5 text-2xl font-semibold">Políticas de Envío</h2>
      <div
        class="w-full sm:max-w-2xl mt-5 py-4 px-8 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg prose dark:prose-invert mb-4"
      >
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">1. Zonas de envío</h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              Realizamos envíos a todo el Perú, desde nuestra tienda ubicada en Huancayo.
            </p>
          </div>
        </section>

        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">2. Métodos de envío</h3>
          <div class="mb-6 dark:text-gray-300">
            <ul class="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <li class="flex items-start gap-3">
                <span class="text-green-500 mt-1">✔</span>
                <span>Envío a domicilio: Entregamos tus productos a nivel nacional.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-green-500 mt-1">✔</span>
                <span
                  >Recogida en tienda: Puedes recoger tu pedido directamente en nuestra tienda
                  ubicada en Av. Giráldez 274 T-02, Giráldez Centro de Negocios, Junín –
                  Huancayo.</span
                >
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">3. Costos de envío</h3>
          <p class="mb-6 dark:text-gray-300">
            El costo de envío depende del destino de tu pedido y se calculará automáticamente al
            momento de la compra.
          </p>
        </section>

        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">4. Tiempo de entrega</h3>
          <ul class="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Huancayo: 1–3 días hábiles</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Otras ciudades del Perú: 3–7 días hábiles</span>
            </li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">5. Condiciones especiales</h3>
          <p class="mb-6 dark:text-gray-300">
            Todos nuestros productos son tecnológicos y delicados, por lo que manejamos cada pedido
            con cuidado para garantizar que lleguen en perfectas condiciones.
          </p>
        </section>

        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">6. Contacto</h3>
          <p class="mb-6 dark:text-gray-300">
            Si tienes alguna pregunta sobre nuestros envíos, puedes contactarnos a través del
            siguiente número:
            <br />
            <span>
              Teléfono:
              <a
                href="https://wa.me/51964645037"
                target="__blank"
                class="hover:text-gray-200 hover:underline"
              >
                +51 964 645 037
              </a>
            </span>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
