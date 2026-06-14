// 2026 grid seed (11 teams) — f1-data-engineer (T2).
// Export names `teams` / `getTeam` are stable contracts consumed by feature code.
//
// VERIFICATION (2026-06-12): facts verified against the pre-season 2026 entry
// list / supplier deals as of knowledge cutoff 2026-01 (FIA entry list, team
// announcements 2024–2025). Live re-check vs Jolpica was DENIED in this build
// environment; fields that may have drifted are marked UNVERIFIED.
// 2026 engine map: Mercedes → Mercedes/McLaren/Williams/Alpine ·
// Ferrari → Ferrari/Haas/Cadillac · Red Bull Ford → Red Bull/Racing Bulls ·
// Honda → Aston Martin · Audi → Audi.
import type { Team } from '../types';

export const teams: Team[] = [
  {
    id: 'mclaren',
    name: 'McLaren',
    fullName: 'McLaren Formula 1 Team',
    base: 'Woking, Anh',
    teamPrincipal: 'Andrea Stella',
    primaryColor: '#FF8000', // papaya — official brand hex
    secondaryColor: '#47C7FC',
    engineSupplier: 'Mercedes',
    carModel: 'MCL40', // UNVERIFIED — pattern-based (2025: MCL39)
    driverIds: ['lando-norris', 'oscar-piastri'],
  },
  {
    id: 'ferrari',
    name: 'Ferrari',
    fullName: 'Scuderia Ferrari HP', // UNVERIFIED 2026 title sponsor carry-over (2024–25: HP)
    base: 'Maranello, Ý',
    teamPrincipal: 'Frédéric Vasseur',
    primaryColor: '#E8002D',
    secondaryColor: '#FFEB00',
    engineSupplier: 'Ferrari',
    carModel: 'SF-26', // UNVERIFIED — pattern-based (2025: SF-25)
    driverIds: ['charles-leclerc', 'lewis-hamilton'],
  },
  {
    id: 'red-bull',
    name: 'Red Bull',
    fullName: 'Oracle Red Bull Racing',
    base: 'Milton Keynes, Anh',
    teamPrincipal: 'Laurent Mekies', // Team Principal & CEO since 07/2025
    primaryColor: '#3671C6',
    secondaryColor: '#FFC906',
    engineSupplier: 'Red Bull Ford', // Red Bull Powertrains–Ford from 2026
    carModel: 'RB22', // UNVERIFIED — pattern-based (2025: RB21)
    driverIds: ['max-verstappen', 'isack-hadjar'],
  },
  {
    id: 'mercedes',
    name: 'Mercedes',
    fullName: 'Mercedes-AMG PETRONAS Formula One Team',
    base: 'Brackley, Anh',
    teamPrincipal: 'Toto Wolff',
    primaryColor: '#27F4D2',
    secondaryColor: '#C8CCCE',
    engineSupplier: 'Mercedes',
    carModel: 'W17', // UNVERIFIED — pattern-based (2025: W16)
    driverIds: ['george-russell', 'kimi-antonelli'],
  },
  {
    id: 'aston-martin',
    name: 'Aston Martin',
    fullName: 'Aston Martin Aramco Formula One Team',
    base: 'Silverstone, Anh',
    teamPrincipal: 'Andy Cowell', // Group CEO & Team Principal
    primaryColor: '#229971',
    secondaryColor: '#CEDC00',
    engineSupplier: 'Honda', // Honda works partner from 2026
    carModel: 'AMR26', // UNVERIFIED — pattern-based (2025: AMR25)
    driverIds: ['fernando-alonso', 'lance-stroll'],
  },
  {
    id: 'alpine',
    name: 'Alpine',
    fullName: 'BWT Alpine Formula One Team',
    base: 'Enstone, Anh',
    teamPrincipal: 'Steve Nielsen', // Managing Director since 09/2025 — UNVERIFIED title mid-2026
    primaryColor: '#0093CC',
    secondaryColor: '#FF87BC',
    engineSupplier: 'Mercedes', // customer Mercedes PU from 2026 (Renault works exit)
    carModel: 'A526', // UNVERIFIED — pattern-based (2025: A525)
    driverIds: ['pierre-gasly', 'franco-colapinto'],
  },
  {
    id: 'williams',
    name: 'Williams',
    fullName: 'Atlassian Williams Racing',
    base: 'Grove, Anh',
    teamPrincipal: 'James Vowles',
    primaryColor: '#64C4FF',
    secondaryColor: '#041E42',
    engineSupplier: 'Mercedes',
    carModel: 'FW48', // UNVERIFIED — pattern-based (2025: FW47)
    driverIds: ['alexander-albon', 'carlos-sainz'],
  },
  {
    id: 'racing-bulls',
    name: 'Racing Bulls',
    fullName: 'Visa Cash App Racing Bulls F1 Team', // UNVERIFIED 2026 title sponsors
    base: 'Faenza, Ý',
    teamPrincipal: 'Alan Permane',
    primaryColor: '#6692FF',
    secondaryColor: '#C8CDD8',
    engineSupplier: 'Red Bull Ford',
    carModel: 'VCARB 03', // UNVERIFIED — pattern-based (2025: VCARB 02)
    driverIds: ['liam-lawson', 'arvid-lindblad'],
  },
  {
    id: 'audi',
    name: 'Audi',
    fullName: 'Audi F1 Team', // UNVERIFIED official 2026 entry name (works entry, ex-Sauber)
    base: 'Hinwil, Thụy Sĩ',
    teamPrincipal: 'Jonathan Wheatley',
    primaryColor: '#F50537', // UNVERIFIED — Audi F1 launch identity red
    secondaryColor: '#101418',
    engineSupplier: 'Audi',
    carModel: 'R26', // Audi presented the "R26 Concept" identity in 2025
    driverIds: ['nico-hulkenberg', 'gabriel-bortoleto'],
  },
  {
    id: 'haas',
    name: 'Haas',
    fullName: 'MoneyGram Haas F1 Team',
    base: 'Kannapolis, Mỹ',
    teamPrincipal: 'Ayao Komatsu',
    primaryColor: '#B6BABD',
    secondaryColor: '#E6002B',
    engineSupplier: 'Ferrari',
    carModel: 'VF-26', // UNVERIFIED — pattern-based (2025: VF-25)
    driverIds: ['esteban-ocon', 'oliver-bearman'],
  },
  {
    id: 'cadillac',
    name: 'Cadillac',
    fullName: 'Cadillac Formula 1 Team', // UNVERIFIED official 2026 entry name
    base: 'Fishers, Indiana, Mỹ',
    teamPrincipal: 'Graeme Lowdon',
    primaryColor: '#B79962', // UNVERIFIED — gold/black launch identity
    secondaryColor: '#101216',
    engineSupplier: 'Ferrari', // customer Ferrari PU until the GM works unit (announced for 2029)
    carModel: 'C26', // UNVERIFIED — placeholder, official name not confirmable offline
    driverIds: ['sergio-perez', 'valtteri-bottas'],
  },
];

export function getTeam(teamId: string): Team | undefined {
  return teams.find((t) => t.id === teamId);
}
