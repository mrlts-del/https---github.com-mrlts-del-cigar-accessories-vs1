'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Icons } from '@/components/icons';
// Server action to be created
import { resetPassword } from '@/actions/auth'; // Import server action

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
      toast.error('Invalid or missing password reset token.');
    }
  }, [token]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Invalid or missing password reset token.');
      toast.error('Invalid or missing password reset token.');
      return;
    }

    startTransition(async () => {
      try {
        // Call server action
        const result = await resetPassword({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword, // Pass confirmPassword for schema validation
        });

        if (result.success) {
          setSuccess('Password reset successfully! You can now sign in.');
          toast.success('Password reset successfully!');
          // Redirect after a short delay
          setTimeout(() => router.push('/auth/signin'), 2000);
        } else {
          setError(result.error || 'Failed to reset password.');
          toast.error(result.error || 'Failed to reset password.');
        }
      } catch (err) {
        console.error('Reset password error:', err);
        setError('An unexpected error occurred.');
        toast.error('An unexpected error occurred.');
      }
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Set New Password</CardTitle>
        <CardDescription>
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
           <p className="text-center text-destructive">{error || 'Loading token...'}</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                        disabled={isPending || !!success}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                        disabled={isPending || !!success}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm text-center text-destructive">{error}</p>
              )}
               {success && (
                <p className="text-sm text-center text-green-600">{success}</p>
              )}
              <Button type="submit" className="w-full" disabled={isPending || !!success}>
                {isPending && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Reset Password
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
       <CardFooter className="text-sm">
         {!success && ( // Only show if not successful yet
           <p>
             <a href="/auth/signin" className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-primary">
               Back to Sign In
             </a>
           </p>
         )}
      </CardFooter>
    </Card>
  );
}
