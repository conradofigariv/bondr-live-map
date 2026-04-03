export type BusCompany = 'ERSA' | 'TAMSE' | 'Coniferal';

export interface Bus {
  id: string;
  line: string;
  company: BusCompany;
  lat: number;
  lng: number;
  updatedAt: Date;
  isCurrentUser?: boolean;
}

export type AppMode = 'traveler' | 'map';

export { COMPANY_LINES } from '@/lib/constants';

export const COMPANY_COLORS: Record<BusCompany, string> = {
  ERSA: 'ersa',
  TAMSE: 'tamse',
  Coniferal: 'coniferal',
};
