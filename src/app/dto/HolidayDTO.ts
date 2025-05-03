export interface HolidayDTO {
  id?: number;         // ID của ngày lễ (nếu có)
  holidayName: string; // Tên ngày lễ
  date: string;        // Ngày (yyyy-MM-dd)
  isFixed: boolean;    // Có phải ngày cố định hay không
  description?: string; // Mô tả (tùy chọn)
}
