import { BaseEntity} from '../BaseEntity';
import { Product} from './product';
import {Language, LanguageImpl} from '../Language';

export class ProductsTranslation extends BaseEntity {
  id: number;
  name: string;
  description?: string;
  material?: string;
  care?: string;
  product: Product;
  language: Language;

  constructor(data?: Partial<ProductsTranslation>) {
    super(data);
    this.id = data?.id || 0;
    this.name = data?.name || '';
    this.description = data?.description || '';
    this.material = data?.material || '';
    this.care = data?.care || '';
    this.product = data?.product ? new Product(data.product) : new Product();
    this.language = data?.language ? new LanguageImpl(data.language) : new LanguageImpl();
  }
}
