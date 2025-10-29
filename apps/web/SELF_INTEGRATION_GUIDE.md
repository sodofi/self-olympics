# 🎯 Self Protocol Integration - Complete Guide

## ✅ What We Built

Your Olympics voting app now uses **Self Protocol** for privacy-preserving identity verification!

---

## 🔄 How It Works Now

### **Old Flow (Manual Selection):**
```
1. User clicks "Register Your Country"
2. User manually selects country from list
3. Anyone can vote unlimited times
4. No verification of country citizenship
```

### **New Flow (Self Verification):**
```
1. User clicks "REGISTER YOUR COUNTRY"
2. QR code appears
3. User scans with Self app on phone
4. Self app reads passport (locally on device)
5. Generates zero-knowledge proof:
   - "I'm a real human with valid passport"
   - "I'm from Country X"
   - Unique nullifier (prevents double-voting)
6. Proof sent to your backend
7. Backend verifies proof & extracts country
8. Checks if nullifier already voted
9. If new: Register vote for their country
10. If duplicate: Show "Already registered" message
11. Leaderboard updates!
```

---

## 📁 Files Created/Modified

### **New Files:**
1. `src/lib/countries.ts` - Country code to name mapping (ISO 3166-1 alpha-3)
2. `src/components/self-verification.tsx` - Self QR code component
3. `SELF_INTEGRATION_GUIDE.md` - This file

### **Modified Files:**
1. `src/app/api/register/route.ts` - Now verifies Self proofs instead of accepting any input
2. `src/app/page.tsx` - Uses Self QR component instead of country selector
3. `.env` - Added Self configuration

---

## 🔧 Configuration (Environment Variables)

Added to `.env`:
```bash
# Self Protocol Configuration
NEXT_PUBLIC_SELF_APP_NAME="Self Olympics"
NEXT_PUBLIC_SELF_SCOPE="self-olympics-2024"
NEXT_PUBLIC_SELF_ENDPOINT="http://localhost:3000/api/register"
```

**For Production:**
Update `NEXT_PUBLIC_SELF_ENDPOINT` to your deployed URL (e.g., `https://yourdomain.com/api/register`)

---

## 🎨 User Experience

### **Registration Flow:**

1. **Button Click:**
   - User clicks "REGISTER YOUR COUNTRY" button
   - Modal opens with Self QR code

2. **QR Code Display:**
   - Large QR code in center
   - Instructions on how to use Self app
   - Link to download Self app

3. **User Scans:**
   - Opens Self app on phone
   - Scans QR code
   - Approves sharing nationality from passport

4. **Verification:**
   - "Processing your verification..." message
   - Backend verifies proof
   - Extracts country from passport

5. **Success:**
   - Popup: "Adding [Country Name]" ✨
   - Modal closes
   - Leaderboard updates with +1 for their country
   - Button changes to "✓ REGISTERED"

6. **Already Registered:**
   - Popup: "You've already registered for [Country Name]!"
   - User can see their previous registration

---

## 🔒 Security Features

### **1. Zero-Knowledge Proofs**
- User's personal information never leaves their device
- Only proves: "I have a valid passport from Country X"
- No names, passport numbers, or other PII exposed

### **2. Nullifier (Unique ID)**
- Self generates a unique identifier per person per app
- Same person = same nullifier (even across devices)
- Prevents double-voting completely

### **3. Backend Verification**
- All proofs verified on your server
- Invalid proofs are rejected
- Cryptographic proof that passport is real

### **4. No Manual Input**
- User can't lie about their country
- Country extracted directly from verified passport
- Impossible to fake or manipulate

---

## 🗄️ Database Structure

