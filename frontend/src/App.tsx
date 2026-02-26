import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from './i18n/LanguageContext';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import DemoPage from './pages/DemoPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherSearchPage from './pages/TeacherSearchPage';
import TeacherProfilePage from './pages/TeacherProfilePage';
import AIStudyAssistantPage from './pages/AIStudyAssistantPage';
import SubscriptionPackagesPage from './pages/SubscriptionPackagesPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import BlogListingPage from './pages/BlogListingPage';
import BlogPostPage from './pages/BlogPostPage';
import SessionRecordingsPage from './pages/SessionRecordingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

// Root index — always renders Homepage, never /demo
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Homepage,
});

const demoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/demo',
  component: DemoPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: TeacherSearchPage,
});

const teacherProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/$teacherId',
  component: TeacherProfilePage,
});

const studentDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-dashboard',
  component: StudentDashboard,
});

// Alias /student → /student-dashboard for ProfileSetupModal navigation
const studentAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student',
  beforeLoad: () => { throw redirect({ to: '/student-dashboard' }); },
  component: StudentDashboard,
});

const teacherDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher-dashboard',
  component: TeacherDashboard,
});

// Alias /teacher → /teacher-dashboard for ProfileSetupModal navigation
const teacherAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher',
  beforeLoad: () => { throw redirect({ to: '/teacher-dashboard' }); },
  component: TeacherDashboard,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-dashboard',
  component: AdminDashboard,
});

const aiAssistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai-assistant',
  component: AIStudyAssistantPage,
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/subscriptions',
  component: SubscriptionPackagesPage,
});

// Alias /subscription-packages → /subscriptions for PaymentFailure navigation
const subscriptionPackagesAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/subscription-packages',
  beforeLoad: () => { throw redirect({ to: '/subscriptions' }); },
  component: SubscriptionPackagesPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog',
  component: BlogListingPage,
});

const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog/$slug',
  component: BlogPostPage,
});

const sessionRecordingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/session-recordings',
  component: SessionRecordingsPage,
});

// /teacher/wallet — TeacherDashboard handles wallet inline; redirect to teacher dashboard
const teacherWalletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/wallet',
  beforeLoad: () => { throw redirect({ to: '/teacher-dashboard' }); },
  component: TeacherDashboard,
});

// Catch-all: redirect unknown paths to homepage
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  beforeLoad: () => { throw redirect({ to: '/' }); },
  component: Homepage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  demoRoute,
  searchRoute,
  teacherProfileRoute,
  studentDashboardRoute,
  studentAliasRoute,
  teacherDashboardRoute,
  teacherAliasRoute,
  teacherWalletRoute,
  adminDashboardRoute,
  aiAssistantRoute,
  subscriptionsRoute,
  subscriptionPackagesAliasRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  blogRoute,
  blogPostRoute,
  sessionRecordingsRoute,
  notFoundRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}
