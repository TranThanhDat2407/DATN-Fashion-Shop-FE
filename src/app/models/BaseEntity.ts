export class BaseEntity {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;

  constructor(data?: Partial<BaseEntity>) {
    this.createdAt = data?.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data?.updatedAt ? new Date(data.updatedAt) : new Date();
    this.createdBy = data?.createdBy || undefined;
    this.updatedBy = data?.updatedBy || undefined;
  }

  onCreate(): void {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    // this.createdBy = this.getCurrentUserId(); // Nếu có logic lấy user ID
    // this.updatedBy = this.getCurrentUserId();
  }

  onUpdate(): void {
    this.updatedAt = new Date();
  }

  // Nếu cần, có thể tạo một phương thức lấy ID người dùng hiện tại từ AuthService
  // private getCurrentUserId(): number {
  //   return AuthService.getCurrentUser().id; // Ví dụ
  // }
}
