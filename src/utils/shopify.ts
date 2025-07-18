import { blink } from '../blink/client'

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  images: { src: string }[]
  variants: {
    id: string
    price: string
    compare_at_price: string | null
    inventory_quantity: number
  }[]
  vendor: string
  product_type: string
  tags: string[]
  status: string
  created_at: string
  updated_at: string
}

export interface ShopifyOrder {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
  total_price: string
  currency: string
  financial_status: string
  fulfillment_status: string
  customer: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  line_items: {
    id: string
    product_id: string
    variant_id: string
    title: string
    quantity: number
    price: string
    name: string
  }[]
}

export interface ShopifyCustomer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
  updated_at: string
  orders_count: number
  total_spent: string
}

export class ShopifyAPI {
  private baseUrl: string
  private accessToken: string

  constructor(shopUrl: string, accessToken: string) {
    this.baseUrl = `https://${shopUrl}/admin/api/2024-04`
    this.accessToken = accessToken
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getShop() {
    const response = await this.makeRequest<{ shop: any }>('/shop.json')
    return response.shop
  }

  async getProducts(params: {
    limit?: number
    since_id?: string
    published_status?: 'published' | 'unpublished' | 'any'
  } = {}): Promise<ShopifyProduct[]> {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.since_id) searchParams.append('since_id', params.since_id)
    if (params.published_status) searchParams.append('published_status', params.published_status)

    const response = await this.makeRequest<{ products: ShopifyProduct[] }>(`/products.json?${searchParams}`)
    return response.products
  }

  async getProduct(productId: string): Promise<ShopifyProduct> {
    const response = await this.makeRequest<{ product: ShopifyProduct }>(`/products/${productId}.json`)
    return response.product
  }

  async getOrders(params: {
    limit?: number
    since_id?: string
    status?: 'open' | 'closed' | 'any'
    financial_status?: 'paid' | 'pending' | 'unpaid' | 'any'
    fulfillment_status?: 'fulfilled' | 'unfulfilled' | 'any'
  } = {}): Promise<ShopifyOrder[]> {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.since_id) searchParams.append('since_id', params.since_id)
    if (params.status) searchParams.append('status', params.status)
    if (params.financial_status) searchParams.append('financial_status', params.financial_status)
    if (params.fulfillment_status) searchParams.append('fulfillment_status', params.fulfillment_status)

    const response = await this.makeRequest<{ orders: ShopifyOrder[] }>(`/orders.json?${searchParams}`)
    return response.orders
  }

  async getOrder(orderId: string): Promise<ShopifyOrder> {
    const response = await this.makeRequest<{ order: ShopifyOrder }>(`/orders/${orderId}.json`)
    return response.order
  }

  async getCustomers(params: {
    limit?: number
    since_id?: string
  } = {}): Promise<ShopifyCustomer[]> {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.since_id) searchParams.append('since_id', params.since_id)

    const response = await this.makeRequest<{ customers: ShopifyCustomer[] }>(`/customers.json?${searchParams}`)
    return response.customers
  }

  async createScriptTag(src: string): Promise<void> {
    await this.makeRequest('/script_tags.json', {
      method: 'POST',
      body: JSON.stringify({
        script_tag: {
          event: 'onload',
          src: src
        }
      })
    })
  }

  async createWebhook(topic: string, address: string): Promise<void> {
    await this.makeRequest('/webhooks.json', {
      method: 'POST',
      body: JSON.stringify({
        webhook: {
          topic: topic,
          address: address,
          format: 'json'
        }
      })
    })
  }
}

export async function getShopifyAPIForUser(userId: string): Promise<ShopifyAPI | null> {
  try {
    const setupData = await blink.db.setup.list({
      where: { userId: userId, setupCompleted: "1" },
      limit: 1
    })

    if (setupData.length === 0) {
      return null
    }

    const setup = setupData[0]
    return new ShopifyAPI(setup.shopifyStoreUrl, setup.shopifyAccessToken)
  } catch (error) {
    console.error('Error getting Shopify API instance:', error)
    return null
  }
}

export function generateReviewRequestUrl(orderId: string, customerId: string, productId: string): string {
  const baseUrl = window.location.origin
  const token = btoa(`${orderId}:${customerId}:${productId}`)
  return `${baseUrl}/review/${token}`
}

export function parseReviewRequestToken(token: string): { orderId: string, customerId: string, productId: string } | null {
  try {
    const decoded = atob(token)
    const [orderId, customerId, productId] = decoded.split(':')
    return { orderId, customerId, productId }
  } catch (error) {
    return null
  }
}

export function formatCurrency(amount: string, currency: string = 'USD'): string {
  const num = parseFloat(amount)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(num)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getProductImageUrl(product: ShopifyProduct): string {
  return product.images.length > 0 ? product.images[0].src : '/placeholder-product.jpg'
}

export function getProductPrice(product: ShopifyProduct): string {
  if (product.variants.length > 0) {
    const variant = product.variants[0]
    return variant.price
  }
  return '0.00'
}

export function getProductComparePrice(product: ShopifyProduct): string | null {
  if (product.variants.length > 0) {
    const variant = product.variants[0]
    return variant.compare_at_price
  }
  return null
}