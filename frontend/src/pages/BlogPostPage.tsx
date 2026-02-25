import { useParams, useNavigate } from '@tanstack/react-router';
import { blogStore } from '../lib/localStore';
import Navbar from '../components/Navbar';
import { Calendar, User, ChevronLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export default function BlogPostPage() {
  const { slug } = useParams({ from: '/blog/$slug' });
  const navigate = useNavigate();
  const post = blogStore.getBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-3">Post Not Found</h2>
          <p className="text-muted-foreground mb-6">This blog post doesn't exist or has been removed.</p>
          <Button onClick={() => navigate({ to: '/blog' })} className="btn-primary">
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="font-display text-xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="font-semibold text-lg mt-4 mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate({ to: '/blog' })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Blog
        </button>

        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-64 object-cover rounded-2xl mb-8"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mb-8">
            <BookOpen className="w-12 h-12 text-primary/30" />
          </div>
        )}

        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" /> {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(post.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <div className="prose prose-sm max-w-none space-y-1">
          {renderContent(post.content)}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Button onClick={() => navigate({ to: '/blog' })} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Blog
          </Button>
        </div>
      </article>

      <footer className="bg-sidebar text-sidebar-foreground py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-sidebar-foreground/50">
          <p>© {new Date().getFullYear()} Pristine Learning. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sidebar-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
