import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const shopifyClientId = Deno.env.get('SHOPIFY_CLIENT_ID')!;
const shopifyClientSecret = Deno.env.get('SHOPIFY_CLIENT_SECRET')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ShopifyTokenResponse {
  access_token: string;
  scope: string;
  expires_in?: number;
  associated_user_scope?: string;
  associated_user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    account_owner: boolean;
    locale: string;
    collaborator: boolean;
    email_verified: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const { shop, code, hmac, host } = await req.json();

    if (!shop || !code) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Verify HMAC (simplified - in production, implement proper HMAC verification)
    // For now, we'll proceed with the token exchange

    // Exchange authorization code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: shopifyClientId,
        client_secret: shopifyClientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for access token');
    }

    const tokenData: ShopifyTokenResponse = await tokenResponse.json();

    // Get shop info to validate the connection
    const shopResponse = await fetch(`https://${shop}/admin/api/2024-04/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': tokenData.access_token,
      },
    });

    if (!shopResponse.ok) {
      throw new Error('Failed to validate shop connection');
    }

    const shopData = await shopResponse.json();

    // Store the access token and shop information
    // Note: In production, encrypt the access token before storing
    const { error: storeError } = await supabase
      .from('shopify_stores')
      .upsert({
        shop_domain: shop,
        access_token: tokenData.access_token,
        scope: tokenData.scope,
        shop_name: shopData.shop.name,
        shop_email: shopData.shop.email,
        shop_owner: shopData.shop.shop_owner,
        currency: shopData.shop.currency,
        timezone: shopData.shop.timezone,
        plan_name: shopData.shop.plan_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (storeError) {
      console.error('Database error:', storeError);
      throw new Error('Failed to store shop information');
    }

    // Create webhooks for the shop
    const webhooks = [
      'app/uninstalled',
      'orders/create',
      'orders/updated',
      'orders/paid',
      'products/create',
      'products/update',
      'customers/create',
    ];

    for (const webhook of webhooks) {
      try {
        await fetch(`https://${shop}/admin/api/2024-04/webhooks.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': tokenData.access_token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            webhook: {
              topic: webhook,
              address: `${Deno.env.get('FUNCTION_BASE_URL')}/webhooks/${webhook.replace('/', '-')}`,
              format: 'json',
            },
          }),
        });
      } catch (error) {
        console.error(`Failed to create webhook for ${webhook}:`, error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      shop: shopData.shop.name,
      domain: shop 
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Shopify OAuth callback error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});