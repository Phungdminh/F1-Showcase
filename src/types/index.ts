// Frozen data contracts — docs/PLAN.md §3. Changes require updating PLAN.md
// and flagging every consumer.

export interface Team {
  id: string; // slug: "mclaren" — also Jolpica constructorId map key
  name: string;
  fullName: string;
  base: string;
  teamPrincipal: string;
  primaryColor: string; // hex, only consumed via CSS vars
  secondaryColor: string; // hex, only consumed via CSS vars
  engineSupplier: string; // 2026 PU
  carModel: string;
  driverIds: [string, string];
}

export interface Driver {
  id: string; // slug: "lando-norris" — maps to Jolpica driverId
  teamId: string;
  name: string;
  number: number;
  country: string; // display name (Vietnamese copy ok)
  headshotUrl: string | null; // null → placeholder avatar
}

export interface DriverSeasonResult {
  round: number;
  raceName: string;
  position: number | null; // null = DNF/DNS/NC
  points: number;
  podium: boolean;
  dnf: boolean;
  status: string; // raw API status text
}

export interface Race {
  round: number;
  name: string;
  country: string;
  city: string;
  circuitId: string;
  date: string; // ISO 8601 race date
  lat: number; // marker position
  lng: number;
}

export interface Circuit {
  id: string;
  name: string;
  lengthKm: number;
  laps: number;
  facts: string[]; // fact-panel lines
  pathPoints: [number, number][]; // normalized [x,y] centerline, ≥ 64 pts, closed loop
  startFinishIndex: number; // index into pathPoints
  sectorBreaks: [number, number]; // pathPoints indices for sector hints
}

export interface CarSubPart {
  id: string;
  name: string;
  description: string;
  offset: [number, number, number]; // exploded-view displacement
}

export interface CarComponent {
  id: string; // "front-wing", "power-unit", … (11 ids, SPEC §2.4)
  name: string; // Vietnamese label
  hotspot: [number, number, number]; // scene-space anchor
  summary: string;
  subParts: CarSubPart[]; // ≥ 2 per component
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  importance: 1 | 2 | 3 | 4 | 5;
  sourceUrl: string;
  imageUrl?: string;
  category?: string; // tab kicker
}

export interface ConstructorStanding {
  position: number;
  teamId: string;
  teamName: string;
  points: number;
  wins: number;
}

export interface DriverStanding {
  position: number;
  driverId: string;
  driverName: string;
  teamId: string;
  points: number;
  wins: number;
}
