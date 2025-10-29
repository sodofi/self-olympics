import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

/**
 * POST /api/register
 * 
 * What this does:
 * 1. User clicks on a country in the frontend
 * 2. Frontend sends country code to this API
 * 3. API checks if country exists in database
 * 4. If exists: increment count by 1
 * 5. If doesn't exist: create new country with count = 1
 * 6. Return updated count to frontend
 * 
 * Example request body:
 * { "countryCode": "BRA", "countryName": "Brazil" }
 */
export async function POST(request: NextRequest) {
  let client;

  try {
    // Get data from request
    const body = await request.json();
    const { countryCode, countryName } = body;

    // Validate required fields
    if (!countryCode || !countryName) {
      return NextResponse.json(
        { success: false, error: 'Missing countryCode or countryName' },
        { status: 400 }
      );
    }

    // Get database connection
    client = await getClient();

    // Start a transaction (ensures all queries succeed together or none do)
    await client.query('BEGIN');

    // Check if country already exists
    const existingCountry = await client.query(
      'SELECT country_code, count FROM countries WHERE country_code = $1',
      [countryCode]
    );

    let newCount: number;

    if (existingCountry.rows.length > 0) {
      // Country exists - increment count
      const updateResult = await client.query(
        `UPDATE countries 
         SET count = count + 1, updated_at = CURRENT_TIMESTAMP 
         WHERE country_code = $1 
         RETURNING count`,
        [countryCode]
      );
      newCount = updateResult.rows[0].count;
      console.log(`✅ Updated ${countryName} to count: ${newCount}`);
    } else {
      // Country doesn't exist - create new with count = 1
      const insertResult = await client.query(
        `INSERT INTO countries (country_code, country_name, count) 
         VALUES ($1, $2, 1) 
         RETURNING count`,
        [countryCode, countryName]
      );
      newCount = insertResult.rows[0].count;
      console.log(`✅ Created ${countryName} with count: 1`);
    }

    // Generate a unique registration ID (simulating a user registration)
    const registrationId = `${countryCode}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Insert registration record
    await client.query(
      'INSERT INTO registrations (nullifier, country_code) VALUES ($1, $2)',
      [registrationId, countryCode]
    );

    // Commit transaction (save all changes)
    await client.query('COMMIT');

    // Return success
    return NextResponse.json({
      success: true,
      countryCode,
      countryName,
      count: newCount,
      message: `Successfully registered for ${countryName}!`
    });

  } catch (error: any) {
    // If error, rollback (undo all changes)
    if (client) {
      await client.query('ROLLBACK');
    }

    console.error('❌ Error in /api/register:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to register country', details: error.message },
      { status: 500 }
    );
  } finally {
    // Always release the database connection back to the pool
    if (client) {
      client.release();
    }
  }
}

