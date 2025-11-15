import { NextResponse } from 'next/server';
import { getAdminUser, updateLastLogin } from '@/lib/utils/admin-auth';

export async function POST() {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await updateLastLogin(adminUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating last login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}