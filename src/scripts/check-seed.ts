import { db } from '../lib/db';
import { articles, categories } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkSeed() {
  try {
    console.log('Checking seeded articles...\n');

    // Check categories
    const allCategories = await db.select().from(categories);
    console.log('Categories found:');
    allCategories.forEach(cat => {
      console.log(`  - ${cat.name} (slug: ${cat.slug})`);
    });
    console.log('');

    // Check India category articles
    const indiaCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, 'india'))
      .limit(1);

    if (indiaCategory.length > 0) {
      const indiaArticles = await db
        .select()
        .from(articles)
        .where(eq(articles.categoryId, indiaCategory[0].id))
        .limit(10);

      console.log(`India category articles: ${indiaArticles.length}`);
      indiaArticles.forEach(article => {
        console.log(`  - ${article.title} (published: ${article.published})`);
      });
      console.log('');
    }

    // Check International category articles
    const internationalCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, 'international'))
      .limit(1);

    if (internationalCategory.length > 0) {
      const internationalArticles = await db
        .select()
        .from(articles)
        .where(eq(articles.categoryId, internationalCategory[0].id))
        .limit(10);

      console.log(`International category articles: ${internationalArticles.length}`);
      internationalArticles.forEach(article => {
        console.log(`  - ${article.title} (published: ${article.published})`);
      });
      console.log('');
    }

    // Check all published articles
    const allPublishedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.published, true))
      .limit(20);

    console.log(`Total published articles: ${allPublishedArticles.length}`);
    allPublishedArticles.forEach(article => {
      console.log(`  - ${article.title}`);
    });

    console.log('\n✅ Seed check complete!');
  } catch (error) {
    console.error('Error checking seed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  checkSeed()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export { checkSeed };

