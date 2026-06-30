import ShopLayout from '@/layouts/shop/ShopLayout.vue'
import { useCartStore } from '@/stores/useCartStore'
import LoginView from '@/views/auth/login/LoginView.vue'
import RegisterView from '@/views/auth/register/RegisterView.vue'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

const publicRoutes = [
  {
    path: '/',
    component: ShopLayout,
    children: [
      {
        path: '',
        name: 'shop.home',
        component: () => import('@/views/shop/HomeView.vue'),
      },
      {
        path: 'products',
        children: [
          {
            path: 'category/:categoryId',
            name: 'shop.products.category',
            component: () => import('@/views/shop/product/ProductsView.vue'),
          },
          {
            path: 'category/:categoryId/subcategory/:subcategoryId',
            name: 'shop.products.category.subcategory',
            component: () => import('@/views/shop/product/ProductsView.vue'),
          },
        ],
      },
      {
        path: 'variant/product/:productId/variant/:variantId',
        name: 'shop.variant.show',
        component: () => import('@/views/shop/variant/VariantShowView.vue'),
      },
      {
        path: 'cart',
        name: 'shop.cart',
        component: () => import('@/views/shop/cart/CartView.vue'),
        meta: {
          title: 'Carrito de compras',
          step: 1,
          showGlobalLoading: true,
        },
      },
      {
        path: 'aboutUs',
        name: 'shop.aboutUs',
        component: () => import('@/views/shop/footer/company/AboutUsView.vue'),
      },
      {
        path: 'privacy-policy',
        name: 'shop.privacyPolicy',
        component: () => import('@/views/shop/footer/legal/PrivacyPolicyView.vue'),
      },
      {
        path: 'terms-and-conditions',
        name: 'shop.termsAndConditions',
        component: () => import('@/views/shop/footer/legal/TermsAndConditionsView.vue'),
      },
      {
        path: 'shipping-policy',
        name: 'shop.shippingPolicy',
        component: () => import('@/views/shop/footer/legal/ShippingPolicyView.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/checkout',
    component: () => import('@/views/shop/checkout/CheckoutView.vue'),
    meta: { requiresAuth: true, title: 'Checkout', showGlobalLoading: true },
    // ← AGREGAR beforeEnter
    beforeEnter: async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext,
    ) => {
      const errorPages = [
        '/server-error',
        '/unauthorized',
        '/session-expired',
        '/maintenance',
        '/not-found',
      ]
      const comesFromError = errorPages.some((path) => from.path.includes(path))

      // Si viene de una página de error, permitir acceso sin validar
      if (comesFromError) {
        return next()
      }

      // Obtener el store del carrito
      const cartStore = useCartStore()

      // Si el carrito está cargando, esperar a que termine
      if (cartStore.isLoading) {
        // Esperar hasta que termine de cargar (máximo 3 segundos)
        const maxWait = 5000
        const startTime = Date.now()

        while (cartStore.isLoading && Date.now() - startTime < maxWait) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      // Si el carrito aún no tiene items cargados, intentar cargarlo
      if (cartStore.items.length === 0 && !cartStore.isLoading) {
        try {
          await cartStore.loadCart()
        } catch (error) {
          console.error('Error cargando carrito:', error)
        }
      }

      // Ahora sí validar si el carrito está vacío
      if (cartStore.isEmpty) {
        return next({ name: 'shop.cart' })
      }

      next()
    },
    children: [
      {
        path: '',
        redirect: { name: 'shoop.checkout.delivery' },
      },
      {
        path: 'delivery',
        name: 'shop.checkout.delivery',
        component: () => import('@/views/shop/checkout/DeliveryStep.vue'),
        meta: {
          title: 'Información de entrega',
          step: 2,
          requiresStep: 1, // Requiere haber completado el paso 1
          showGlobalLoading: true,
        },
      },
      {
        path: 'payment',
        name: 'shop.checkout.payment',
        component: () => import('@/views/shop/checkout/PaymentStep.vue'),
        meta: {
          title: 'Método de pago',
          step: 3,
          requiresStep: 2, // Requiere haber completado el paso 2
          showGlobalLoading: true,
        },
      },
    ],
  },
  {
    path: '/checkout/payment/timeout',
    name: 'shop.checkout.paymentTimeout',
    component: () => import('@/views/errors/PaymentTimeout.vue'),
    meta: {
      title: 'Tiempo agotado - Pago',
    },
  },
]

export default publicRoutes
