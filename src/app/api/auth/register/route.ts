import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Sign up with email and password
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || null,
        },
      },
    });

    if (authError) {
      console.error('Supabase auth error:', authError);

      // Provide more specific error messages
      let errorMessage = authError.message;

      if (authError.message.includes('already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (authError.message.includes('password')) {
        errorMessage = 'Password does not meet requirements. Use at least 6 characters.';
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? authError.message : undefined
        },
        { status: 400 }
      );
    }

    console.log('User registered successfully:', email);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: data.user,
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
