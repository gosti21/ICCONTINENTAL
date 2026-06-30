export interface categorySI {
  id: number
  name: string
  subcategories?: subSI[]
}

export interface subSI {
  id: number
  name: string
}
