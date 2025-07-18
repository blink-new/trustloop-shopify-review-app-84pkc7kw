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
    // Verify webhook (simplified - in production, implement proper webhook verification)
    const shopDomain = req.headers.get('X-Shopify-Shop-Domain');
    const webhookId = req.headers.get('X-Shopify-Webhook-Id');
    
    if (!shopDomain) {
      return new Response('Invalid webhook', { status: 400 });
    }

    const orderData = await req.json();

    // Store order in database
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        shopify_order_id: orderData.id.toString(),
        shop_domain: shopDomain,
        order_number: orderData.name,
        customer_email: orderData.email,
        customer_first_name: orderData.billing_address?.first_name || '',
        customer_last_name: orderData.billing_address?.last_name || '',
        total_price: orderData.total_price,
        currency: orderData.currency,
        financial_status: orderData.financial_status,
        fulfillment_status: orderData.fulfillment_status,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
        line_items: JSON.stringify(orderData.line_items),
        raw_data: JSON.stringify(orderData),
      });

    if (orderError) {
      console.error('Error storing order:', orderError);
      return new Response('Database error', { status: 500 });
    }

    // Store line items for review tracking
    for (const lineItem of orderData.line_items) {
      await supabase
        .from('order_line_items')
        .insert({
          shopify_order_id: orderData.id.toString(),
          shop_domain: shopDomain,
          product_id: lineItem.product_id?.toString() || '',
          variant_id: lineItem.variant_id?.toString() || '',
          product_title: lineItem.title,
          quantity: lineItem.quantity,
          price: lineItem.price,
          created_at: new Date().toISOString(),
        });
    }

    // Trigger review request workflow (if order is paid)
    if (orderData.financial_status === 'paid') {
      // Schedule review request email after delivery
      const reviewRequestDelay = 7; // days after delivery
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + reviewRequestDelay);

      await supabase
        .from('email_campaigns')
        .insert({
          shop_domain: shopDomain,
          order_id: orderData.id.toString(),
          customer_email: orderData.email,
          campaign_type: 'review_request',
          scheduled_date: scheduledDate.toISOString(),
          status: 'scheduled',
          created_at: new Date().toISOString(),
        });
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal server error', { status: 500 });
  }
});