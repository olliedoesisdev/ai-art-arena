# Admin Portal - Quick Start Guide

Get your admin portal up and running in 5 minutes!

## ⚡ Quick Setup (5 Steps)

### 1️⃣ Run Database Schema

```bash
# Open Supabase Dashboard > SQL Editor
# Copy and run: supabase-admin-schema.sql
```

### 2️⃣ Create Your Admin User

**In Supabase Dashboard:**
1. Go to **Authentication** > **Users**
2. Click **Add User** > **Create new user**
3. Enter your email and password
4. Copy the User ID

### 3️⃣ Add to Admin Table

**In SQL Editor, run:**

```sql
INSERT INTO admin_users (id, email, name, role)
VALUES (
  'PASTE_YOUR_USER_ID_HERE',
  'your-email@example.com',
  'Your Name',
  'admin'
);
```

### 4️⃣ Verify Environment Variables

Check `.env.local` contains:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5️⃣ Login to Admin Portal

```bash
# Restart dev server
npm run dev

# Open browser
http://localhost:3000/admin/login
```

Login with your email and password!

---

## 🎯 What You Can Do Now

### Create a Contest

1. Go to `/admin/contests`
2. Click **New Contest**
3. Fill in:
   - Title: "AI Art Weekly Challenge"
   - Week: 1, Year: 2025
   - Start/End dates
   - Status: "active"
4. Click **Create Contest**

### Add Artworks

1. Go to `/admin/artworks`
2. Click **New Artwork**
3. Fill in:
   - Select contest
   - Title, Artist name
   - Image URL (use any public image URL)
   - Optional: Description, prompt, style
4. Click **Create Artwork**

### View Analytics

1. Go to `/admin/analytics`
2. See vote statistics
3. View top artworks
4. Track recent votes

---

## 📱 Admin Routes

| Page | URL | Purpose |
|------|-----|---------|
| **Login** | `/admin/login` | Sign in |
| **Dashboard** | `/admin` | Overview & stats |
| **Contests** | `/admin/contests` | Manage contests |
| **Artworks** | `/admin/artworks` | Manage artworks |
| **Analytics** | `/admin/analytics` | Voting stats |

---

## 👥 User Roles

| Role | Contests | Artworks | Analytics | Users | Delete |
|------|----------|----------|-----------|-------|--------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Moderator** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Editor** | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## 🔧 Common Issues

### Can't Login?

```sql
-- Check if you're in admin_users table
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```

### Environment Error?

```bash
# Restart dev server after changing .env.local
npm run dev
```

### Permission Error?

```sql
-- Make sure you're an admin
UPDATE admin_users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 🎉 You're Done!

No more manual SQL! You can now:

- ✅ Create contests through the UI
- ✅ Add artworks with a form
- ✅ View real-time analytics
- ✅ Manage everything from your browser

**Admin Portal:** `http://localhost:3000/admin`

For detailed documentation, see: [ADMIN-SETUP-GUIDE.md](./ADMIN-SETUP-GUIDE.md)