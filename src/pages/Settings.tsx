import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings as SettingsIcon,
  Store,
  Mail,
  Shield,
  Palette,
  Bell,
  Download,
  Trash2,
  Key,
  Brain,
  Save,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { blink } from '../blink/client'
import { toast } from '@/hooks/use-toast'

interface SetupData {
  shopifyStoreUrl: string
  shopifyAccessToken: string
  geminiApiKey: string
  setupCompleted: boolean
  storeInfo?: any
}

export function Settings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [setupData, setSetupData] = useState<SetupData>({
    shopifyStoreUrl: '',
    shopifyAccessToken: '',
    geminiApiKey: '',
    setupCompleted: false
  })
  const [showTokens, setShowTokens] = useState({
    shopify: false,
    gemini: false
  })
  const [verifying, setVerifying] = useState({
    shopify: false,
    gemini: false
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await blink.auth.me()
        setUser(userData)
        
        // Load existing setup data
        const existingSetup = await blink.db.setup.list({
          where: { userId: userData.id },
          limit: 1
        })
        
        if (existingSetup.length > 0) {
          const setup = existingSetup[0]
          setSetupData({
            shopifyStoreUrl: setup.shopifyStoreUrl || '',
            shopifyAccessToken: setup.shopifyAccessToken || '',
            geminiApiKey: setup.geminiApiKey || '',
            setupCompleted: Boolean(Number(setup.setupCompleted)),
            storeInfo: setup.storeInfo ? JSON.parse(setup.storeInfo) : null
          })
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUserData()
  }, [])

  const validateShopifyStore = async (storeUrl: string, accessToken: string) => {
    const cleanUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    
    if (!cleanUrl.includes('.myshopify.com')) {
      throw new Error('Please enter a valid Shopify store URL')
    }
    
    const response = await fetch(`https://${cleanUrl}/admin/api/2024-04/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Invalid access token or store URL')
    }
    
    const data = await response.json()
    return data.shop
  }

  const validateGeminiApi = async (apiKey: string) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Test'
          }]
        }]
      })
    })
    
    if (!response.ok) {
      throw new Error('Invalid Gemini API key')
    }
    
    return true
  }

  const handleVerifyShopify = async () => {
    if (!setupData.shopifyStoreUrl || !setupData.shopifyAccessToken) {
      toast({
        title: "Missing Information",
        description: "Please enter both store URL and access token",
        variant: "destructive"
      })
      return
    }
    
    setVerifying(prev => ({ ...prev, shopify: true }))
    
    try {
      const storeInfo = await validateShopifyStore(setupData.shopifyStoreUrl, setupData.shopifyAccessToken)
      setSetupData(prev => ({ ...prev, storeInfo }))
      
      toast({
        title: "Shopify Connected!",
        description: `Successfully connected to ${storeInfo.name}`
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Shopify",
        variant: "destructive"
      })
    } finally {
      setVerifying(prev => ({ ...prev, shopify: false }))
    }
  }

  const handleVerifyGemini = async () => {
    if (!setupData.geminiApiKey) {
      toast({
        title: "Missing API Key",
        description: "Please enter your Gemini API key",
        variant: "destructive"
      })
      return
    }
    
    setVerifying(prev => ({ ...prev, gemini: true }))
    
    try {
      await validateGeminiApi(setupData.geminiApiKey)
      
      toast({
        title: "Gemini API Connected!",
        description: "API key verified successfully"
      })
    } catch (error) {
      toast({
        title: "API Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify API key",
        variant: "destructive"
      })
    } finally {
      setVerifying(prev => ({ ...prev, gemini: false }))
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return
    
    setLoading(true)
    
    try {
      // Check if setup record exists
      const existingSetup = await blink.db.setup.list({
        where: { userId: user.id },
        limit: 1
      })
      
      const setupRecord = {
        userId: user.id,
        shopifyStoreUrl: setupData.shopifyStoreUrl,
        shopifyAccessToken: setupData.shopifyAccessToken,
        geminiApiKey: setupData.geminiApiKey,
        setupCompleted: true,
        storeInfo: JSON.stringify(setupData.storeInfo),
        updatedAt: new Date().toISOString()
      }
      
      if (existingSetup.length > 0) {
        await blink.db.setup.update(existingSetup[0].id, setupRecord)
      } else {
        await blink.db.setup.create({
          ...setupRecord,
          createdAt: new Date().toISOString()
        })
      }
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully"
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your TrustLoop preferences</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button 
            size="sm" 
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="integration" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        {/* Integration Settings */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Shopify Integration
              </CardTitle>
              <CardDescription>
                Configure your Shopify store connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shopifyUrl">Shopify Store URL</Label>
                <Input
                  id="shopifyUrl"
                  placeholder="yourstore.myshopify.com"
                  value={setupData.shopifyStoreUrl}
                  onChange={(e) => setSetupData(prev => ({ ...prev, shopifyStoreUrl: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your Shopify store URL (without https://)
                </p>
              </div>
              
              <div>
                <Label htmlFor="shopifyToken">Private App Access Token</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="shopifyToken"
                    type={showTokens.shopify ? "text" : "password"}
                    placeholder="shpat_..."
                    value={setupData.shopifyAccessToken}
                    onChange={(e) => setSetupData(prev => ({ ...prev, shopifyAccessToken: e.target.value }))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTokens(prev => ({ ...prev, shopify: !prev.shopify }))}
                  >
                    {showTokens.shopify ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVerifyShopify}
                    disabled={verifying.shopify}
                  >
                    {verifying.shopify ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Shopify Private App access token
                </p>
              </div>

              {setupData.storeInfo && (
                <Alert className="border-green-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    <strong>Connected to:</strong> {setupData.storeInfo.name}
                    <br />
                    <strong>Domain:</strong> {setupData.storeInfo.domain}
                    <br />
                    <strong>Plan:</strong> {setupData.storeInfo.plan_name}
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
                  3. Configure the app with required permissions
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Integration (Gemini)
              </CardTitle>
              <CardDescription>
                Configure AI-powered review moderation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="geminiKey">Gemini API Key</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="geminiKey"
                    type={showTokens.gemini ? "text" : "password"}
                    placeholder="AI..."
                    value={setupData.geminiApiKey}
                    onChange={(e) => setSetupData(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTokens(prev => ({ ...prev, gemini: !prev.gemini }))}
                  >
                    {showTokens.gemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVerifyGemini}
                    disabled={verifying.gemini}
                  >
                    {verifying.gemini ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Google Gemini API key for AI-powered review moderation
                </p>
              </div>

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
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Store Information
              </CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input 
                    id="storeName" 
                    placeholder="My Awesome Store"
                    value={setupData.storeInfo?.name || ''}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="storeUrl">Store URL</Label>
                  <Input 
                    id="storeUrl" 
                    placeholder="https://mystore.com"
                    value={setupData.storeInfo?.domain || ''}
                    readOnly
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input 
                    id="timezone"
                    value={setupData.storeInfo?.timezone || 'UTC'}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input 
                    id="currency"
                    value={setupData.storeInfo?.currency || 'USD'}
                    readOnly
                  />
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Store information is automatically synced from your Shopify store.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newReviewNotif">New Review Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new reviews are submitted
                  </p>
                </div>
                <Switch id="newReviewNotif" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="flaggedReviewNotif">Flagged Review Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when reviews are flagged for moderation
                  </p>
                </div>
                <Switch id="flaggedReviewNotif" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="campaignNotif">Campaign Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about campaign performance
                  </p>
                </div>
                <Switch id="campaignNotif" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email sending preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input id="senderName" placeholder="Your Store Name" />
                </div>
                <div>
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input id="senderEmail" placeholder="noreply@yourstore.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="replyEmail">Reply-to Email</Label>
                <Input id="replyEmail" placeholder="support@yourstore.com" />
              </div>
              <Separator />
              <div>
                <Label htmlFor="emailSignature">Email Signature</Label>
                <Textarea 
                  id="emailSignature" 
                  placeholder="Best regards,\nYour Store Team"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Moderation Settings */}
        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                AI Moderation
              </CardTitle>
              <CardDescription>
                Configure automatic review moderation using Gemini AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoModeration">Enable Auto-Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically moderate reviews using Gemini AI
                  </p>
                </div>
                <Switch id="autoModeration" defaultChecked />
              </div>
              <div>
                <Label htmlFor="confidenceThreshold">Confidence Threshold</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="75"
                    className="flex-1"
                  />
                  <span className="text-sm w-12">75%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Reviews below this confidence score will be flagged for manual review
                </p>
              </div>
              <Separator />
              <div>
                <Label htmlFor="bannedKeywords">Banned Keywords</Label>
                <Textarea 
                  id="bannedKeywords" 
                  placeholder="Enter keywords separated by commas..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Reviews containing these keywords will be automatically flagged
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Widget Appearance
              </CardTitle>
              <CardDescription>
                Customize how your widgets look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input 
                      type="color" 
                      id="primaryColor"
                      defaultValue="#4338CA"
                      className="w-12 h-10 rounded border"
                    />
                    <Input value="#4338CA" className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input 
                      type="color" 
                      id="accentColor"
                      defaultValue="#10B981"
                      className="w-12 h-10 rounded border"
                    />
                    <Input value="#10B981" className="flex-1" />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <select className="w-full px-3 py-2 border border-input rounded-md bg-background mt-2">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                  <option>Lato</option>
                  <option>Montserrat</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export or delete your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Export All Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download all your reviews, campaigns, and settings
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-red-600">Delete All Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all your data (this cannot be undone)
                  </p>
                </div>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}