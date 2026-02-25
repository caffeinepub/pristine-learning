import { Link } from '@tanstack/react-router';
import { BookOpen, Mail, Heart } from 'lucide-react';

const CONTACT_EMAIL = 'pristinelearningofficial@gmail.com';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'pristine-learning'
  );

  return (
    <footer className="bg-sidebar text-sidebar-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-sidebar-primary" />
              <span className="font-display font-bold text-lg">Pristine Learning</span>
            </div>
            <p className="text-sidebar-foreground/60 text-sm leading-relaxed mb-4">
              Global online tutoring marketplace connecting students and teachers worldwide.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-sm text-sidebar-primary hover:text-sidebar-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* Platform */}
          <div>
            <p className="font-semibold mb-3 text-sm">Platform</p>
            <div className="space-y-2 text-sm text-sidebar-foreground/60">
              <Link to="/search" className="block hover:text-sidebar-foreground transition-colors">Find Teachers</Link>
              <Link to="/subscriptions" className="block hover:text-sidebar-foreground transition-colors">Subscriptions</Link>
              <Link to="/blog" className="block hover:text-sidebar-foreground transition-colors">Blog</Link>
            </div>
          </div>

          {/* For Teachers */}
          <div>
            <p className="font-semibold mb-3 text-sm">For Teachers</p>
            <div className="space-y-2 text-sm text-sidebar-foreground/60">
              <Link to="/teacher" className="block hover:text-sidebar-foreground transition-colors">Teacher Dashboard</Link>
              <Link to="/teacher/wallet" className="block hover:text-sidebar-foreground transition-colors">Wallet</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="font-semibold mb-3 text-sm">Contact & Support</p>
            <div className="space-y-2 text-sm text-sidebar-foreground/60">
              <Link to="/student" className="block hover:text-sidebar-foreground transition-colors">Student Dashboard</Link>
              <Link to="/student/ai-assistant" className="block hover:text-sidebar-foreground transition-colors">AI Study Assistant</Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-1.5 hover:text-sidebar-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Email Support
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sidebar-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sidebar-foreground/50">
          <p>© {year} Pristine Learning. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-sidebar-primary fill-sidebar-primary mx-0.5" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sidebar-foreground transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
