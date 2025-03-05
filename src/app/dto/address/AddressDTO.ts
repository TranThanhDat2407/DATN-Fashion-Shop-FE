export interface AddressDTO {
  id: number;
  street: string;
  district: string;
  ward: string;
  province: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;  // Số điện thoại
  firstName: string;    // Tên người nhận
  lastName: string;
  isDefault: boolean;   // Địa chỉ mặc định
}
