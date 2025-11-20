/**
 * Database Configuration Checker
 * Checks if the email-based voting system is properly configured
 * Run with: npx tsx check-database-config.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: any
}

const results: CheckResult[] = []

async function checkPublicUsersTable() {
  try {
    const { data, error } = await supabase
      .from('public_users')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist
        results.push({
          name: 'public_users table',
          status: 'fail',
          message: 'Table does not exist. Run migrate-to-email-voting.sql',
        })
        return false
      }
      throw error
    }

    results.push({
      name: 'public_users table',
      status: 'pass',
      message: 'Table exists and is accessible',
    })
    return true
  } catch (error) {
    results.push({
      name: 'public_users table',
      status: 'fail',
      message: `Error: ${error}`,
    })
    return false
  }
}

async function checkVotesTableSchema() {
  try {
    // Try to query votes table
    const { data, error } = await supabase
      .from('votes')
      .select('id, artwork_id, contest_id, user_id, user_identifier, ip_hash')
      .limit(1)

    if (error) {
      results.push({
        name: 'votes table schema',
        status: 'fail',
        message: `Error querying votes table: ${error.message}`,
      })
      return false
    }

    results.push({
      name: 'votes table schema',
      status: 'pass',
      message: 'Votes table exists with required columns',
    })
    return true
  } catch (error) {
    results.push({
      name: 'votes table schema',
      status: 'fail',
      message: `Error: ${error}`,
    })
    return false
  }
}

async function checkCanVoteFunction() {
  try {
    // Try calling the function with dummy UUIDs
    const dummyUUID = '00000000-0000-0000-0000-000000000000'

    const { data, error } = await supabase
      .rpc('can_vote', {
        p_artwork_id: dummyUUID,
        p_user_id: dummyUUID,
        p_contest_id: dummyUUID,
      })

    if (error) {
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        results.push({
          name: 'can_vote function',
          status: 'fail',
          message: 'Function does not exist or has wrong signature. Run verify-and-fix-voting.sql',
        })
        return false
      }

      // Function exists but might have errored for other reasons
      results.push({
        name: 'can_vote function',
        status: 'warning',
        message: `Function exists but returned error: ${error.message}`,
        details: error,
      })
      return true
    }

    results.push({
      name: 'can_vote function',
      status: 'pass',
      message: `Function exists and returns: ${data}`,
    })
    return true
  } catch (error) {
    results.push({
      name: 'can_vote function',
      status: 'fail',
      message: `Error: ${error}`,
    })
    return false
  }
}

async function checkActiveContest() {
  try {
    const { data: contest, error } = await supabase
      .rpc('get_active_contest')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        results.push({
          name: 'active contest',
          status: 'warning',
          message: 'No active contest found. Users cannot vote without an active contest.',
        })
        return false
      }
      throw error
    }

    if (!contest) {
      results.push({
        name: 'active contest',
        status: 'warning',
        message: 'No active contest found.',
      })
      return false
    }

    results.push({
      name: 'active contest',
      status: 'pass',
      message: `Active contest found: Week ${contest.week_number || 'N/A'}`,
      details: {
        id: contest.contest_id,
        status: contest.status,
        end_date: contest.end_date,
      },
    })
    return true
  } catch (error) {
    results.push({
      name: 'active contest',
      status: 'fail',
      message: `Error: ${error}`,
    })
    return false
  }
}

async function checkArtworksForActiveContest() {
  try {
    // First get active contest
    const { data: contest } = await supabase
      .rpc('get_active_contest')
      .single()

    if (!contest) {
      results.push({
        name: 'artworks for active contest',
        status: 'warning',
        message: 'Skipped (no active contest)',
      })
      return false
    }

    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, vote_count')
      .eq('contest_id', contest.contest_id)

    if (error) throw error

    if (!artworks || artworks.length === 0) {
      results.push({
        name: 'artworks for active contest',
        status: 'warning',
        message: 'No artworks found for active contest',
      })
      return false
    }

    results.push({
      name: 'artworks for active contest',
      status: 'pass',
      message: `Found ${artworks.length} artwork(s)`,
      details: artworks.map(a => ({ id: a.id, title: a.title, votes: a.vote_count })),
    })
    return true
  } catch (error) {
    results.push({
      name: 'artworks for active contest',
      status: 'fail',
      message: `Error: ${error}`,
    })
    return false
  }
}

async function checkAuthConfiguration() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      results.push({
        name: 'auth configuration',
        status: 'warning',
        message: 'Not currently authenticated (this is normal for this script)',
      })
      return true
    }

    results.push({
      name: 'auth configuration',
      status: 'pass',
      message: session ? 'Auth is working and user is logged in' : 'Auth is configured (no active session)',
    })
    return true
  } catch (error) {
    results.push({
      name: 'auth configuration',
      status: 'fail',
      message: `Error: ${error}`,
    })
    return false
  }
}

function printResults() {
  console.log('\n' + '='.repeat(60))
  console.log('DATABASE CONFIGURATION CHECK RESULTS')
  console.log('='.repeat(60) + '\n')

  let passCount = 0
  let failCount = 0
  let warningCount = 0

  for (const result of results) {
    const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠'
    const color = result.status === 'pass' ? '\x1b[32m' : result.status === 'fail' ? '\x1b[31m' : '\x1b[33m'
    const reset = '\x1b[0m'

    console.log(`${color}${icon} ${result.name}${reset}`)
    console.log(`  ${result.message}`)

    if (result.details) {
      console.log(`  Details:`, JSON.stringify(result.details, null, 2))
    }
    console.log()

    if (result.status === 'pass') passCount++
    else if (result.status === 'fail') failCount++
    else warningCount++
  }

  console.log('='.repeat(60))
  console.log(`Total: ${passCount} passed, ${failCount} failed, ${warningCount} warnings`)
  console.log('='.repeat(60) + '\n')

  // Recommendations
  if (failCount > 0) {
    console.log('\x1b[31m❌ CRITICAL ISSUES FOUND\x1b[0m')
    console.log('\nRecommended actions:')

    if (results.find(r => r.name === 'public_users table' && r.status === 'fail')) {
      console.log('  1. Run migrate-to-email-voting.sql in Supabase SQL Editor')
    }

    if (results.find(r => r.name === 'can_vote function' && r.status === 'fail')) {
      console.log('  2. Run verify-and-fix-voting.sql in Supabase SQL Editor')
    }

    console.log()
  } else if (warningCount > 0) {
    console.log('\x1b[33m⚠ WARNINGS FOUND\x1b[0m')
    console.log('\nRecommended actions:')

    if (results.find(r => r.name === 'active contest' && r.status === 'warning')) {
      console.log('  1. Create an active contest in the admin panel or via SQL')
    }

    if (results.find(r => r.name === 'artworks for active contest' && r.status === 'warning')) {
      console.log('  2. Add artworks to the active contest')
    }

    console.log()
  } else {
    console.log('\x1b[32m✓ ALL CHECKS PASSED!\x1b[0m')
    console.log('\nYour database is properly configured for email-based voting.\n')
  }
}

async function main() {
  console.log('Starting database configuration checks...\n')

  await checkPublicUsersTable()
  await checkVotesTableSchema()
  await checkCanVoteFunction()
  await checkActiveContest()
  await checkArtworksForActiveContest()
  await checkAuthConfiguration()

  printResults()

  // Exit with error code if there are failures
  const hasFailures = results.some(r => r.status === 'fail')
  process.exit(hasFailures ? 1 : 0)
}

main().catch(error => {
  console.error('\n❌ Unexpected error:', error)
  process.exit(1)
})
