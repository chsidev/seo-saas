"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import ProtectedRoute from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Check,
  Crown,
  CreditCard,
  Calendar,
  Download,
  ExternalLink,
  Zap,
  Users,
  BarChart3,
  Search,
  Link as LinkIcon,
  FileText,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { api } from '@/lib/api';

// Data fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

const planDisplayNameMap: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro Agency',
  enterprise: 'Enterprise',
};

export default function BillingPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const isRTL = i18n.language === 'ar';

  // Fetch billing data
  const { data: billingData } = useSWR('/billing/status', fetcher);
  const { data: plans } = useSWR('/billing/plans', fetcher);
  const { data: billingHistory } = useSWR('/billing/history', fetcher);

  const currentPlanRaw = billingData?.currentPlan || 'starter';
  const currentPlan = planDisplayNameMap[currentPlanRaw.toLowerCase()] || 'Starter';


  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setShowUpgradeDialog(true);
  };

  const handleStripePayment = async () => {
    try {
      const response = await api.post('/stripe/checkout-sessioncreate-checkout-session', {
        plan_id: selectedPlan,
        cycle: billingCycle,
      });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error('Failed to create checkout session');
    }
  };

  const handleMyFatoorahPayment = async () => {
    try {
      const response = await api.post('/myfatoorah/subscribe', {
        plan_id: selectedPlan,
        cycle: billingCycle,
      });
      window.location.href = response.data.payment_url;
    } catch (error) {
      toast.error('Failed to create payment session');
    }
  };

  const handleContactSales = () => {
    toast.success('Contact form submitted! We\'ll be in touch soon.');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t('billing.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing information
            </p>
          </div>

          {/* Current Plan & Usage */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Crown className={`h-5 w-5 text-yellow-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('billing.currentPlan')}
                    </CardTitle>
                    <CardDescription>
                      {user?.subscription_plan} Plan - {user?.subscription_status}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    $59/month
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Features */}
                <div>
                  <h4 className="font-medium mb-3">Plan Features</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {billingData?.currentPlanFeatures?.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usage Stats */}
                <div>
                  <h4 className="font-medium mb-3">{t('billing.usage')}</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Projects</span>
                        <span>{billingData?.usage?.projects || 0} / {billingData?.limits?.projects || 0}</span>
                      </div>
                      <Progress value={billingData?.usage?.projects ? (billingData.usage.projects / billingData.limits.projects) * 100 : 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Keywords</span>
                        <span>{billingData?.usage?.keywords || 0} / {billingData?.limits?.keywords || 0}</span>
                      </div>
                      <Progress value={billingData?.usage?.keywords ? (billingData.usage.keywords / billingData.limits.keywords) * 100 : 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Audits This Month</span>
                        <span>{billingData?.usage?.audits || 0} / {billingData?.limits?.audits || 0}</span>
                      </div>
                      <Progress value={billingData?.usage?.audits ? (billingData.usage.audits / billingData.limits.audits) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleUpgrade('Pro Agency')}>
                    {t('billing.upgradeNow')}
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('billing.manageBilling')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next Billing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('billing.nextBilling')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">${billingData?.nextBilling?.amount || 0}</p>
                  <p className="text-sm text-muted-foreground">{billingData?.nextBilling?.date || 'N/A'}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{billingData?.paymentMethod || '•••• •••• •••• ••••'}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleUpgrade('Pro Agency')}>
                    {t('billing.updatePayment')}
                  </Button>
                </div>

                {user?.subscription_status === 'trial' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <Zap className="inline h-4 w-4 mr-1" />
                      Free trial ends in 45 days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pricing Plans */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                Choose the plan that best fits your needs
              </CardDescription>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center p-1 bg-muted rounded-lg w-fit">
                <Button
                  variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBillingCycle('yearly')}
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Save 20%
                  </Badge>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-4">
                {(plans || []).map((plan: any) => (
                  <Card key={plan.name} className={`relative ${plan.recommended ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Recommended
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="pt-2">
                        <span className="text-3xl font-bold">
                          {typeof plan.price[billingCycle] === 'number' 
                            ? `$${plan.price[billingCycle]}`
                            : plan.price[billingCycle]
                          }
                        </span>
                        {typeof plan.price[billingCycle] === 'number' && (
                          <span className="text-muted-foreground">
                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {plan.limitations.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Not included:</p>
                          {plan.limitations.map((limitation: string, index: number) => (
                            <div key={index} className="flex items-center text-xs text-muted-foreground">
                              <span className="w-4 h-4 mr-2 flex-shrink-0">×</span>
                              <span>{limitation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="pt-4">
                        {plan.name === 'Enterprise' ? (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleContactSales}
                          >
                            Contact Sales
                          </Button>
                        ) : currentPlan.toLowerCase() === plan.name.toLowerCase() ? (
                          <Button variant="outline" className="w-full" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button 
                            className="w-full"
                            variant={plan.recommended ? 'default' : 'outline'}
                            onClick={() => handleUpgrade(plan.name)}
                          >
                            {currentPlan === 'starter' ? 'Upgrade' : 'Switch Plan'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          {/* <Card>
            <CardHeader>
              <CardTitle>{t('billing.billingHistory')}</CardTitle>
              <CardDescription>
                Your recent billing transactions and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(billingHistory || []).map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.plan} Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                        <Badge variant={transaction.status === 'paid' ? 'default' : 'destructive'}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}

          {/* Upgrade Dialog */}
          <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Choose Payment Method</DialogTitle>
                <DialogDescription>
                  Select your preferred payment provider to upgrade to {selectedPlan}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <Button
                  onClick={handleStripePayment}
                  className="w-full h-12 justify-start"
                  variant="outline"
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Pay with Stripe</div>
                    <div className="text-xs text-muted-foreground">Credit/Debit Cards, Apple Pay, Google Pay</div>
                  </div>
                </Button>
                
                <Button
                  onClick={handleMyFatoorahPayment}
                  className="w-full h-12 justify-start"
                  variant="outline"
                >
                  <Shield className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Pay with MyFatoorah</div>
                    <div className="text-xs text-muted-foreground">KNET, Visa, Mastercard, Apple Pay</div>
                  </div>
                </Button>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  );
}