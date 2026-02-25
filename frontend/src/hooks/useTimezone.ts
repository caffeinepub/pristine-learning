import { useMemo } from 'react';
import { getTimezoneAbbr } from '../utils/formatTime';

export function useTimezone() {
  return useMemo(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const abbr = getTimezoneAbbr(timezone);
    return { timezone, abbr };
  }, []);
}
