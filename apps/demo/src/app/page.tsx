'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ServerCrash, Bug } from 'lucide-react';
import Script from 'next/script';
import Image from 'next/image';

type UserProfile = {
  profile: {
    name: string;
  };
};

export default function BuggyDemoPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Simulates a failed API call to a non-existent endpoint.
  const handleApiError = async () => {
    setLoading(true);
    setError(null);
    console.log('Attempting to fetch data from a broken API endpoint...');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const response = await fetch('/api/this-route-does-not-exist');
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (err: unknown) {
      // Type check the error before accessing properties.
      if (err instanceof Error) {
        console.error('API call failed as expected:', err.message);
        setError(err.message);
      } else {
        console.error('An unexpected error occurred:', err);
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Simulates a classic client-side JavaScript error.
  const handleFrontendError = () => {
    setLoading(true);
    setError(null);
    console.log('Executing a function that will throw a client-side error...');
    
    try {
      // This will throw a "Cannot read properties of null" error.
      const user: UserProfile | null = null;
      console.log(user!.profile.name); // Using non-null assertion to trigger the error purposefully.
    } catch (err: unknown) {
      // Type check the error.
      if (err instanceof Error) {
        console.error('Client-side error caught as expected:', err.message);
        setError(`TypeError: ${err.message}`);
      } else {
        console.error('An unexpected error occurred:', err);
        setError('An unknown client-side error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <Image
            src="/logo.png"
            width={200}
            height={120}
            alt="Logo"
            className="absolute top-10"
          />
        <Card className="w-full max-w-lg">
          <CardHeader>
              <div className='space-y-2'>
                <CardTitle className='text-lg'>Buggy Dashboard</CardTitle>
                <CardDescription>
                  This page is designed to fail. Test the CatchFrame widget.
                </CardDescription>
              </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm p-4 bg-slate-50 dark:bg-slate-800 border rounded-md">
              <p>
                Click the buttons below to simulate common application errors. When an error occurs, use the CatchFrame widget (bottom-right) to record and submit a bug report.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Button to trigger a failed API call */}
              <Button onClick={handleApiError} disabled={loading} variant="outline">
                <ServerCrash className="mr-2 h-4 w-4" />
                {loading ? 'Fetching...' : 'Trigger Failed API Call (404)'}
              </Button>

              {/* Button to trigger a client-side rendering error */}
              <Button onClick={handleFrontendError} disabled={loading} variant="outline">
                <Bug className="mr-2 h-4 w-4" />
                {loading ? 'Executing...' : 'Trigger Frontend TypeError'}
              </Button>
            </div>

            <Separator />

            {/* Display area for the error message */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>An Error Occurred</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      <Script src="https://app.catchframe.app/scripts/widget.js" />
    </>
  );
}

