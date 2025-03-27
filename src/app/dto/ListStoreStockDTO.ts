import {Promotion} from '../models/Product/Promotion';
import {BaseResponse} from './Response/base-response';

export interface ListStoreStockDTO extends BaseResponse{
  inventoryId? :number
  productId: number;
  productVariantId: number;
  productImage: string;
  productName: string;
  colorName: string;
  sizeName: string;
  colorImage: string;
  basePrice: number;
  salePrice: number;
  promotion?: Promotion;
  quantityInStock: number;
  variantUpdateDate: string;
}
