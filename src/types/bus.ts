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

export const COMPANY_LINES: Record<BusCompany, string[]> = {
  ERSA: ['B', 'C', 'D', 'E1', 'E2', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
  TAMSE: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'],
  Coniferal: ['C1', 'C2', 'C3', 'C4', 'C5'],
};

export const COMPANY_COLORS: Record<BusCompany, string> = {
  ERSA: 'ersa',
  TAMSE: 'tamse',
  Coniferal: 'coniferal',
};
