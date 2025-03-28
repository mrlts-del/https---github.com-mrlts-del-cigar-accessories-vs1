'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed unused Label import
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// Removed unused Separator import
import { Icons } from '@/components/icons'; // Assuming an icons component exists or will be created

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type SignInFormValues = z.infer<typeof formSchema>;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/'; // Redirect back after login
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null); // Track which OAuth provider is loading

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: SignInFormValues) {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false, // Handle redirect manually based on result
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        // Display error message (e.g., invalid credentials)
        toast.error(result.error === 'CredentialsSignin' ? 'Invalid email or password.' : 'An error occurred during sign in.');
      } else if (result?.ok) {
        // Redirect to callbackUrl on success
        router.push(callbackUrl);
        router.refresh(); // Refresh server components
        toast.success('Signed in successfully!');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuthSignIn(provider: 'google' | 'github') {
    setIsOAuthLoading(provider);
    try {
      await signIn(provider, {
        callbackUrl: callbackUrl,
        // No redirect: false here, let NextAuth handle OAuth redirect flow
      });
      // signIn with OAuth redirects, so success/error handling is less direct here
      // If it returns, it's usually because of an error before redirect
    } catch (error) {
       console.error(`OAuth sign in error (${provider}):`, error);
       toast.error(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
       // Don't set loading to false here as successful OAuth redirects away
       // Only reset if there was an error *before* redirecting
       // setIsOAuthLoading(null); // Consider resetting based on specific error types if needed
    }
  }


  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your email and password below to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-6">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading || !!isOAuthLoading}
          >
            {isOAuthLoading === 'github' ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.gitHub className="mr-2 h-4 w-4" /> // Placeholder
            )}{' '}
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading || !!isOAuthLoading}
          >
             {isOAuthLoading === 'google' ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" /> // Placeholder
            )}{' '}
            Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Credentials Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      {...field}
                      disabled={isLoading || !!isOAuthLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      disabled={isLoading || !!isOAuthLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || !!isOAuthLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-sm">
        {/* Add link to Sign Up page later */}
        <p className="text-muted-foreground">
          Don't have an account?{' '}
          <a href="/auth/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign up
          </a>
        </p>
         {/* Add link to Password Reset page later */}
         <p>
           <a href="/auth/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-primary">
             Forgot password?
           </a>
         </p>
      </CardFooter>
    </Card>
  );
}

// Placeholder for Icons component - create this file later
// components/icons.tsx
// export const Icons = {
//   spinner: (props: React.SVGProps<SVGSVGElement>) => (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
//   ),
//   gitHub: (props: React.SVGProps<SVGSVGElement>) => ( /* GitHub Icon SVG */ ),
//   google: (props: React.SVGProps<SVGSVGElement>) => ( /* Google Icon SVG */ ),
// };
