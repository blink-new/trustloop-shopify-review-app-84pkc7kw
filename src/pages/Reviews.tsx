import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Star, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function Reviews() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const reviews = [
    {
      id: 1,
      customer: "Sarah Johnson",
      email: "sarah.j@email.com",
      product: "Wireless Bluetooth Headphones",
      rating: 5,
      comment: "Amazing sound quality and comfortable fit. Perfect for workouts! The battery life is outstanding and they connect seamlessly to my phone.",
      date: "2024-01-15",
      status: "approved",
      verified: true,
      sentiment: "positive",
      flagged: false,
      images: 2
    },
    {
      id: 2,
      customer: "Mike Chen",
      email: "mike.chen@email.com",
      product: "Smart Watch Pro",
      rating: 4,
      comment: "Great features but battery life could be better. Overall satisfied with the purchase and would recommend to others.",
      date: "2024-01-14",
      status: "pending",
      verified: true,
      sentiment: "neutral",
      flagged: false,
      images: 1
    },
    {
      id: 3,
      customer: "Emma Davis",
      email: "emma.d@email.com",
      product: "Organic Cotton T-Shirt",
      rating: 5,
      comment: "Super soft and comfortable. Love the eco-friendly materials!",
      date: "2024-01-13",
      status: "approved",
      verified: false,
      sentiment: "positive",
      flagged: false,
      images: 0
    },
    {
      id: 4,
      customer: "John Smith",
      email: "j.smith@email.com",
      product: "Wireless Bluetooth Headphones",
      rating: 1,
      comment: "Poor quality, stopped working after 2 days. Very disappointed.",
      date: "2024-01-12",
      status: "flagged",
      verified: true,
      sentiment: "negative",
      flagged: true,
      images: 0
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'flagged': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'negative': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === 'all' || review.status === filter
    const matchesSearch = review.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
          <p className="text-muted-foreground">Manage and moderate customer reviews</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
          <Button size="sm">
            Export Reviews
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews, customers, or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{review.customer}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <Badge className={`text-xs ${getStatusColor(review.status)}`}>
                      {review.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
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
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <div className="flex items-center space-x-1">
                      {getSentimentIcon(review.sentiment)}
                      <span className="text-sm text-muted-foreground capitalize">{review.sentiment}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{review.product}</p>
                  <p className="text-sm mb-3">{review.comment}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{review.email}</span>
                    {review.images > 0 && (
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {review.images} photo{review.images > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {review.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Review</DropdownMenuItem>
                      <DropdownMenuItem>Reply to Customer</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reviews found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Reviews will appear here once customers start leaving feedback'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}