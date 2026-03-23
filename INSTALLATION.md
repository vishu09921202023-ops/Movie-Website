# 🚀 Installation & Setup Guide for Vegamovies

This guide walks you through setting up the complete Vegamovies application locally or for production deployment.

## Prerequisites

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn**: Comes with Node.js
- **MongoDB Atlas**: Free account ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Git**: For version control ([Download](https://git-scm.com/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

## Part 1: MongoDB Setup

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project named "Vegamovies"
4. Create a new cluster (M0 Free tier is sufficient)

### 1.2 Get Connection String
1. Click "Connect" on your cluster
2. Select "Drivers"
3. Choose Node.js and copy the connection string
4. It will look like: `mongodb+srv://username:password@cluster.mongodb.net/vegamovies?retryWrites=true&w=majority`

## Part 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd Movie-Website/backend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Create Environment File
```bash
cp .env.example .env
```

### 2.4 Configure Environment Variables
Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://yourUsername:yourPassword@cluster.mongodb.net/vegamovies?retryWrites=true&w=majority
JWT_SECRET=your_random_64_character_secret_key_here_make_it_long_random_12345
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**How to generate JWT_SECRET:**
```bash
# On Windows (PowerShell)
-join (1..64 | ForEach-Object { [char]((48..122) | Get-Random) })

# On Mac/Linux
openssl rand -base64 48
```

### 2.5 Seed Sample Data
```bash
npm run seed
```

You'll see:
```
Connected to MongoDB
Cleared existing data
Created 20 movies
Created admin user (username: admin, password: admin123)
Created site links
Seeding complete!
```

### 2.6 Start Backend Server
```bash
npm run dev
```

You should see: `Server running on port 5000`

**Test API:**
- Visit `http://localhost:5000/api/health` - Should return `{"status":"OK"}`
- Check movies: `http://localhost:5000/api/movies`

## Part 3: Frontend Setup

### 3.1 Open New Terminal & Navigate to Frontend
```bash
cd Movie-Website/frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Create Environment File
```bash
cp .env.example .env.local
```

### 3.4 Configure Environment Variables
Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_NAME=Vegamovies
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3.5 Start Frontend Development Server
```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.x
  - Local:        http://localhost:3000
```

## Part 4: Access the Application

### 4.1 Public Access
- **Homepage**: http://localhost:3000
- **Browse Screen**: http://localhost:3000/browse
- **Movie Detail**: Click any movie card
- **Anime Section**: http://localhost:3000/anime
- **K-Drama Section**: http://localhost:3000/kdrama
- **Search**: http://localhost:3000/search?q=any-query
- **Trending**: http://localhost:3000/trending

### 4.2 Admin Access
- **Login Page**: http://localhost:3000/admin/login
- **Default Credentials**:
  - Username: `admin`
  - Password: `admin123`
- **Dashboard**: http://localhost:3000/admin/dashboard
- **Manage Movies**: http://localhost:3000/admin/movies
- **Add Movie**: http://localhost:3000/admin/movies/new
- **Site Links**: http://localhost:3000/admin/sitelinks

## Part 5: Development Workflow

### File Structure
```
Movie-Website/
├── frontend/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── lib/              # API & utilities
│   └── package.json      # Frontend dependencies
│
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, validation
│   ├── seed.js           # Sample data
│   ├── server.js         # Express app
│   └── package.json      # Backend dependencies
│
└── README.md
```

### Common Commands

**Backend:**
```bash
cd backend
npm run dev      # Start dev server
npm run seed     # Seed database
npm start        # Production start
```

**Frontend:**
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Production start
npm run lint     # Check for errors
```

## Part 6: Making Changes

### Adding a New Movie Type
1. Open `backend/models/Movie.js`
2. Add to enum in `type` field
3. Update frontend navbar filters

### Changing Colors
1. Edit `frontend/tailwind.config.ts`
2. Update colors in theme.extend.colors
3. Rebuild Next.js

### Adding New Genres
1. Open `frontend/components/Navbar.tsx`
2. Add genre to DROPDOWNS.genre array
3. Same for admin form in `frontend/app/admin/movies/new/page.tsx`

### Managing Movies
1. Go to Admin Dashboard: `/admin/dashboard`
2. Click "Manage Movies"
3. Click "Edit" or "Delete" on any movie
4. Or add new from "+ Add New Movie" button

## Part 7: Troubleshooting

### MongoDB Connection Fails
- Verify connection string in `.env`
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for development)
- Ensure username/password are URL-encoded

### Frontend can't reach API
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running on port 5000
- Check CORS in `backend/server.js`

### Admin login fails
- Clear browser cache and cookies
- Ensure you ran `npm run seed` in backend
- Check backend logs for errors

### Images don't load
- Verify poster URL is valid
- Check Next.js image configuration in `frontend/next.config.ts`
- Add domains to `remotePatterns` if using different image source

### Port already in use
```bash
# Change port in backend/.env:
PORT=5001

# Or kill the process using the port
# Windows:
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# Mac/Linux:
lsof -i :5000
kill -9 [PID]
```

## Part 8: Production Deployment

### Deploy Frontend to Vercel
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy Backend to Railway
1. Sign up at [Railway.app](https://railway.app/)
2. Connect GitHub repository
3. Create new project from GitHub
4. Select `backend` directory as root
5. Add environment variables
6. Deploy!

### Production Environment Variables

**Backend (.env on Railway):**
```
MONGODB_URI=<your_production_mongodb>
JWT_SECRET=<long_random_string>
PORT=5000
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

**Frontend (.env.local on Vercel):**
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_SITE_NAME=Vegamovies
NEXT_PUBLIC_SITE_URL=https://your-frontend.vercel.app
```

## Part 9: Security Checklist

Before going live, ensure:

- [ ] Change admin password from default
- [ ] Generate new JWT_SECRET (min 64 chars, random)
- [ ] Set NODE_ENV=production
- [ ] Enable MongoDB authentication
- [ ] Configure CORS properly (don't use wildcard *)*
- [ ] Add rate limiting to public endpoints
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set secure cookies in production
- [ ] Review data validation (Zod schemas)
- [ ] Test with real data

## Support & Next Steps

### Getting More Help
- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Feature Customization
- Modify colors in tailwind.config.ts
- Change navbar items in components/Navbar.tsx
- Customize admin form fields
- Add new filters and search options

### Performance Optimization
- Enable image optimization
- Implement caching strategies
- Use CDN for images
- Optimize database queries
- Implement pagination

---

**Enjoy building! 🎬**
