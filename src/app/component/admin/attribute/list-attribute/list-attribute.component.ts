import { Component, OnInit } from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { TableComponent } from '../../table/table.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { PageResponse } from '../../../../dto/Response/page-response';
import { Color } from '../../../../models/AttributeValue/Color';

import { response } from 'express';
import { ApiResponse } from '../../../../dto/Response/ApiResponse';
import { Size } from '../../../../models/AttributeValue/Size';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { ToastrService } from 'ngx-toastr';
import {AttributeService} from '../../../../services/admin/AttributeService/attribute.service';

@Component({
  selector: 'app-list-attribute',
  standalone: true,
  imports: [HeaderAdminComponent, TableComponent, CommonModule, FormsModule, DialogComponent],
  templateUrl: './list-attribute.component.html',
  styleUrl: './list-attribute.component.scss'
})
export class ListAttributeComponent implements OnInit {
  headersColor: string[] = ['id', 'valueImg', 'valueName', 'button']
  headersSize: string[] = ['id', 'valueName', 'button']
  dataColor: PageResponse<Color[]> | null = null
  dataSize: PageResponse<Size[]> | null = null
  checkedItemSize: number[] = [];
  checkedItemColor: number[] = [];
  isActive: any = null
  nameSearch: string = ''
  debounceTimerName: any;
  sortBy: string = 'id'
  sortDir: string = 'desc'
  checkAttribute: boolean = true

  pageColor: number = 0
  sizeColor: number = 10
  sortByColor: string = 'id'
  sortDirColor: string = 'desc'
  nameColor: string = ''

  pageSize: number = 0
  sizeSize: number = 5
  sortBySize: string = 'id'
  sortDirSize: string = 'desc'
  nameSize: string = ''

  constructor(
    private attributeService: AttributeService,
    private diaLog: MatDialog,
    private toastService: ToastrService,


  ) { }

  ngOnInit(): void {
    this.fetchAttributeValue()
  }

  async fetchAttributeValue(): Promise<void> {
    const callApis = {
      dataColor: this.getColors(this.pageColor, this.sizeColor, this.sortByColor, this.sortDirColor, this.nameColor).pipe(catchError(() => of(null))),
      dataSize: this.getSizes(this.pageSize, this.sizeSize, this.sortBySize, this.sortDirSize, this.nameSize).pipe(catchError(() => of(null))),
    }

    const response = await firstValueFrom(forkJoin(callApis));
    this.dataColor = response.dataColor
    this.dataSize = response.dataSize


    console.log('dataSize : ' + this.dataSize)

  }
  resetSize() {
    this.checkAttribute = false
    this.resetFiter();
    console.log('resetSize')
  }
  resetColor() {
    this.checkAttribute = true
    this.resetFiter();

    console.log('resetColor')
  }
  onItemsPerPageChangeColor(newSize: number) {
    this.sizeColor = newSize;
    this.pageColor = 0;
    this.fetchAttributeValue();

  }
  onItemsPerPageChangeSize(newSize: number) {
    this.sizeSize = newSize;
    this.pageSize = 0;
    this.fetchAttributeValue();

  }

  getSizes(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    name: string
  ): Observable<PageResponse<Size[]> | null> {
    return this.attributeService.getSizes(page, size, sortBy, sortDir, name).pipe(
      map((response: ApiResponse<PageResponse<Size[]>>) => response.data),
      catchError(() => of(null))
    )
  }

  onPageChangeSize(newPage: number): void {
    this.pageSize = newPage;
    this.fetchAttributeValue();
  }

  toggleCheckboxSize = (item: any): void => {
    item.checked = !item.checked;

    if (item.checked) {
      if (!this.checkedItemSize.includes(item.id)) {
        this.checkedItemSize.push(item.id);
      }
    } else {
      this.checkedItemSize = this.checkedItemSize.filter(id => id !== item.id);
    }
    console.log('After toggle:', this.checkedItemSize);
  }


  getColors(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    name: string
  ): Observable<PageResponse<Color[]> | null> {
    return this.attributeService.getColors(page, size, sortBy, sortDir, name).pipe(
      map((response: ApiResponse<PageResponse<Color[]>>) => response.data),
      catchError(() => of(null))
    )
  }

  onPageChangeColor(newPage: number): void {
    this.pageColor = newPage;
    this.fetchAttributeValue();
  }

  toggleCheckboxColor = (item: any): void => {
    item.checked = !item.checked;

    if (item.checked) {
      if (!this.checkedItemColor.includes(item.id)) {
        this.checkedItemColor.push(item.id);
      }
    } else {
      this.checkedItemColor = this.checkedItemColor.filter(id => id !== item.id);
    }
    console.log('After toggle color:', this.checkedItemColor);
  }


