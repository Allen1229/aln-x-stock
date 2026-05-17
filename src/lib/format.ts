export function formatDate(d: Date | string | number): string {
  const date = typeof d === 'object' ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateTime(d: Date | number): string {
  const date = typeof d === 'number' ? new Date(d * 1000) : d;
  const base = formatDate(date);
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${base} ${h}:${mi}`;
}

/** 取得相對天數差（今天為 0，昨天為 1，依此類推；基於日曆日比較）
 * @param d 可傳 Date 物件或 unix 毫秒（注意：跟 formatDate 一致，是毫秒不是秒）
 */
export function daysAgo(d: Date | number): number {
  const target = typeof d === 'number' ? new Date(d) : new Date(d);
  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffMs = startOfDay(new Date()) - startOfDay(target);
  return Math.floor(diffMs / 86400000);
}

/** 中文相對日期：今天 / 昨天 / N 天前；超過 10 天回傳 null（呼叫端可改顯示通用詞） */
export function relativeDateZh(d: Date | number): string | null {
  const n = daysAgo(d);
  if (n <= 0) return '今天';
  if (n === 1) return '昨天';
  if (n === 2) return '前天';
  if (n <= 9) return `${n} 天前`;
  return null;
}
