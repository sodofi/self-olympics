import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from '@selfxyz/core';
import { getCountryName } from '@/lib/countries';

// CORS headers for Self app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * POST /api/register
 * 
 * Self Protocol Integration - Verify user's identity and country
 * 
 * Flow:
 * 1. User scans QR code with Self app
 * 2. Self app generates zero-knowledge proof of:
 *    - User is a real human (has valid passport)
 *    - User's country of citizenship
 * 3. Frontend sends proof to this API
 * 4. API verifies proof using Self protocol
 * 5. Extract country from verified proof
 * 6. Check if user (nullifier) has already voted
 * 7. If new: Register vote for their country
 * 8. If already voted: Return existing registration
 * 
 * Request body:
 * {
 *   "attestationId": number,      // Document type (1 = passport, 2 = EU ID)
 *   "proof": Array,                // Zero-knowledge proof
 *   "publicSignals": Array,        // Public signals
 *   "userContextData": string      // User context
 * }
 */

// Initialize Self Backend Verifier (singleton)
const selfBackendVerifier = new SelfBackendVerifier(
  process.env.NEXT_PUBLIC_SELF_SCOPE || "self-olympics",
  process.env.NEXT_PUBLIC_SELF_ENDPOINT || "http://localhost:3000/api/register",
  false, // mockPassport: false = real passports only
  AllIds, // Allow all attestation types (passport, EU ID)
  new DefaultConfigStore({
    minimumAge: 0, // No age restriction
    excludedCountries: [], // All countries allowed
    ofac: false, // No OFAC restrictions
  }),
  "hex" // userIdentifierType
);

export async function POST(request: NextRequest) {
  let client;

  try {
    // Log all incoming requests
    console.log('\n========================================');
    console.log('📥 POST /api/register - Request received');
    console.log('========================================');
    
    // Get Self proof data from request
    const body = await request.json();
    console.log('Request body keys:', Object.keys(body));
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { attestationId, proof, publicSignals, userContextData } = body;

    // Validate required fields
    if (!proof || !publicSignals || !attestationId || !userContextData) {
      console.log('❌ Missing required fields:');
      console.log('  - attestationId:', !!attestationId);
      console.log('  - proof:', !!proof);
      console.log('  - publicSignals:', !!publicSignals);
      console.log('  - userContextData:', !!userContextData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required Self verification data',
          details: 'proof, publicSignals, attestationId, and userContextData are required'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('✅ All required fields present');
    console.log('🔐 Verifying Self proof...');

    // Verify the Self proof
    const verificationResult = await selfBackendVerifier.verify(
      attestationId,
      proof,
      publicSignals,
      userContextData
    );

    // Check if verification was successful
    if (!verificationResult.isValidDetails.isValid) {
      console.error('❌ Self verification failed:', verificationResult.isValidDetails);
      return NextResponse.json(
        {
          success: false,
          error: 'Self verification failed',
          details: verificationResult.isValidDetails,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('✅ Self verification successful!');

    // Extract data from verified proof
    const { discloseOutput, userData } = verificationResult;
    const nullifier = userData.userIdentifier; // Unique ID per person
    const countryCode = discloseOutput.nationality; // ISO 3-letter code from passport

    if (!countryCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Country code not found in verified proof',
          details: 'The Self verification did not include nationality disclosure'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get full country name
    const countryName = getCountryName(countryCode);
    
    console.log(`👤 User verified: ${nullifier.substring(0, 10)}... from ${countryName} (${countryCode})`);

    // Get database connection
    client = await getClient();

    // Start transaction
    await client.query('BEGIN');

    // Check if this nullifier (person) has already registered
    const existingRegistration = await client.query(
      'SELECT country_code FROM registrations WHERE nullifier = $1',
      [nullifier]
    );

    if (existingRegistration.rows.length > 0) {
      // User has already voted
      await client.query('ROLLBACK');
      const existingCountry = existingRegistration.rows[0].country_code;
      const existingCountryName = getCountryName(existingCountry);
      
      console.log(`⚠️ User already registered for ${existingCountryName}`);

      return NextResponse.json({
        success: false,
        alreadyRegistered: true,
        countryCode: existingCountry,
        countryName: existingCountryName,
        message: `You've already registered for ${existingCountryName}!`
      }, { headers: corsHeaders });
    }

    // Check if country exists in database
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
      console.log(`📊 Updated ${countryName} to count: ${newCount}`);
    } else {
      // Country doesn't exist - create new with count = 1
      const insertResult = await client.query(
        `INSERT INTO countries (country_code, country_name, count) 
         VALUES ($1, $2, 1) 
         RETURNING count`,
        [countryCode, countryName]
      );
      newCount = insertResult.rows[0].count;
      console.log(`🆕 Created ${countryName} with count: 1`);
    }

    // Insert registration record with nullifier
    await client.query(
      'INSERT INTO registrations (nullifier, country_code) VALUES ($1, $2)',
      [nullifier, countryCode]
    );

    // Commit transaction
    await client.query('COMMIT');

    console.log(`🎉 Successfully registered vote for ${countryName}!`);

    // Return success
    return NextResponse.json({
      success: true,
      countryCode,
      countryName,
      count: newCount,
      message: `Successfully registered for ${countryName}!`
    }, { headers: corsHeaders });

  } catch (error: any) {
    // If error, rollback
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('❌ Rollback error:', rollbackError);
      }
    }

    console.error('❌ Error in /api/register:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to register', 
        details: error.message 
      },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    // Always release the database connection
    if (client) {
      client.release();
    }
  }
}

