// Jolpica (Ergast-compatible) ID mappings — bridges our seed slugs to API ids.
// Consumers: src/lib/api/jolpica.ts, scripts/refresh-data.ts.
//
// VERIFICATION NOTE (2026-06-12): live verification against
// https://api.jolpi.ca/ergast/f1/2026/... was NOT possible in this build
// environment (network tools denied). IDs follow Jolpica's stable Ergast
// conventions as of knowledge cutoff 2026-01. Entries marked UNVERIFIED are
// new 2026 entities whose canonical Jolpica id could not be confirmed live —
// re-verify via `npm run data:refresh`.

/** Our Team.id → Jolpica constructorId. */
export const jolpicaConstructorId: Record<string, string> = {
  mclaren: 'mclaren',
  ferrari: 'ferrari',
  'red-bull': 'red_bull',
  mercedes: 'mercedes',
  'aston-martin': 'aston_martin',
  alpine: 'alpine',
  williams: 'williams',
  'racing-bulls': 'rb',
  audi: 'audi', // UNVERIFIED — entry ran as 'sauber' through 2025; 2026 works entry expected as 'audi'
  haas: 'haas',
  cadillac: 'cadillac', // UNVERIFIED — brand-new 2026 entry, id assumed
};

/** Our Driver.id → Jolpica driverId. */
export const jolpicaDriverId: Record<string, string> = {
  'lando-norris': 'norris',
  'oscar-piastri': 'piastri',
  'charles-leclerc': 'leclerc',
  'lewis-hamilton': 'hamilton',
  'max-verstappen': 'max_verstappen',
  'isack-hadjar': 'hadjar',
  'george-russell': 'russell',
  'kimi-antonelli': 'antonelli',
  'fernando-alonso': 'alonso',
  'lance-stroll': 'stroll',
  'pierre-gasly': 'gasly',
  'franco-colapinto': 'colapinto',
  'alexander-albon': 'albon',
  'carlos-sainz': 'sainz',
  'liam-lawson': 'lawson',
  'arvid-lindblad': 'arvid_lindblad', // VERIFIED 2026-06-12 vs Jolpica /2026/drivers
  'nico-hulkenberg': 'hulkenberg',
  'gabriel-bortoleto': 'bortoleto',
  'esteban-ocon': 'ocon',
  'oliver-bearman': 'bearman',
  'sergio-perez': 'perez',
  'valtteri-bottas': 'bottas',
};

/** Our Circuit.id → Jolpica circuitId (used by getSchedule mapping). */
export const jolpicaCircuitId: Record<string, string> = {
  'albert-park': 'albert_park',
  shanghai: 'shanghai',
  suzuka: 'suzuka',
  bahrain: 'bahrain',
  jeddah: 'jeddah',
  miami: 'miami',
  'gilles-villeneuve': 'villeneuve',
  monaco: 'monaco',
  catalunya: 'catalunya',
  'red-bull-ring': 'red_bull_ring',
  silverstone: 'silverstone',
  spa: 'spa',
  hungaroring: 'hungaroring',
  zandvoort: 'zandvoort',
  monza: 'monza',
  madring: 'madring', // UNVERIFIED — new 2026 Madrid circuit, id assumed
  baku: 'baku',
  'marina-bay': 'marina_bay',
  cota: 'americas',
  'hermanos-rodriguez': 'rodriguez',
  interlagos: 'interlagos',
  'las-vegas': 'vegas',
  lusail: 'losail',
  'yas-marina': 'yas_marina',
};
