'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { Role, Prisma } from '@prisma/client'; // Import Prisma
import crypto from 'crypto';
import { Resend } from 'resend';
import React from 'react'; // Re-add React import
import { PasswordResetEmail } from '@/emails/password-reset-email';
import { WelcomeEmail } from '@/emails/welcome-email'; // Import Welcome Email

// Initialize Resend (ensure RESEND_API_KEY is in .env)
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// --- Schemas ---

const RegisterSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
});

const EmailSchema = z.string().email({ message: 'Invalid email address.' });

const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: 'Token is required.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// --- Result Types ---

interface ActionResult {
  success: boolean;
  error?: string;
}

// --- Register User Action ---

export async function registerUser(
  values: z.infer<typeof RegisterSchema>
): Promise<ActionResult> {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input provided.' };
  }
  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: 'Email already in use.' };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({ // Assign result to newUser
      data: { name, email, password: hashedPassword, role: Role.USER },
    });
    console.log('User registered successfully:', email);

    // Send Welcome Email
    if (resend && newUser.email) {
      try {
        await resend.emails.send({
          from: 'Cigar Accessories <noreply@yourdomain.com>', // TODO: Replace domain
          to: [newUser.email],
          subject: 'Welcome to Cigar Accessories!',
          react: React.createElement(WelcomeEmail, { userName: newUser.name }),
        });
        console.log(`Welcome email sent to ${newUser.email}`);
      } catch (emailError) {
        console.error(`Failed to send welcome email for user ${newUser.id}:`, emailError);
        // Log error but don't fail registration if email fails
      }
    } else if (!resend) {
       console.warn(`Resend not configured, skipping welcome email for user ${newUser.id}.`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error during user registration:', error);
    return { success: false, error: 'Registration failed.' };
  }
}

// --- Password Reset Actions ---

/**
 * Generates a password reset token and sends the reset email.
 */
export async function generatePasswordResetToken(
  email: string
): Promise<ActionResult> {
  const validatedEmail = EmailSchema.safeParse(email);
  if (!validatedEmail.success) { return { success: false, error: 'Invalid email address.' }; }
  const userEmail = validatedEmail.data;
  const user = await db.user.findUnique({ where: { email: userEmail } });
  if (!user) { console.warn(`Password reset requested for non-existent email: ${userEmail}`); return { success: true }; }
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600 * 1000);
  try {
    await db.$transaction([
      db.passwordResetToken.deleteMany({ where: { email: userEmail } }),
      db.passwordResetToken.create({ data: { email: userEmail, token, expires } }),
    ]);
  } catch (dbError) { console.error('Failed to store password reset token:', dbError); return { success: false, error: 'Database error.' }; }
  if (!resend) { console.error('Resend is not initialized. RESEND_API_KEY missing?'); return { success: false, error: 'Email service not configured.' }; }
  const resetLink = `${domain}/auth/reset-password?token=${token}`;
  try {
    const { data, error } = await resend.emails.send({
      from: 'Cigar Accessories <noreply@yourdomain.com>', to: [userEmail], subject: 'Reset Your Password',
      react: React.createElement(PasswordResetEmail, { resetLink }),
    });
    if (error) { console.error('Resend error:', error); return { success: false, error: 'Failed to send reset email.' }; }
    console.log('Password reset email sent successfully to:', userEmail, 'ID:', data?.id);
    return { success: true };
  } catch (emailError) { console.error('Error sending password reset email:', emailError); return { success: false, error: 'Failed to send reset email.' }; }
}

/**
 * Verifies a password reset token and updates the user's password.
 */
export async function resetPassword(
  values: z.infer<typeof ResetPasswordSchema>
): Promise<ActionResult> {
  const validatedFields = ResetPasswordSchema.safeParse(values);
  if (!validatedFields.success) { return { success: false, error: 'Invalid input.' }; }
  const { token, password } = validatedFields.data;
  const existingToken = await db.passwordResetToken.findUnique({ where: { token } });
  if (!existingToken) { return { success: false, error: 'Invalid or expired token.' }; }
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) { await db.passwordResetToken.delete({ where: { id: existingToken.id } }).catch(e => console.error("Failed to delete expired token:", e)); return { success: false, error: 'Token has expired.' }; }
  const user = await db.user.findUnique({ where: { email: existingToken.email } });
  if (!user) { return { success: false, error: 'User not found.' }; }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { password: hashedPassword } }),
      db.passwordResetToken.delete({ where: { id: existingToken.id } }),
    ]);
    console.log('Password reset successfully for user:', user.email);
    return { success: true };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') { return { success: false, error: 'User not found.' }; }
    return { success: false, error: 'Failed to update password.' };
  }
}
