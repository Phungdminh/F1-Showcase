// Circuit seed aggregator — one file per circuit lives in src/data/circuits/.
// Export names `circuits` / `getCircuit` are stable contracts consumed by
// /calendar/:roundId (TrackScene + fact panel). Ordered by 2026 round.
import type { Circuit } from '../types';
import { albertPark } from './circuits/albert-park';
import { shanghai } from './circuits/shanghai';
import { suzuka } from './circuits/suzuka';
import { bahrain } from './circuits/bahrain';
import { jeddah } from './circuits/jeddah';
import { miami } from './circuits/miami';
import { gillesVilleneuve } from './circuits/gilles-villeneuve';
import { monaco } from './circuits/monaco';
import { catalunya } from './circuits/catalunya';
import { redBullRing } from './circuits/red-bull-ring';
import { silverstone } from './circuits/silverstone';
import { spa } from './circuits/spa';
import { hungaroring } from './circuits/hungaroring';
import { zandvoort } from './circuits/zandvoort';
import { monza } from './circuits/monza';
import { madring } from './circuits/madring';
import { baku } from './circuits/baku';
import { marinaBay } from './circuits/marina-bay';
import { cota } from './circuits/cota';
import { hermanosRodriguez } from './circuits/hermanos-rodriguez';
import { interlagos } from './circuits/interlagos';
import { lasVegas } from './circuits/las-vegas';
import { lusail } from './circuits/lusail';
import { yasMarina } from './circuits/yas-marina';

export const circuits: Circuit[] = [
  albertPark,
  shanghai,
  suzuka,
  bahrain,
  jeddah,
  miami,
  gillesVilleneuve,
  monaco,
  catalunya,
  redBullRing,
  silverstone,
  spa,
  hungaroring,
  zandvoort,
  monza,
  madring,
  baku,
  marinaBay,
  cota,
  hermanosRodriguez,
  interlagos,
  lasVegas,
  lusail,
  yasMarina,
];

export function getCircuit(circuitId: string): Circuit | undefined {
  return circuits.find((c) => c.id === circuitId);
}
