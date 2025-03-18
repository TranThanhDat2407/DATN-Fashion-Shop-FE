import { BaseResponse } from '../Response/base-response';

export interface InventoryTransferResponse extends BaseResponse {
  id: number;
  warehouseId: number;
  storeId: number;
  status: string;
  message: string;
  isReturn: boolean;

  items: InventoryTransferItemResponse[]; // Danh sách các sản phẩm trong phiếu chuyển kho
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
