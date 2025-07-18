import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { 
  Link,
  Instagram,
  ShoppingCart,
  Mail,
  Globe,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

export function Integrations() {
  const integrations = [
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Connect your Shopify store to sync products and orders',
      icon: ShoppingCart,
      category: 'E-commerce',
      status: 'connected',
      connected: true,
      features: ['Product sync', 'Order sync', 'Customer data', 'ScriptTag injection']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Import user-generated content from Instagram',
      icon: Instagram,
      category: 'Social Media',
      status: 'available',
      connected: false,
      features: ['UGC import', 'Hashtag monitoring', 'Tagged posts', 'Media fetching']
    },
    {
      id: 'klaviyo',
      name: 'Klaviyo',
      description: 'Sync reviews as events for advanced email marketing',
      icon: Mail,
      category: 'Marketing',
      status: 'available',
      connected: false,
      features: ['Event tracking', 'Customer segmentation', 'Automated flows', 'Review triggers']
    },
    {
      id: 'amazon',
      name: 'Amazon Reviews',
      description: 'Import existing reviews from Amazon products',
      icon: ShoppingCart,
      category: 'E-commerce',
      status: 'beta',
      connected: false,
      features: ['Review import', 'ASIN matching', 'Bulk processing', 'Deduplication']
    },
    {
      id: 'google',
      name: 'Google Merchant Center',
      description: 'Export reviews to Google for enhanced product listings',
      icon: Globe,
      category: 'Search',
      status: 'available',
      connected: false,
      features: ['Review export', 'Product ratings', 'Rich snippets', 'SEO benefits']
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 3000+ apps through automated workflows',
      icon: Link,
      category: 'Automation',
      status: 'available',
      connected: false,
      features: ['Webhook triggers', 'Custom workflows', 'Multi-app connections', 'Real-time sync']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'available': return 'bg-blue-100 text-blue-800'
      case 'beta': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'available': return <AlertCircle className="h-4 w-4 text-blue-600" />
      case 'beta': return <AlertCircle className="h-4 w-4 text-purple-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const categories = ['All', 'E-commerce', 'Social Media', 'Marketing', 'Search', 'Automation']

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground">Connect TrustLoop with your favorite tools</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            API Keys
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Documentation
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Active integrations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Link className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Ready to connect</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Synced</CardTitle>
            <Globe className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4k</div>
            <p className="text-xs text-muted-foreground">Records this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === 'All' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {integration.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${getStatusColor(integration.status)}`}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(integration.status)}
                        <span className="capitalize">{integration.status}</span>
                      </span>
                    </Badge>
                    {integration.connected && (
                      <Switch checked={true} />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {integration.description}
                </CardDescription>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    {integration.connected ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        disabled={integration.status === 'beta'}
                      >
                        {integration.status === 'beta' ? 'Coming Soon' : 'Connect'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* API Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            API & Webhooks
          </CardTitle>
          <CardDescription>
            Build custom integrations with our REST API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">REST API</h4>
              <p className="text-sm text-muted-foreground">
                Access reviews, campaigns, and analytics data programmatically
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Docs
                </Button>
                <Button variant="outline" size="sm">
                  Generate API Key
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Webhooks</h4>
              <p className="text-sm text-muted-foreground">
                Receive real-time notifications when events occur
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">
                  Test Webhook
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}