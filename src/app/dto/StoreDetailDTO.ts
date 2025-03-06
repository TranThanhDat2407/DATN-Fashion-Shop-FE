export interface StoreDetailDTO{
  id: number;
  name: string;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  openHour: string;
  closeHour: string;
  fullAddress: string;
  distance: number | null;
}
