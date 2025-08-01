"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, Loader2, Mail, User, Building } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface InviteInfo {
  id: number;
  email: string;
  role: 'viewer' | 'editor' | 'owner';
  status: 'pending' | 'accepted' | 'declined';
  project: {
    id: number;
    name: string;
  };
  inviter: {
    name: string;
    email: string;
  };
}

export default function AcceptInvitePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const fetchInviteInfo = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      if (authLoading) return;

      if (!user) {
        // Store the current URL to redirect back after login
        localStorage.setItem('redirect_after_login', `/auth/accept-invite?token=${token}`);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/invites/info?token=${token}`);
        setInviteInfo(response.data);
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Failed to load invitation details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInviteInfo();
  }, [token, user, authLoading]);

  const handleAccept = async () => {
    if (!token) return;
    
    setSubmitting(true);
    try {
      await api.post('/invites/accept', { token });
      toast.success('Invitation accepted successfully!');
      router.push('/projects');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to accept invitation';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    
    setSubmitting(true);
    try {
      await api.post('/invites/decline', { token });
      toast.success('Invitation declined');
      router.push('/projects');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to decline invitation';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      viewer: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    };
    
    return (
      <Badge className={variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Search className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                SEO Pro
              </span>
            </div>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading invitation...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Search className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                SEO Pro
              </span>
            </div>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Team Invitation</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                You need to sign in to accept this team invitation
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/auth/login">
                    Sign In
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/register">
                    Create Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Search className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                SEO Pro
              </span>
            </div>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {error}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/projects">
                  Go to Projects
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!inviteInfo) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Search className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              SEO Pro
            </span>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Team Invitation</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              You've been invited to join a project team
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Project</span>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-semibold">{inviteInfo.project.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Role</span>
                  {getRoleBadge(inviteInfo.role)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Invited by</span>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="text-right">
                      <p className="font-medium text-sm">{inviteInfo.inviter.name}</p>
                      <p className="text-xs text-muted-foreground">{inviteInfo.inviter.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleAccept}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Accept
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleDecline}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}