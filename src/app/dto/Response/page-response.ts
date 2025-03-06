export class PageResponse<T> {
  content: T[]; // Danh sách dữ liệu
  pageNo: number; // Số trang hiện tại
  pageSize: number; // Số phần tử mỗi trang
  totalPages: number; // Tổng số trang
  totalElements: number; // Tổng số phần tử
  first: boolean; // Là trang đầu tiên?
  last: boolean; // Là trang cuối cùng?

  constructor(data?: Partial<PageResponse<T>>) {
    this.content = data?.content || [];
    this.pageNo = data?.pageNo ?? 0;
    this.pageSize = data?.pageSize ?? 10;
    this.totalPages = data?.totalPages ?? 0;
    this.totalElements = data?.totalElements ?? 0;
    this.first = data?.first ?? false;
    this.last = data?.last ?? false;
  }
}
