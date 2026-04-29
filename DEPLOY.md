# Deploy to Vercel — Quick Reference

## Environment Variables to add in Vercel Dashboard

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xnbskezssonfveazbjzu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuYnNrZXpzc29uZnZlYXpianp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODIwMTAsImV4cCI6MjA5MzA1ODAxMH0.dBbSE_Cb92WcvkxjlJ0TZRYlvLhpAkLjWjU02X9dimU` |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-APP.vercel.app` ← replace after deploy |

## After deploying, update Supabase

Go to: https://supabase.com/dashboard/project/xnbskezssonfveazbjzu/auth/url-configuration

Set:
- Site URL: `https://YOUR-APP.vercel.app`
- Redirect URLs: `https://YOUR-APP.vercel.app/**` and `http://localhost:3001/**`
