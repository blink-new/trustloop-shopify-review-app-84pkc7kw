import { useState, useEffect } from 'react'
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
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { blink } from '@/blink/client'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DashboardStats {
  totalReviews: number
  averageRating: number
  verifiedPurchaseRate: number
  pendingReviews: number
  monthlyGrowth: number
}

interface RecentReview {
  id: string
  customerName: string
  customerEmail: string
  productTitle: string
  rating: number
  comment: string
  createdAt: string
  isVerified: boolean
  status: string
}

interface TopProduct {
  productId: string
  productTitle: string
  reviewCount: number
  averageRating: number
  monthlyGrowth: number
}

export function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    averageRating: 0,
    verifiedPurchaseRate: 0,
    pendingReviews: 0,
    monthlyGrowth: 0
  })
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setLoading(true)
        
        // Get user data
        const userData = await blink.auth.me()
        setUser(userData)
        
        // Check if setup is complete
        const setupData = await blink.db.setup.list({
          where: { userId: userData.id, setupCompleted: "1" },
          limit: 1
        })
        
        if (setupData.length === 0) {
          // Redirect to setup if not complete
          window.location.href = '/setup'
          return
        }
        
        // Load dashboard data
        await Promise.all([
          loadDashboardStats(userData.id),
          loadRecentReviews(userData.id),
          loadTopProducts(userData.id)
        ])
        
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    initDashboard()
  }, [])

  const loadDashboardStats = async (userId: string) => {
    try {
      // Get all reviews for this user
      const reviews = await blink.db.reviews.list({
        where: { userId }
      })
      
      // Calculate stats
      const totalReviews = reviews.length
      const approvedReviews = reviews.filter(r => r.status === 'approved')
      const pendingReviews = reviews.filter(r => r.status === 'pending').length
      const verifiedReviews = reviews.filter(r => Number(r.isVerified) > 0).length
      
      const averageRating = approvedReviews.length > 0 
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0
      
      const verifiedPurchaseRate = totalReviews > 0 
        ? (verifiedReviews / totalReviews) * 100
        : 0
      
      // Calculate monthly growth (simplified)
      const monthlyGrowth = Math.random() * 20 - 10 // Placeholder
      
      setStats({
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
        verifiedPurchaseRate: Number(verifiedPurchaseRate.toFixed(1)),
        pendingReviews,
        monthlyGrowth: Number(monthlyGrowth.toFixed(1))
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadRecentReviews = async (userId: string) => {
    try {
      const reviews = await blink.db.reviews.list({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        limit: 5
      })
      
      setRecentReviews(reviews.map(review => ({
        id: review.id,
        customerName: review.customerName,
        customerEmail: review.customerEmail,
        productTitle: review.productTitle,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        isVerified: Number(review.isVerified) > 0,
        status: review.status
      })))
    } catch (error) {
      console.error('Error loading recent reviews:', error)
    }
  }

  const loadTopProducts = async (userId: string) => {
    try {
      // Get all reviews grouped by product
      const reviews = await blink.db.reviews.list({
        where: { userId, status: 'approved' }
      })
      
      // Group by product and calculate stats
      const productStats: Record<string, any> = {}
      
      reviews.forEach(review => {
        if (!productStats[review.productId]) {
          productStats[review.productId] = {
            productId: review.productId,
            productTitle: review.productTitle,
            ratings: [],
            count: 0
          }
        }
        productStats[review.productId].ratings.push(review.rating)
        productStats[review.productId].count++
      })
      
      // Convert to array and sort by count
      const topProductsArray = Object.values(productStats)
        .map((product: any) => ({
          productId: product.productId,
          productTitle: product.productTitle,
          reviewCount: product.count,
          averageRating: product.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / product.ratings.length,
          monthlyGrowth: Math.random() * 30 // Placeholder
        }))
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 3)
      
      setTopProducts(topProductsArray)
    } catch (error) {
      console.error('Error loading top products:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return '1 day ago'
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Reviews",
      value: stats.totalReviews.toString(),
      description: `${stats.monthlyGrowth > 0 ? '↑' : '↓'} ${Math.abs(stats.monthlyGrowth)}% from last month`,
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toString(),
      description: "Overall customer satisfaction",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Verified Purchases",
      value: `${stats.verifiedPurchaseRate}%`,
      description: "Reviews from verified customers",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews.toString(),
      description: "Awaiting moderation",
      icon: Eye,
      color: "text-purple-600"
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
        {statCards.map((stat, index) => {
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
              {recentReviews.length > 0 ? (
                recentReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{review.customerName}</span>
                          {review.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          <Badge variant={review.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                            {review.status}
                          </Badge>
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
                        <p className="text-xs text-muted-foreground">{review.productTitle}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground">Reviews will appear here once customers start submitting them</p>
                </div>
              )}
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
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">{product.productTitle}</div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{product.reviewCount} reviews</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span>{product.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs text-green-600">
                        +{product.monthlyGrowth.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No product reviews yet</p>
                  <p className="text-sm text-muted-foreground">Top products will appear here once you receive reviews</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}