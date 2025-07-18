import { blink } from '../blink/client'
import { ShopifyAPI } from './shopify'

export interface WebhookConfig {
  topic: string
  functionName: string
  description: string
  required: boolean
}

export const WEBHOOK_CONFIGS: WebhookConfig[] = [
  {
    topic: 'orders/create',
    functionName: 'shopify-orders-webhook',
    description: 'Triggered when a new order is created',
    required: true
  },
  {
    topic: 'orders/updated',
    functionName: 'shopify-orders-webhook',
    description: 'Triggered when an order is updated',
    required: true
  },
  {
    topic: 'orders/fulfilled',
    functionName: 'shopify-orders-webhook',
    description: 'Triggered when an order is fulfilled',
    required: true
  },
  {
    topic: 'products/create',
    functionName: 'shopify-products-webhook',
    description: 'Triggered when a new product is created',
    required: true
  },
  {
    topic: 'products/update',
    functionName: 'shopify-products-webhook',
    description: 'Triggered when a product is updated',
    required: true
  },
  {
    topic: 'app/uninstalled',
    functionName: 'shopify-orders-webhook',
    description: 'Triggered when the app is uninstalled',
    required: true
  }
]

export class WebhookManager {
  private shopifyAPI: ShopifyAPI
  private baseUrl: string

  constructor(shopifyAPI: ShopifyAPI) {
    this.shopifyAPI = shopifyAPI
    this.baseUrl = 'https://84pkc7kw--'
  }

  async setupAllWebhooks(userId: string): Promise<{ success: boolean; results: any[] }> {
    const results = []
    
    try {
      // Get existing webhooks to avoid duplicates
      const existingWebhooks = await this.getExistingWebhooks()
      
      for (const config of WEBHOOK_CONFIGS) {
        try {
          // Check if webhook already exists
          const exists = existingWebhooks.some(webhook => 
            webhook.topic === config.topic && 
            webhook.address.includes(config.functionName)
          )
          
          if (!exists) {
            const webhookUrl = `${this.baseUrl}${config.functionName}.functions.blink.new`
            
            await this.shopifyAPI.createWebhook(config.topic, webhookUrl)
            
            // Save webhook info to database
            await blink.db.webhooks.create({
              userId,
              topic: config.topic,
              functionName: config.functionName,
              webhookUrl,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
            
            results.push({
              topic: config.topic,
              status: 'created',
              url: webhookUrl
            })
          } else {
            results.push({
              topic: config.topic,
              status: 'already_exists',
              url: `${this.baseUrl}${config.functionName}.functions.blink.new`
            })
          }
        } catch (error) {
          console.error(`Failed to create webhook for ${config.topic}:`, error)
          results.push({
            topic: config.topic,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      return { success: true, results }
    } catch (error) {
      console.error('Error setting up webhooks:', error)
      return { success: false, results }
    }
  }

  private async getExistingWebhooks(): Promise<any[]> {
    try {
      const response = await fetch(`${this.shopifyAPI['baseUrl']}/webhooks.json`, {
        headers: {
          'X-Shopify-Access-Token': this.shopifyAPI['accessToken'],
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch existing webhooks')
      }
      
      const data = await response.json()
      return data.webhooks || []
    } catch (error) {
      console.error('Error fetching existing webhooks:', error)
      return []
    }
  }

  async removeAllWebhooks(userId: string): Promise<{ success: boolean; results: any[] }> {
    const results = []
    
    try {
      // Get webhooks from database
      const webhooks = await blink.db.webhooks.list({
        where: { userId, isActive: true }
      })
      
      for (const webhook of webhooks) {
        try {
          // Get the webhook ID from Shopify
          const existingWebhooks = await this.getExistingWebhooks()
          const shopifyWebhook = existingWebhooks.find(w => 
            w.topic === webhook.topic && w.address === webhook.webhookUrl
          )
          
          if (shopifyWebhook) {
            await this.deleteWebhook(shopifyWebhook.id)
          }
          
          // Mark as inactive in database
          await blink.db.webhooks.update(webhook.id, {
            isActive: false,
            updatedAt: new Date().toISOString()
          })
          
          results.push({
            topic: webhook.topic,
            status: 'removed'
          })
        } catch (error) {
          console.error(`Failed to remove webhook for ${webhook.topic}:`, error)
          results.push({
            topic: webhook.topic,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      return { success: true, results }
    } catch (error) {
      console.error('Error removing webhooks:', error)
      return { success: false, results }
    }
  }

  private async deleteWebhook(webhookId: string): Promise<void> {
    const response = await fetch(`${this.shopifyAPI['baseUrl']}/webhooks/${webhookId}.json`, {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': this.shopifyAPI['accessToken'],
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete webhook ${webhookId}`)
    }
  }

  async verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
    try {
      const crypto = await import('crypto')
      const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(body, 'utf8')
        .digest('base64')
      
      return computedSignature === signature
    } catch (error) {
      console.error('Error verifying webhook signature:', error)
      return false
    }
  }
}

export async function createWebhookManager(userId: string): Promise<WebhookManager | null> {
  try {
    const setupData = await blink.db.setup.list({
      where: { userId, setupCompleted: "1" },
      limit: 1
    })
    
    if (setupData.length === 0) {
      return null
    }
    
    const setup = setupData[0]
    const shopifyAPI = new ShopifyAPI(setup.shopifyStoreUrl, setup.shopifyAccessToken)
    
    return new WebhookManager(shopifyAPI)
  } catch (error) {
    console.error('Error creating webhook manager:', error)
    return null
  }
}

export function getWebhookEndpointUrl(functionName: string): string {
  return `https://84pkc7kw--${functionName}.functions.blink.new`
}