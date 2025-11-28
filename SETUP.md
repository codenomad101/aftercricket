# Quick Setup Guide

Follow these steps to get your Cricket News Platform up and running:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up PostgreSQL Database

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE cricket_news;
```

## 3. Configure Environment Variables

Create a `.env.local` file in the root directory with:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/cricket_news"
CRICKET_API_KEY="6655ea70-e8d2-49de-943a-712569ea8ac8"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-secret-here"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## 4. Set Up Database Schema

```bash
# Generate migrations
npm run db:generate

# Apply migrations (or use push for development)
npm run db:push

# Initialize with admin user and default categories
npm run db:init
```

## 5. Start Development Server

```bash
npm run dev
```

## 6. Access the Application

- **Home Page**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
  - Login with credentials from `.env.local`

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`
- Ensure database exists

### API Issues
- Verify CRICKET_API_KEY is correct
- Check API rate limits
- Review browser console for errors

### Authentication Issues
- Ensure NEXTAUTH_SECRET is set
- Verify admin user was created (run `npm run db:init`)
- Check browser console for NextAuth errors

## Next Steps

1. Create categories in Admin Dashboard → Categories
2. Create your first article in Admin Dashboard → Articles → New Article
3. Customize the design and content as needed



