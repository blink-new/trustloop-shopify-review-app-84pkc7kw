import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailCampaignRequest {
  campaignId: string;
  customerEmail: string;
  templateType: 'review_request' | 'reminder' | 'thank_you';
  orderId?: string;
  productId?: string;
  customData?: Record<string, any>;
  emailApiKey: string;
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
    const { campaignId, customerEmail, templateType, orderId, productId, customData, emailApiKey }: EmailCampaignRequest = await req.json();

    if (!campaignId || !customerEmail || !templateType || !emailApiKey) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', templateType)
      .eq('shop_domain', campaign.shop_domain)
      .single();

    if (templateError || !template) {
      throw new Error('Email template not found');
    }

    // Get order and product details if provided
    let orderData = null;
    let productData = null;

    if (orderId) {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('shopify_order_id', orderId)
        .single();
      orderData = order;
    }

    if (productId) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('shopify_product_id', productId)
        .single();
      productData = product;
    }

    // Prepare template variables
    const templateVariables = {
      customer_name: orderData?.customer_first_name || 'Valued Customer',
      customer_email: customerEmail,
      product_title: productData?.title || 'Your Purchase',
      product_image: productData?.images ? JSON.parse(productData.images)[0]?.src : '',
      order_number: orderData?.order_number || '',
      shop_name: campaign.shop_name || 'Our Store',
      review_url: `${Deno.env.get('FRONTEND_URL')}/review/${btoa(`${orderId}:${customerEmail}:${productId}`)}`,
      unsubscribe_url: `${Deno.env.get('FRONTEND_URL')}/unsubscribe/${btoa(customerEmail)}`,
      ...customData,
    };

    // Replace template variables in email content
    let emailContent = template.html_content;
    let emailSubject = template.subject;

    for (const [key, value] of Object.entries(templateVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      emailContent = emailContent.replace(regex, value || '');
      emailSubject = emailSubject.replace(regex, value || '');
    }

    // Send email using SendGrid API (or similar email service)
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: template.from_email,
          name: template.from_name,
        },
        personalizations: [{
          to: [{ email: customerEmail }],
          subject: emailSubject,
        }],
        content: [{
          type: 'text/html',
          value: emailContent,
        }],
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
        },
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`Email sending failed: ${errorData}`);
    }

    // Update campaign status
    const { error: updateError } = await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Error updating campaign:', updateError);
    }

    // Track email sent
    await supabase
      .from('email_tracking')
      .insert({
        campaign_id: campaignId,
        customer_email: customerEmail,
        template_type: templateType,
        sent_at: new Date().toISOString(),
        status: 'sent',
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully' 
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Email campaign error:', error);
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