import { BaseEntity} from '../BaseEntity';
import { Product } from './product';

export class Promotion extends BaseEntity {
  id: number;
  discountPercentage: number;
  description?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  products: Product[];

  constructor(data?: Partial<Promotion>) {
    super(data);
    this.id = data?.id || 0;
    this.discountPercentage = data?.discountPercentage || 0;
    this.description = data?.description || '';
    this.startDate = data?.startDate ? new Date(data.startDate) : new Date();
    this.endDate = data?.endDate ? new Date(data.endDate) : new Date();
    this.isActive = data?.isActive ?? false;
    this.products = data?.products?.map(p => new Product(p)) || [];
  }

  isPromotionActive(): boolean {
    const now = new Date();
    return this.isActive && now >= this.startDate && now <= this.endDate;
  }
}
