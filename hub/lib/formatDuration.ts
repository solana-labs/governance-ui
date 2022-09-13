import { formatDuration as _formatDuration, Duration } from 'date-fns';

const AVAILABLE_FORMATS = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
] as const;

const SHORT_MAP = {
  years: 'y',
  months: 'm',
  weeks: 'w',
  days: 'd',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
} as const;

type Args = Parameters<typeof _formatDuration>;
interface Options extends NonNullable<Args[1]> {
  format?: typeof AVAILABLE_FORMATS[number][];
  short?: boolean;
}

export function formatDuration(duration: Duration, options?: Options) {
  if (!options?.short) {
    return _formatDuration(duration, options);
  }

  const formats = options?.format || AVAILABLE_FORMATS;
  const parts: string[] = [];
  const isLarge =
    duration['years'] ||
    duration['months'] ||
    duration['weeks'] ||
    duration['days'];

  for (const format of formats) {
    const value = duration[format];

    if (value || options?.zero) {
      const str = SHORT_MAP[format];

      if (!isLarge || format !== 'seconds') {
        parts.push(`${value}${str}`);
      }
    }
  }

  return parts.join(options?.delimiter || ' ');
}
