export interface CouponLocalizedDTO {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  expirationDate: Date ;
  isActive: boolean;
  isGlobal: boolean;
  name: string;        // Tên theo ngôn ngữ
  description: string; // Mô tả theo ngôn ngữ
  userIds: number[];   // Danh sách ID user được áp dụng
  imageUrl: string;    // Ảnh của mã giảm giá
}
