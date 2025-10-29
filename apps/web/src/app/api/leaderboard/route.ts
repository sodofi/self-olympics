import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/leaderboard
 * 
 * What this does:
 * 1. Frontend calls this API
 * 2. API queries PostgreSQL for all countries
 * 3. Sorts by count (highest first)
 * 4. Returns array of countries to frontend
 * 
 * Example response:
 * {
 *   "success": true,
 *   "leaderboard": [
 *     { "countryCode": "BRA", "countryName": "Brazil", "count": 15 },
 *     { "countryCode": "USA", "countryName": "United States", "count": 10 },
 *     ...
 *   ]
 * }
 */
export async function GET() {
  try {
    // SQL Query explanation:
    // - SELECT: Get these columns from the database
    // - FROM countries: From the countries table
    // - ORDER BY count DESC: Sort by count, highest first (DESC = descending)
    // - country_name ASC: If counts are equal, sort alphabetically
    
    const result = await query(
      `SELECT 
        country_code as "countryCode", 
        country_name as "countryName", 
        count 
       FROM countries 
       ORDER BY count DESC, country_name ASC`
    );

    console.log(`✅ Fetched ${result.rows.length} countries from leaderboard`);

    return NextResponse.json({
      success: true,
      leaderboard: result.rows,
      total: result.rows.length
    });

  } catch (error: any) {
    console.error('❌ Error in /api/leaderboard:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard', details: error.message },
      { status: 500 }
    );
  }
}

// This tells Next.js to always fetch fresh data (not cached)
export const dynamic = 'force-dynamic';

