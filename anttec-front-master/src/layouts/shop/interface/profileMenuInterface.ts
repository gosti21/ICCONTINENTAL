export interface profileMenuInterface {
  loggedIn: itemInterface[]
  notLoggedIn: itemInterface[]
}
export interface itemInterface {
  name: string
  route?: string
  action?: string
  roles?: string[]
}
