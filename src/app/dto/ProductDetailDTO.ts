import {PromotionDTO} from './Promotion';

export interface ProductDetailDTO {
  id: number;
  name: string;
  description: string;
  material: string;
  care: string;
  basePrice: number;
  promotion: PromotionDTO
  isActive: boolean;
}
