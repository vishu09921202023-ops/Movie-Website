# Vegamovies - Movie Streaming Website

A complete, production-ready movie downloading and streaming website clone built with Next.js 14, Express.js, and MongoDB. Featuring an exact replica of the Vegamovies.vodka interface with premium features.

## 🎯 Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Advanced Filtering**: Filter by OTT platform, genre, year, quality, and type
- **Movie Collections**: Trending, Featured, Anime, K-Drama, and more
- **Admin Panel**: Full movie and site content management
- **Search Functionality**: Fast text-based movie search
- **Download Tracking**: Analytics for views and downloads
- **Authentication**: Secure JWT-based admin authentication
- **Rate Limiting**: Protects against abuse
- **SEO Optimized**: Structured data, sitemaps, and OG tags

## 📋 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios**
- **Zustand** (State management)

### Backend
- **Express.js**
- **MongoDB** (with Mongoose)
- **JWT Authentication**
- **Zod** (Validation)
- **Helmet** (Security headers)
- **Express Rate Limit**

## 📁 Project Structure

```
Movie-Website/
├── frontend/                    # Next.js application
│   ├── app/                     # Next.js app directory
│   │   ├── page.tsx             # Homepage
│   │   ├── browse/page.tsx      # Browse archive
│   │   ├── movie/[slug]/page.tsx # Movie details
│   │   ├── anime/page.tsx       # Anime section
│   │   ├── kdrama/page.tsx      # K-Drama section
│   │   ├── [other sections]
│   │   └── admin/               # Admin panel
│   ├── components/              # React components
│   ├── lib/                     # Utilities & API
│   └── public/                  # Static assets
│
├── backend/                     # Express API
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API routes
│   ├── middleware/              # Auth, validation, rate limiting
│   ├── seed.js                  # Seed sample data
│   └── server.js                # Express entry point
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository
```bash
git clone <repo-url>
cd Movie-Website
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and other config
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/vegamovies
# JWT_SECRET=your_random_secret_key
# PORT=5000

# Seed sample data
npm run seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd ../frontend
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local if needed
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📖 API Endpoints

### Public Endpoints
- `GET /api/movies` - List all movies with filters
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/featured` - Get featured movies
- `GET /api/movies/:slug` - Get movie details
- `POST /api/movies/:id/view` - Record view
- `POST /api/movies/:id/download` - Process download

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin login
- `GET/POST /api/admin/movies` - Manage movies
- `PUT/DELETE /api/admin/movies/:id` - Edit/delete movie
- `GET /api/admin/analytics` - View analytics
- `GET/POST /api/admin/sitelinks` - Manage site links

## 🔐 Admin Access

Default credentials (from seed data):
- **Username**: `admin`
- **Password**: `admin123`

⚠️ Change these immediately in production!

## 🎨 Customization

### Colors
Edit `frontend/tailwind.config.ts` to customize the dark theme colors.

### Navigation Items
Edit the dropdown items in `frontend/components/Navbar.tsx` for OTT, Genre, Year, and Quality filters.

### Site Links
Manage quick filter buttons from the admin panel at `/admin/sitelinks`.

## 📊 Database Schema

### Movie
```javascript
{
  slug, title, cleanTitle, description,
  posterUrl, backdropUrl,
  releaseDate, releaseYear,
  source, audioLanguages,
  type, ottPlatform, genres, qualities,
  downloadLinks, imdbRating, duration,
  isTrending, isFeatured, isAdult,
  views, downloads, tags
}
```

### Admin
```javascript
{
  username, email, passwordHash, role
}
```

### Analytics
```javascript
{
  movieId, event, quality, ipHash, timestamp, userAgent
}
```

## 🛡️ Security Features

- **JWT Authentication**: Secure admin access
- **CORS**: Restricted to frontend domain
- **Helmet.js**: Security headers
- **Rate Limiting**: Prevents abuse
- **Password Hashing**: bcryptjs with salt rounds 12
- **Input Validation**: Zod schemas on all endpoints

## 📱 Responsive Design

- **Mobile** (<768px): 2-col grid, hamburger menu
- **Tablet** (768-1024px): 3-col grid, condensed nav
- **Desktop** (>1024px): 6-col grid, full dropdowns

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Follow hosting platform's deployment guide
```

### Environment Variables

**Backend (.env)**
```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=random_64_char_string
PORT=5000
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
NEXT_PUBLIC_SITE_NAME=Vegamovies
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

## 📝 License

This project is provided as-is for educational purposes.

## ⚠️ Disclaimer

This website is a movie **index** service. It does not host, produce, or distribute any copyrighted content. All content is sourced from third-party providers. Users are responsible for ensuring their usage complies with local laws.

## 🤝 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for movie enthusiasts**
