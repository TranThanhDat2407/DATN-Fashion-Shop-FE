export interface ProductVariantDetailDTO{
  id:number;
  productId: number
  variantImage: string;
  name: string;
  colorId: number;
  color: string;
  size: string;
  sizeId: number;
  basePrice: number;
  salePrice: number;
  inWishlist: boolean
}
