import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Eye,
  Calendar,
  Filter,
  Download
} from 'lucide-react'

export function Dashboard() {
  const stats = [
    {
      title: "Total Reviews",
      value: "1,247",
      description: "↑ 12.5% from last month",
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      title: "Average Rating",
      value: "4.6",
      description: "↑ 0.2 from last month",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Verified Purchases",
      value: "89.2%",
      description: "↑ 3.1% from last month",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Widget Views",
      value: "24,891",
      description: "↑ 18.7% from last month",
      icon: Eye,
      color: "text-purple-600"
    }
  ]

  const recentReviews = [
    {
      id: 1,
      customer: "Sarah Johnson",
      product: "Wireless Bluetooth Headphones",
      rating: 5,
      comment: "Amazing sound quality and comfortable fit. Perfect for workouts!",
      date: "2 hours ago",
      verified: true
    },
    {
      id: 2,
      customer: "Mike Chen",
      product: "Smart Watch Pro",
      rating: 4,
      comment: "Great features but battery life could be better. Overall satisfied.",
      date: "5 hours ago",
      verified: true
    },
    {
      id: 3,
      customer: "Emma Davis",
      product: "Organic Cotton T-Shirt",
      rating: 5,
      comment: "Super soft and comfortable. Love the eco-friendly materials!",
      date: "1 day ago",
      verified: false
    }
  ]

  const topProducts = [
    {
      name: "Wireless Bluetooth Headphones",
      reviews: 342,
      rating: 4.8,
      trend: "+15%"
    },
    {
      name: "Smart Watch Pro",
      reviews: 256,
      rating: 4.6,
      trend: "+8%"
    },
    {
      name: "Organic Cotton T-Shirt",
      reviews: 189,
      rating: 4.7,
      trend: "+23%"
    }
  ]

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your review performance</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Recent Reviews
            </CardTitle>
            <CardDescription>Latest customer feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{review.customer}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
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
                      <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">{review.product}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{review.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Reviewed Products
            </CardTitle>
            <CardDescription>Products with the most reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">{product.name}</div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{product.reviews} reviews</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs text-green-600">
                      {product.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}