# 🚀 GitHub Repository Setup Guide

Your Vegamovies project is now initialized with Git locally. Follow these steps to push it to GitHub.

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Sign in to your account
3. Click **"New"** button (top left, or go to github.com/new)
4. Fill in details:
   - **Repository name**: `vegamovies` (or your preferred name)
   - **Description**: `Complete full-stack movie platform - Next.js + Express.js + MongoDB`
   - **Visibility**: Choose "Private" or "Public"
   - **Don't initialize** with README, .gitignore, or license (we have these)
5. Click **"Create repository"**

## Step 2: Get Your Repository URL

After creating the repository, GitHub will show you commands. Copy your repository URL:
```
https://github.com/YOUR_USERNAME/vegamovies.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Push to GitHub

Run these commands in your terminal (in the Movie-Website directory):

```powershell
cd "c:\Users\nawar\Downloads\Movie-Website"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/vegamovies.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 4: Verify Upload

1. Refresh your GitHub repository page
2. You should see all files uploaded:
   - frontend/ (45+ files)
   - backend/ (20+ files)
   - Documentation files (README, INSTALLATION, DEPLOYMENT, etc.)
3. Verify the commit message appears with your initial commit

## Step 5: Configure GitHub Settings (Optional but Recommended)

### Add Collaborators
1. Go to repository → Settings → Collaborators
2. Add team members if working with others

### Enable Branch Protection
1. Go to Settings → Branches
2. Add rule for "main" branch
3. Require pull requests for changes (optional but good practice)

### Add GitHub Secrets (for Future CI/CD)
1. Go to Settings → Secrets and variables → Actions
2. Add secrets for deployment (future use):
   - `VERCEL_TOKEN` (for frontend auto-deploy)
   - `RAILWAY_TOKEN` (for backend auto-deploy)

## Step 6: Future Updates

Whenever you make changes:

```powershell
cd "c:\Users\nawar\Downloads\Movie-Website"

# Stage changes
git add .

# Commit with message
git commit -m "Update: description of changes"

# Push to GitHub
git push origin main
```

## Step 7: Clone on Another Machine

To clone your repository on another computer:

```powershell
git clone https://github.com/YOUR_USERNAME/vegamovies.git
cd vegamovies
cd backend && npm install
cd ../frontend && npm install
```

## 🔐 Important Security Notes

1. **Never commit .env files** (already in .gitignore)
2. **Don't push credentials** or secrets to GitHub
3. **Change admin password** before each deployment
4. **Keep JWT_SECRET private** (generate new per environment)

---

## 🎯 Your Repository is Ready!

Your project is now:
- ✅ Under version control
- ✅ Backed up to GitHub
- ✅ Ready for collaboration
- ✅ Set up for future CI/CD pipelines

---

## Next Steps

### Option A: Deploy Immediately
→ Follow [DEPLOYMENT.md](DEPLOYMENT.md) to push to Vercel & Railway

### Option B: Make Changes First
```powershell
# Make your customizations
# Then commit and push
git add .
git commit -m "Custom: your changes"
git push origin main
```

### Option C: Set Up CI/CD (Advanced)
1. Create `.github/workflows/deploy.yml` for auto-deploy
2. Add GitHub secrets for API tokens
3. Auto-deploy on push to main branch

---

## Troubleshooting

### Authentication Error
```
fatal: Authentication failed for 'https://github.com/...'
```
**Solution:**
- Use GitHub CLI: `gh auth login`
- Or create Personal Access Token: Settings → Developer settings → Personal access tokens
- Use token as password when prompted

### Push Rejected
```
error: failed to push some refs to 'origin'
```
**Solution:**
```powershell
git pull origin main --allow-unrelated-histories
git push origin main
```

### Can't Find Repository
- Verify repository name matches exactly
- Check username is correct
- Make sure you're pushing to your own repo, not someone else's

---

**Your Vegamovies platform is now on GitHub!** 🎉

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
