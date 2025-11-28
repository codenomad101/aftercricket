import ArticleList from '@/components/ArticleList';

interface ArticlesPageProps {
  searchParams: {
    filter?: string;
  };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const filter = searchParams?.filter || 'all';
  let initialArticles = [];
  
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/articles`, {
      cache: 'no-store',
    });
    const data = await response.json();
    if (data.success) {
      initialArticles = data.data;
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ArticleList initialArticles={initialArticles} initialFilter={filter} />
    </div>
  );
}



