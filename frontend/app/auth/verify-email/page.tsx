"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';


export default function VerifyEmailPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const isRTL = i18n.language === 'ar';
  
console.log("✅ verify-email page rendered");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.detail || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Search className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              SEO Pro
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.verifyEmail')}
          </h1>
        </div>

        {/* Verification Status */}
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              {status === 'loading' && (
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-16 w-16 text-green-600" />
              )}
              {status === 'error' && (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Please wait while we verify your email address'}
              {status === 'success' && 'Your email has been successfully verified'}
              {status === 'error' && 'There was a problem verifying your email'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {message && (
              <Alert variant={status === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-2">
              {status === 'success' && (
                <Button className="w-full" asChild>
                  <Link href="/auth/login">
                    Continue to Login
                  </Link>
                </Button>
              )}
              
              {status === 'error' && (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/register">
                      Try Again
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/auth/login">
                      Back to Login
                    </Link>
                  </Button>
                </>
              )}
              
              {status === 'loading' && (
                <Button variant="outline" className="w-full" disabled>
                  Please wait...
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}