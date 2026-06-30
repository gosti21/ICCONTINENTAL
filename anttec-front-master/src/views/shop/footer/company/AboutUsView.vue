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
      <h2 class="dark:text-white text-gray-800 mt-5 text-2xl font-semibold">Sobre Nosotros</h2>
      <div
        class="w-full sm:max-w-2xl mt-5 py-4 px-8 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg prose dark:prose-invert mb-4"
      >
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">¿Quiénes somos?</h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-2">
              ANTTEC es una empresa especializada en la venta de periféricos y productos
              tecnológicos, orientada a satisfacer las necesidades de usuarios domésticos, gamers,
              estudiantes, profesionales y empresas.
            </p>
            <p class="mb-2">
              Nuestro catálogo incluye una amplia variedad de productos como teclados, mouses,
              routers, memorias USB, audífonos, microSD, coolers y mandos, seleccionados para
              ofrecer rendimiento, calidad y confiabilidad en cada uso.
            </p>
            <p class="mb-2">
              Además de la venta de productos, brindamos servicios de diagnóstico, mantenimiento y
              reparación de equipos informáticos, así como la comercialización de suministros para
              impresoras, ofreciendo soluciones integrales en tecnología.
            </p>
            <p class="mb-6">
              Nos encontramos ubicados en la Av. Giráldez 274 T-02 (Giráldez Centro de Negocios),
              Junín – Huancayo, desde donde atendemos con compromiso y atención personalizada a
              nuestros clientes.
            </p>
          </div>
        </section>
        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-2">Nuestra Misión</h3>
          <p class="mb-6 dark:text-gray-300">
            Brindar soluciones tecnológicas de alta calidad en periféricos gamer y de oficina,
            ofreciendo productos innovadores y un servicio personalizado que se adapte a las
            necesidades de nuestros clientes en Huancayo y la región centro del país, promoviendo la
            productividad, el entretenimiento y el desarrollo digital.
          </p>
        </section>
        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-2">Nuestra Visión</h3>
          <p class="mb-6 dark:text-gray-300">
            Ser la empresa líder en la venta de periféricos gamer y de oficina en la región centro
            del Perú, reconocida por su confiabilidad, variedad de productos y compromiso con la
            tecnología accesible, fomentando una comunidad digital moderna y conectada al año 2030.
          </p>
        </section>
        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">Nuestros valores</h3>
          <ul class="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Calidad en cada producto</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Confianza y transparencia</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Compromiso con el cliente</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Responsabilidad y honestidad</span>
            </li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">¿Por qué elegirnos?</h3>
          <ul class="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Productos cuidadosamente seleccionados</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Atención personalizada</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Pagos 100% seguros</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 mt-1">✔</span>
              <span>Envíos rápidos y confiables</span>
            </li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-2">Nuestro compromiso</h3>
          <p class="mb-6 dark:text-gray-300">
            En ANTTEC nos comprometemos a acompañarte antes, durante y después de tu compra,
            asegurando transparencia, soporte y satisfacción en cada pedido.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
