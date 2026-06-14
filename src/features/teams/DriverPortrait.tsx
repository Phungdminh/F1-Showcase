// DriverPortrait — the headshot frame shown on a driver card / driver page.
// If `driver.headshotUrl` is set, it renders that image (drop-in slot for a real
// photo). Otherwise it renders an on-brand placeholder: a team-coloured gradient
// tile with the driver's initials — driver headshots are copyrighted, so we never
// fetch/scrape them; supply a licensed URL via headshotUrl to show a real photo.
//
// Must render inside TeamThemeBoundary (reads --team-primary). Fills its parent
// frame (h-full/w-full), so the caller owns size + clipping (rounded/overflow).
import { driverInitials } from './driverInitials';
import type { Driver } from '../../types';

export interface DriverPortraitProps {
  driver: Driver;
  className?: string;
}

export default function DriverPortrait({ driver, className = '' }: DriverPortraitProps) {
  if (driver.headshotUrl) {
    return (
      <img
        src={driver.headshotUrl}
        alt={driver.name}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`.trim()}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`flex h-full w-full items-center justify-center ${className}`.trim()}
      style={{
        background:
          'linear-gradient(155deg, color-mix(in srgb, var(--team-primary) 28%, #ffffff) 0%, color-mix(in srgb, var(--team-primary) 6%, #ffffff) 100%)',
      }}
    >
      <span
        className="text-2xl font-light tracking-tight"
        style={{ color: 'color-mix(in srgb, var(--team-primary) 78%, #111111)' }}
      >
        {driverInitials(driver.name)}
      </span>
    </div>
  );
}
