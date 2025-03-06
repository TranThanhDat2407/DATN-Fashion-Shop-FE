import { BaseEntity} from '../BaseEntity';
import { AttributeValue} from './AttributeValue';
import { Product} from './product';
import { ProductVariant} from './ProductVariant';

export class ProductMedia extends BaseEntity {
  id: number;
  mediaUrl: string;
  mediaType: string;
  sortOrder?: number;
  modelHeight?: number;
  colorValue?: AttributeValue;
  product: Product;
  productVariants: ProductVariant[];

  constructor(data?: Partial<ProductMedia>) {
    super(data);
    this.id = data?.id || 0;
    this.mediaUrl = data?.mediaUrl || '';
    this.mediaType = data?.mediaType || '';
    this.sortOrder = data?.sortOrder ?? undefined;
    this.modelHeight = data?.modelHeight ?? undefined;
    this.colorValue = data?.colorValue ? new AttributeValue(data.colorValue) : undefined;
    this.product = data?.product ? new Product(data.product) : new Product();
    this.productVariants = data?.productVariants?.map(pv => new ProductVariant(pv)) || [];
  }
}
