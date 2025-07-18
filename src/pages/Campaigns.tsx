import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Mail, 
  Plus, 
  Play,
  Pause,
  MoreVertical,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  MousePointer
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Campaigns() {
  const campaigns = [
    {
      id: 1,
      name: "Post-Purchase Review Request",
      type: "Automated",
      status: "active",
      trigger: "Order delivered + 3 days",
      sent: 1247,
      opened: 623,
      clicked: 187,
      converted: 89,
      openRate: 50.0,
      clickRate: 15.0,
      conversionRate: 7.1,
      created: "2024-01-10",
      lastSent: "2 hours ago"
    },
    {
      id: 2,
      name: "VIP Customer Thank You",
      type: "Targeted",
      status: "active",
      trigger: "High-value customers",
      sent: 156,
      opened: 134,
      clicked: 67,
      converted: 23,
      openRate: 85.9,
      clickRate: 43.0,
      conversionRate: 14.7,
      created: "2024-01-08",
      lastSent: "1 day ago"
    },
    {
      id: 3,
      name: "Photo Upload Incentive",
      type: "Automated",
      status: "paused",
      trigger: "Review without photo",
      sent: 89,
      opened: 42,
      clicked: 12,
      converted: 8,
      openRate: 47.2,
      clickRate: 13.5,
      conversionRate: 9.0,
      created: "2024-01-05",
      lastSent: "3 days ago"
    },
    {
      id: 4,
      name: "Milestone Celebration",
      type: "Automated",
      status: "draft",
      trigger: "5th review milestone",
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      created: "2024-01-15",
      lastSent: "Never"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />
      case 'paused': return <Pause className="h-3 w-3" />
      default: return null
    }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Campaigns</h1>
          <p className="text-muted-foreground">Automated email sequences to drive reviews</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">2 active, 1 paused</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,492</div>
            <p className="text-xs text-muted-foreground">↑ 12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52.3%</div>
            <p className="text-xs text-muted-foreground">↑ 3.2% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground">↑ 8.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {campaign.type}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(campaign.status)}
                        <span className="capitalize">{campaign.status}</span>
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{campaign.trigger}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sent:</span>
                      <span className="font-medium ml-2">{campaign.sent.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Opened:</span>
                      <span className="font-medium ml-2">{campaign.opened.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clicked:</span>
                      <span className="font-medium ml-2">{campaign.clicked.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Converted:</span>
                      <span className="font-medium ml-2">{campaign.converted.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    {campaign.status === 'active' ? (
                      <DropdownMenuItem>Pause</DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>Activate</DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Open Rate</span>
                    <span className="font-medium">{campaign.openRate}%</span>
                  </div>
                  <Progress value={campaign.openRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Click Rate</span>
                    <span className="font-medium">{campaign.clickRate}%</span>
                  </div>
                  <Progress value={campaign.clickRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium">{campaign.conversionRate}%</span>
                  </div>
                  <Progress value={campaign.conversionRate} className="h-2" />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>Created: {campaign.created}</span>
                <span>Last sent: {campaign.lastSent}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Empty State */}
      {campaigns.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first email campaign to start collecting reviews
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}