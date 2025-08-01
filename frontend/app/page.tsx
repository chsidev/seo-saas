"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  BarChart3,
  Link as LinkIcon,
  FileBarChart,
  Users,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import PublicNavbar from '@/components/layout/public-navbar';
import Footer from '@/components/layout/footer';

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 10);

    return () => clearTimeout(timeout);
    // if (!loading && isAuthenticated) {
    //   router.push('/dashboard');
    // }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: Search,
      title: 'Keyword Tracking',
      description: 'Monitor your keyword rankings across multiple search engines and locations in real-time.',
    },
    {
      icon: BarChart3,
      title: 'Site Audits',
      description: 'Comprehensive SEO audits that identify technical issues and optimization opportunities.',
    },
    {
      icon: LinkIcon,
      title: 'Backlink Analysis',
      description: 'Track your backlink profile and discover new link building opportunities.',
    },
    {
      icon: FileBarChart,
      title: 'Custom Reports',
      description: 'Generate beautiful, branded reports for clients and stakeholders.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team and manage client access with role-based permissions.',
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: 'Support for multiple languages and regions to track global SEO performance.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'SEO Manager at TechCorp',
      content: 'This platform has revolutionized how we track and report on our SEO performance. The insights are invaluable.',
      rating: 5,
    },
    {
      name: 'Ahmed Al-Rashid',
      role: 'Digital Marketing Director',
      content: 'The Arabic language support and regional tracking features are exactly what we needed for our MENA campaigns.',
      rating: 5,
    },
    {
      name: 'Maria Garcia',
      role: 'Freelance SEO Consultant',
      content: 'The client reporting features save me hours every week. My clients love the professional reports.',
      rating: 5,
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Add Your Website',
      description: 'Connect your website and configure your target keywords and locations.',
    },
    {
      step: '02',
      title: 'Track Performance',
      description: 'Monitor your rankings, run audits, and analyze your backlink profile.',
    },
    {
      step: '03',
      title: 'Generate Reports',
      description: 'Create beautiful reports and share insights with your team or clients.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit">
                  <Zap className="h-3 w-3 mr-1" />
                  Trusted by 10,000+ SEO professionals
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight lg:text-6xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Scale Your SEO
                  <br />
                  <span className="text-primary">Like Never Before</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  The all-in-one SEO platform that helps agencies and businesses track rankings, 
                  audit websites, and generate professional reports.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/auth/register">
                    Start Free Trial
                    <ArrowRight className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link href="/pricing">
                    View Pricing
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Cancel anytime
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Keyword Rankings</h3>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      +12% this week
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {['SEO tools', 'keyword tracker', 'backlink analysis'].map((keyword, index) => (
                      <div key={keyword} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{keyword}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-primary">#{index + 1}</span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              <Shield className="h-3 w-3 mr-1" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl font-bold lg:text-5xl">
              Everything you need to
              <br />
              <span className="text-primary">dominate search results</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive suite of SEO tools helps you track, analyze, and improve 
              your search engine performance.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              <Play className="h-3 w-3 mr-1" />
              How It Works
            </Badge>
            <h2 className="text-3xl font-bold lg:text-5xl">
              Get started in
              <br />
              <span className="text-primary">3 simple steps</span>
            </h2>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <div className="w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              <Star className="h-3 w-3 mr-1" />
              Testimonials
            </Badge>
            <h2 className="text-3xl font-bold lg:text-5xl">
              Loved by SEO professionals
              <br />
              <span className="text-primary">around the world</span>
            </h2>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg leading-relaxed">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold lg:text-5xl text-white">
              Ready to boost your SEO?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Join thousands of SEO professionals who trust our platform to grow their organic traffic.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                <Link href="/auth/register">
                  Start Free Trial
                  <ArrowRight className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}