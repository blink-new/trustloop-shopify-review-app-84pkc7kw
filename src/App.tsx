import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { blink } from './blink/client'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Reviews } from './pages/Reviews'
import { Campaigns } from './pages/Campaigns'
import { Widgets } from './pages/Widgets'
import { Integrations } from './pages/Integrations'
import { Settings } from './pages/Settings'
import { Setup } from './pages/Setup'
import { ShopifyAuth } from './pages/ShopifyAuth'
import { ReviewForm } from './pages/ReviewForm'
import { Toaster } from './components/ui/toaster'
import { toast } from './hooks/use-toast'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [setupCompleted, setSetupCompleted] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Check setup status when user is loaded
      if (state.user && !state.isLoading) {
        checkSetupStatus(state.user)
      }
    })
    return unsubscribe
  }, [])

  const checkSetupStatus = async (userData: any) => {
    try {
      const setupData = await blink.db.setup.list({
        where: { userId: userData.id, setupCompleted: "1" },
        limit: 1
      })
      
      setSetupCompleted(setupData.length > 0)
    } catch (error) {
      console.error('Error checking setup status:', error)
      setSetupCompleted(false)
    } finally {
      setCheckingSetup(false)
    }
  }

  if (loading || checkingSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading TrustLoop...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center mx-auto mb-6">
            <span className="text-primary-foreground font-bold text-2xl">T</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to TrustLoop</h1>
          <p className="text-muted-foreground mb-8">
            The comprehensive Shopify app for review and UGC management with AI moderation, 
            email automation, and customizable widgets.
          </p>
          <button 
            onClick={() => blink.auth.login()}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Sign in with Google
          </button>
          <p className="text-sm text-muted-foreground mt-4">
            Secure authentication powered by Google
          </p>
        </div>
      </div>
    )
  }

  // Show setup page if setup is not completed
  if (!setupCompleted) {
    return (
      <Router>
        <Setup />
        <Toaster />
      </Router>
    )
  }

  return (
    <Router>
      <AppLayout user={user}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/widgets" element={<Widgets />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/auth/shopify/callback" element={<ShopifyAuth />} />
          <Route path="/review/:token" element={<ReviewForm />} />
        </Routes>
      </AppLayout>
      <Toaster />
    </Router>
  )
}

export default App