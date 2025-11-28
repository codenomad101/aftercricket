import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import Link from 'next/link';
import { db } from '@/lib/db';
import { articles, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      content: articles.content,
      excerpt: articles.excerpt,
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
    .where(eq(articles.slug, params.slug))
    .limit(1);

  if (article.length === 0 || !article[0].published) {
    notFound();
  }

  const articleData = article[0];

  return (
    <article className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
      <Link
        href="/articles"
        className="text-red-600 hover:text-red-700 mb-4 inline-block text-sm"
      >
        ← Back to News
      </Link>
      
      <div className="mb-4">
        {articleData.category && (
          <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium mb-3">
            {articleData.category.name}
          </span>
        )}
      </div>
      
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
        {articleData.title}
      </h1>
      
      <div className="text-xs text-gray-600 mb-4 pb-3 border-b border-gray-200">
        <p>{format(new Date(articleData.createdAt), 'MMMM dd, yyyy')}</p>
      </div>
      
      {articleData.imageUrl && (
        <div className="mb-6">
          <img
            src={articleData.imageUrl}
            alt={articleData.title}
            className="w-full h-auto rounded-lg shadow-md object-cover"
          />
        </div>
      )}
      
      <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3 prose-p:text-sm prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-li:text-sm prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-blockquote:border-l-red-600 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {articleData.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}



