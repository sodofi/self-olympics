# 🚀 Backend Setup Guide

## What We Built

A simple backend that:
1. Connects to your PostgreSQL database (Supabase)
2. Registers countries when users click them
3. Fetches the leaderboard from the database
4. Updates counts in real-time

---

## 📝 Step-by-Step Setup

### Step 1: Get Your Database Connection String

1. Go to your Vercel Dashboard
2. Click on your **Supabase** database
3. Look for the **`.env.local`** tab or **Connection Strings** section
4. Copy the `POSTGRES_URL` value (it looks like this):
   ```
   postgres://default:xxxxx@xxxxx-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb
   ```

### Step 2: Create `.env.local` File

1. Navigate to `apps/web/` folder
2. Create a new file called `.env.local`
3. Add this content:

```bash
# PostgreSQL Database Connection
POSTGRES_URL="postgres://default:xxxxx@xxxxx-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb"

# Environment
NODE_ENV="development"
```

4. **Replace** the `xxxxx` with your actual database credentials from Step 1

---

## 🧪 Test It!

### 1. Start the development server:

```bash
cd apps/web
pnpm dev
```

### 2. Open your browser:

Go to http://localhost:3000 (or whatever port it shows)

### 3. Test the flow:

1. Click **"REGISTER YOUR COUNTRY"**
2. Select a country (e.g., Brazil)
3. Watch the leaderboard update! ✨

### 4. Check your database:

Go back to Supabase SQL editor and run:
```sql
SELECT * FROM countries ORDER BY count DESC;
```

You should see your country with count = 1!

---

## 🔍 How It Works (Simple Explanation)

### **What is PostgreSQL?**
PostgreSQL is a database that stores data in tables (like Excel spreadsheets). We have 2 tables:

1. **`countries`** table - stores country names and how many registrations
2. **`registrations`** table - stores each individual registration

### **What happens when you click a country?**

```
1. Frontend → Sends country code to /api/register
              ↓
2. Backend →  Checks if country exists in database
              ↓
3. Database → If exists: count = count + 1
              If new: create country with count = 1
              ↓
4. Backend →  Saves registration record
              ↓
5. Frontend → Fetches updated leaderboard
              ↓
6. You see →  Updated count on screen! 🎉
```

### **The Connection Pool (`db.ts`)**

Think of it like a phone line to your database:
- Instead of calling and hanging up each time (slow!)
- We keep the line open and reuse it (fast!)
- Multiple users can use different "lines" at the same time

### **Transactions (in `register/route.ts`)**

```typescript
await client.query('BEGIN');      // Start transaction
// ... do multiple database operations
await client.query('COMMIT');     // Save everything
// OR
await client.query('ROLLBACK');   // Undo everything if error
```

This ensures that either ALL operations succeed or NONE do. No partial saves!

---

## 📁 Files We Created

```
apps/web/
├── src/
│   ├── lib/
│   │   └── db.ts                 ← Connects to PostgreSQL
│   ├── app/
│   │   ├── api/
│   │   │   ├── register/
│   │   │   │   └── route.ts      ← POST: Register a country
│   │   │   └── leaderboard/
│   │   │       └── route.ts      ← GET: Fetch leaderboard
│   │   └── page.tsx              ← Frontend (updated)
└── .env.local                     ← Your database connection
```

---

## 🐛 Troubleshooting

### "POSTGRES_URL is not set"
**Problem**: The `.env.local` file is missing or in the wrong location

**Solution**: 
1. Make sure `.env.local` is in `apps/web/` directory
2. Restart your dev server (`pnpm dev`)

### "Failed to connect to server"
**Problem**: Database connection string is wrong

**Solution**:
1. Double-check your `POSTGRES_URL` in `.env.local`
2. Make sure you copied the full string from Vercel/Supabase
3. Check if your database is running in Vercel dashboard

### "No countries registered yet"
**Problem**: Database is empty or query failed

**Solution**:
1. Go to Supabase SQL editor
2. Run: `SELECT * FROM countries;`
3. If empty, the seed query didn't run - re-run the schema SQL

### Leaderboard not updating
**Problem**: Browser cache or API not refreshing

**Solution**:
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Check browser console for errors (F12 → Console tab)
3. Check terminal for server errors

---

## ✅ Success Checklist

- [ ] Created `.env.local` with `POSTGRES_URL`
- [ ] Ran `pnpm dev` successfully
- [ ] Can see the app in browser
- [ ] Click "Register Your Country" opens modal
- [ ] Selecting a country updates the leaderboard
- [ ] Count increases when clicking same country again
- [ ] Can verify in database: `SELECT * FROM countries;`

---

## 🎉 That's It!

Your backend is now connected! Every registration is saved to PostgreSQL and the leaderboard updates in real-time.

**Next Steps** (optional):
- Add authentication to prevent spam
- Limit one registration per user
- Add more countries
- Deploy to Vercel (it will auto-configure the database!)

---

## 📚 Database Queries You Can Run

Check all countries:
```sql
SELECT * FROM countries ORDER BY count DESC;
```

Check all registrations:
```sql
SELECT * FROM registrations ORDER BY timestamp DESC LIMIT 10;
```

See which countries have most registrations:
```sql
SELECT country_name, count 
FROM countries 
WHERE count > 0 
ORDER BY count DESC;
```

Reset a country's count:
```sql
UPDATE countries SET count = 0 WHERE country_code = 'BRA';
```

Delete all registrations (careful!):
```sql
DELETE FROM registrations;
UPDATE countries SET count = 0;
```

---

**Need help?** Check the console logs in your browser (F12) and terminal for detailed error messages!