  deleteColor = (colorId: number): void => {
    const dialogRef = this.diaLog.open(DialogComponent, {
      data: { message: 'Are you sure you want to delete Color?' }

    })

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.attributeService.deleteColor(colorId).subscribe({
          next: response => {
            this.toastService.success('Success', 'Color Deleted successfully!', { timeOut: 3000 });
            this.fetchAttributeValue();
          },
          error: error => {
            this.toastService.error('Error', 'There was an error deleting the Color.', { timeOut: 3000 });
            console.log(error);
          }
        })
      }
    })

  }


  deleteSize = (sizeId: number): void => {
    const dialogRef = this.diaLog.open(DialogComponent, {
      data: { message: 'Are you sure you want to delete Size?' }

    })

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.attributeService.deleteSize(sizeId).subscribe({
          next: response => {
            this.toastService.success('Success', 'Size Deleted successfully!', { timeOut: 3000 });
            this.fetchAttributeValue();
          },
          error: error => {
            this.toastService.error('Error', 'There was an error deleting the Size.', { timeOut: 3000 });
            console.log(error);
          }
        })
      }
    })

  }
  onIsActiveChange(): void {
    this.fetchAttributeValue()
    console.log("Selected isActive value:", this.isActive);
  }

  deleteItemsCheck() {
    if (this.checkAttribute) {
      this.deleteManyColor()
    } else {
      this.deleteManySizes()
    }
  }

  deleteManyColor = async (): Promise<void> => {
    if (this.checkedItemColor.length === 0) {
      this.toastService.error('No items Color selected to delete.', 'Error', { timeOut: 2000 });

      return;
    }

    // Mở dialog xác nhận và chờ kết quả
    const result = await firstValueFrom(
      this.diaLog.open(DialogComponent, {
        width: '400px',
        data: { message: 'Are you sure you want to delete Color?' }
      }).afterClosed()
    );

    if (result === true) {
      // Xóa các mục theo thứ tự, đợi API xóa từng mục hoàn thành
      for (const id of this.checkedItemColor) {
        try {
          await firstValueFrom(this.attributeService.deleteColor(id));
          console.log(`Deleted category with id ${id}`);
          this.toastService.success('Success', 'Color deleted successfully!', { timeOut: 1000 });
        } catch (error) {
          console.error(`Error deleting category with id ${id}`, error);
          this.toastService.error('Error', 'There was an error deleting the Color.', { timeOut: 1000 });
        }
      }
    } else {
      console.log('User canceled deletion.');
    }

    // Sau khi xóa xong (hoặc hủy), reset mảng và làm mới danh sách
    this.checkedItemColor = [];
    this.fetchAttributeValue();
  };
  deleteManySizes = async (): Promise<void> => {
    if (this.checkedItemSize.length === 0) {
      this.toastService.error('No items Size selected to delete.', 'Error', { timeOut: 2000 });

      return;
    }

    // Mở dialog xác nhận và chờ kết quả
    const result = await firstValueFrom(
      this.diaLog.open(DialogComponent, {
        width: '400px',
        data: { message: 'Are you sure you want to delete Size?' }
      }).afterClosed()
    );

    if (result === true) {
      // Xóa các mục theo thứ tự, đợi API xóa từng mục hoàn thành
      for (const id of this.checkedItemSize) {
        try {
          await firstValueFrom(this.attributeService.deleteSize(id));
          console.log(`Deleted category with id ${id}`);
          this.toastService.success('Success', 'Size deleted successfully!', { timeOut: 1000 });
        } catch (error) {
          console.error(`Error deleting category with id ${id}`, error);
          this.toastService.error('Error', 'There was an error deleting the Size.', { timeOut: 1000 });
        }
      }
    } else {
      console.log('User canceled deletion.');
    }

    // Sau khi xóa xong (hoặc hủy), reset mảng và làm mới danh sách
    this.checkedItemSize = [];
    this.fetchAttributeValue();
  };
  onNameChange(value: string): void {
    // Xóa timer cũ nếu có
    if (this.debounceTimerName) {
      clearTimeout(this.debounceTimerName);
    }
    // Đặt timer mới chờ 1s
    this.debounceTimerName = setTimeout(() => {
      this.searchNameAttribute(value);
    }, 1000);
  }
  searchNameAttribute(value: string): void {
    if (this.checkAttribute) {
      this.nameColor = value
      this.fetchAttributeValue()
    } else {
      this.nameSize = value
      this.fetchAttributeValue()
    }
  }

  onCreateAtChange() {
    if (this.checkAttribute) {
      this.sortByColor = this.sortBy
      this.fetchAttributeValue()
    } else {
      this.sortBySize = this.sortBy
      this.fetchAttributeValue()
    }
  }
  onSortDirChange() {
    if (this.checkAttribute) {
      this.sortDirColor = this.sortDir
      this.fetchAttributeValue()
    } else {
      this.sortDirSize = this.sortDir
      this.fetchAttributeValue()
    }
  }
  async resetFiter(): Promise<void> {
    this.sortBy = 'id'
    this.sortDir = 'desc'
    this.nameSearch = ''
    this.nameColor = ''
    this.nameSize = ''
    this.fetchAttributeValue();
  }
}
