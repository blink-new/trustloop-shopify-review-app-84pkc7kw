import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { blink } from '../blink/client'
import { toast } from '@/hooks/use-toast'

export function ShopifyAuth() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const shop = searchParams.get('shop')
  const host = searchParams.get('host')
  const code = searchParams.get('code')
  const hmac = searchParams.get('hmac')

  const redirectToShopifyOAuth = useCallback(() => {
    const scopes = 'read_products,read_orders,read_customers,write_script_tags,write_webhooks'
    const redirectUri = `${window.location.origin}/auth/shopify/callback`
    const state = btoa(JSON.stringify({ shop, host }))
    
    const authUrl = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${process.env.REACT_APP_SHOPIFY_CLIENT_ID}&` +
      `scope=${scopes}&` +
      `redirect_uri=${redirectUri}&` +
      `state=${state}&` +
      `grant_options[]=`

    window.location.href = authUrl
  }, [shop, host])

  const handleOAuthCallback = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Exchange code for access token
      const response = await fetch('/api/auth/shopify/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          code,
          hmac,
          host
        })
      })

      if (!response.ok) {
        throw new Error('Failed to authenticate with Shopify')
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        toast({
          title: "Authentication Successful!",
          description: "Your Shopify store has been connected to TrustLoop."
        })
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        throw new Error(data.error || 'Authentication failed')
      }

    } catch (error) {
      console.error('OAuth callback error:', error)
      setError(error instanceof Error ? error.message : 'Authentication failed')
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : 'Please try again',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [shop, code, hmac, host, navigate])

  useEffect(() => {
    if (!shop) {
      setError('Missing shop parameter')
      setLoading(false)
      return
    }

    if (code && hmac) {
      // Handle OAuth callback
      handleOAuthCallback()
    } else {
      // Redirect to Shopify OAuth
      redirectToShopifyOAuth()
    }
  }, [shop, code, hmac, handleOAuthCallback, redirectToShopifyOAuth])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">T</span>
            </div>
            <CardTitle>Connecting to Shopify</CardTitle>
            <CardDescription>
              Setting up your TrustLoop integration
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Authenticating with your Shopify store...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Successfully Connected!</CardTitle>
            <CardDescription>
              Your Shopify store is now connected to TrustLoop
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm">
                <strong>Store:</strong> {shop}
                <br />
                <strong>Status:</strong> Connected
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting to your dashboard...
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>Connection Failed</CardTitle>
            <CardDescription>
              There was an issue connecting to your Shopify store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/setup')}
                className="w-full"
              >
                Manual Setup
              </Button>
              
              <div className="text-center">
                <a 
                  href="https://help.shopify.com/en/manual/apps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  Get Help <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}