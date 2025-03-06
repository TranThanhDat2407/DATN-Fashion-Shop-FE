import { CommonModule, NgClass, NgForOf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, take, throwError } from 'rxjs';
import { ReviewDetailProductDTO } from '../../../dto/ReviewDetailProductDTO';
import { ReviewServiceService } from '../../../services/client/ReviewService/review-service.service';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { PageResponse } from '../../../dto/Response/page-response';
import { response } from 'express';
import { DetailProductService } from '../../../services/client/DetailProductService/detail-product-service.service';
import { DetailProductDTO } from '../../../dto/DetailProductDTO';
import { ReviewTotalDTO } from '../../../dto/ReviewTotalDTO';
import { ReviewAverageDTO } from '../../../dto/ReviewAverageDTO';
import {TotalReviewByRatingDTO} from '../../../dto/TotalReviewByRatingDTO';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [NgForOf, CommonModule,
    NgClass, TranslateModule, RouterLink],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent implements OnInit {
  page: number = 0
  size: number = 4
  sortBy: string = 'id'
  sortDir: string = 'desc'
  currentPage: number = 0; // Trang hiện tại
  pageSize: number = 10; // Số phần tử trên mỗi trang
  isLoading: boolean = false; // Trạng thái tải dữ liệu
  reviewAverage: number = 0
  reviewTotal: number = 0


  currentLang: string = '';
  currentCurrency: string = '';
  productId: number = 0

  dataPageReviews: PageResponse<ReviewDetailProductDTO[]> | null = null
  dataDetailReviews: ReviewDetailProductDTO[] | null | undefined = null;
  dataDetailsProduct: DetailProductDTO | null = null;

  constructor(
    private navigationService: NavigationService,
    private routerActive: ActivatedRoute,
    private reviewService: ReviewServiceService,
    private detailProductService: DetailProductService,

  ) {
  }


  async ngOnInit(): Promise<void> {
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);
    this.getIdsFromProductRouter();
    await this.fetchReviews(this.productId)
    this.updatePercentages();

  }


  getIdsFromProductRouter(): void {
    this.routerActive.params.pipe(take(1)).subscribe(params => {
      this.productId = Number(params['productId']) || 0;
      // console.log('productId : ' + this.productId)
    });
  }
  async fetchReviews(productId: number): Promise<void> {
    if (!productId) return;


    const callApis = {
      dataReviews: this.getReviewssDetailProduct(productId, this.page, this.size, this.sortBy, this.sortDir).pipe(catchError((catchError => of(null)))),
      dataDetailsProduct: this.getDetailsProduct(this.currentLang, productId).pipe(catchError(() => of(null))),
      reviewTotal: this.getReviewTotal(productId).pipe(catchError(() => of(0))),
      reviewAverage: this.getReviewAverage(productId).pipe(catchError(() => of(0))),
    }

    const response = await firstValueFrom(forkJoin(callApis));
    this.dataPageReviews = response.dataReviews
    this.dataDetailReviews = response.dataReviews?.content?.flat() ?? [];
    this.reviewAverage = response.reviewAverage;
    this.reviewTotal = response.reviewTotal;
    this.dataDetailsProduct = response.dataDetailsProduct

  }
    getDetailsProduct(lang: string, productId: number): Observable<DetailProductDTO | null> {
      return this.detailProductService.getDetailProduct(lang, productId).pipe(
        map((response: ApiResponse<DetailProductDTO>) => response?.data ?? null),
        catchError((error) => {
          console.error("❌ Lỗi khi gọi API getDetailsProduct:", error);
          return of(null);
        })
      );

    }
  getReviewssDetailProduct(
    productId: number,
    page: number,
    size: number,
    sortBy: string,
    sortDir: string
  ): Observable<PageResponse<ReviewDetailProductDTO[]>> {
    return this.reviewService
      .getReviewDetailProduct(productId, page, size, sortBy, sortDir)
      .pipe(
        map((response: ApiResponse<PageResponse<ReviewDetailProductDTO[]>>) => response.data || null),
        catchError(() => of(null as any))
      );
  }


  getReviewTotal(productId: number): Observable<number> {
    return this.reviewService.getReviewTotal(productId)
      .pipe(
        map(
          (response: ApiResponse<ReviewTotalDTO>) => response.data.totalReviews || 0),
        catchError(() => of(0))
      )

  }

  getReviewAverage(productId: number): Observable<number> {
    return this.reviewService.getReviewAverage(productId)
      .pipe(
        map((response: ApiResponse<ReviewAverageDTO>) => response.data.avgRating || 0),
        catchError(() => of(0))
      )
  }

  rating: number = 5;// Trung bình số sao
  reviewCount: number = 999;//Tổng số đánh giá

  // Danh sách đánh giá
  reviews = [
    {
      title: 'Comfortable',
      rating: 5,
      size: 'S',
      fit: 'Đúng với kích thước',
      comment:
        "Uniqlo’s AIRism UV Protection Mesh Full-Zip Hoodie offers excellent sun protection with a lightweight, breathable fabric that’s perfect for daily wear. Its stylish design blends seamlessly into any outfit, making it both functional and fashionable. Easy to maintain and comfortable for all day use, it’s a great addition for those mindful of sun safety.",
      user: 'MLJane',
      gender: 'Nữ',
      age: '25 đến 34 tuổi',
      height: '156 - 160cm',
      weight: '51 - 55kg',
      shoeSize: 'EU38',
      location: 'Selangor',
      date: '22/12/2024',
    },
    {
      title: 'Like it',
      rating: 3,
      size: 'XL',
      fit: 'Đúng với kích thước',
      comment: 'I like it. Very comfortable to wear and nice colour too',
      user: 'Chew',
      gender: 'Nữ',
      age: '55 đến 64 tuổi',
      height: '166 - 170cm',
      weight: '66 - 70kg',
      shoeSize: 'EU39',
      location: 'Singapore',
      date: '22/12/2024',
    },
    {
      title: 'Like it',
      rating: 3,
      size: 'XL',
      fit: 'Đúng với kích thước',
      comment: 'I like it. Very comfortable to wear and nice colour too',
      user: 'Chew',
      gender: 'Nữ',
      age: '55 đến 64 tuổi',
      height: '166 - 170cm',
      weight: '66 - 70kg',
      shoeSize: 'EU39',
      location: 'Singapore',
      date: '22/12/2024',
    },
    {
      title: 'Like it',
      rating: 3,
      size: 'XL',
      fit: 'Đúng với kích thước',
      comment: 'I like it. Very comfortable to wear and nice colour too',
      user: 'Chew',
      gender: 'Nữ',
      age: '55 đến 64 tuổi',
      height: '166 - 170cm',
      weight: '66 - 70kg',
      shoeSize: 'EU39',
      location: 'Singapore',
      date: '22/12/2024',
    },
    {
      title: 'Like it',
      rating: 3,
      size: 'XL',
      fit: 'Đúng với kích thước',
      comment: 'I like it. Very comfortable to wear and nice colour too',
      user: 'Chew',
      gender: 'Nữ',
      age: '55 đến 64 tuổi',
      height: '166 - 170cm',
      weight: '66 - 70kg',
      shoeSize: 'EU39',
      location: 'Singapore',
      date: '22/12/2024',
    },
    {
      title: 'Comfortable',
      rating: 5,
      size: 'S',
      fit: 'Đúng với kích thước',
      comment:
        "Uniqlo’s AIRism UV Protection Mesh Full-Zip Hoodie offers excellent sun protection with a lightweight, breathable fabric that’s perfect for daily wear. Its stylish design blends seamlessly into any outfit, making it both functional and fashionable. Easy to maintain and comfortable for all day use, it’s a great addition for those mindful of sun safety.",
      user: 'MLJane',
      gender: 'Nữ',
      age: '25 đến 34 tuổi',
      height: '156 - 160cm',
      weight: '51 - 55kg',
      shoeSize: 'EU38',
      location: 'Selangor',
      date: '22/12/2024',
    },
    {
      title: 'Like it',
      rating: 3,
      size: 'XL',
      fit: 'Đúng với kích thước',
      comment: 'I like it. Very comfortable to wear and nice colour too',
      user: 'Chew',
      gender: 'Nữ',
      age: '55 đến 64 tuổi',
      height: '166 - 170cm',
      weight: '66 - 70kg',
      shoeSize: 'EU39',
      location: 'Singapore',
      date: '22/12/2024',
    },
    {
      title: 'Like it',
      rating: 3,
      size: 'XL',
      fit: 'Đúng với kích thước',
      comment: 'I like it. Very comfortable to wear and nice colour too',
      user: 'Chew',
      gender: 'Nữ',
      age: '55 đến 64 tuổi',
      height: '166 - 170cm',
      weight: '66 - 70kg',
      shoeSize: 'EU39',
      location: 'Singapore',
      date: '22/12/2024',
    },
    {
      title: 'Like it',
      rating: 3,
      size: 'XL',
      fit: 'Đúng với kích thước',
      comment: 'I like it. Very comfortable to wear and nice colour too',
      user: 'Chew',
      gender: 'Nữ',
      age: '55 đến 64 tuổi',
      height: '166 - 170cm',
      weight: '66 - 70kg',
      shoeSize: 'EU39',
      location: 'Singapore',
      date: '22/12/2024',
    },
    {
      title: 'Like it',
      rating: 3,
      size: 'XL',
      fit: 'Đúng với kích thước',
      comment: 'I like it. Very comfortable to wear and nice colour too',
      user: 'Chew',
      gender: 'Nữ',
      age: '55 đến 64 tuổi',
      height: '166 - 170cm',
      weight: '66 - 70kg',
      shoeSize: 'EU39',
      location: 'Singapore',
      date: '22/12/2024',
    },
  ];

  // Tạo danh sách sao đầy đủ
  getFullStars(rating: number): Array<number> {
    return Array(Math.floor(rating)).fill(0);
  }

  // Tạo danh sách sao rỗng
  getEmptyStars(rating: number): Array<number> {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  ratings = [
    { stars: 5, count: 1067, percentage: 92.78 },
    { stars: 4, count: 67, percentage: 5.83 },
    { stars: 3, count: 8, percentage: 0.69 },
    { stars: 2, count: 2, percentage: 0.17 },
    { stars: 1, count: 6, percentage: 0.52 },
  ];

  totalReviews = this.ratings.reduce((sum, rating) => sum + rating.count, 0);


  private updatePercentages() {
    this.ratings.forEach((rating) => {
      rating.percentage = (rating.count / this.totalReviews) * 100;
    });
  }

  //sticky-buttons
  isStickyVisible = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const stickyButtons = document.querySelector('.sticky-buttons');
    if (stickyButtons) {
      const rect = stickyButtons.getBoundingClientRect();
      this.isStickyVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
    }
  }

  //Load reviews

  displayedReviews = 5;


  loadMoreReviews() {
    if (this.isLoading || (this.dataPageReviews && this.dataPageReviews.last)) {
      return; // Không tải thêm nếu đang tải hoặc đã hết dữ liệu
    }

    this.isLoading = true; // Bắt đầu tải dữ liệu

    this.getReviewssDetailProduct(this.productId, this.currentPage, this.pageSize, 'createdAt', 'desc')
      .subscribe(response => {
        if (response && response.content) {
          // Gộp dữ liệu mới, bỏ 4 phần tử đầu tiên
          this.dataDetailReviews = [...(this.dataDetailReviews ?? []), ...response.content].flat().slice(this.size);

          this.dataPageReviews = response; // Cập nhật thông tin phân trang
          this.currentPage++; // Tăng số trang hiện tại
        }
        this.isLoading = false; // Kết thúc tải
      });
  }


  // this.dataDetailReviews = [...(this.dataDetailReviews ?? []), ...response.content].flat();



  get visibleReviews() {
    return this.reviews.slice(0, this.displayedReviews);
  }
}
