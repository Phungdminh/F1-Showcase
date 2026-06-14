// Landing — a parallax one-page showcase (replaces the old 3D/video hero per the
// user's new direction: "bỏ cho tôi phần hero ... tôi muốn đây là 1 trang
// parallel web như https://findrealestate.com/"). NO 3D, NO video here anymore.
//
// The landing is now an INTRO-ONLY page: just the editorial HeroIntro — no footer
// and no on-landing category sections. The four nav categories (Teams / Calendar /
// News / Standings) are reached via the top nav header only. The Showcase section
// components remain in ./sections/ (unused) in case the overview is ever restored.
import Navbar from '../../components/Navbar';
import HeroIntro from './sections/HeroIntro';

export default function LandingPage() {
  return (
    <div id="top" className="bg-transparent text-neutral-900">
      {/* Navbar stays at the top — light over the editorial base, solidifies on scroll. */}
      <div className="fixed inset-x-0 top-0 z-50">
        <Navbar variant="light" solidifyOnScroll />
      </div>

      <main>
        <HeroIntro />
      </main>
    </div>
  );
}
