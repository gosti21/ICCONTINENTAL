import type { adminAsideInterface } from '@/layouts/admin/interface/adminAsideInterface'

export const adminSidebarLinks: adminAsideInterface[] = [
  {
    name: 'Dashboard',
    icon: 'fa-solid fa-chart-line',
    route: 'admin.dashboard',
  },
  {
    name: 'Ventas',
    icon: 'fa-solid fa-cash-register',
    route: 'admin.sales',
  },
  {
    name: 'Usuarios',
    icon: 'fa-solid fa-users',
    route: 'admin.users',
    children: [
      {
        name: 'Empleados',
        icon: 'fa-solid fa-user-tie',
        route: 'admin.users.employees',
      },
      {
        name: 'Clientes',
        icon: 'fa-solid fa-user-group',
        route: 'admin.users.customers',
      },
    ],
  },
  {
    header: 'Administrar página',
  },
  {
    name: 'Marcas',
    icon: 'fa-solid fa-tags',
    route: 'admin.brands',
  },
  {
    name: 'Categorías',
    icon: 'fa-solid fa-layer-group',
    route: 'admin.categories',
  },
  {
    name: 'Subcategorías',
    icon: 'fa-solid fa-list',
    route: 'admin.subcategories',
  },
  {
    name: 'Catálogo',
    icon: 'fa-solid fa-book',
    route: 'admin.catalog',
    children: [
      {
        name: 'Productos',
        icon: 'fa-solid fa-box',
        route: 'admin.catalog.products',
      },
      {
        name: 'Especificaciones',
        icon: 'fa-solid fa-list-check',
        route: 'admin.catalog.specifications',
      },
      {
        name: 'Opciones',
        icon: 'fa-solid fa-gear',
        route: 'admin.catalog.options',
      },
    ],
  },
  {
    name: 'Almacén',
    icon: 'fa-solid fa-shop',
    route: 'admin.store',
    children: [
      {
        name: 'Sucursal',
        icon: 'fa-solid fa-warehouse',
        route: 'admin.store.branches',
      },
      {
        name: 'Inventario',
        icon: 'fa-solid fa-clipboard-list',
        route: 'admin.store.variants',
      },
      {
        name: 'Movimientos',
        icon: 'fa-solid fa-file-invoice',
        route: 'admin.store.movements',
      },
    ],
  },
  {
    name: 'Portadas',
    icon: 'fa-solid fa-images',
    route: 'admin.covers',
  },
  {
    name: 'Pago QR',
    icon: 'fa-solid fa-money-bill-1',
    route: 'admin.paymentMethod',
  },
  {
    header: 'Órdenes y envío',
  },
  {
    name: 'Zonas de envío',
    icon: 'fa-solid fa-map-location-dot',
    route: 'admin.address',
    children: [
      {
        name: 'Paises',
        icon: 'fa-solid fa-earth-americas',
        route: 'admin.address.countries',
      },
      {
        name: 'Departamentos',
        icon: 'fa-solid fa-location-dot',
        route: 'admin.address.departments',
      },
      {
        name: 'Provincias',
        icon: 'fa-solid fa-location-arrow',
        route: 'admin.address.provinces',
      },
      {
        name: 'Distritos',
        icon: 'fa-solid fa-location-crosshairs',
        route: 'admin.address.districts',
      },
    ],
  },
  {
    name: 'Couriers',
    icon: 'fa-solid fa-dolly',
    route: 'admin.couriers',
  },
  {
    name: 'Órdenes',
    icon: 'fa-solid fa-cart-arrow-down',
    route: 'admin.orders',
  },
  {
    name: ' Envios',
    icon: 'fa-solid fa-truck-fast',
    route: 'admin.shipments',
  },
]
