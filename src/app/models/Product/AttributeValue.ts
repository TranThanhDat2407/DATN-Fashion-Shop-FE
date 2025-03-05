import { BaseEntity} from '../BaseEntity';
import { Attribute} from './Attribute';
import { AttributeValuePattern} from './AttributeValuePattern';
import { ProductVariant} from './ProductVariant';

export class AttributeValue extends BaseEntity {
  id: number;
  valueName: string;
  valueImg?: string;
  sortOrder?: number;
  attribute: Attribute;
  attributeValuePattern?: AttributeValuePattern;
  productVariantsForColor: ProductVariant[];
  productVariantsForSize: ProductVariant[];

  constructor(data?: Partial<AttributeValue>) {
    super(data);
    this.id = data?.id || 0;
    this.valueName = data?.valueName || '';
    this.valueImg = data?.valueImg || '';
    this.sortOrder = data?.sortOrder || 0;
    this.attribute = data?.attribute ? new Attribute(data.attribute) : new Attribute();
    this.attributeValuePattern = data?.attributeValuePattern
      ? new AttributeValuePattern(data.attributeValuePattern)
      : undefined;
    this.productVariantsForColor = data?.productVariantsForColor?.map(pv => new ProductVariant(pv)) || [];
    this.productVariantsForSize = data?.productVariantsForSize?.map(pv => new ProductVariant(pv)) || [];
  }
}
