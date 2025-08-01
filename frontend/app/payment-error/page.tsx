'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-orange-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was an error processing your payment. Please try again or contact support.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            What can you do?
          </h3>
          <ul className="text-left space-y-2 text-sm text-gray-600">
            <li>• Check your payment details and try again</li>
            <li>• Try a different payment method</li>
            <li>• Contact our support team for assistance</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/pricing"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
          <a
            href="mailto:support@seosaas.com"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}