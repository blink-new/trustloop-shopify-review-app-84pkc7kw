import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-*',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const shopDomain = req.headers.get('X-Shopify-Shop-Domain');
    
    if (!shopDomain) {
      return new Response('Invalid webhook', { status: 400 });
    }

    const productData = await req.json();

    // Store product in database
    const { error: productError } = await supabase
      .from('products')
      .upsert({
        shopify_product_id: productData.id.toString(),
        shop_domain: shopDomain,
        title: productData.title,
        handle: productData.handle,
        description: productData.body_html || '',
        product_type: productData.product_type,
        vendor: productData.vendor,
        tags: productData.tags ? productData.tags.split(',').map((tag: string) => tag.trim()) : [],
        status: productData.status,
        images: JSON.stringify(productData.images || []),
        variants: JSON.stringify(productData.variants || []),
        created_at: productData.created_at,
        updated_at: productData.updated_at,
        raw_data: JSON.stringify(productData),
      });

    if (productError) {
      console.error('Error storing product:', productError);
      return new Response('Database error', { status: 500 });
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Product webhook processing error:', error);
    return new Response('Internal server error', { status: 500 });
  }
});