# Deployment Checklist for 3D Outfit Builder

## Pre-Deployment Setup

### 1. Environment Variables
Ensure all required environment variables are set in Vercel:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)

**Optional Variables (if using direct database connection):**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `POSTGRES_HOST`
- `SUPABASE_JWT_SECRET`

### 2. Supabase Database Setup
Run the following SQL scripts in order in your Supabase SQL editor:

1. `scripts/00-complete-database-setup.sql` - Complete database schema
2. `scripts/14-add-onboarding-field.sql` - Onboarding fields
3. `scripts/15-optimize-rls-policies.sql` - Optimized RLS policies
4. `scripts/17-add-foreign-key-indexes.sql` - Performance indexes
5. `scripts/18-optimize-profiles-indexes.sql` - Profile table optimization
6. `scripts/20-fix-storage-rls.sql` - Storage bucket and RLS policies

### 3. Supabase Storage Setup
Ensure the following storage buckets exist:
- `avatars` - For user profile pictures (public read, authenticated write)

## Deployment Steps

### 1. GitHub Repository
- Ensure your code is pushed to GitHub
- Repository should be public or accessible to Vercel

### 2. Vercel Deployment
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration
5. Add environment variables in the "Environment Variables" section
6. Click "Deploy"

### 3. Post-Deployment Verification

#### Health Check
- Visit `https://your-app.vercel.app/api/health`
- Should return: `{"status":"ok","timestamp":"...","environment":"production"}`

#### Authentication Flow
1. Visit `/auth/register` - Create a new account
2. Check email for verification link
3. Complete email verification
4. Visit `/onboarding` - Complete the 3-step onboarding process
5. Upload a profile picture
6. Verify profile data persists after logout/login

#### Core Features
- [ ] Landing page loads without errors
- [ ] Feature cards animate smoothly into view
- [ ] Navigation works (authenticated vs non-authenticated states)
- [ ] 3D Playground page loads
- [ ] Outfit Picker functionality
- [ ] Gallery page with filters
- [ ] Product pages and cart functionality
- [ ] Profile management and settings

#### Database Performance
- Check Supabase dashboard for any RLS policy warnings
- Verify query performance is optimal
- Confirm all foreign key indexes are in place

## Troubleshooting

### Common Issues

**Cards not visible:**
- Ensure framer-motion is installed: `npm install framer-motion`
- Check browser console for JavaScript errors
- Verify CSS classes are loading properly

**Authentication errors:**
- Verify Supabase environment variables are correct
- Check Supabase project settings for correct URLs
- Ensure RLS policies are properly configured

**Database connection issues:**
- Verify database connection strings
- Check Supabase project is active and not paused
- Ensure all required tables exist

**Storage upload errors:**
- Verify storage bucket exists and is properly configured
- Check RLS policies for storage bucket
- Ensure CORS is configured if needed

### Performance Optimization
- All foreign key indexes should be in place
- RLS policies should be optimized (no performance warnings)
- Images should be optimized and properly sized
- Consider enabling Vercel Analytics for monitoring

## Production Readiness Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed and optimized
- [ ] Storage buckets configured with proper RLS
- [ ] Authentication flow tested end-to-end
- [ ] All pages load without errors
- [ ] Mobile responsiveness verified
- [ ] Performance optimizations applied
- [ ] Error handling implemented
- [ ] Health check endpoint working
- [ ] Monitoring and analytics configured

## Maintenance

### Regular Tasks
- Monitor Supabase usage and performance
- Check Vercel deployment logs for errors
- Update dependencies regularly
- Monitor user feedback and bug reports
- Backup database regularly (Supabase handles this automatically)

### Scaling Considerations
- Monitor database query performance
- Consider CDN for static assets
- Implement caching strategies as needed
- Monitor and optimize bundle size
- Consider implementing rate limiting for API endpoints
