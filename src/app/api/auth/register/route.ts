import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, name, redirectUrl } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Note: Supabase Auth automatically handles duplicate email checks
    // No need to manually check for existing users in the auth.users table

    // Send magic link for signup
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          name: name || null,
        },
        shouldCreateUser: true,
      },
    });

    if (authError) {
      console.error('Supabase auth error:', authError);

      // Provide more specific error messages
      let errorMessage = authError.message;

      if (authError.message.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (authError.message.includes('email')) {
        errorMessage = 'Failed to send confirmation email. Please check your email address and try again.';
      } else if (authError.message.includes('SMTP')) {
        errorMessage = 'Email service is temporarily unavailable. Please try again in a few minutes or contact support.';
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? authError.message : undefined
        },
        { status: 400 }
      );
    }

    console.log('Magic link sent successfully to:', email);

    return NextResponse.json({
      success: true,
      message: 'Magic link sent! Check your email to complete registration.',
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      {
        error: 'Failed to register user. Please try again.',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
