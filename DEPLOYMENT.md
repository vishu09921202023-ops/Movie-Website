# 🌐 Deployment Guide: Vegamovies to Production

This guide covers deploying the complete Vegamovies stack to production using industry-standard platforms.

## Overview

- **Frontend**: Vercel (Next.js optimal hosting)
- **Backend**: Railway or Render (Node.js/Express)
- **Database**: MongoDB Atlas (Cloud database)
- **Domain**: Namecheap / GoDaddy (Optional)

## Prerequisites

- GitHub account with repository
- Vercel account ([Sign up](https://vercel.com))
- Railway account ([Sign up](https://railway.app)) OR Render account ([Sign up](https://render.com))
- MongoDB Atlas cluster set up

---

## Part 1: Deploy Backend

### Option A: Deploy to Railway (Recommended)

#### Step 1: Push to GitHub
```bash
cd Movie-Website
git init
git add .
git commit -m "Initial commit: Complete Vegamovies platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vegamovies.git
git push -u origin main
```

#### Step 2: Create Railway Account & Project
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway to access your repositories
4. Click "+ New Project"
5. Select "Deploy from GitHub repo"
6. Choose your vegamovies repository
7. Select the repo and Railway will auto-detect it's a Node.js project

#### Step 3: Configure Environment Variables
In Railway dashboard:
1. Go to your project
2. Click on the "backend" service (which Railway auto-detected)
3. Go to "Variables" tab
4. Add these variables:

```
MONGODB_URI = mongodb+srv://yourUsername:yourPassword@cluster.mongodb.net/vegamovies?retryWrites=true&w=majority
JWT_SECRET = <generate_random_64_char_string>
PORT = 5000
CORS_ORIGIN = https://your-frontend.vercel.app
NODE_ENV = production
```

#### Step 4: Configure Root Directory
1. In Railway project settings
2. Look for "Root Directory"
3. Set to `backend` (important!)
4. Railway will build and deploy automatically

#### Step 5: Get API URL
1. Go to "Deployments" tab
2. Click the successful deployment
3. Copy the domain (e.g., `https://vegamovies-production.up.railway.app`)
4. Your API URL is: `https://vegamovies-production.up.railway.app/api`

### Option B: Deploy to Render

#### Step 1: Create Web Service
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "+ New +" and select "Web Service"
4. Connect your GitHub repository
5. Select the vegamovies repo

#### Step 2: Configure Service
- **Name**: vegamovies-api
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `backend` (Important!)

#### Step 3: Add Environment Variables
Click "Advanced" and add:
```
MONGODB_URI = <your_mongodb_connection>
JWT_SECRET = <random_string>
PORT = 5000
CORS_ORIGIN = https://your-frontend.vercel.app
NODE_ENV = production
```

#### Step 4: Deploy
Click "Create Web Service" and wait for deployment (5-10 minutes)

---

## Part 2: Deploy Frontend to Vercel

### Option A: Via Git Push (Recommended)

#### Step 1: Create Vercel Account
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel
4. Click "Add New..." → "Project"
5. Select your vegamovies repository

#### Step 2: Configure Project
- **Framework**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next`

#### Step 3: Environment Variables
In Vercel dashboard:
1. Go to "Settings" → "Environment Variables"
2. Add:
```
NEXT_PUBLIC_API_URL = https://your-backend.railway.app/api
NEXT_PUBLIC_SITE_NAME = Vegamovies
NEXT_PUBLIC_SITE_URL = https://your-frontend.vercel.app
```

#### Step 4: Deploy
Click "Deploy" and Vercel will automatically deploy whenever you push to main branch

### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to frontend
cd frontend

# Deploy
vercel --prod

# Follow prompts to configure
```

---

## Part 3: Custom Domain Setup

### Connect Domain to Vercel

1. **Get a Domain**
   - Buy from Namecheap, GoDaddy, or register with any provider
   - Example: `vegamovies.com`

2. **Add Domain to Vercel**
   - Go to Vercel Dashboard → Settings → Domains
   - Enter your domain
   - Choose "I'll manage my own nameservers"

3. **Update Nameservers at Domain Registrar**
   - Log in to your domain registrar
   - Go to DNS/Nameserver settings
   - Change nameservers to Vercel's:
     - `ns1.vercel.com`
     - `ns2.vercel.com`
   - Save and wait 24-48 hours for DNS propagation

4. **Verify Domain in Vercel**
   - After DNS propagates, Vercel will auto-verify
   - Your site will be live at: `https://vegamovies.com`

---

## Part 4: Update Frontend API URL

After backend deployment:

1. Update `frontend/.env.production`:
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api
```

2. Commit and push:
```bash
git add frontend/.env.production
git commit -m "Update API URL to production backend"
git push origin main
```

3. Vercel will auto-redeploy frontend

---

## Part 5: Test Production Deployment

### Test Backend API
```bash
# Replace with your actual URL
curl https://your-backend.railway.app/api/health

# Should return:
# {"status":"OK"}
```

### Test Movie Endpoints
```bash
# Get movies
curl https://your-backend.railway.app/api/movies

# Get trending
curl https://your-backend.railway.app/api/movies/trending
```

### Test Frontend
1. Visit `https://your-frontend.vercel.app`
2. Browse movies (should load)
3. Click movie → should show details
4. Try admin login: `/admin/login`
5. Test download buttons

---

## Part 6: Monitoring & Maintenance

### Access Logs

**Railway:**
1. Dashboard → Click backend service
2. Click "Logs" tab
3. View real-time logs

**Render:**
1. Dashboard → Web Service
2. Click "Logs" tab
3. View deployment logs

### Monitor Performance

**Vercel:**
1. Dashboard → Analytics
2. View page views, response times
3. Check real-time metrics

**Railway:**
1. Metrics tab shows CPU, memory usage
2. Monitor database connection health
3. Check for errors in logs

### Update Database

For maintenance or scaling:

1. **Update MongoDB:**
   - Go to MongoDB Atlas
   - Click your cluster
   - Can upgrade tier if needed
   - Changes apply with minimal downtime

2. **Restart Services:**
   - **Railway**: Deployments → Click three dots → Redeploy
   - **Vercel**: Settings → Deployments → Redeploy

---

## Part 7: SSL/HTTPS & Security

### Automatic HTTPS
- Both Vercel and Railway provide free SSL certificates
- Automatically renewed
- Enforced on all traffic

### Update Admin Credentials
After deploying:

1. Access admin panel: `https://your-domain/admin/login`
2. Login with `admin / admin123`
3. Go to backend code → `seed.js`
4. Change default admin password:
   ```javascript
   const admin = new Admin({
     username: 'admin',
     email: 'admin@vegamovies.com',
     passwordHash: 'your_new_secure_password', // Change this!
     role: 'admin',
   });
   ```
5. Redeploy backend

### Rate Limiting
Already configured in production:
- Download: 10 per IP per hour
- Search: 60 per IP per minute
- API: 100 per minute

---

## Part 8: Backup & Recovery

### MongoDB Backup
MongoDB Atlas automatically backs up daily:
1. Atlas Dashboard → Backup section
2. Can restore to any point in last 35 days
3. Snapshots available for download

### GitHub Backup
Your entire code is on GitHub:
```bash
# Clone backup anytime:
git clone https://github.com/YOUR_USERNAME/vegamovies.git
```

---

## Part 9: Performance Optimization

### Frontend (Vercel)
- Already uses CDN
- Images auto-optimized
- Edge caching enabled

### Backend (Railway/Render)
- Add caching headers for static data
- Optimize database queries
- Use indexes on frequently queried fields

Example optimization in `backend/routes/movies.js`:
```javascript
// Add cache headers
res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
```

---

## Part 10: Troubleshooting Production

### Frontend Won't Load
1. Check Vercel logs
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Check browser console for errors
4. Verify backend is running

### API Returns 503
1. Check Railway/Render status
2. Verify MongoDB connection
3. Check service logs for errors
4. Restart service if needed

### Movies Not Loading
1. Verify MongoDB connection in logs
2. Check if seed data exists
3. Ensure JWT_SECRET is set correctly
4. Check CORS settings

### Admin Login Fails
1. Verify JWT_SECRET matches in all instances
2. Check back end logs for auth errors
3. Clear browser cache
4. Try incognito/private window

---

## Useful Commands

```bash
# Check service status
railway run env | grep PORT

# View live logs
vercel logs <deployment-url>

# Rollback to previous deployment
vercel rollback

# Monitor database
mongosh --uri "your_mongodb_connection_string"
```

---

## 🎉 You're Live!

Your Vegamovies platform is now live and accessible globally!

### Share Your Links
- Frontend: `https://your-domain`
- Admin: `https://your-domain/admin/login`
- API Docs: Swagger (optional, add for advanced users)

### Monitor Success
- Check daily active users in admin analytics
- Track most downloaded movies
- Monitor server performance
- Get user feedback

### Next Steps
- Add more movie content
- Customize branding
- Implement additional features
- Scale infrastructure as needed

---

**Happy streaming! 🍿**
