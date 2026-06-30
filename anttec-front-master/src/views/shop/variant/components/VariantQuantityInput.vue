<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  modelValue: number
  maxStock: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// Valor interno para manejar el input
const internalValue = computed({
  get: () => props.modelValue,
  set: (value: number) => {
    // Validar y normalizar el valor
    let normalizedValue = value

    // Convertir a número si es string
    if (typeof normalizedValue === 'string') {
      normalizedValue = parseInt(normalizedValue, 10)
    }

    // Si no es un número válido, establecer a 1
    if (isNaN(normalizedValue) || normalizedValue < 1) {
      normalizedValue = 1
    }

    // Si excede el stock, establecer al máximo
    if (normalizedValue > props.maxStock) {
      normalizedValue = props.maxStock
    }

    emit('update:modelValue', normalizedValue)
  },
})

// Validar cuando cambie el stock máximo
watch(
  () => props.maxStock,
  (newMaxStock) => {
    if (props.modelValue > newMaxStock) {
      emit('update:modelValue', newMaxStock)
    }
  },
)

const increment = () => {
  if (internalValue.value < props.maxStock) {
    internalValue.value++
  }
}

const decrement = () => {
  if (internalValue.value > 1) {
    internalValue.value--
  }
}

// Manejar el blur del input para asegurar que el valor sea válido
const handleBlur = () => {
  if (!internalValue.value || internalValue.value < 1) {
    internalValue.value = 1
  } else if (internalValue.value > props.maxStock) {
    internalValue.value = props.maxStock
  }
}

// Prevenir entrada de caracteres no numéricos
const handleKeypress = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode
  // Solo permitir números (48-57 son los códigos de 0-9)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}
</script>

<template>
  <!-- Corregir o verificar el tema del stock -->
  <div class="flex items-center gap-4">
    <span class="font-bold text-gray-900 dark:text-gray-100">Cantidad:</span>
    <div
      class="flex items-center border-2 rounded-lg overflow-hidden shadow-sm"
      :class="[
        disabled
          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
          : 'border-gray-300 dark:border-gray-600',
      ]"
    >
      <button
        @click="decrement"
        :disabled="disabled || internalValue <= 1"
        class="px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          disabled || internalValue <= 1
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700',
        ]"
        type="button"
        title="Disminuir cantidad"
      >
        <font-awesome-icon
          icon="fa-solid fa-minus"
          size="sm"
          class="text-gray-700 dark:text-gray-300"
        />
      </button>

      <input
        v-model.number="internalValue"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        :disabled="disabled"
        :min="1"
        :max="maxStock"
        @blur="handleBlur"
        @keypress="handleKeypress"
        class="w-16 text-center border-x-2 py-2.5 focus:outline-none bg-transparent dark:text-gray-100 font-semibold transition-colors"
        :class="[
          disabled
            ? 'border-gray-200 dark:border-gray-700 cursor-not-allowed'
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400',
        ]"
      />

      <button
        @click="increment"
        :disabled="disabled || internalValue >= maxStock"
        class="px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          disabled || internalValue >= maxStock
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700',
        ]"
        type="button"
        title="Aumentar cantidad"
      >
        <font-awesome-icon
          icon="fa-solid fa-plus"
          size="sm"
          class="text-gray-700 dark:text-gray-300"
        />
      </button>
    </div>

    <!-- Indicador de stock máximo -->
    <span v-if="!disabled" class="text-sm text-gray-500 dark:text-gray-400">
      Máx: {{ maxStock }}
    </span>
  </div>
</template>
