import { GraduationCap, Mail, Heart } from 'lucide-react';
import { SiFacebook, SiInstagram, SiYoutube } from 'react-icons/si';
import { useLanguage } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown-app';
  const utmUrl = `https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg text-foreground">Pristine Learning</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <SiFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <SiInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <SiYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">{t('footer.home')}</a></li>
              <li><a href="/search" className="hover:text-primary transition-colors">{t('footer.findTeacher')}</a></li>
              <li><a href="/ai-assistant" className="hover:text-primary transition-colors">{t('footer.aiAssistant')}</a></li>
              <li><a href="/demo" className="hover:text-primary transition-colors">{t('footer.demo')}</a></li>
              <li><a href="/blog" className="hover:text-primary transition-colors">{t('footer.blog')}</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">{t('footer.helpCenter')}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t('footer.privacyPolicy')}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t('footer.termsOfService')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('footer.contactUs')}</h3>
            <a
              href="mailto:pristinelearningofficial@gmail.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              pristinelearningofficial@gmail.com
            </a>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {year} Pristine Learning. {t('footer.copyright')}</p>
          <p className="flex items-center gap-1">
            {t('footer.builtWith')} <Heart className="w-3.5 h-3.5 text-primary fill-primary mx-0.5" /> {t('footer.using')}{' '}
            <a href={utmUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
