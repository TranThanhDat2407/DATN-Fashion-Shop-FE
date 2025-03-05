import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @Input() tableHeaders: string[] = [];
  @Input() tableData: any[] = [];
  @Input() eventClickDelete: (item: any) => void = () => { };
  @Input() routerLinkString: string = '';
  @Input() activeRouterLinkString: string = '';
  @Input() changePage: boolean = true;
  @Input() toggleCheckbox: (item: any) => void = () => { };
  @Input() changeActive: (item: boolean) => void = () => { };
  @Input() typeImage: string = '';

  @Input() dataPage: any = {}; // Dữ liệu bảng
  @Input() itemsPerPage: number = 10; // Số mục hiển thị mỗi trang
  @Input() currentPage: number = 1; // Trang hiện tại
  @Output() pageChanged = new EventEmitter<number>();

  page : number = 0 
  setPage(page: number) {
    this.currentPage = page;
    this.page =page
    this.pageChanged.emit(page);  // Phát sự kiện
  }

  // Lấy dữ liệu phân trang
  get paginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.dataPage.content.slice(start, end); // Lấy dữ liệu từ content
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.currentPage = this.page;
      this.pageChanged.emit(this.page);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.currentPage = this.page;
      this.pageChanged.emit(this.page);
    }
  }

  

  get totalPages() {
    return this.dataPage?.totalPages ? Math.ceil(this.dataPage.totalPages) : 0;
  }
  
  get totalElements() {
    return this.dataPage.totalElements; // Lấy tổng số phần tử từ dữ liệu
  }
}
