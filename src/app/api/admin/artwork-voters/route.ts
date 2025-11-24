import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artworkId = searchParams.get('artworkId');

    if (!artworkId) {
      return NextResponse.json(
        { error: 'Artwork ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user is authenticated and is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all voters for this artwork
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        id,
        voted_at,
        vote_date,
        user_id,
        public_users:user_id (
          email,
          name
        )
      `)
      .eq('artwork_id', artworkId)
      .order('voted_at', { ascending: false });

    if (votesError) {
      console.error('Error fetching voters:', votesError);
      return NextResponse.json(
        { error: 'Failed to fetch voters', details: votesError.message },
        { status: 500 }
      );
    }

    // Transform the data to include voter info
    const voters = votes?.map((vote: any) => ({
      id: vote.id,
      email: vote.public_users?.email || null,
      name: vote.public_users?.name || null,
      voted_at: vote.voted_at,
      vote_date: vote.vote_date,
    })) || [];

    return NextResponse.json({
      voters,
      total: voters.length,
    });
  } catch (error) {
    console.error('Error in artwork-voters API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch voters',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
