import { BaseEntity} from '../BaseEntity';
import {Category, CategoryImpl} from '../Category/Category';
import { ProductsTranslation} from './ProductsTranslation';
import { ProductVariant} from './ProductVariant';
import { Promotion} from './Promotion';

export class Product extends BaseEntity {
  id: number;
  status: string;
  basePrice: number;
  isActive: boolean;
  categories: CategoryImpl[];
  translations: ProductsTranslation[];
  variants: ProductVariant[];
  promotion?: Promotion;

  constructor(data?: Partial<Product>) {
    super(data);
    this.id = data?.id || 0;
    this.status = data?.status || '';
    this.basePrice = data?.basePrice || 0;
    this.isActive = data?.isActive ?? true;
    this.categories = data?.categories?.map(c => new CategoryImpl(c)) || [];
    this.translations = data?.translations?.map(t => new ProductsTranslation(t)) || [];
    this.variants = data?.variants?.map(v => new ProductVariant(v)) || [];
    this.promotion = data?.promotion ? new Promotion(data.promotion) : undefined;
  }

  getTranslationByLanguage(langCode: string): ProductsTranslation | undefined {
    let translation = this.translations.find(
      t => t.language?.code === langCode && t.name?.trim()
    );

    if (!translation) {
      translation = this.translations.find(t => t.language?.code === 'en');
    }

    return translation;
  }
}
