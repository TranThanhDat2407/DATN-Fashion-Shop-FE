import { BaseResponse } from '../Response/base-response';

export interface InventoryTransferResponse extends BaseResponse {
  id: number;
  warehouseId: number;
  storeId: number;
  status: string;
  message: string;
  isReturn: boolean;
  storeName : string;
  warning : boolean

  items: InventoryTransferItemResponse[];
}

export interface InventoryTransferItemResponse {
  productVariantId: number;
  productName: string;
  productImage: string | null;
  colorImage: string;
  colorName: string;
  size: string;
  quantity: number;
}
