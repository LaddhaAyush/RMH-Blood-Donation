# 🚀 Deployment Guide

## Pre-Deployment Checklist

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create a cluster (Free tier M0 is sufficient)
- [ ] Create database user with username and password
- [ ] Whitelist IP addresses:
  - For Vercel: Add `0.0.0.0/0` (allow from anywhere)
  - For local testing: Add your current IP
- [ ] Get connection string (format: `mongodb+srv://...`)

### 2. Environment Variables
- [ ] Create `.env` file locally (DO NOT commit this)
- [ ] Add `MONGODB_URI=your_connection_string_here`
- [ ] Ensure `.env` is in `.gitignore`

### 3. Code Verification
- [ ] All files saved
- [ ] Run `npm install` to ensure dependencies are installed
- [ ] Test locally if possible (with Atlas connection)

## Vercel Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the settings

3. **Configure Environment Variables**
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add: `MONGODB_URI` = `mongodb+srv://ayush:rmhblood26@rmh.vzcajej.mongodb.net/blood_donation?retryWrites=true&w=majority`
   - Select all environments (Production, Preview, Development)
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Visit your live URL

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts to configure

# Add environment variable
vercel env add MONGODB_URI

# Redeploy
vercel --prod
```

## Post-Deployment Verification

### 1. Test Endpoints
- [ ] Visit homepage: `https://your-app.vercel.app/`
- [ ] Visit dashboard: `https://your-app.vercel.app/dashboard`
- [ ] Submit a test registration
- [ ] Check if stats update on dashboard

### 2. Check Vercel Logs
- Go to Vercel Dashboard → Your Project → Deployments
- Click on latest deployment
- Check "Functions" logs for any errors

### 3. MongoDB Atlas Verification
- [ ] Go to Atlas Dashboard → Database → Browse Collections
- [ ] Check `blood_donation` database
- [ ] Verify `donors` and `stats` collections exist
- [ ] Check if test donor was saved

## Common Issues & Solutions

### Issue: "FUNCTION_INVOCATION_FAILED"
**Solution:**
- Check Vercel function logs for actual error
- Ensure `MONGODB_URI` is set in Vercel environment variables
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Issue: "Could not connect to MongoDB Atlas"
**Solution:**
- Verify connection string is correct
- Check MongoDB Atlas network access settings
- Ensure database user has correct permissions
- Check if cluster is running (not paused)

### Issue: "Module not found"
**Solution:**
- Ensure all dependencies are in `package.json`
- Run `npm install` locally
- Commit `package.json` and `package-lock.json`
- Redeploy

### Issue: Static files (CSS/JS) not loading
**Solution:**
- Check `vercel.json` routing configuration
- Ensure files are in `public/` directory
- Check browser console for 404 errors
- Clear browser cache

## Performance Optimization Tips

1. **Enable Caching**
   - Static files are automatically cached by Vercel
   - Consider adding cache headers for API responses

2. **Monitor Cold Starts**
   - First request after idle may be slow (5-10s)
   - Subsequent requests will be fast (~100-500ms)
   - Consider using a uptime monitor (e.g., UptimeRobot) to ping every 5 minutes

3. **Database Connection Pooling**
   - Already implemented in `server.js`
   - Connections are reused across function invocations

4. **Error Monitoring**
   - Monitor Vercel function logs regularly
   - Set up alerts in Vercel dashboard
   - Consider adding Sentry or LogRocket for error tracking

## Security Best Practices

- ✅ Never commit `.env` file
- ✅ Use strong MongoDB password
- ✅ Rotate credentials periodically
- ✅ Keep dependencies updated (`npm audit`)
- ✅ Use HTTPS (Vercel provides automatically)
- ✅ Validate all user inputs (already implemented)
- ✅ Limit MongoDB user permissions (read/write only)

## Maintenance

### Weekly
- [ ] Check Vercel function logs for errors
- [ ] Monitor database size in Atlas
- [ ] Check for security alerts in MongoDB Atlas

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit fix`
- [ ] Review and optimize database indexes
- [ ] Check Atlas cluster performance metrics

### As Needed
- [ ] Scale MongoDB cluster if needed
- [ ] Add new features or bug fixes
- [ ] Update environment variables if credentials change

## Support

If you encounter issues:
1. Check Vercel function logs
2. Check MongoDB Atlas logs
3. Review browser console errors
4. Check this deployment guide
5. Open an issue on GitHub

---

**Last Updated:** January 2026
**Deployment Status:** ✅ Production Ready
