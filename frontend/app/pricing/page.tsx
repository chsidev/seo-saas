"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Check,
  X,
  Crown,
  Zap,
  Users,
  BarChart3,
  Search,
  Link as LinkIcon,
  FileText,
  Shield,
  ArrowRight,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import PublicNavbar from '@/components/layout/public-navbar';
import Footer from '@/components/layout/footer';

export default function PricingPage() {
  const { t, i18n } = useTranslation();
  const [isYearly, setIsYearly] = useState(false);

  const { user, loading } = useAuth();
  const router = useRouter();

  const isRTL = i18n.language === 'ar';

  // Check trial and subscription status
  const isInTrial = user?.trial_ends_at && new Date(user.trial_ends_at) > new Date();
  const trialExpired = user?.trial_ends_at && new Date(user.trial_ends_at) < new Date();
  const hasActiveSubscription = user?.subscription_status === 'active';
  const currentPlan = user?.subscription_plan?.toLowerCase();

  const plans = [
    {
      name: 'Starter',
      description: 'Great for small businesses',
      price: { monthly: 29, yearly: 279 },
      popular: false,
      features: [
        '1 Project',
        '1 User Seat',
        '300 Keywords',
        '10 Site Audits/month',
        'Google only Tracking',
        'Email Report',
      ],
      limitations: [
        'Limited Audit & Rank History',
        'No Backlink Crawler',
        'No Team Collaboration',
        'No Custom Branding',
        'No Region/Language Selection',
        'No API Access',
        'No SMTP Control',
        'No Custom PDF Filters',
        'No Priority Support',
        'No Training/Onboarding',
      ],
      cta: 'Start 14-Day Trial',
      href: '/auth/register',
    },
    {
      name: 'Growth',
      description: 'Perfect for growing agencies',
      price: { monthly: 59, yearly: 567 },
      popular: true,
      features: [
        '1 User Seats',
        '8 Projects',
        '800 Keywords',
        '25 Site Audits/month',
        'Basic Backlink Analysis',
        'Team Collaboration',
        'Custom Branding (PDF/CSV)',
        'Google + Bing Tracking',
        'Weekly Email Reports',
        'Region/Language Selection',
      ],
      limitations: [
        'Limited Audit & Rank History',
        'No API Access',
        'No SMTP Control',
        'No Custom PDF Filters',
        'No Priority Support',
        'No Training/Onboarding',
      ],
      cta: 'Start 14-Day Trial',
      href: '/auth/register',
    },
    {
      name: 'Pro Agency',
      description: 'For established agencies',
      price: { monthly: 149, yearly: 1431 },
      popular: false,
      features: [
        '10 User Seats',
        '30 Projects',
        '3,000 Keywords',
        '100 Site Audits/month',
        'Full Backlink Suite',
        'Team Collaboration',
        'Full Custom Branding',
        'Google, Bing, Yahoo Tracking',
        'Weekly Email Reports',
        'Full Audit & Rank History',
        'Region/Language Selection',
        'SMTP Control',
        'Custom PDF Filters',
        'Priority Support',
      ],
      limitations: [
        'Limited API Access',
        'No Training/Onboarding',
      ],
      cta: 'Get Started',
      href: '/auth/register',
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: { monthly: 'Custom', yearly: 'Custom' },
      popular: false,
      features: [
        'Unlimited User Seats',
        'Unlimited Projects',
        'Unlimited Keywords',
        'Unlimited Audits',
        'Dedicated Backlink Crawler',
        'Unlimited Team Members',
        'Full Custom Branding',
        'All Search Engines',
        'Custom Email Reports',
        'Full Audit & Rank History',
        'Region/Language Selection',
        'Full API Access',
        'SMTP Control',
        'Custom PDF Filters',
        'Priority Support',
        'Training & Onboarding',
      ],
      limitations: [],
      cta: 'Contact Sales',
      href: '/contact',
    },
  ];

  // Determine which plan should be highlighted
  const getHighlightedPlan = () => {
    if (!user) return 'Growth'; // Most popular for anonymous users
    if (hasActiveSubscription && currentPlan) {
      // Highlight current plan for subscribed users
      const planName = plans.find(p => p.name.toLowerCase() === currentPlan)?.name;
      return planName || 'Growth';
    }
    return 'Growth'; // Default to most popular
  };

  const highlightedPlan = getHighlightedPlan();

  // Update plans to set popular flag dynamically
  const updatedPlans = plans.map(plan => ({
    ...plan,
    popular: plan.name === highlightedPlan
  }));
  const features = [
    { name: 'User Seats', starter: '1', growth: '3', pro: '10', enterprise: 'Unlimited' },
    { name: 'Projects', starter: '1', growth: '8', pro: '30', enterprise: 'Unlimited' },
    { name: 'Tracked Keywords', starter: '300', growth: '800', pro: '3,000', enterprise: '10,000+' },
    { name: 'SEO Audits / Month', starter: '10', growth: '25', pro: '100', enterprise: 'Unlimited' },
    { name: 'Backlink Crawler', starter: false, growth: 'Basic', pro: 'Full (Depth 3, IPs, Redirects)', enterprise: 'Dedicated' },
    { name: 'Team Collaboration', starter: false, growth: true, pro: true, enterprise: true },
    { name: 'Custom Branding (PDF/CSV)', starter: false, growth: false, pro: false, enterprise: 'Full White-label' },
    { name: 'Search Engine Tracking', starter: 'Google only', growth: 'Google + Bing', pro: 'Google, Bing, Yahoo', enterprise: 'All + custom options' },
    { name: 'Weekly Email Reports', starter: true, growth: true, pro: true, enterprise: true },
    { name: 'Audit & Rank History', starter: 'Limited', growth: 'Limited', pro: 'Full retention', enterprise: 'Full retention' },
    { name: 'Region/Language Selection', starter: false, growth: true, pro: true, enterprise: true },
    { name: 'API Access', starter: false, growth: false, pro: 'Read-only', enterprise: 'Full access' },
    { name: 'SMTP / Email Control', starter: false, growth: false, pro: true, enterprise: true },
    { name: 'Custom PDF Filters', starter: false, growth: false, pro: true, enterprise: true },
    { name: 'Priority Support', starter: false, growth: false, pro: true, enterprise: 'SLA-backed' },
    { name: 'Training / Onboarding', starter: false, growth: false, pro: false, enterprise: true },
  ];

  const planIdMap = {
    "Starter": "starter",
    "Growth": "growth",
    "Pro Agency": "pro",
  };


  const handleSelectPlan = async (planId: string) => {    
    console.log(' Selected plan:', planId);
    
    if (loading) {
      console.log(' Still loading user context...');
      return; 
    }
    
    if (!user) {
      console.warn(' No user context found, redirecting');
      router.push('/auth/register');
      return;
    }
    
    if (!user.is_verified) {
      toast.warning('Please verify your email before selecting a plan.');
      return;
    }
    
    // If user has active subscription and selecting their current plan
    if (hasActiveSubscription && currentPlan === planId.toLowerCase()) {
      toast.success('You already have access to this plan.');
      router.push('/dashboard');
      return;
    }
    
    // If user is in trial period for Starter or Growth plans, redirect to dashboard
    if (isInTrial && (planId === 'Starter' || planId === 'Growth')) {
      toast.success('You already have access to this plan during your trial period.');
      router.push('/dashboard');
      return;
    }
    
    if (planId === 'enterprise') {
      router.push('/contact');
      return;
    }

    try {
      const res = await api.post('/myfatoorah/subscribe', {
        plan_id: planIdMap[planId as keyof typeof planIdMap],
        billing_cycle: isYearly ? 'yearly' : 'monthly',
      });
      console.log(' Got checkout URL:', res.data.checkout_url);
      window.location.href = res.data.checkout_url;
    } catch (err) {
      toast.error('Failed to create payment session.');
    }
  };

  const getCtaLabel = (planName: string) => {
    if (!user) {
      return planName === 'Enterprise' ? 'Contact Sales' : (planName === 'Starter' || planName === 'Growth') ? 'Start 14-Day Trial' : 'Get Started';
    }
    
    // If user has active subscription and this is their current plan
    if (hasActiveSubscription && currentPlan === planName.toLowerCase()) {
      return 'Go to Dashboard';
    }
    
    // If user is in trial and selecting Starter/Growth plans
    if (isInTrial && (planName === 'Starter' || planName === 'Growth')) {
      return 'Start 14-Day Trial';
    }
    
    // If trial expired or no trial
    if (trialExpired || !user.trial_ends_at) {
      return planName === 'Enterprise' ? 'Contact Sales' : 'Get Started';
    }
    
    // Default case
    return planName === 'Enterprise' ? 'Contact Sales' : (planName === 'Starter' || planName === 'Growth') ? 'Start 14-Day Trial' : 'Get Started';
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            <Badge variant="outline" className="w-fit mx-auto">
              <Crown className="h-3 w-3 mr-1" />
              Pricing Plans
            </Badge>
            <h1 className="text-4xl font-bold lg:text-6xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Choose the perfect plan
              <br />
              <span className="text-primary">for your business</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Starter and Growth plans include a 14-day free trial. All paid plans require a credit card.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <Label htmlFor="billing-toggle" className={isYearly ? 'text-muted-foreground' : 'font-medium'}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label htmlFor="billing-toggle" className={isYearly ? 'font-medium' : 'text-muted-foreground'}>
                Yearly
                <Badge variant="secondary" className="ml-2">
                  Save 20%
                </Badge>
              </Label>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-4">
            {updatedPlans.map((plan, index) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-2xl scale-105' : 'shadow-lg'} border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      {hasActiveSubscription && currentPlan === plan.name.toLowerCase() ? 'Current Plan' : 'Most Popular'}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {(plan.name === 'Starter' || plan.name === 'Growth') && typeof plan.price[isYearly ? 'yearly' : 'monthly'] === 'number'
                      ? `14-day free trial, then billed ${isYearly ? 'yearly' : 'monthly'}.`
                      : 'No trial. Immediate billing.'}
                  </CardDescription>
                  
                  <div className="pt-4 text-center">
                    {isYearly && typeof plan.price.monthly === 'number' && typeof plan.price.yearly === 'number' ? (
                      <>
                        <div>
                          <span className="text-xl text-muted-foreground line-through mr-2">
                            ${plan.price.monthly * 12}
                          </span>
                          <span className="text-4xl font-bold text-primary">
                            ${plan.price.yearly}
                          </span>
                          <span className="text-muted-foreground">/year</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${plan.price.monthly}/month billed annually
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">
                          {typeof plan.price.monthly === 'number' ? `$${plan.price.monthly}` : plan.price.monthly}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    )}
                  </div>
                </CardHeader>

                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature: string, featureIndex: number) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t space-y-3">
                      {plan.limitations.map((limitation: string, limitationIndex: number) => (
                        <div key={limitationIndex} className="flex items-center text-sm text-muted-foreground">
                          <X className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-6">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handleSelectPlan(plan.name)}
                      disabled={hasActiveSubscription && currentPlan === plan.name.toLowerCase()}
                    >
                      {getCtaLabel(plan.name)}
                      {plan.name !== 'Enterprise' && !(hasActiveSubscription && currentPlan === plan.name.toLowerCase()) && (
                        <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Compare all features
            </h2>
            <p className="text-xl text-muted-foreground">
              See exactly what's included in each plan
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-6 font-semibold">Features</th>
                  <th className="text-center p-6 font-semibold">Starter</th>
                  <th className="text-center p-6 font-semibold bg-primary/5">
                    Growth
                    <Badge variant="secondary" className="ml-2 text-xs">Popular</Badge>
                  </th>
                  <th className="text-center p-6 font-semibold">Pro Agency</th>
                  <th className="text-center p-6 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature.name} className={`border-b ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                    <td className="p-6 font-medium">{feature.name}</td>
                    {/* <td className="text-center p-6">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        feature.free
                      )}
                    </td> */}
                    <td className="text-center p-6">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        feature.starter
                      )}
                    </td>
                    <td className="text-center p-6 bg-primary/5">
                      {typeof feature.growth === 'boolean' ? (
                        feature.growth ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        <span className="font-medium">{feature.growth}</span>
                      )}
                    </td>
                    <td className="text-center p-6">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        feature.pro
                      )}
                    </td>
                    <td className="text-center p-6">
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        feature.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Frequently asked questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any billing differences.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What happens after the free trial?</h3>
              <p className="text-muted-foreground">
                After your 14-Day free trial ends, you'll be automatically charged. 
                You can upgrade to a paid plan at any time.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                Yes, we offer a 30-day money-back guarantee on all paid plans. 
                If you're not satisfied, we'll refund your payment in full.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Absolutely. You can cancel your subscription at any time from your account settings. 
                Your access will continue until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold lg:text-4xl text-white">
              Ready to get started?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Join thousands of SEO professionals who trust our platform to grow their business.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/auth/register">
                Start Free Trial
                <ArrowRight className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}