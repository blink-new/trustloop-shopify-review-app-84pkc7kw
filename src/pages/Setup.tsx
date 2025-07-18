import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Store, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Settings,
  Brain,
  Loader2
} from 'lucide-react'
import { blink } from '../blink/client'
import { toast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ShopifyStore {
  id: string
  name: string
  domain: string
  email: string
  currency: string
  timezone: string
  plan_name: string
  created_at: string
  updated_at: string
}

interface SetupData {
  shopify_store_url: string
  shopify_access_token: string
  gemini_api_key: string
  setup_completed: boolean
  store_info?: ShopifyStore
}

export function Setup() {
  const [activeTab, setActiveTab] = useState('shopify')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [setupData, setSetupData] = useState<SetupData>({
    shopify_store_url: '',
    shopify_access_token: '',
    gemini_api_key: '',
    setup_completed: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initUser = async () => {
      try {
        const userData = await blink.auth.me()
        setUser(userData)
        
        // Load existing setup data
        const existingSetup = await blink.db.setup.list({
          where: { userId: userData.id },
          limit: 1
        })
        
        if (existingSetup.length > 0) {
          setSetupData(existingSetup[0])
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    initUser()
  }, [])

  const validateShopifyStore = async (storeUrl: string, accessToken: string) => {
    try {
      setVerifying(true)
      setErrors({})
      
      // Clean up the store URL
      const cleanUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
      
      // Validate store URL format
      if (!cleanUrl.includes('.myshopify.com')) {
        throw new Error('Please enter a valid Shopify store URL (e.g., yourstore.myshopify.com)')
      }
      
      // Make API call to verify the store and token
      const response = await fetch(`https://${cleanUrl}/admin/api/2024-04/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Invalid access token or store URL. Please check your credentials.')
      }
      
      const data = await response.json()
      const storeInfo = data.shop as ShopifyStore
      
      // Update setup data with store info
      setSetupData(prev => ({
        ...prev,
        shopify_store_url: cleanUrl,
        shopify_access_token: accessToken,
        store_info: storeInfo
      }))
      
      toast({
        title: "Store Connected Successfully!",
        description: `Connected to ${storeInfo.name}`
      })
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to store'
      setErrors({ shopify: errorMessage })
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      })
      return false
    } finally {
      setVerifying(false)
    }
  }

  const handleShopifyConnect = async () => {
    if (!setupData.shopify_store_url || !setupData.shopify_access_token) {
      setErrors({
        shopify: 'Please fill in both store URL and access token'
      })
      return
    }
    
    const success = await validateShopifyStore(setupData.shopify_store_url, setupData.shopify_access_token)
    if (success) {
      setActiveTab('ai')
    }
  }

  const handleGeminiApiTest = async () => {
    if (!setupData.gemini_api_key) {
      setErrors({ gemini: 'Please enter your Gemini API key' })
      return
    }
    
    try {
      setVerifying(true)
      setErrors({})
      
      // Test the Gemini API key with a simple request
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${setupData.gemini_api_key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, this is a test to verify API access.'
            }]
          }]
        })
      })
      
      if (!response.ok) {
        throw new Error('Invalid Gemini API key. Please check your credentials.')
      }
      
      toast({
        title: "Gemini API Connected!",
        description: "API key verified successfully"
      })
      
      setActiveTab('complete')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify API key'
      setErrors({ gemini: errorMessage })
      toast({
        title: "API Verification Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleCompleteSetup = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Save setup data to database
      const setupRecord = {
        userId: user.id,
        shopifyStoreUrl: setupData.shopify_store_url,
        shopifyAccessToken: setupData.shopify_access_token,
        geminiApiKey: setupData.gemini_api_key,
        setupCompleted: true,
        storeInfo: JSON.stringify(setupData.store_info),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await blink.db.setup.create(setupRecord)
      
      toast({
        title: "Setup Complete!",
        description: "Your TrustLoop account is now ready to use.",
      })
      
      // Redirect to dashboard
      window.location.href = '/dashboard'
      
    } catch (error) {
      console.error('Setup error:', error)
      toast({
        title: "Setup Failed",
        description: "Failed to save setup data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const isShopifyComplete = setupData.store_info && setupData.shopify_access_token
  const isGeminiComplete = setupData.gemini_api_key && !errors.gemini
  const canComplete = isShopifyComplete && isGeminiComplete

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mr-3">
              <span className="text-primary-foreground font-bold text-xl">T</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">TrustLoop Setup</h1>
          </div>
          <p className="text-muted-foreground">
            Let's get your Shopify store connected and configure your AI settings
          </p>
        </div>

        {/* Setup Tabs */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Initial Setup
            </CardTitle>
            <CardDescription>
              Complete these steps to start using TrustLoop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="shopify" className="flex items-center">
                  <Store className="h-4 w-4 mr-2" />
                  Shopify Store
                  {isShopifyComplete && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Settings
                  {isGeminiComplete && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                </TabsTrigger>
                <TabsTrigger value="complete" className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </TabsTrigger>
              </TabsList>

              {/* Shopify Store Tab */}
              <TabsContent value="shopify" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="store-url">Shopify Store URL</Label>
                    <Input
                      id="store-url"
                      placeholder="yourstore.myshopify.com"
                      value={setupData.shopify_store_url}
                      onChange={(e) => setSetupData(prev => ({ ...prev, shopify_store_url: e.target.value }))}
                      className={errors.shopify ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter your Shopify store URL (without https://)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="access-token">Private App Access Token</Label>
                    <Input
                      id="access-token"
                      type="password"
                      placeholder="shpat_..."
                      value={setupData.shopify_access_token}
                      onChange={(e) => setSetupData(prev => ({ ...prev, shopify_access_token: e.target.value }))}
                      className={errors.shopify ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Your Shopify Private App access token
                    </p>
                  </div>

                  {errors.shopify && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.shopify}</AlertDescription>
                    </Alert>
                  )}

                  {setupData.store_info && (
                    <Alert className="border-green-500">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription>
                        <strong>Connected to:</strong> {setupData.store_info.name}
                        <br />
                        <strong>Domain:</strong> {setupData.store_info.domain}
                        <br />
                        <strong>Plan:</strong> {setupData.store_info.plan_name}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      <strong>How to get your access token:</strong>
                      <br />
                      1. Go to your Shopify admin → Apps → App and sales channel settings
                      <br />
                      2. Click "Develop apps" → "Create a private app"
                      <br />
                      3. Configure the app with required permissions (read_products, read_orders, etc.)
                      <br />
                      4. Copy the Admin API access token
                      <br />
                      <a 
                        href="https://help.shopify.com/en/manual/apps/private-apps" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        Learn more <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={handleShopifyConnect}
                    disabled={verifying || !setupData.shopify_store_url || !setupData.shopify_access_token}
                    className="w-full"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying Connection...
                      </>
                    ) : (
                      <>
                        <Store className="h-4 w-4 mr-2" />
                        Connect Shopify Store
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* AI Settings Tab */}
              <TabsContent value="ai" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gemini-key">Gemini API Key</Label>
                    <Input
                      id="gemini-key"
                      type="password"
                      placeholder="AI..."
                      value={setupData.gemini_api_key}
                      onChange={(e) => setSetupData(prev => ({ ...prev, gemini_api_key: e.target.value }))}
                      className={errors.gemini ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Your Google Gemini API key for AI-powered review moderation
                    </p>
                  </div>

                  {errors.gemini && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.gemini}</AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <strong>How to get your Gemini API key:</strong>
                      <br />
                      1. Go to Google AI Studio (ai.google.dev)
                      <br />
                      2. Click "Get API key" → "Create API key"
                      <br />
                      3. Select or create a Google Cloud project
                      <br />
                      4. Copy the generated API key
                      <br />
                      <a 
                        href="https://ai.google.dev/gemini-api/docs/api-key" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        Learn more <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={handleGeminiApiTest}
                    disabled={verifying || !setupData.gemini_api_key}
                    className="w-full"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing API Key...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Test Gemini API
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Complete Tab */}
              <TabsContent value="complete" className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Setup Complete!</h3>
                  <p className="text-muted-foreground">
                    Your TrustLoop account is ready to help you manage reviews and grow your business.
                  </p>
                  
                  <div className="bg-muted p-4 rounded-lg text-left">
                    <h4 className="font-medium mb-2">Setup Summary:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Shopify Store: {setupData.store_info?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Gemini AI: Configured</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCompleteSetup}
                    disabled={loading || !canComplete}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Completing Setup...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Setup & Continue
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}