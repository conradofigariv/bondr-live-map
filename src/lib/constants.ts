import type { BusCompany } from '@/types/bus';

export const COMPANIES: Record<BusCompany, { name: string; color: string; textColor: string }> = {
  ERSA:      { name: 'ERSA',      color: '#FF5F1F', textColor: '#fff' },
  TAMSE:     { name: 'TAMSE',     color: '#06B6D4', textColor: '#fff' },
  Coniferal: { name: 'Coniferal', color: '#EAB308', textColor: '#000' },
};

/** All bus lines grouped by company */
export const COMPANY_LINES: Record<BusCompany, string[]> = {
  ERSA: [
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10',
    'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20',
    'B21', 'B22', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30',
    'B31', 'B32',
  ],
  TAMSE: ['A', 'B', 'C', 'D', 'E', 'F'],
  Coniferal: [
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8',
    'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16',
  ],
};

/** How long a report stays "alive" before being pruned locally (ms) */
export const REPORT_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** How often the GPS position is sent to Supabase (ms) */
export const GPS_SEND_INTERVAL_MS = 8_000;

/** How often to poll as a fallback if Realtime drops (ms) */
export const POLL_INTERVAL_MS = 15_000;

/** How often to prune stale reports locally (ms) */
export const PRUNE_INTERVAL_MS = 30_000;
