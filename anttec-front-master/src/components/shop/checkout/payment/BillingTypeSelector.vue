<script setup lang="ts">
interface Props {
  modelValue: 'boleta' | 'factura'
}

interface Emits {
  (e: 'update:modelValue', value: 'boleta' | 'factura'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleChange = (value: 'boleta' | 'factura') => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <label class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
      Tipo de comprobante
      <span class="text-red-500">*</span>
    </label>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Boleta -->
      <label
        class="relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
        :class="
          modelValue === 'boleta'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
        "
      >
        <input
          type="radio"
          :checked="modelValue === 'boleta'"
          @change="handleChange('boleta')"
          class="sr-only"
        />
        <div class="flex items-center gap-3 w-full">
          <div class="flex-1">
            <p
              class="font-semibold"
              :class="
                modelValue === 'boleta'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-gray-100'
              "
            >
              Boleta
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400">Para personas</p>
          </div>
          <font-awesome-icon
            v-if="modelValue === 'boleta'"
            icon="fa-solid fa-check-circle"
            class="text-2xl text-blue-600 dark:text-blue-400"
          />
        </div>
      </label>

      <!-- Factura -->
      <label
        class="relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
        :class="
          modelValue === 'factura'
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
            : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
        "
      >
        <input
          type="radio"
          :checked="modelValue === 'factura'"
          @change="handleChange('factura')"
          class="sr-only"
        />
        <div class="flex items-center gap-3 w-full">
          <div class="flex-1">
            <p
              class="font-semibold"
              :class="
                modelValue === 'factura'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-900 dark:text-gray-100'
              "
            >
              Factura
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400">Para empresas</p>
          </div>
          <font-awesome-icon
            v-if="modelValue === 'factura'"
            icon="fa-solid fa-check-circle"
            class="text-2xl text-green-600 dark:text-green-400"
          />
        </div>
      </label>
    </div>
  </div>
</template>
