'use server';

import { z } from 'zod';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const signUp = validatedActionWithUser(
  signUpSchema,
  async (data, formData, user) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { error: error.message };
    }

    redirect('/(dashboard)');
  }
);

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signIn = validatedActionWithUser(
  signInSchema,
  async (data, formData, user) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { error: error.message };
    }

    redirect('/(dashboard)');
  }
);

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
  }

  redirect('/(login)/sign-in');
}
