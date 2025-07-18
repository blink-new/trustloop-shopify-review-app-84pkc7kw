import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star, Upload, CheckCircle, AlertCircle, Camera, Video } from 'lucide-react'
import { blink } from '../blink/client'
import { toast } from '@/hooks/use-toast'
import { parseReviewRequestToken } from '../utils/shopify'

export function ReviewForm() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewData, setReviewData] = useState({
    customerName: '',
    customerEmail: '',
    title: '',
    content: '',
    photos: [] as string[],
    videos: [] as string[]
  })
  const [tokenData, setTokenData] = useState<{
    orderId: string
    customerId: string
    productId: string
  } | null>(null)

  useEffect(() => {
    if (token) {
      const parsed = parseReviewRequestToken(token)
      if (parsed) {
        setTokenData(parsed)
      } else {
        setError('Invalid review request token')
      }
    }
  }, [token])

  const handleFileUpload = async (files: FileList | null, type: 'photo' | 'video') => {
    if (!files) return

    try {
      setLoading(true)
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const { publicUrl } = await blink.storage.upload(
          file,
          `reviews/${type}s/${Date.now()}-${file.name}`,
          { upsert: true }
        )
        uploadedUrls.push(publicUrl)
      }

      setReviewData(prev => ({
        ...prev,
        [type === 'photo' ? 'photos' : 'videos']: [
          ...prev[type === 'photo' ? 'photos' : 'videos'],
          ...uploadedUrls
        ]
      }))

      toast({
        title: "Files uploaded successfully!",
        description: `${uploadedUrls.length} ${type}(s) uploaded`
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tokenData) {
      setError('Invalid review request')
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!reviewData.customerName.trim() || !reviewData.customerEmail.trim() || !reviewData.content.trim()) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const reviewRecord = {
        id: `review_${Date.now()}`,
        userId: 'system', // This would be set by the webhook handler
        shopifyProductId: tokenData.productId,
        shopifyOrderId: tokenData.orderId,
        customerName: reviewData.customerName,
        customerEmail: reviewData.customerEmail,
        rating: rating,
        title: reviewData.title,
        content: reviewData.content,
        photos: JSON.stringify(reviewData.photos),
        videos: JSON.stringify(reviewData.videos),
        verifiedPurchase: true,
        status: 'pending',
        moderationScore: 0,
        source: 'email',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await blink.db.reviews.create(reviewRecord)

      setSubmitted(true)
      toast({
        title: "Review submitted successfully!",
        description: "Thank you for your feedback. Your review is being processed."
      })

    } catch (error) {
      console.error('Submit error:', error)
      setError('Failed to submit review. Please try again.')
      toast({
        title: "Submission failed",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const removeMedia = (index: number, type: 'photo' | 'video') => {
    setReviewData(prev => ({
      ...prev,
      [type === 'photo' ? 'photos' : 'videos']: prev[type === 'photo' ? 'photos' : 'videos'].filter((_, i) => i !== index)
    }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Review Submitted!</CardTitle>
            <CardDescription>
              Thank you for your feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Your review has been submitted successfully and will be reviewed by our team.
            </p>
            <div className="flex justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <Button onClick={() => window.close()} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Leave a Review
            </CardTitle>
            <CardDescription>
              Share your experience with this product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Rating */}
              <div>
                <Label className="text-base font-medium">Overall Rating *</Label>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          i < (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-3 text-sm text-muted-foreground">
                      {rating} out of 5 stars
                    </span>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Your Name *</Label>
                  <Input
                    id="customerName"
                    value={reviewData.customerName}
                    onChange={(e) => setReviewData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={reviewData.customerEmail}
                    onChange={(e) => setReviewData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Review Title */}
              <div>
                <Label htmlFor="title">Review Title (Optional)</Label>
                <Input
                  id="title"
                  value={reviewData.title}
                  onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your review"
                />
              </div>

              {/* Review Content */}
              <div>
                <Label htmlFor="content">Your Review *</Label>
                <Textarea
                  id="content"
                  rows={4}
                  value={reviewData.content}
                  onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              {/* Photo Upload */}
              <div>
                <Label className="text-base font-medium">Add Photos (Optional)</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, 'photo')}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Upload Photos
                  </label>
                </div>
                {reviewData.photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {reviewData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(index, 'photo')}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <Label className="text-base font-medium">Add Videos (Optional)</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, 'video')}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Upload Videos
                  </label>
                </div>
                {reviewData.videos.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {reviewData.videos.map((video, index) => (
                      <div key={index} className="relative">
                        <video
                          src={video}
                          className="w-full h-20 object-cover rounded-lg"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(index, 'video')}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || loading || rating === 0}
                className="w-full"
                size="lg"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting this review, you agree to our terms and conditions.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}