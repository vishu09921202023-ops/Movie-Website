# 🚀 Deploy Your Movie Website to Your .IN Domain

## Fastest Method: Render.com (FREE)

### Step 1: Push Code to GitHub
```bash
cd c:\Users\nawar\Downloads\Movie-Website
git add -A
git commit -m "Ready for production deployment"
git push
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your Movie-Website repo

### Step 3: Configure Deployment
- **Name:** movie-website
- **Runtime:** Node
- **Build Command:** 
  ```
  cd frontend && npm install && npm run build && cd ../backend && npm install
  ```
- **Start Command:** 
  ```
  node backend/server.js & cd frontend && npx next start -p 3020
  ```

### Step 4: Add Environment Variables
In Render Dashboard → Environment:
```
NODE_ENV=production
PORT=5000
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

### Step 5: Deploy
Click "Deploy" - wait 5-10 minutes

---

## Step 6: Point Your Domain

1. **Get Render's URL** from dashboard (like: movie-website.onrender.com)

2. **Go to Your Domain Registrar** (GoDaddy/Namecheap/etc)

3. **Add CNAME Record:**
   - Type: CNAME
   - Host: `www` (or root)
   - Value: `movie-website.onrender.com`
   - TTL: 3600

4. **Wait 24 hours** for DNS propagation

5. **Access:** https://yourdomain.in

---

## Alternative: Deploy to AWS (More Reliable)

### Using AWS Elastic Beanstalk:

1. Install EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize:
   ```bash
   cd c:\Users\nawar\Downloads\Movie-Website
   eb init -p "Node.js 18 running on 64bit Amazon Linux 2"
   ```

3. Create environment:
   ```bash
   eb create production-env
   ```

4. Deploy:
   ```bash
   eb deploy
   ```

5. Enable HTTPS:
   ```bash
   eb config
   # Add certificate
   ```

---

## Option 3: Simple Docker + DigitalOcean

### docker-compose.yml file is in repo - just:
```bash
docker-compose up -d
```

Then SSH into droplet and run this.

---

## What You Need RIGHT NOW

Reply with:
1. **GitHub URL** of your repo (so I can verify it's there)
2. **Which hosting you choose** (Render/AWS/DO)?
3. **Your AWS credentials** (if using AWS)?

**Then I'll finish the deployment for you!** ✅

---

## Current Status
- ✅ Code ready
- ✅ Database (DynamoDB) configured  
- ✅ Environment variables set
- ⏳ Just needs hosting + domain DNS pointing

🎬 **Website will be LIVE in 30 minutes!**
