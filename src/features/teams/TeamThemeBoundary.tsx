// Layout route for /teams/:teamId — PLAN.md §2. Reads the team seed and
// scopes --team-primary / --team-secondary CSS vars on a wrapper so every
// nested page (detail, driver, car) can use team accents without ever
// hardcoding a hex. Falls back to Tailwind neutrals (not team colors) when
// the team is unknown, so var() consumers never break.
import type { CSSProperties } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { getTeam } from '../../data/teams';

const NEUTRAL_PRIMARY = '#737373'; // tailwind neutral-500
const NEUTRAL_SECONDARY = '#404040'; // tailwind neutral-700

export default function TeamThemeBoundary() {
  const { teamId } = useParams<'teamId'>();
  const team = teamId ? getTeam(teamId) : undefined;

  const themeVars = {
    '--team-primary': team?.primaryColor ?? NEUTRAL_PRIMARY,
    '--team-secondary': team?.secondaryColor ?? NEUTRAL_SECONDARY,
  } as CSSProperties;

  return (
    <div style={themeVars}>
      <Outlet />
    </div>
  );
}
