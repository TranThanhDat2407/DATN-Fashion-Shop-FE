export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rateToBase: number;
  isBase: boolean;
}
