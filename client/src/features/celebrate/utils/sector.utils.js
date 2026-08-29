import { DOMAINS } from "../../../shared/data/domains";
import { uid } from "../../../shared/utils/units";

// حصيلة المدار الأول لمجال واحد: كم وحدة أُنجزت وكم سؤالاً أُجيب فيها
export function sectorSummary(domainId, progress = {}) {
  const di = DOMAINS.findIndex((d) => d.id === domainId);
  const domain = di >= 0 ? DOMAINS[di] : null;
  if (!domain) return { domain: null, di: -1, units: 0, questions: 0 };
  const ids = Array.from({ length: 8 }, (_, i) => uid(domain.id, 0, i));
  const done = ids.filter((id) => progress[id]);
  // total قد يغيب في سجلات قديمة، فنعدّه صفراً بدل أن ينتج NaN
  const questions = done.reduce((sum, id) => sum + (Number(progress[id]?.total) || 0), 0);
  return { domain, di, units: done.length, questions };
}
