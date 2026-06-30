import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { ProductFiltersI } from '@/interfaces/shop/Product/ProductFilterSInterface'
import type { productSI, productsSI } from '@/interfaces/shop/Product/ProductSInterface'
import httpPublic from '../httpPublic'

class ProductSService {
  private get api() {
    return httpPublic
  }

  async getAllLasts(): Promise<productSI[]> {
    const res = await this.api.get<ApiListResponseI<productSI[]>>('products/last')
    console.log(res.data.message)
    return res.data.data
  }

  async getWithFilters(filters?: ProductFiltersI): Promise<productsSI> {
    // Construir los query parameters
    const params = new URLSearchParams()

    if (filters) {
      // Iterar sobre cada filtro y agregarlo si tiene valor
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }

    // Hacer la petición con los parámetros
    const url = params.toString() ? `products?${params.toString()}` : 'products'
    const res = await this.api.get<productsSI>(url)

    console.log(res.data.message)
    return res.data
  }

  //Helpers
  async getByCategory(categoryId: number | string): Promise<productsSI> {
    return this.getWithFilters({ category: categoryId })
  }

  async getBySubcategory(subcategoryId: number): Promise<productsSI> {
    return this.getWithFilters({ subcategory: subcategoryId })
  }

  async getByCategoryAndSubcategory(
    categoryId: number | string,
    subcategoryId: number | string,
  ): Promise<productsSI> {
    return this.getWithFilters({
      category: categoryId,
      subcategory: subcategoryId,
    })
  }
}

export default ProductSService
