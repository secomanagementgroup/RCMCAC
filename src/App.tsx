import { useState, useEffect, useCallback } from 'react';
import LandingPage from '@/components/LandingPage';
import FunnelDashboard from '@/components/FunnelDashboard';
import Login from '@/components/Login';
import AdminSetup from '@/components/AdminSetup';
import AcceptInvite from '@/components/AcceptInvite';
import ProfileSetup from '@/components/ProfileSetup';
import { AuthProvider, useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type View = 'landing' | 'funnel' | 'login' | 'admin-setup' | 'accept-invite' | 'profile-setup';

function getRepSlugFromUrl(): string | undefined {
  const params = new URLSearchParams(window.location.search);
  return params.get('rep') || undefined;
}

function getInviteTokenFromUrl(): string | null {
  const hash = window.location.hash;
  const match = hash.match(/invite=([a-f0-9-]+)/i);
  return match ? match[1] : null;
}

function AppContent() {
  const { session, profile, loading } = useAuth();
  const [view, setView] = useState<View>('login');
  const [repSlug, setRepSlug] = useState<string | undefined>(undefined);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Check URL on mount for rep slug or invite token
  useEffect(() => {
    const slug = getRepSlugFromUrl();
    if (slug) {
      setRepSlug(slug);
      setView('landing');
    }

    const token = getInviteTokenFromUrl();
    if (token) {
      setInviteToken(token);
      setView('accept-invite');
    }
  }, []);

  // Check if any admin profile exists (for the bootstrap screen)
  const checkAdminExists = useCallback(async () => {
    if (!supabase) return;
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');
    setHasAdmin((count ?? 0) > 0);
  }, []);

  // When user tries to access the dashboard/funnel
  useEffect(() => {
    if (view === 'funnel' || view === 'login' || view === 'admin-setup') {
      checkAdminExists();
    }
  }, [view, checkAdminExists]);

  // Auto-redirect logic when auth state changes
  useEffect(() => {
    if (loading) return;

    if (inviteToken && view === 'accept-invite') {
      // Stay on accept-invite until they complete it
      return;
    }

    if (session && profile) {
      // Logged in with profile
      if (profile.role === 'admin') {
        // Admins always go to dashboard — never profile setup
        if (view === 'login' || view === 'admin-setup' || view === 'accept-invite' || view === 'profile-setup') {
          setView('funnel');
        }
      } else if (!profile.profile_setup_complete && view !== 'profile-setup') {
        setView('profile-setup');
      } else if (profile.profile_setup_complete && (view === 'login' || view === 'admin-setup' || view === 'accept-invite' || (view === 'profile-setup' && !isEditingProfile))) {
        setView('funnel');
      }
    } else if (session && !profile && view !== 'profile-setup' && view !== 'accept-invite') {
      // Has session but no profile yet — could be mid-signup
      // If admin doesn't exist, they're bootstrapping
      if (hasAdmin === false) {
        // They just signed up for admin — the complete_signup rpc should have created the profile
        // If profile is still missing, show admin setup
      }
    }
  }, [session, profile, loading, view, inviteToken, hasAdmin, isEditingProfile]);

  // Handle navigation from landing page "Staff Login" button
  function handleGoToFunnel() {
    if (loading) return;
    if (session && profile?.profile_setup_complete) {
      setView('funnel');
    } else if (session && profile && !profile.profile_setup_complete) {
      setView('profile-setup');
    } else {
      // No session — check if admin exists
      if (hasAdmin === null) {
        checkAdminExists().then(() => {
          // Will be handled by the effect
        });
      }
      setView(hasAdmin === false ? 'admin-setup' : 'login');
    }
  }

  // Show loading screen while auth state resolves
  if (loading && view !== 'accept-invite' && view !== 'landing') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  // Accept invite flow takes priority
  if (view === 'accept-invite' && inviteToken) {
    // If already logged in with a complete profile, go to funnel
    if (session && profile?.profile_setup_complete) {
      setView('funnel');
      return null;
    }
    return (
      <AcceptInvite
        token={inviteToken}
        onSuccess={() => {
          // Clear the invite hash from URL
          window.location.hash = '';
          setInviteToken(null);
          // The auth state change will trigger the profile-setup view
          setView('profile-setup');
        }}
      />
    );
  }

  // Landing page (only for rep links / customer-facing pages with ?rep=)
  if (view === 'landing' && repSlug) {
    return (
      <LandingPage
        onGoToFunnel={handleGoToFunnel}
        repSlug={repSlug}
      />
    );
  }

  // Admin bootstrap (one-time) — goes straight to dashboard, no profile setup
  if (view === 'admin-setup' || (view === 'login' && hasAdmin === false)) {
    return (
      <AdminSetup
        onSuccess={() => {
          setView('funnel');
        }}
        onBack={() => setView('login')}
      />
    );
  }

  // Profile setup — only for non-admin (sales reps)
  if ((view === 'profile-setup' || (session && profile && !profile.profile_setup_complete)) && profile?.role !== 'admin') {
    return (
      <ProfileSetup
        isEditing={isEditingProfile}
        onComplete={() => {
          setIsEditingProfile(false);
          setView('funnel');
        }}
        onCancel={() => {
          setIsEditingProfile(false);
          setView('funnel');
        }}
      />
    );
  }

  // Login screen — default view for staff
  if (view === 'login' || (!session && (view === 'funnel'))) {
    return (
      <Login
        onSuccess={() => {
          // Auth state change will handle redirect
          setView('funnel');
        }}
      />
    );
  }

  // Funnel dashboard (auth required)
  if (view === 'funnel') {
    if (!session || !profile) {
      return (
        <Login
          onSuccess={() => setView('funnel')}
        />
      );
    }
    return (
      <FunnelDashboard
        onEditProfile={() => {
          setIsEditingProfile(true);
          setView('profile-setup');
        }}
      />
    );
  }

  // Fallback: show login
  return (
    <Login
      onSuccess={() => setView('funnel')}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
