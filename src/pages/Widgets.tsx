import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  Plus, 
  Eye,
  Settings,
  Copy,
  Star,
  ShoppingCart,
  MessageSquare,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'

export function Widgets() {
  const [activeWidget, setActiveWidget] = useState('homepage')

  const widgets = [
    {
      id: 'homepage',
      name: 'Homepage Carousel',
      description: 'Display top reviews across all products',
      type: 'carousel',
      status: 'active',
      placement: 'Homepage',
      views: 12847,
      clicks: 892,
      ctr: 6.9,
      enabled: true
    },
    {
      id: 'product',
      name: 'Product Page Reviews',
      description: 'Embedded review display with filters',
      type: 'embedded',
      status: 'active',
      placement: 'Product Pages',
      views: 8932,
      clicks: 1205,
      ctr: 13.5,
      enabled: true
    },
    {
      id: 'collection',
      name: 'Collection Rating Snippet',
      description: 'Average rating display in collection grids',
      type: 'snippet',
      status: 'active',
      placement: 'Collection Pages',
      views: 5634,
      clicks: 423,
      ctr: 7.5,
      enabled: true
    },
    {
      id: 'floating',
      name: 'Floating Review Widget',
      description: 'Fixed-position scroll-following bubble',
      type: 'floating',
      status: 'draft',
      placement: 'All Pages',
      views: 0,
      clicks: 0,
      ctr: 0,
      enabled: false
    },
    {
      id: 'popup',
      name: 'Exit Intent Popup',
      description: 'Triggered by exit intent or scroll depth',
      type: 'popup',
      status: 'paused',
      placement: 'All Pages',
      views: 2341,
      clicks: 156,
      ctr: 6.7,
      enabled: false
    },
    {
      id: 'thankyou',
      name: 'Thank You Page Widget',
      description: 'Post-purchase review prompt',
      type: 'embedded',
      status: 'active',
      placement: 'Thank You Page',
      views: 892,
      clicks: 234,
      ctr: 26.2,
      enabled: true
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const mockReviews = [
    {
      customer: "Sarah Johnson",
      rating: 5,
      comment: "Amazing product! Highly recommend to everyone.",
      product: "Wireless Headphones",
      verified: true
    },
    {
      customer: "Mike Chen",
      rating: 4,
      comment: "Good quality, fast shipping. Very satisfied.",
      product: "Smart Watch",
      verified: true
    },
    {
      customer: "Emma Davis",
      rating: 5,
      comment: "Perfect fit and great material quality.",
      product: "Organic T-Shirt",
      verified: false
    }
  ]

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Widgets</h1>
          <p className="text-muted-foreground">Customize and manage review widgets</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Widget
          </Button>
        </div>
      </div>

      {/* Widget Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Widget Gallery
              </CardTitle>
              <CardDescription>Manage your review widgets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widgets.map((widget) => (
                  <div 
                    key={widget.id} 
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      activeWidget === widget.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setActiveWidget(widget.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{widget.name}</h4>
                          <Badge className={`text-xs ${getStatusColor(widget.status)}`}>
                            {widget.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{widget.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{widget.placement}</span>
                          <span>•</span>
                          <span>{widget.views.toLocaleString()} views</span>
                          <span>•</span>
                          <span>{widget.ctr}% CTR</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={widget.enabled}
                          onCheckedChange={() => {}}
                        />
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Widget Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Widget Preview
              </CardTitle>
              <CardDescription>
                Preview how your widget will look on your site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="desktop" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="desktop" className="flex items-center">
                    <Monitor className="h-4 w-4 mr-2" />
                    Desktop
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="desktop" className="mt-4">
                  <div className="bg-gray-50 p-6 rounded-lg min-h-[400px]">
                    {/* Homepage Carousel Preview */}
                    {activeWidget === 'homepage' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {mockReviews.map((review, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="flex items-center space-x-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm mb-2">"{review.comment}"</p>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>{review.customer}</span>
                                <span>{review.product}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Product Page Preview */}
                    {activeWidget === 'product' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Customer Reviews</h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="ml-1 text-sm">4.6</span>
                            </div>
                            <span className="text-sm text-gray-600">(247 reviews)</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mb-4">
                          <Button variant="outline" size="sm">All</Button>
                          <Button variant="outline" size="sm">5★</Button>
                          <Button variant="outline" size="sm">4★</Button>
                          <Button variant="outline" size="sm">With Photos</Button>
                        </div>
                        <div className="space-y-3">
                          {mockReviews.slice(0, 2).map((review, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center space-x-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm mb-2">{review.comment}</p>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span className="font-medium">{review.customer}</span>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Collection Page Preview */}
                    {activeWidget === 'collection' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="bg-white p-4 rounded-lg">
                              <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
                              <h4 className="font-medium text-sm mb-1">Product Name</h4>
                              <div className="flex items-center space-x-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-600 ml-1">(24)</span>
                              </div>
                              <p className="text-sm font-semibold">$29.99</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Other widget previews */}
                    {(activeWidget === 'floating' || activeWidget === 'popup' || activeWidget === 'thankyou') && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Palette className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Widget Preview</h3>
                          <p className="text-sm text-gray-600">
                            Configure your widget settings to see the preview
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="mobile" className="mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[400px] max-w-sm mx-auto">
                    <div className="bg-white rounded-lg p-4 h-full">
                      <p className="text-sm text-center text-gray-600">
                        Mobile preview for {widgets.find(w => w.id === activeWidget)?.name}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Widget Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Copy className="h-5 w-5 mr-2" />
                Installation Code
              </CardTitle>
              <CardDescription>Copy and paste into your theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                <code className="text-sm text-gray-800">
                  {`<script src="https://trustloop.app/widget.js"></script>
<div id="trustloop-widget" data-widget-id="${activeWidget}"></div>`}
                </code>
              </div>
              <Button className="mt-3" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}