### **Countries Table:**
```sql
countries (
  country_code VARCHAR(3) PRIMARY KEY,  -- "USA", "BRA", etc.
  country_name VARCHAR(100),            -- "United States", "Brazil"
  count INTEGER,                         -- Number of votes
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Registrations Table:**
```sql
registrations (
  id SERIAL PRIMARY KEY,
  nullifier VARCHAR(255) UNIQUE,  -- Self's unique person ID
  country_code VARCHAR(3),         -- Which country they voted for
  timestamp TIMESTAMP
)
```

**Key Point:** `nullifier` is UNIQUE, ensuring one vote per person!

---

## 🧪 Testing Locally

### **1. Start Dev Server:**
```bash
cd apps/web
pnpm dev
```

### **2. Open Browser:**
```
http://localhost:3000
```

### **3. Test with Mock Passport (Development):**

To enable mock passports for testing (no real passport needed):

Update `src/app/api/register/route.ts`:
```typescript
const selfBackendVerifier = new SelfBackendVerifier(
  process.env.NEXT_PUBLIC_SELF_SCOPE || "self-olympics",
  process.env.NEXT_PUBLIC_SELF_ENDPOINT || "http://localhost:3000/api/register",
  true, // ← Change to true for mock passports
  AllIds,
  new DefaultConfigStore({
    minimumAge: 0,
    excludedCountries: [],
    ofac: false,
  }),
  "hex"
);
```

Update `src/components/self-verification.tsx`:
```typescript
const app = new SelfAppBuilder({
  version: 2,
  appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Olympics",
  scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "self-olympics-2024",
  endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || "http://localhost:3000/api/register",
  logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
  userId: userId,
  endpointType: "staging", // ← Change to "staging" for development
  userIdType: "hex",
  userDefinedData: JSON.stringify({ timestamp: Date.now() }),
  disclosures: {
    nationality: true,
  }
}).build();
```

### **4. Test Real Passport (Production):**

Keep the settings as:
- `mockPassport: false` in backend
- `endpointType: "staging_https"` in frontend

You'll need the actual Self app on your phone to test.

---

## 🚀 Deployment Checklist

### **Before Deploying:**

1. ✅ Update `.env` with production URL
2. ✅ Set `mockPassport: false` (real passports only)
3. ✅ Verify database tables exist in production
4. ✅ Test QR code works from public URL
5. ✅ Make endpoint publicly accessible (not localhost)

### **Environment Variables for Production:**
```bash
NEXT_PUBLIC_SELF_APP_NAME="Self Olympics"
NEXT_PUBLIC_SELF_SCOPE="self-olympics-2024"
NEXT_PUBLIC_SELF_ENDPOINT="https://yourdomain.com/api/register"
POSTGRES_URL="your-production-database-url"
```

---

## 🐛 Troubleshooting

### **QR Code Not Displaying:**
- Check browser console for errors
- Verify environment variables are set
- Refresh the page

### **"Verification Failed" Error:**
- Make sure endpoint is publicly accessible
- Check backend logs for specific error
- Verify Self SDK packages are installed

### **"Already Registered" But User Didn't Vote:**
- This means the nullifier already exists in database
- Each person has ONE nullifier per app scope
- Check `registrations` table for nullifier

### **Country Not Recognized:**
- Check if country code is in `src/lib/countries.ts`
- Self returns ISO 3166-1 alpha-3 codes (e.g., "USA", not "US")
- Add missing countries to the mapping

### **Endpoint Not Accessible:**
- For localhost testing, use ngrok:
  ```bash
  ngrok http 3000
  ```
- Update `NEXT_PUBLIC_SELF_ENDPOINT` to ngrok URL
- Restart dev server

---

## 📊 Monitoring

### **Check Registrations:**
```sql
SELECT 
  r.nullifier,
  c.country_name,
  r.timestamp
FROM registrations r
JOIN countries c ON r.country_code = c.country_code
ORDER BY r.timestamp DESC
LIMIT 20;
```

### **Check Duplicate Attempts:**
```sql
SELECT 
  country_code,
  COUNT(*) as attempts
FROM registrations
GROUP BY country_code
HAVING COUNT(*) > 1;
```

### **View Leaderboard:**
```sql
SELECT 
  country_name,
  count,
  updated_at
FROM countries
ORDER BY count DESC
LIMIT 10;
```

---

## 🎓 Key Benefits

### **For Users:**
- ✅ Privacy-preserving (no personal data shared)
- ✅ One-time verification (scan once, done)
- ✅ Fair voting (one person, one vote)
- ✅ Trustless (cryptographic proof, not trust)

### **For You (Developer):**
- ✅ Bot-proof (requires real passport)
- ✅ Sybil-resistant (unique nullifiers)
- ✅ Country verification (can't fake nationality)
- ✅ No manual moderation needed
- ✅ Scalable (Self handles verification infrastructure)

---

## 🔗 Useful Links

- **Self Protocol Docs:** https://docs.self.xyz
- **Self App Download:** https://self.xyz
- **Self GitHub:** https://github.com/selfxyz/self
- **Support:** Join Self Discord for help

---

## 📝 Next Steps (Optional Enhancements)

1. **Add Age Verification:**
   ```typescript
   disclosures: {
     nationality: true,
     minimumAge: 18, // Only 18+ can vote
   }
   ```

2. **Exclude Certain Countries:**
   ```typescript
   new DefaultConfigStore({
     minimumAge: 0,
     excludedCountries: ['PRK', 'IRN'], // Exclude North Korea, Iran
     ofac: false,
   })
   ```

3. **Add OFAC Sanctions Check:**
   ```typescript
   new DefaultConfigStore({
     minimumAge: 0,
     excludedCountries: [],
     ofac: true, // Check against OFAC list
   })
   ```

4. **Show Verification Badge:**
   - Add "Verified with Self" badge to registered users
   - Display verification timestamp

5. **Analytics:**
   - Track verification success rate
   - Monitor countries with most attempts
   - Identify patterns in registration times

---

## 🎉 That's It!

Your Olympics voting app is now powered by Self Protocol! 

Users can prove their country citizenship without revealing their identity, and you have a bot-proof, fair voting system.

**Questions?** Check the logs or feel free to ask! 🚀

