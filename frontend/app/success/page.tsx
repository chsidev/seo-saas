'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function SuccessPage() {
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Refresh user data to get updated subscription info
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your subscription has been activated successfully.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            What's Next?
          </h3>
          <ul className="text-left space-y-2 text-sm text-gray-600">
            <li>• Access your enhanced dashboard features</li>
            <li>• Create unlimited projects</li>
            <li>• Get detailed SEO reports</li>
            <li>• Monitor your backlinks</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/dashboard/projects/create"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Create Your First Project
          </Link>
        </div>
      </div>
    </div>
  );
}