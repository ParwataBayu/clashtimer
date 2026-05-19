export function msToComponents(ms: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function componentsToMs(
  days: number,
  hours: number,
  minutes: number,
  seconds: number
): number {
  return (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000;
}

export function formatFinishAt(
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
  fromNow = true
): number {
  const duration = componentsToMs(days, hours, minutes, seconds);
  return fromNow ? Date.now() + duration : duration;
}