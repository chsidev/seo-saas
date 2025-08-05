"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import ProtectedRoute from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  User,
  Users,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Monitor,
  Mail,
  Plus,
  Trash2,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { api } from '@/lib/api';

// Data fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const isRTL = i18n.language === 'ar';

  // Fetch team data
  const [timezone, setTimezone] = useState('utc');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    weeklyReports: true,
    auditAlerts: true,
    rankingChanges: false,
    teamUpdates: true,
    emailSummary: true,
  });

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    toast.success('Language updated successfully');
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success('Theme updated successfully');
  };

  const handleProfileUpdate = async () => {
    try {
      await api.patch('/users/update', {
        name: profileData.name,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
  }
    setProfileData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  const handlePasswordChange = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      await api.post('/users/change-password', {
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword,
      });
      toast.success('Password updated successfully');
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/users/delete-account');
      toast.success('Account deleted successfully');
      logout();
      router.push('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete account';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-muted-foreground">Loading profile...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t('settings.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center">
                <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('settings.profile')}
              </TabsTrigger>
              {/* <TabsTrigger value="team" className="flex items-center">
                <Users className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('settings.team')}
              </TabsTrigger> */}
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('settings.notifications')}
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center">
                <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('settings.preferences')}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.personalInfo')}</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('auth.name')}</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  
                  <Button onClick={handleProfileUpdate}>
                    {t('common.save')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.changePassword')}</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('settings.currentPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  
                  <Button onClick={handlePasswordChange}>
                    Update Password
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Delete Account</CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <h4 className="font-medium text-destructive mb-2">Warning</h4>
                      <p className="text-sm text-muted-foreground">
                        Deleting your account will permanently remove:
                      </p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• All your projects and keywords</li>
                        <li>• SEO audit history and reports</li>
                        <li>• Team collaborations and invitations</li>
                        <li>• Billing history and subscription data</li>
                        <li>• All personal settings and preferences</li>
                      </ul>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting}>
                          <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          Delete My Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers, including all projects, keywords,
                            audit history, and billing information.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Deleting...
                              </>
                            ) : (
                              'Yes, delete my account'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.emailNotifications')}</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive via email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.weeklyReports')}</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly performance summaries
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.auditAlerts')}</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when site audits are completed
                      </p>
                    </div>
                    <Switch
                      checked={notifications.auditAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, auditAlerts: checked }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.rankingChanges')}</Label>
                      <p className="text-sm text-muted-foreground">
                        Alert me when keyword rankings change significantly
                      </p>
                    </div>
                    <Switch
                      checked={notifications.rankingChanges}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, rankingChanges: checked }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.teamUpdates')}</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about team member activities
                      </p>
                    </div>
                    <Switch
                      checked={notifications.teamUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, teamUpdates: checked }))
                      }
                    />
                  </div>
                  
                  <Button onClick={() => toast.success('Notification preferences saved')}>
                    {t('common.save')} Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.general')}</CardTitle>
                  <CardDescription>
                    Customize your application experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center">
                        <Globe className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('settings.language')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred language
                      </p>
                    </div>
                    <Select value={i18n.language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center">
                        <Monitor className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('settings.theme')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred theme
                      </p>
                    </div>
                    <Select value={theme} onValueChange={handleThemeChange}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center">
                            <Monitor className="h-4 w-4 mr-2" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.timezone')}</Label>
                      <p className="text-sm text-muted-foreground">
                        Set your local timezone for accurate reporting
                      </p>
                    </div>
                    {/* <Select defaultValue="utc"> */}
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="w-52">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                        <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                        <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                        <SelectItem value="gst">Gulf Time (GMT+4)</SelectItem>
                        <SelectItem value="ast">Arabia Time (GMT+3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}