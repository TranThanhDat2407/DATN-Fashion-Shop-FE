import { BaseEntity } from '../BaseEntity';
import { AttributeValue} from './AttributeValue';
import { Product} from './product';
import { ProductMedia} from './ProductMedia';

export class ProductVariant extends BaseEntity {
  id: number;
  salePrice: number;
  colorValue?: AttributeValue;
  sizeValue?: AttributeValue;
  product: Product;
  productMedias: ProductMedia[];

  constructor(data?: Partial<ProductVariant>) {
    super(data);
    this.id = data?.id || 0;
    this.salePrice = data?.salePrice || 0;
    this.colorValue = data?.colorValue ? new AttributeValue(data.colorValue) : undefined;
    this.sizeValue = data?.sizeValue ? new AttributeValue(data.sizeValue) : undefined;
    this.product = data?.product ? new Product(data.product) : new Product();
    this.productMedias = data?.productMedias?.map(pm => new ProductMedia(pm)) || [];
  }

  getAdjustedPrice(): number {
    if (
      this.product.promotion &&
      this.product.promotion.isActive &&
      new Date() >= new Date(this.product.promotion.startDate) &&
      new Date() <= new Date(this.product.promotion.endDate)
    ) {
      const discountPercentage = this.product.promotion.discountPercentage;
      return this.salePrice - (this.salePrice * discountPercentage) / 100;
    }
    return this.salePrice;
  }
}
