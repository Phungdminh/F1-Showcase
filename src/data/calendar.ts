// 2026 calendar seed (24 rounds) — f1-data-engineer (T2).
// Export names `calendar` / `getRace` / `getUpcomingRace` are stable contracts.
//
// VERIFICATION (2026-06-12): rounds & dates per the official 2026 FIA calendar
// (announced 2025-06-10), correct as of knowledge cutoff 2026-01. Live
// re-check vs https://api.jolpi.ca/ergast/f1/2026.json was DENIED in this
// build environment — late venue/date changes are UNVERIFIED (runtime layer
// `getSchedule()` self-heals with a 24 h TTL). Season opens in Melbourne,
// Madrid (Madring) debuts at round 16, Imola is gone. Las Vegas races Saturday.
// lat/lng follow Ergast circuit locations (Madring approximated — UNVERIFIED).
import type { Race } from '../types';

export const calendar: Race[] = [
  { round: 1, name: 'GP Úc', country: 'Úc', city: 'Melbourne', circuitId: 'albert-park', date: '2026-03-08', lat: -37.8497, lng: 144.968 },
  { round: 2, name: 'GP Trung Quốc', country: 'Trung Quốc', city: 'Thượng Hải', circuitId: 'shanghai', date: '2026-03-15', lat: 31.3389, lng: 121.22 },
  { round: 3, name: 'GP Nhật Bản', country: 'Nhật Bản', city: 'Suzuka', circuitId: 'suzuka', date: '2026-03-29', lat: 34.8431, lng: 136.541 },
  { round: 4, name: 'GP Bahrain', country: 'Bahrain', city: 'Sakhir', circuitId: 'bahrain', date: '2026-04-12', lat: 26.0325, lng: 50.5106 },
  { round: 5, name: 'GP Ả Rập Xê Út', country: 'Ả Rập Xê Út', city: 'Jeddah', circuitId: 'jeddah', date: '2026-04-19', lat: 21.6319, lng: 39.1044 },
  { round: 6, name: 'GP Miami', country: 'Mỹ', city: 'Miami', circuitId: 'miami', date: '2026-05-03', lat: 25.9581, lng: -80.2389 },
  { round: 7, name: 'GP Canada', country: 'Canada', city: 'Montréal', circuitId: 'gilles-villeneuve', date: '2026-05-24', lat: 45.5, lng: -73.5228 },
  { round: 8, name: 'GP Monaco', country: 'Monaco', city: 'Monte Carlo', circuitId: 'monaco', date: '2026-06-07', lat: 43.7347, lng: 7.42056 },
  // UNVERIFIED race title — Barcelona keeps a 2026 slot alongside the new Madrid round
  { round: 9, name: 'GP Barcelona-Catalunya', country: 'Tây Ban Nha', city: 'Barcelona', circuitId: 'catalunya', date: '2026-06-14', lat: 41.57, lng: 2.26111 },
  { round: 10, name: 'GP Áo', country: 'Áo', city: 'Spielberg', circuitId: 'red-bull-ring', date: '2026-06-28', lat: 47.2197, lng: 14.7647 },
  { round: 11, name: 'GP Anh', country: 'Anh', city: 'Silverstone', circuitId: 'silverstone', date: '2026-07-05', lat: 52.0786, lng: -1.01694 },
  { round: 12, name: 'GP Bỉ', country: 'Bỉ', city: 'Spa-Francorchamps', circuitId: 'spa', date: '2026-07-19', lat: 50.4372, lng: 5.97139 },
  { round: 13, name: 'GP Hungary', country: 'Hungary', city: 'Budapest', circuitId: 'hungaroring', date: '2026-07-26', lat: 47.5789, lng: 19.2486 },
  { round: 14, name: 'GP Hà Lan', country: 'Hà Lan', city: 'Zandvoort', circuitId: 'zandvoort', date: '2026-08-23', lat: 52.3888, lng: 4.54092 },
  { round: 15, name: 'GP Ý', country: 'Ý', city: 'Monza', circuitId: 'monza', date: '2026-09-06', lat: 45.6156, lng: 9.28111 },
  // Madrid debut — circuit & coordinates UNVERIFIED (new venue around IFEMA)
  { round: 16, name: 'GP Tây Ban Nha (Madrid)', country: 'Tây Ban Nha', city: 'Madrid', circuitId: 'madring', date: '2026-09-13', lat: 40.4675, lng: -3.6167 },
  { round: 17, name: 'GP Azerbaijan', country: 'Azerbaijan', city: 'Baku', circuitId: 'baku', date: '2026-09-27', lat: 40.3725, lng: 49.8533 },
  { round: 18, name: 'GP Singapore', country: 'Singapore', city: 'Singapore', circuitId: 'marina-bay', date: '2026-10-11', lat: 1.2914, lng: 103.864 },
  { round: 19, name: 'GP Hoa Kỳ', country: 'Mỹ', city: 'Austin', circuitId: 'cota', date: '2026-10-25', lat: 30.1328, lng: -97.6411 },
  { round: 20, name: 'GP Mexico City', country: 'México', city: 'Mexico City', circuitId: 'hermanos-rodriguez', date: '2026-11-01', lat: 19.4042, lng: -99.0907 },
  { round: 21, name: 'GP São Paulo', country: 'Brazil', city: 'São Paulo', circuitId: 'interlagos', date: '2026-11-08', lat: -23.7036, lng: -46.6997 },
  { round: 22, name: 'GP Las Vegas', country: 'Mỹ', city: 'Las Vegas', circuitId: 'las-vegas', date: '2026-11-21', lat: 36.1147, lng: -115.173 },
  { round: 23, name: 'GP Qatar', country: 'Qatar', city: 'Lusail', circuitId: 'lusail', date: '2026-11-29', lat: 25.49, lng: 51.4542 },
  { round: 24, name: 'GP Abu Dhabi', country: 'UAE', city: 'Abu Dhabi', circuitId: 'yas-marina', date: '2026-12-06', lat: 24.4672, lng: 54.6031 },
];

export function getRace(round: number): Race | undefined {
  return calendar.find((r) => r.round === round);
}

/** First round with race date >= now; undefined when the season is over. */
export function getUpcomingRace(now: Date = new Date()): Race | undefined {
  return calendar.find((r) => new Date(r.date).getTime() >= now.getTime());
}
