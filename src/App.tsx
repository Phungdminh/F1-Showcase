// App shell + router — PLAN.md §1 route map. Every page is lazy so three.js
// never lands in the landing chunk; <PageTransition> (motion contract) wraps
// the routed outlet. `location` is passed explicitly to <Routes> so the
// exiting tree keeps rendering the previous route during transitions.
import { lazy, Suspense } from 'react';
import { LayoutGroup } from 'framer-motion';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import PageTransition from './components/motion/PageTransition';
import ScrollManager from './components/motion/ScrollManager';

const LandingPage = lazy(() => import('./features/landing/LandingPage'));
const TeamsPage = lazy(() => import('./features/teams/TeamsPage'));
const TeamThemeBoundary = lazy(() => import('./features/teams/TeamThemeBoundary'));
const TeamDetailPage = lazy(() => import('./features/teams/TeamDetailPage'));
const DriverDetailPage = lazy(() => import('./features/teams/DriverDetailPage'));
const CarExplorerPage = lazy(() => import('./features/teams/CarExplorerPage'));
const CalendarPage = lazy(() => import('./features/calendar/CalendarPage'));
const RoundDetailPage = lazy(() => import('./features/calendar/RoundDetailPage'));
const NewsPage = lazy(() => import('./features/news/NewsPage'));
const StandingsPage = lazy(() => import('./features/standings/StandingsPage'));
const NotFound = lazy(() => import('./features/NotFound'));

function RoutedOutlet() {
  const location = useLocation();

  return (
    <PageTransition>
      {/* Shared <LayoutGroup> so contracted layoutIds (team-accent / driver-portrait
          / car-thumb / round-card) morph across the route change. AnimatePresence
          (inside PageTransition) holds the exiting element's projection snapshot so
          the entering element animates from the card's last rect (MOTION §2/§3). */}
      <LayoutGroup>
        <Suspense fallback={<div className="min-h-screen bg-[#0F0F0F]" aria-hidden="true" />}>
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:teamId" element={<TeamThemeBoundary />}>
              <Route index element={<TeamDetailPage />} />
              <Route path="drivers/:driverId" element={<DriverDetailPage />} />
              <Route path="car" element={<CarExplorerPage />} />
            </Route>
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/calendar/:roundId" element={<RoundDetailPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </LayoutGroup>
    </PageTransition>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-transparent">
      <BrowserRouter>
        <ScrollManager />
        <RoutedOutlet />
      </BrowserRouter>
    </div>
  );
}
