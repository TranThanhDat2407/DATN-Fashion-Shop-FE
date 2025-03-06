export interface InventoryAudResponse {
  revision: number;
  revisionType: 'ADD' | 'MOD' | 'DEL';
  createdBy?: number | null;
  updatedBy?: number | null;
  id: number;
  storeId: number;
  productVariantId: number;
  colorImage: string;
  colorName: string;
  size: string;
  productName: string;
  productImage: string;
  quantity: number;
  deltaQuantity: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}
