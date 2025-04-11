import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderAdminComponent } from "../../header-admin/header-admin.component";
import { TableComponent } from "../../table/table.component";
import { StoreService } from '../../../../services/client/store/store.service';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { PageResponse } from '../../../../dto/Response/page-response';
import { Store } from '../../../../models/Store/Store';
import { ApiResponse } from '../../../../dto/Response/ApiResponse';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { ToastrService } from 'ngx-toastr';
interface InsertStoreDTO {
  name: string;
  phoneNumber: string;
  email: string;
  openHour: string;
  closeHour: string;
  isActive: boolean;
  street: string;
  city: string;
  district: string;
  ward: string;
  full_address: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-list-store',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderAdminComponent, TableComponent, DialogComponent],
  templateUrl: './list-store.component.html',
  styleUrl: './list-store.component.scss'
})
export class ListStoreComponent implements OnInit {
  header: string[] = ['id', 'name', 'email', 'phone', 'isActive', 'openHour', 'openHour', 'fullAddress', 'button']
  name?: string
  city?: string
  page: number = 0
  size: number = 7
  userLat?: number
  userLon?: number
  dataPageStore: PageResponse<Store[]> | null = null
  dataStore: Store[] = []

  constructor(
    private storeService: StoreService,
    private router: Router,
    private diaLog: MatDialog,
    private toastService: ToastrService,


  ) {

  }
  ngOnInit(): void {
    this.loadStore();

  }


  onItemsPerPageChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadStore();

  }

  loadStore(): void {
    this.storeService
      .getStore(
        this.name, this.city, this.page, this.size, this.userLat, this.userLon
      )
      .subscribe((response) => {
        this.dataPageStore = response.data
        this.dataStore = response.data.content.flat() ?? [];
      });
  }


  deleteStore = (storeId: number): void => {
    const dialogRef = this.diaLog.open(DialogComponent, {
      data: { message: 'Are you sure you want to delete Store?' }

    })

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.storeService.deleteStore(storeId).subscribe({
          next: response => {
            this.toastService.success('Success', 'Store Deleted successfully!', { timeOut: 3000 });
            this.loadStore()
          },
          error: error => {
            this.toastService.error('Error', 'There was an error deleting the Store.', { timeOut: 3000 });
            console.log(error);
          }
        })
      }
    })

  }

  getStore(
    name?: string,
    city?: string,
    page: number = 0,
    size: number = 10,
    userLat?: number,
    userLon?: number): Observable<PageResponse<Store[]>> {
    return this.storeService.getStore(name, city, page, size, userLat, userLon).pipe(
      map((response: ApiResponse<PageResponse<Store[]>>) => response.data || null)
    )
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadStore()
  }

  resetFilters() {
    this.name = ''
    this.city = ''
    this.loadStore();
  }
}
