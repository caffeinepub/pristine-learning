import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { Toaster } from '@/components/ui/sonner';
import Footer from './components/Footer';

// Pages
import Homepage from './pages/Homepage';
import TeacherSearchPage from './pages/TeacherSearchPage';
import TeacherProfilePage from './pages/TeacherProfilePage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AIStudyAssistantPage from './pages/AIStudyAssistantPage';
import SessionRecordingsPage from './pages/SessionRecordingsPage';
import TeacherWalletPage from './pages/TeacherWalletPage';
import BlogListingPage from './pages/BlogListingPage';
import BlogPostPage from './pages/BlogPostPage';
import SubscriptionPackagesPage from './pages/SubscriptionPackagesPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
        <Toaster richColors position="top-right" />
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Homepage });
const searchRoute = createRoute({ getParentRoute: () => rootRoute, path: '/search', component: TeacherSearchPage });
const teacherProfileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/teacher/$teacherId', component: TeacherProfilePage });
const studentDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student', component: StudentDashboard });
const studentAIRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/ai-assistant', component: AIStudyAssistantPage });
const studentRecordingsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/recordings', component: SessionRecordingsPage });
const teacherDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/teacher', component: TeacherDashboard });
const teacherWalletRoute = createRoute({ getParentRoute: () => rootRoute, path: '/teacher/wallet', component: TeacherWalletPage });
const adminDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminDashboard });
const blogRoute = createRoute({ getParentRoute: () => rootRoute, path: '/blog', component: BlogListingPage });
const blogPostRoute = createRoute({ getParentRoute: () => rootRoute, path: '/blog/$slug', component: BlogPostPage });
const subscriptionsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/subscriptions', component: SubscriptionPackagesPage });
const paymentSuccessRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-success', component: PaymentSuccess });
const paymentFailureRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-failure', component: PaymentFailure });

const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  teacherProfileRoute,
  studentDashboardRoute,
  studentAIRoute,
  studentRecordingsRoute,
  teacherDashboardRoute,
  teacherWalletRoute,
  adminDashboardRoute,
  blogRoute,
  blogPostRoute,
  subscriptionsRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

export default function App() {
  return <RouterProvider router={router} />;
}
