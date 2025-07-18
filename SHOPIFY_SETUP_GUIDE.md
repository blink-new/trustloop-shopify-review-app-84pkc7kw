# TrustLoop Shopify App Setup Guide

## 🚀 Quick Start for Shopify Store Testing

This guide walks you through setting up TrustLoop on your Shopify store for testing.

### Prerequisites

1. **Shopify Store**: You need a Shopify store (development store is fine)
2. **Private App Access**: You'll need to create a private app in your Shopify admin
3. **API Keys**: You'll need a Gemini API key for AI moderation

---

## 📋 Step 1: Create a Shopify Private App

### 1. Access Your Shopify Admin
- Go to your Shopify admin dashboard
- Navigate to **Apps** → **App and sales channel settings**

### 2. Create a Private App
- Click **"Develop apps"** (or **"Develop apps for your store"**)
- Click **"Create a private app"**
- Fill in the app details:
  - **App name**: TrustLoop
  - **App URL**: `https://trustloop-shopify-review-app-84pkc7kw.sites.blink.new`
  - **Allowed redirection URL(s)**: `https://trustloop-shopify-review-app-84pkc7kw.sites.blink.new/auth/callback`

### 3. Configure API Permissions
Set the following **Admin API access scopes**:

**Products**:
- `read_products`
- `write_products`

**Orders**:
- `read_orders`
- `write_orders`

**Customers**:
- `read_customers`
- `write_customers`

**Content**:
- `read_content`
- `write_content`

**Themes**:
- `read_themes`
- `write_themes`

**Script Tags**:
- `read_script_tags`
- `write_script_tags`

**Webhooks**:
- `read_webhooks`
- `write_webhooks`

### 4. Get Your Access Token
- After creating the app, go to **API credentials**
- Copy the **Admin API access token** (starts with `shpat_`)
- **Keep this secure** - you'll need it for setup

---

## 🤖 Step 2: Get Gemini API Key

### 1. Visit Google AI Studio
- Go to [ai.google.dev](https://ai.google.dev)
- Sign in with your Google account

### 2. Create API Key
- Click **"Get API key"**
- Click **"Create API key"**
- Select or create a Google Cloud project
- Copy the generated API key (starts with `AI`)

---

## 🔧 Step 3: Configure TrustLoop

### 1. Open TrustLoop
- Visit: `https://trustloop-shopify-review-app-84pkc7kw.sites.blink.new`
- Click **"Sign in with Google"**

### 2. Complete Setup
The app will guide you through a 3-step setup process:

**Step 1: Shopify Store**
- Enter your store URL (e.g., `yourstore.myshopify.com`)
- Paste your Private App Access Token
- Click **"Connect Shopify Store"**

**Step 2: AI Settings**
- Paste your Gemini API key
- Click **"Test Gemini API"**

**Step 3: Complete Setup**
- Review your settings
- Click **"Complete Setup & Continue"**

---

## 🛠️ Step 4: Test the Integration

### 1. Dashboard Overview
After setup, you'll see the main dashboard with:
- Review statistics
- Recent reviews
- Top products
- Analytics

### 2. Test Review Submission
- Go to **Reviews** page
- Use the sample review form at `/review/test-token`
- Submit a test review with rating and content

### 3. Widget Testing
- Go to **Widgets** page
- Create a product review widget
- Copy the embed code
- Test it on your store

### 4. Campaign Testing
- Go to **Campaigns** page
- Create a post-purchase email campaign
- Test email template generation

---

## 🎯 Testing Features

### Core Features to Test:

1. **Review Management**
   - Submit new reviews
   - Moderate reviews (approve/reject)
   - View review analytics

2. **Email Campaigns**
   - Create review request campaigns
   - Test email templates
   - Track campaign performance

3. **Widget Generation**
   - Create different widget types
   - Test widget customization
   - Embed widgets on your store

4. **AI Moderation**
   - Submit reviews with different sentiments
   - Test automatic moderation
   - Adjust moderation settings

### Test Data:
The app includes sample data for:
- 1,247 total reviews
- 4.6 average rating
- 89.2% verified purchases
- 24,891 widget views

---

## 📊 Database Schema

The app creates these tables automatically:
- `setup` - Store configuration
- `reviews` - Customer reviews
- `campaigns` - Email campaigns
- `email_templates` - Email templates
- `widgets` - Display widgets
- `products` - Shopify products (synced)
- `analytics` - Usage analytics

---

## 🔧 Advanced Configuration

### Webhook Setup (Optional)
For production use, you can set up webhooks:
- Orders Created: `/api/webhooks/orders/create`
- Orders Updated: `/api/webhooks/orders/updated`
- Products Updated: `/api/webhooks/products/update`

### Custom Domain (Optional)
- Contact support for custom domain setup
- Point DNS to the provided IP address

---

## 🚨 Troubleshooting

### Common Issues:

1. **"Invalid access token"**
   - Verify your private app has the correct permissions
   - Ensure the token is copied correctly (starts with `shpat_`)

2. **"API key verification failed"**
   - Check your Gemini API key is valid
   - Ensure you have enabled the Gemini API in Google Cloud

3. **"Setup data not found"**
   - Complete the setup process fully
   - Check that all steps show green checkmarks

### Support:
- Check the console for error messages
- Verify your store URL format (no https://, no trailing slash)
- Ensure all required permissions are granted

---

## 🎉 Success Indicators

Your TrustLoop integration is working correctly when you can:

✅ **Authentication**: Successfully connect to your Shopify store  
✅ **Reviews**: Submit and manage reviews  
✅ **Campaigns**: Create and test email campaigns  
✅ **Widgets**: Generate and customize widgets  
✅ **AI Moderation**: Automatic review processing  
✅ **Analytics**: View performance metrics  

---

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Review the troubleshooting section
3. Contact support with:
   - Your store URL
   - Screenshots of any errors
   - Steps to reproduce the issue

---

**Happy Testing! 🎊**

Your TrustLoop app is now ready to help you manage reviews and grow your Shopify business.