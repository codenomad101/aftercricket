# Cricket News Platform

A full-stack Next.js 14+ application featuring live cricket scores, news articles, and an admin dashboard for content management.

## Features

- 🏏 **Live Cricket Scores** - Real-time match updates from cricketdata.org API
- 📰 **News Articles** - Rich content articles with markdown support
- 🏷️ **Categories** - Organize articles by Players, Teams, Tournaments, etc.
- 🔐 **Admin Dashboard** - Secure admin panel for managing content
- 💾 **Caching** - 15-minute API response caching to optimize performance
- 🎨 **Modern UI** - Beautiful design with light brown and light blue color scheme

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **API**: cricketdata.org

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository** (or navigate to the project directory)

```bash
cd cricketype
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cricket_news"

# Cricket API
CRICKET_API_KEY="6655ea70-e8d2-49de-943a-712569ea8ac8"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-one-change-this-in-production"

# Admin Credentials (for initial setup)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

**Important**: 
- Replace `DATABASE_URL` with your PostgreSQL connection string
- Generate a secure `NEXTAUTH_SECRET` (you can use: `openssl rand -base64 32`)
- Update admin credentials as needed

4. **Set up the database**

```bash
# Generate database migrations
npm run db:generate

# Apply migrations (or use push for development)
npm run db:push

# Initialize database with admin user and default categories
npm run db:init
```

5. **Start the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
cricketype/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── articles/       # Public article pages
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   ├── lib/                # Utilities and configurations
│   │   ├── db/            # Database setup and schema
│   │   ├── auth.ts        # NextAuth configuration
│   │   └── cricket-api.ts # Cricket API integration
│   ├── scripts/           # Utility scripts
│   └── types/             # TypeScript type definitions
├── drizzle/               # Database migrations
└── public/                # Static assets
```

## Usage

### Admin Dashboard

1. Navigate to `/admin`
2. Login with your admin credentials (from `.env.local`)
3. Manage articles and categories from the dashboard

### Creating Articles

1. Go to Admin Dashboard → Articles → New Article
2. Fill in the article details:
   - Title (required)
   - Category (required)
   - Content (Markdown supported)
   - Excerpt (optional)
   - Publish status
3. Click "Create Article"

### Managing Categories

1. Go to Admin Dashboard → Categories
2. Click "New Category" to create categories
3. Default categories are created on initialization:
   - Players
   - Teams
   - Tournaments
   - Matches
   - General

## API Endpoints

- `GET /api/cricket/live-scores` - Get live cricket matches
- `GET /api/articles` - Get all articles (with optional category filter)
- `GET /api/articles/[id]` - Get a specific article
- `POST /api/articles` - Create a new article (admin only)
- `PUT /api/articles/[id]` - Update an article (admin only)
- `DELETE /api/articles/[id]` - Delete an article (admin only)
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category (admin only)

## Database Schema

- **users**: Admin authentication
- **articles**: News articles with rich content
- **categories**: Article categories
- **api_cache**: Cached API responses with TTL

## Caching

The application implements 15-minute caching for cricket API responses to:
- Reduce API calls
- Improve performance
- Avoid rate limiting

Cache is stored in the `api_cache` table with automatic expiration.

## Color Scheme

- Light Brown: `#D4A574`
- Dark Brown: `#8B6F47`
- Light Blue: `#A8D8EA`
- Dark Blue: `#5A9AB5`
- Cream: `#F5E6D3`

## Development

```bash
# Run development server
npm run dev

# Generate database migrations
npm run db:generate

# Push schema changes (development)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Initialize database
npm run db:init
```

## Production Deployment

1. Set up a PostgreSQL database
2. Update environment variables
3. Generate a secure `NEXTAUTH_SECRET`
4. Run database migrations
5. Initialize the database
6. Build the application:

```bash
npm run build
npm start
```

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue on the repository.



