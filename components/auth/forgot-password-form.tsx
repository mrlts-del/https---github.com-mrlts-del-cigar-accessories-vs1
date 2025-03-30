'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { generatePasswordResetToken } from '@/actions/auth';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await generatePasswordResetToken(values.email);
        if (result.success) {
          setMessage('If an account with that email exists, a password reset link has been sent.');
          form.reset();
        } else {
          toast.error(result.error || 'Failed to send reset link.');
        }
      } catch (error) {
        console.error('Forgot password error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your email address below and we'll send you a link to reset your password. {/* Escaped apostrophe */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {message && ( <p className="text-sm text-center text-green-600">{message}</p> )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && ( <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> )}
              Send Reset Link
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm">
         <p>
           <a href="/auth/signin" className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-primary">
             Back to Sign In
           </a>
         </p>
      </CardFooter>
    </Card>
  );
}
