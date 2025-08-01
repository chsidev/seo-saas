"use client";

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Search,
  Link as LinkIcon,
  FileBarChart,
  Settings,
  CreditCard,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const pathname = usePathname();
  
  const isRTL = i18n.language === 'ar';

  const navigationItems = [
    {
      href: '/dashboard',
      label: t('navigation.dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: '/projects',
      label: t('navigation.projects'),
      icon: FolderOpen,
    },
    {
      href: '/rankings',
      label: t('navigation.rankings'),
      icon: BarChart3,
    },
    {
      href: '/audits',
      label: t('navigation.audits'),
      icon: Search,
    },
    {
      href: '/backlinks',
      label: t('navigation.backlinks'),
      icon: LinkIcon,
    },
    {
      href: '/reports',
      label: t('navigation.reports'),
      icon: FileBarChart,
    },
  ];

  const settingsItems = [
    {
      href: '/billing',
      label: t('navigation.billing'),
      icon: CreditCard,
    },
    {
      href: '/settings',
      label: t('navigation.settings'),
      icon: Settings,
    },
  ];

  const adminItems = [
    {
      href: '/admin',
      label: t('navigation.admin'),
      icon: Users,
    },
  ];

  return (
    <div className={cn("flex h-full flex-col bg-card", className)}>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {/* Main Navigation */}
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Navigation
            </h2>
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href && "bg-secondary"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              {t('settings.title')}
            </h2>
            <div className="space-y-1">
              {settingsItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href && "bg-secondary"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                {t('admin.title')}
              </h2>
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href && "bg-secondary"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}