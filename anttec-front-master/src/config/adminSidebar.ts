import type { adminAsideInterface } from '@/layouts/admin/interface/adminAsideInterface'

export const adminSidebarLinks: adminAsideInterface[] = [
  {
    name: 'Dashboard',
    icon: 'fa-solid fa-gauge-high',
    route: 'admin.dashboard',
  },
  {
    name: 'Ventas',
    icon: 'fa-solid fa-receipt',
    route: 'admin.sales',
  },
  {
    name: 'Usuarios',
    icon: 'fa-solid fa-user-shield',
    route: 'admin.users',
    children: [
      {
        name: 'Empleados',
        icon: 'fa-solid fa-id-badge',
        route: 'admin.users.employees',
      },
      {
        name: 'Clientes',
        icon: 'fa-solid fa-handshake',
        route: 'admin.users.customers',
      },
    ],
  },
  {
    header: 'Administrar página',
  },
  {
    name: 'Marcas',
    icon: 'fa-solid fa-trademark',
    route: 'admin.brands',
  },
  {
    name: 'Categorías',
    icon: 'fa-solid fa-shapes',
    route: 'admin.categories',
  },
  {
    name: 'Subcategorías',
    icon: 'fa-solid fa-sitemap',
    route: 'admin.subcategories',
  },
  {
    name: 'Catálogo',
    icon: 'fa-solid fa-swatchbook',
    route: 'admin.catalog',
    children: [
      {
        name: 'Productos',
        icon: 'fa-solid fa-boxes-stacked',
        route: 'admin.catalog.products',
      },
      {
        name: 'Especificaciones',
        icon: 'fa-solid fa-sliders',
        route: 'admin.catalog.specifications',
      },
      {
        name: 'Opciones',
        icon: 'fa-solid fa-wand-magic-sparkles',
        route: 'admin.catalog.options',
      },
    ],
  },
  {
    name: 'Almacén',
    icon: 'fa-solid fa-warehouse',
    route: 'admin.store',
    children: [
      {
        name: 'Sucursal',
        icon: 'fa-solid fa-store',
        route: 'admin.store.branches',
      },
      {
        name: 'Inventario',
        icon: 'fa-solid fa-barcode',
        route: 'admin.store.variants',
      },
      {
        name: 'Movimientos',
        icon: 'fa-solid fa-right-left',
        route: 'admin.store.movements',
      },
    ],
  },
  {
    name: 'Portadas',
    icon: 'fa-solid fa-panorama',
    route: 'admin.covers',
  },
  {
    name: 'Pago QR',
    icon: 'fa-solid fa-qrcode',
    route: 'admin.paymentMethod',
  },
  {
    header: 'Órdenes y envío',
  },
  {
    name: 'Zonas de envío',
    icon: 'fa-solid fa-map',
    route: 'admin.address',
    children: [
      {
        name: 'Paises',
        icon: 'fa-solid fa-globe',
        route: 'admin.address.countries',
      },
      {
        name: 'Departamentos',
        icon: 'fa-solid fa-map-pin',
        route: 'admin.address.departments',
      },
      {
        name: 'Provincias',
        icon: 'fa-solid fa-signs-post',
        route: 'admin.address.provinces',
      },
      {
        name: 'Distritos',
        icon: 'fa-solid fa-location-dot',
        route: 'admin.address.districts',
      },
    ],
  },
  {
    name: 'Couriers',
    icon: 'fa-solid fa-truck-ramp-box',
    route: 'admin.couriers',
  },
  {
    name: 'Órdenes',
    icon: 'fa-solid fa-bag-shopping',
    route: 'admin.orders',
  },
  {
    name: ' Envios',
    icon: 'fa-solid fa-truck-arrow-right',
    route: 'admin.shipments',
  },
]
