export interface User {
  createAt: string; // Ngày tạo
  updateAt: string; // Ngày cập nhật
  id: number; // ID người dùng
  name: string; // Tên người dùng
  email: string; // Email
  phone: string; // Số điện thoại
  password: string; // Mật khẩu
  oneTimePassword: string | null; // OTP (nếu có thể null)
  otpRequestedTime: string; // Thời gian yêu cầu OTP
  active: boolean; // Trạng thái hoạt động
  review: any[]; // Danh sách đánh giá (kiểu `any[]` nếu không có thêm chi tiết)
}
