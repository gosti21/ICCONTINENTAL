<script setup lang="ts"></script>

<template>
  <footer class="bg-black text-gray-300 dark:bg-footer">
    <div class="max-w-7xl mx-auto px-8 py-12">
      <!-- GRID -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <!-- CONTACTO -->
        <div class="flex justify-center">
          <div class="min-w-60 sm:min-w-0">
            <h4 class="text-white font-semibold mb-4 uppercase tracking-wide text-center">
              Contacto
            </h4>

            <p class="text-sm font-medium mb-1">Ubicación</p>
            <a
              href="https://maps.app.goo.gl/TLDbwhF12vhne7AE9"
              target="_blank"
              class="block text-sm hover:text-white transition"
            >
              Av. Giraldez N° 274 Int. T-2<br />
              Huancayo
            </a>

            <p class="text-sm font-medium mt-4 mb-1">WhatsApp</p>
            <a
              href="https://wa.me/51964645037"
              target="_blank"
              class="text-sm hover:text-white transition"
            >
              +51 964 645 037
            </a>

            <p class="text-sm font-medium mt-4 mb-1">Correo</p>
            <a href="mailto:anttecshop@gmail.com" class="block text-sm hover:text-white transition">
              anttecshop@gmail.com
            </a>

            <p class="text-sm font-medium mt-4 mb-1">Horario</p>
            <p class="text-sm">Lunes a sábado: 9:30 am – 8:00 pm</p>
          </div>
        </div>

        <!-- EMPRESA -->
        <div class="flex justify-center">
          <div class="min-w-60 sm:min-w-0">
            <h4 class="text-white font-semibold mb-4 uppercase tracking-wide text-center">
              Empresa
            </h4>

            <ul class="space-y-2 text-sm">
              <router-link :to="{ name: 'shop.aboutUs' }" class="hover:text-white transition">
                Nosotros
              </router-link>
            </ul>
          </div>
        </div>

        <!-- LEGALES -->
        <div class="flex justify-center">
          <div class="min-w-60 sm:min-w-0">
            <h4 class="text-white font-semibold mb-4 uppercase tracking-wide text-center">
              Legales
            </h4>

            <ul class="space-y-2 text-sm">
              <li>
                <router-link
                  :to="{ name: 'shop.privacyPolicy' }"
                  class="hover:text-white transition"
                >
                  Políticas de privacidad
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'shop.shippingPolicy' }"
                  class="hover:text-white transition"
                >
                  Políticas de envío
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'shop.termsAndConditions' }"
                  class="hover:text-white transition"
                >
                  Términos y condiciones
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- DIVIDER -->
      <hr class="my-10 border-gray-400" />

      <!-- BOTTOM -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <span class="text-sm"> ANTTECH © 2026. Todos los derechos reservados </span>

        <div class="flex gap-5">
          <a
            href="https://www.facebook.com/share/15KfQnuHvN/"
            target="_blank"
            class="hover:text-white transition"
          >
            <font-awesome-icon icon="fa-brands fa-facebook-f" size="lg" />
          </a>

          <a
            href="https://api.whatsapp.com/send?phone=51964645037"
            target="_blank"
            class="hover:text-white transition"
          >
            <font-awesome-icon icon="fa-brands fa-instagram" size="lg" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
