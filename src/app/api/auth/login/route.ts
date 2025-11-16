import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Sign in with Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      );
    }

    // Check if user exists in public_users table
    const { data: publicUser } = await supabase
      .from('public_users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // If user doesn't exist in public_users, add them
    if (!publicUser) {
      await supabase
        .from('public_users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || null,
        });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: publicUser?.name || data.user.user_metadata?.name || null,
      },
      message: 'Login successful!',
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
