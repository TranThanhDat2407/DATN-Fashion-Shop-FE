export interface ListStoreDTO{
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
  city: string
  ward: string
  district: string
  street:string
  distance: number | null;
}
