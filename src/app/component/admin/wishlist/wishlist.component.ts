import {Component, OnInit, ViewChild} from '@angular/core';
import {RevenueService, ReviewStatistics} from '../../../services/admin/RevenueService/revenue.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {
  MatTableDataSource, MatTableModule
} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatIcon} from '@angular/material/icon';
import {HttpClient} from '@angular/common/http';

interface CountReviews {
  productId: number;
  productName: string;
  totalReviews: number;
  avgRating: number;
  oneStar: number;
  twoStars: number;
  threeStars: number;
  fourStars: number;
  fiveStars: number;
}
@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatCard,
    NgIf,
    MatCardFooter,
    DatePipe,
    MatCardContent,
    MatCardTitle,
    MatCardSubtitle,
    MatCardHeader,
    NgForOf,
    MatProgressBar,
    MatIcon
  ],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']

})
export class WishlistComponent implements OnInit{
  displayedColumns: string[] = [
    'productName', 'totalReviews', 'avgRating', 'fiveStars', 'fourStars', 'threeStars', 'twoStars', 'oneStar'
  ];
  dataSource = new MatTableDataSource<ReviewStatistics>([]);
  totalElements: number = 0;

  selectedProductId: number | null = null;
  reviews: any[] = [];
  isLoadingReviews = false;
  isLoading = false;

  averageRating: number = 0;
  totalReviews: number = 0;
  ratingCounts: { [key: number]: number } = {};
  currentFitLabel: string = 'Đúng với kích thước';
  fitData: any = {
    fitTight: 0,
    fitSlightlyTight: 0,
    fitTrueToSize: 0,
    fitSlightlyLoose: 0,
    fitLoose: 0
  };

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;


  constructor(private revenueService: RevenueService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReviewStatistics();
    this.loadReviewSummary();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  loadReviewStatistics(): void {
    this.isLoading = true;
    this.revenueService.getReviewStatistics('vi')
      .subscribe({
        next: (response) => {
          console.log('Danh sách đánh giá:', response);

          if (response.data && response.data.content) {
            this.dataSource.data = response.data.content;
            this.totalElements = response.data.totalElements;

            if (this.dataSource.data.length > 0) {
              this.selectedProductId = this.dataSource.data[0].productId; // Gán productId đầu tiên
              this.loadReviewSummary(this.selectedProductId);
            }

            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
            if (this.sort) {
              this.dataSource.sort = this.sort;
            }
          }
        },
        error: (err) => {
          console.error('Lỗi khi tải đánh giá:', err);
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  onRowClick(productId: number) {
    if (this.selectedProductId === productId) {
      this.selectedProductId = null;
      this.reviews = [];
      return;
    }

    this.selectedProductId = productId;
    this.isLoadingReviews = true;
    this.revenueService.getReviewsByProduct(productId).subscribe({
      next: (response) => {
        this.reviews = response.data?.content || [];
        this.isLoadingReviews = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải đánh giá sản phẩm:', err);
        this.isLoadingReviews = false;
      }
    });
  }

  loadReviewSummary(productId?: number) {
    if (!productId) {
      return;
    }
    this.http.get<any>(`http://localhost:8080/api/v1/revenue/count/reviews?languageCode=vi&productId=${productId}`)
      .subscribe((response) => {
        const reviewData = response.data?.content?.find((r: CountReviews) => r.productId === productId);

        if (reviewData) {
          this.averageRating = reviewData.avgRating;
          this.totalReviews = reviewData.totalReviews;
          this.ratingCounts = {
            1: reviewData.oneStar || 0,
            2: reviewData.twoStars || 0,
            3: reviewData.threeStars || 0,
            4: reviewData.fourStars || 0,
            5: reviewData.fiveStars || 0
          };

          // ✅ Gán dữ liệu fit
          this.fitData = {
            fitTight: reviewData.fitTight || 0,
            fitSlightlyTight: reviewData.fitSlightlyTight || 0,
            fitTrueToSize: reviewData.fitTrueToSize || 0,
            fitSlightlyLoose: reviewData.fitSlightlyLoose || 0,
            fitLoose: reviewData.fitLoose || 0
          };

          console.log("Fit Data Loaded:", this.fitData);

        }else {
          this.fitData = {
            fitTight: 0,
            fitSlightlyTight: 0,
            fitTrueToSize: 0,
            fitSlightlyLoose: 0,
            fitLoose: 0
          };
        }
      }, (error) => {
        console.error('Lỗi khi tải tổng hợp đánh giá:', error);
      });
  }

  getFitPosition(fitData: any): number {
    if (!fitData) return 50;

    const fitLevels = [
      { key: 'fitTight', label: 'Chật', position: 0 },
      { key: 'fitSlightlyTight', label: 'Hơi chật', position: 25 },
      { key: 'fitTrueToSize', label: 'Đúng với kích thước', position: 50 },
      { key: 'fitSlightlyLoose', label: 'Hơi rộng', position: 75 },
      { key: 'fitLoose', label: 'Rộng', position: 100 }
    ];

    let maxFit = fitLevels[2]; // Mặc định là fitTrueToSize

    for (const fit of fitLevels) {
      if ((fitData[fit.key] || 0) > (fitData[maxFit.key] || 0)) {
        maxFit = fit;
      }
    }

    this.currentFitLabel = maxFit.label; // Cập nhật label hiện tại
    return maxFit.position;
  }

  getFitColor(): string {
    if (!this.fitData) return 'primary';

    const position = this.getFitPosition(this.fitData);

    if (position <= 25) return 'warn';       // Chật -> màu cảnh báo
    if (position <= 50) return 'accent';     // Hơi chật
    if (position <= 75) return 'primary';    // Đúng size
    return 'accent';                         // Hơi rộng/Rộng
  }

  getRatingPercentage(star: number): number {
    return this.totalReviews > 0 ? (this.ratingCounts[star] || 0) / this.totalReviews * 100 : 0;
  }

  getStarsArray() {
    const rating = this.averageRating || 0;
    return Array(Math.floor(rating)).fill(0);
  }

  hasHalfStar() {
    const rating = this.averageRating || 0;
    return rating % 1 >= 0.5;
  }

  trackByProductId(index: number, item: CountReviews): number {
    return item.productId;
  }

}
