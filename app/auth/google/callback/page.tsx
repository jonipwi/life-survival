'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        router.push('/?error=oauth_failed');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        router.push('/?error=no_code');
        return;
      }

      try {
        // Send the authorization code to the backend to complete authentication
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
          }),
        });

        if (response.ok) {
          // Authentication successful, redirect to main page
          // The main page will automatically check authentication status
          router.push('/');
        } else {
          const errorData = await response.json();
          console.error('Authentication failed:', errorData);
          router.push('/?error=auth_failed');
        }
      } catch (error) {
        console.error('Error during authentication:', error);
        router.push('/?error=network_error');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}

export default function GoogleCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}