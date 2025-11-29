import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articles, categories } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const published = searchParams.get('published') !== 'false';

    const conditions = [];

    if (published) {
      conditions.push(eq(articles.published, true));
    }

    if (categoryId) {
      conditions.push(eq(articles.categoryId, parseInt(categoryId)));
    }

    let query = db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        imageUrl: articles.imageUrl,
        published: articles.published,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(articles.createdAt));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, excerpt, imageUrl, categoryId, published } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const result = await db
      .insert(articles)
      .values({
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200),
        imageUrl: imageUrl || null,
        categoryId: parseInt(categoryId),
        authorId: parseInt(session.user.id),
        published: published || false,
      })
      .returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create article' },
      { status: 500 }
    );
  }
}

