import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from './i18n/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Homepage from './pages/Homepage';
import TeacherSearchPage from './pages/TeacherSearchPage';
import TeacherProfilePage from './pages/TeacherProfilePage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AIStudyAssistantPage from './pages/AIStudyAssistantPage';
import DemoPage from './pages/DemoPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import SubscriptionPackagesPage from './pages/SubscriptionPackagesPage';

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

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Homepage });
const searchRoute = createRoute({ getParentRoute: () => rootRoute, path: '/search', component: TeacherSearchPage });
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/teacher/$id', component: TeacherProfilePage });
const studentDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student-dashboard', component: StudentDashboard });
const teacherDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/teacher-dashboard', component: TeacherDashboard });
const adminDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin-dashboard', component: AdminDashboard });
const aiAssistantRoute = createRoute({ getParentRoute: () => rootRoute, path: '/ai-assistant', component: AIStudyAssistantPage });
const demoRoute = createRoute({ getParentRoute: () => rootRoute, path: '/demo', component: DemoPage });
const paymentSuccessRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-success', component: PaymentSuccess });
const paymentFailureRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-failure', component: PaymentFailure });
const subscriptionRoute = createRoute({ getParentRoute: () => rootRoute, path: '/subscriptions', component: SubscriptionPackagesPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  profileRoute,
  studentDashboardRoute,
  teacherDashboardRoute,
  adminDashboardRoute,
  aiAssistantRoute,
  demoRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  subscriptionRoute,
]);

const router = createRouter({ routeTree });

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
