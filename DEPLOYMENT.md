# 3D Outfit Builder - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- A Supabase account and project
- A Vercel account (recommended for deployment)

## Environment Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd 3d-outfit-builder
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   \`\`\`

## Supabase Configuration

1. **Create a new Supabase project** at https://supabase.com

2. **Run the database setup scripts** in the Supabase SQL editor:
   - Execute `scripts/00-complete-database-setup.sql`
   - Execute `scripts/01-create-tables.sql`
   - Execute `scripts/02-create-rls-policies.sql`
   - Execute `scripts/03-seed-sample-data.sql`
   - Execute `scripts/04-create-functions.sql`

3. **Configure Authentication**
   - Go to Authentication > Settings
   - Add your domain to "Site URL"
   - Configure email templates if needed

4. **Set up Storage**
   - Go to Storage and create a bucket named "avatars"
   - Set appropriate policies for public access

## Local Development

1. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Open your browser** and navigate to `http://localhost:3000`

3. **Test the application**
   - Register a new account
   - Complete the onboarding flow
   - Test the dashboard features

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in the Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your app

### Option 2: Manual Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start the production server**
   \`\`\`bash
   npm start
   \`\`\`

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Verify email confirmation flow
- [ ] Test profile updates and image uploads
- [ ] Check dashboard analytics and charts
- [ ] Verify 3D playground functionality
- [ ] Test real-time updates
- [ ] Confirm mobile responsiveness

## Monitoring and Maintenance

1. **Set up error tracking** (e.g., Sentry)
2. **Monitor performance** with Vercel Analytics
3. **Set up database backups** in Supabase
4. **Configure alerts** for critical issues

## Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Verify environment variables
   - Check RLS policies
   - Ensure service role key has proper permissions

2. **Image upload issues**
   - Verify storage bucket exists
   - Check storage policies
   - Ensure proper CORS configuration

3. **Real-time updates not working**
   - Check WebSocket connections
   - Verify subscription setup
   - Test with browser developer tools

### Support

For additional support:
- Check the Supabase documentation
- Review Next.js deployment guides
- Contact the development team

## Performance Optimization

1. **Enable caching** for static assets
2. **Optimize images** with Next.js Image component
3. **Use CDN** for better global performance
4. **Monitor bundle size** and optimize imports
5. **Implement lazy loading** for heavy components

## Security Considerations

1. **Review RLS policies** regularly
2. **Keep dependencies updated**
3. **Use HTTPS** in production
4. **Implement rate limiting** if needed
5. **Regular security audits**

---

Your 3D Outfit Builder is now ready for production! 🚀
