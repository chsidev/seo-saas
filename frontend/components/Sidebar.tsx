'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  FolderIcon, 
  UserIcon,
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/use-auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderIcon },
  { name: 'Account', href: '/dashboard/account', icon: UserIcon },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCardIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex flex-col w-64 bg-gray-50 min-h-screen">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive(item.href)
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium border-l-4 transition-colors duration-200`}
            >
              <item.icon
                className={`${
                  isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 h-5 w-5`}
              />
              {item.name}
            </Link>
          ))}
          
          {user?.role === 'admin' && (
            <>
              <div className="border-t border-gray-200 mt-6 pt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 pb-2">
                  Admin
                </p>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium border-l-4 transition-colors duration-200`}
                  >
                    <item.icon
                      className={`${
                        isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}