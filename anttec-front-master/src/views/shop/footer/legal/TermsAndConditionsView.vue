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
        Términos y condiciones
      </h2>
      <div
        class="w-full sm:max-w-2xl mt-5 py-4 px-8 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg prose dark:prose-invert mb-4"
      >
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">1. Introducción</h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              Bienvenido a ANTTEC. Al acceder y utilizar este sitio web, aceptas los siguientes
              Términos y Condiciones. Si no estás de acuerdo con estos términos, por favor no
              utilices nuestro sitio.
            </p>
          </div>
        </section>
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">
            2. Descripción de la Empresa
          </h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              ANTTEC se especializa en la venta de periféricos, con un enfoque principal en
              productos dirigidos tanto a usuarios domésticos, gamers, estudiantes, profesionales y
              empresas.
            </p>
          </div>
        </section>
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">3. Métodos de Pago</h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              Los pagos en nuestro sitio son procesados a través de Niubiz, una plataforma segura de
              pagos en línea. Aceptamos diversos métodos de pago como tarjetas de crédito, débito y
              otros medios disponibles a través de dicha pasarela.
            </p>
          </div>
        </section>
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">4. Envíos y Entregas</h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              Realizamos envíos a nivel nacional. El tiempo estimado de entrega dependerá de la
              ubicación y el tipo de producto comprado. Los costos de envío se calcularán en el
              proceso de compra y serán informados antes de finalizar el pago.
            </p>
          </div>
        </section>
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">
            5. Política de Devoluciones y Reembolsos
          </h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              Si no estás completamente satisfecho con tu compra, puedes solicitar una devolución
              dentro de los 10 días hábiles posteriores a la recepción del producto. El artículo
              debe estar en su estado original y no haber sido usado. Los costos de envío para
              devoluciones corren a cargo del cliente.
            </p>
          </div>
        </section>
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">
            6. Responsabilidad del Cliente
          </h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              El cliente es responsable de proporcionar información verídica y precisa al momento de
              realizar su compra. Esto incluye datos de contacto, dirección de envío y métodos de
              pago. En caso de error en la información proporcionada, ANTTEC no se hace responsable
              de retrasos o problemas con el envío.
            </p>
          </div>
        </section>
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">7. Propiedad Intelectual</h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              Todo el contenido del sitio web de ANTTEC, incluyendo imágenes, descripciones de
              productos y logotipos, están protegidos por derechos de autor y son propiedad
              exclusiva de ANTTEC. Queda prohibida su reproducción, distribución o uso sin el
              consentimiento expreso de la empresa.
            </p>
          </div>
        </section>
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">
            8. Modificaciones de los Términos y Condiciones
          </h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier
              momento. Cualquier cambio será publicado en este sitio web y entrará en vigor de
              inmediato. Te recomendamos revisar periódicamente estos términos para estar al tanto
              de cualquier actualización.
            </p>
          </div>
        </section>
        <section>
          <h3 class="text-xl dark:text-gray-200 font-medium mb-3">9. Contacto</h3>
          <p class="mb-6 dark:text-gray-300">
            Para cualquier consulta, duda o solicitud, puedes contactarnos a través del siguiente
            número:
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
        <section>
          <h3 class="mt-4 text-xl dark:text-gray-200 font-medium mb-2">
            10. Aceptación de los Términos
          </h3>
          <div class="mb-4 dark:text-gray-300">
            <p class="mb-6">
              Al utilizar nuestro sitio web y realizar una compra, el cliente acepta estar sujeto a
              estos Términos y Condiciones. Si tienes alguna pregunta sobre los mismos, no dudes en
              contactarnos.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
