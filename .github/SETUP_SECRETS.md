# GitHub Secrets Setup

To enable the GitHub Actions workflow, you need to add the following secrets to your repository.

## How to Add Secrets

1. Go to your repository: https://github.com/astralintegration-co/egon-health
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

## Required Secrets

### Supabase Credentials (Web)

**Name:** `NEXT_PUBLIC_SUPABASE_URL`
**Value:** `https://vpdwubpodcrbicvldskg.supabase.co`

**Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Value:** Your anon/public key from Supabase Dashboard → Project Settings → API

**Name:** `NEXT_PUBLIC_PROJECT_ID`
**Value:** `vpdwubpodcrbicvldskg`

### Supabase Credentials (Mobile)

**Name:** `EXPO_PUBLIC_SUPABASE_URL`
**Value:** `https://vpdwubpodcrbicvldskg.supabase.co`

**Name:** `EXPO_PUBLIC_SUPABASE_ANON_KEY`
**Value:** Same anon/public key as above

## Optional Secrets

**Name:** `EXPO_TOKEN`
**Value:** Get from https://expo.dev/accounts/[your-account]/settings/access-tokens
**Purpose:** Required for EAS builds, optional for config validation

## Verification

Once secrets are added:
1. Push a commit to main branch
2. Go to **Actions** tab in GitHub
3. Check that the workflow runs successfully
4. All three jobs (test-web, test-expo, lint) should pass

## Troubleshooting

- **Build fails with "NEXT_PUBLIC_SUPABASE_URL is not set"**: Make sure secret names match exactly
- **Expo job fails**: EXPO_TOKEN is optional, you can ignore this or add the token
- **Type check fails**: This is set to continue-on-error, won't block the workflow

## Security Note

These are PUBLIC keys that are safe to use in client-side code. Never add your:
- `SUPABASE_SERVICE_ROLE` key (server-side only, keep in .env locally)
- Database passwords
- API secrets
