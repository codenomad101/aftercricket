import { db } from '../lib/db';
import { users, categories } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function initDatabase() {
  try {
    console.log('Initializing database...');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.insert(users).values({
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Admin user created:', adminEmail);
    } else {
      console.log('Admin user already exists');
    }

    // Create default categories
    const defaultCategories = [
      { name: 'Players', slug: 'players', description: 'News about cricket players' },
      { name: 'Teams', slug: 'teams', description: 'Team news and updates' },
      { name: 'Tournaments', slug: 'tournaments', description: 'Tournament coverage' },
      { name: 'Matches', slug: 'matches', description: 'Match reports and analysis' },
      { name: 'General', slug: 'general', description: 'General cricket news' },
    ];

    for (const category of defaultCategories) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, category.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(categories).values(category);
        console.log(`Category created: ${category.name}`);
      }
    }

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export { initDatabase };

