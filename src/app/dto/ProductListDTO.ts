import { BaseResponse} from './Response/base-response';
import { PromotionDTO} from './Promotion';

export class ProductListDTO extends BaseResponse {
  id: number;
  name: string;
  basePrice: number;
  isActive: boolean;
  promotion?: PromotionDTO;

  constructor(data?: Partial<ProductListDTO>) {
    super(data); // Kế thừa từ BaseResponse

    this.id = data?.id || 0;
    this.name = data?.name || '';
    this.basePrice = data?.basePrice || 0;
    this.isActive = data?.isActive ?? true;
    this.promotion = data?.promotion ? new PromotionDTO(data.promotion) : undefined;
  }
}
