import { Component, OnInit, Provider } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { catchError, filter, first, firstValueFrom, forkJoin, map, Observable, of, take } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AddressServiceService } from '../../../services/client/AddressService/address-service.service';
import { Province } from '../../../models/Provinces';
import { SizeDTO } from '../../../models/sizeDTO';
import { ProductServiceService } from '../../../services/client/ProductService/product-service.service';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { ReviewServiceService } from '../../../services/client/ReviewService/review-service.service';
import { Review } from '../../../models/Review';
import { response } from 'express';
import { ToastrService } from 'ngx-toastr';
import { DetailMediaDTO } from '../../../dto/DetailMediaDTO';
import { ImageDetailService } from '../../../services/client/ImageDetailService/image-detail.service';
import { DetailProductDTO } from '../../../dto/DetailProductDTO';
import { DetailProductService } from '../../../services/client/DetailProductService/detail-product-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalNotifyErrorComponent } from '../Modal-notify/modal-notify-error/modal-notify-error.component';
import { ModelNotifySuccsessComponent } from '../Modal-notify/model-notify-succsess/model-notify-succsess.component';

@Component({
  selector: 'app-insert-review',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterLink,
    ModalNotifyErrorComponent,
    ModelNotifySuccsessComponent,
    NgClass
  ],
  templateUrl: './insert-review.component.html',
  styleUrl: './insert-review.component.scss'
})
export class InsertReviewComponent implements OnInit {
  validationForm: boolean = false
  notifyError: boolean = false
  notifySuccsess: boolean = false

  currentLang: string = 'vi';
  currentCurrency: string = 'vn';
  productId?: number;

  sizeId?: number;
  colorId?: number;

  reviewForm: FormGroup;

  // Variables for UI
  selectedRating: number = 3;
  ratingText: string = '';
  fitValue: number = 3; // Default "Đúng với kích thước"
  terms: boolean = false
  dataProvince: Province[] = [];

  isOpen: boolean = false;
  searchText: string = '';
  selectedItem: any = null;
  dataSizes: SizeDTO[] = [];
  dataDetailsProduct: DetailProductDTO | null = null;



  reviewNew: Review = {
    productId: this.productId ?? 0,
    title: '',
    comment: '',
    purchasedSize: '',
    fit: '',
    nickname: '',
    gender: '',
    ageGroup: '',
    height: '',
    weight: '',
    shoeSize: '',
    location: '',
    reviewRate: 0
  };





  // Static data
  //Kích cỡ đã mua

  sizes = [
    { size: 'XS' },
    { size: 'S' },
    { size: 'M' },
    { size: 'L' },
    { size: 'XL' },
    { size: 'XXL' }
  ];
  //Giới tính
  genders = [
    { gender: '♂ (M)' },
    { gender: '♀ (F)' },
    { gender: '⚤ (O)' }
  ];
  //Độ tuổi
  ages = [
    { age: '0 - 6 mo' },
    { age: '7 - 12 mo' },
    { age: '13 - 24 mo' },
    { age: '2 - 3 yo' },
    { age: '4 - 6 yo' },
    { age: '7 - 9 yo' },
    { age: '10 - 14 yo' },
    { age: '15 - 19 yo' },
    { age: '20 - 24 yo' },
    { age: '25 - 34 yo' },
    { age: '35 - 44 yo' },
    { age: '45 - 54 yo' },
    { age: '55 - 64 yo' },
    { age: '65+ yo' }
  ];
  
  //Chiều cao
  heights = [
    { height: ' <= 50cm  ' },
    { height: '51 - 60cm' },
    { height: '61 - 70cm' },
    { height: '71 - 80cm' },
    { height: '81 - 90cm' },
    { height: '91 - 100cm' },
    { height: '101 - 110cm' },
    { height: '111 - 120cm' },
    { height: '121 - 130cm' },
    { height: '131 - 140cm' },
    { height: '141 - 150cm' },
    { height: '151 - 155cm' },
    { height: '156 - 160cm' },
    { height: '161 - 165cm' },
    { height: '166 - 170cm' },
    { height: '171 - 175cm' },
    { height: '176 - 180cm' },
    { height: '181 - 185cm' },
    { height: '186 - 190cm' },
  ];
  //Cân nặng
  weights = [
    { weight: '<= 5kg  ' },
    { weight: '5 - 8kg' },
    { weight: '9 - 12kg' },
    { weight: '13 - 15kg' },
    { weight: '16 - 20kg' },
    { weight: '21 - 25kg' },
    { weight: '26 - 30kg' },
    { weight: '31 - 35kg' },
    { weight: '36 - 40kg' },
    { weight: '41 - 45kg' },
    { weight: '46 - 50kg' },
    { weight: '51 - 55kg' },
    { weight: '56 - 60kg' },
    { weight: '61 - 65kg' },
    { weight: '66 - 70kg' },
    { weight: '71 - 75kg' },
    { weight: '76 - 80kg' },
    { weight: '81 - 85kg' },
    { weight: '86 - 90kg' },
  ];

  //Cỡ giày
  shoeSizes = [
    { size: '<= EU33' },
    { size: 'EU34' },
    { size: 'EU35' },
    { size: 'EU36' },
    { size: 'EU37' },
    { size: 'EU38' },
    { size: 'EU39' },
    { size: 'EU40' },
    { size: 'EU41' },
    { size: 'EU42' },
    { size: 'EU43' },
    { size: 'EU44' },
    { size: 'EU45' },
    { size: 'EU46' },
    { size: 'EU47' },
    { size: 'EU48' },
    { size: 'EU49' },
    { size: 'EU50 trở lên' },
  ];






  constructor(private fb: FormBuilder,
              private navigationService: NavigationService,
              private activeRoute: ActivatedRoute,
              private router: Router,
              private addressService: AddressServiceService,
              private productService: ProductServiceService,
              private reviewService: ReviewServiceService,
              private toastr: ToastrService,
              private detailProductService: DetailProductService,
              private dialog: MatDialog



  ) {
    this.reviewForm = this.fb.group({
      rating: [0, Validators.required],
      fit: [3, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      comment: ['', [Validators.required, Validators.minLength(50)]],
      sizePurchased: ['', Validators.required],
      nickname: ['', Validators.required],
      gender: ['', Validators.required],
      location: ['', Validators.required],
      age: ['', Validators.required],
      height: ['', Validators.required],
      weight: ['', Validators.required],
      shoeSize: ['', Validators.required],
      agree: [false, Validators.requiredTrue]
    });

    // Lắng nghe giá trị ngôn ngữ và tiền tệ từ NavigationService
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });


  }

  async ngOnInit(): Promise<void> {
    this.getProductIdFromRouter();
    await this.fetchInsertReview(this.productId ?? 0);
  }

  getProductIdFromRouter(): void {
    this.activeRoute.params.pipe(take(1)).subscribe(params => {
      this.productId = Number(params['productId'])
      this.colorId = Number(params['colorId']) || 0;
      this.sizeId = Number(params['sizeId']) || 0;
      console.log(this.productId)
      console.log("colorId: " + this.colorId)
      console.log(this.sizeId)


      this.reviewNew.productId = this.productId
      console.log("this.reviewNew.productId 11: " + this.reviewNew.productId)

    })


    console.log("this.reviewNew.productId :" + this.reviewNew.productId)
  }

  async fetchInsertReview(productId: number): Promise<void> {
    if (!productId) return;

    const callApis = {
      dataProvince: this.getApiProvincesFromNominatim().pipe(catchError(() => of([]))),
      dataSizes: this.getSizeProduct(productId).pipe(catchError(() => of([]))),
      dataDetailsProduct: this.getDetailsProduct(this.currentLang, productId).pipe(catchError(() => of(null))),



    };
    const response = await firstValueFrom(forkJoin(callApis));
    this.dataProvince = response.dataProvince
    this.dataSizes = response.dataSizes;
    this.dataDetailsProduct = response.dataDetailsProduct

    console.log("dataSizes : " + this.dataSizes[0].valueName)

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


  getSizeProduct(productId: number): Observable<SizeDTO[]> {
    return this.productService.getSizeProduct(productId).pipe(
      map((response: ApiResponse<SizeDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }
  getApiProvincesFromNominatim(): Observable<Province[]> {
    return this.addressService.getApiProvincesFromNominatim();
  }

  // Handlers
  setRating(rating: number): void {
    this.selectedRating = rating;
    this.ratingText = this.getRatingText(rating);
    this.reviewForm.controls['rating'].setValue(rating);
    if (this.reviewNew) {
      this.reviewNew.reviewRate = rating;
    }

  }

  setFitValue(value: number): void {
    // Validate that value is between 1 and 5
    if (value < 1 || value > 5) {
      console.log('Invalid value for fit:', value);
      return;  // Exit early if value is not in the valid range
    }

    this.fitValue = value;
    this.reviewForm.controls['fit'].setValue(value);

    const fitLabels = [
      'CHẬT',
      'HƠI CHẬT',
      'ĐÚNG VỚI KÍCH THƯỚC',
      'HƠI RỘNG',
      'RỘNG'
    ];

    this.reviewNew.fit = fitLabels[value - 1];
    console.log(this.reviewNew.fit);
  }

  getRatingText(rating: number): string {
    switch (rating) {
      case 1: return 'Kém';
      case 2: return 'Được';
      case 3: return 'Trung bình';
      case 4: return 'Tốt';
      case 5: return 'Rất tốt';
      default: return '';
    }
  }
  bien: boolean = false
  onSubmit = (): void => {
    if (this.reviewNew.reviewRate === 0) {
      this.reviewNew.reviewRate = this.selectedRating
    }
    if (!this.reviewNew.fit) {
      this.reviewNew.fit = 'ĐÚNG VỚI KÍCH THƯỚC'
    }
    if (!this.reviewNew.nickname) {
      this.reviewNew.nickname = 'None'
    }

    if (!this.reviewNew.location) {
      console.log("ugbuhcbhifaipfru9nganp")
      this.bien = true
    }else{
      this.bien = false

    }


    if (!this.validateReview()) return;

    this.reviewService.createReview(this.reviewNew).subscribe(
      response => {
        this.notifySuccsess = false;
        setTimeout(() => {
          this.notifySuccsess = true;
        }, 10);
        this.resetForm()
        return;


      },
      error => {
        // this.toastr.error('There was an error creating the review!', 'ERROR', {
        //   timeOut: 2000,
        // })
        this.dialog.open(ModalNotifyErrorComponent)

      }
    );


  }


  get filteredProvinces(): Province[] {
    const search = this.removeVietnameseTones(this.searchText.trim().toLowerCase());
    return this.dataProvince.filter(province =>
      this.removeVietnameseTones(province.name.toLowerCase()).includes(search)
    );
  }
  resetForm(): void {
    this.reviewNew = {
      productId: this.productId ?? 0,
      title: '',
      comment: '',
      purchasedSize: '',
      fit: '',
      nickname: '',
      gender: '',
      ageGroup: '',
      height: '',
      weight: '',
      shoeSize: '',
      location: '',
      reviewRate: 0
    };
    this.selectedItem = null
    this.terms = false

  }


  toggleLanguageAndCurrency() {
    if (this.currentLang === 'vi') {
      this.changeLanguageAndCurrency('en', 'us'); // Đổi sang tiếng Anh
    } else {
      this.changeLanguageAndCurrency('vi', 'vn'); // Đổi sang tiếng Việt
    }
    console.log("ok lun")
  }

  changeLanguageAndCurrency(lang: string, currency: string) {
    // Cập nhật giá trị ngôn ngữ và tiền tệ trong NavigationService
    this.navigationService.updateLang(lang);
    this.navigationService.updateCurrency(currency);

    // Tạo URL mới với ngôn ngữ và tiền tệ đã thay đổi
    const updatedUrl = this.router.url.replace(
      /\/client\/[^\/]+\/[^\/]+/,
      `/client/${currency}/${lang}`
    );

    // Điều hướng đến URL mới
    this.router.navigateByUrl(updatedUrl);
  }


  removeVietnameseTones(str: string): string {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D");
  }


  selectItem(item: Province) {
    this.selectedItem = item;
    this.isOpen = false
    this.searchText = ''
    this.reviewNew.location = item.name
  }
  reviewNews: any = {}; // Đối tượng lưu dữ liệu nhập vào
  errorFields: any = {}; // Đối tượng lưu trạng thái lỗi của từng trường
  validateReview(): boolean {
    this.validationForm = false; // Mặc định không có lỗi
    let isValid = true; // Kiểm tra tổng thể



    // Kiểm tra từng trường và đánh dấu lỗi nếu cần
    this.errorFields = {
      title: !this.reviewNew.title || this.reviewNew.title.trim().length === 0,
      comment: !this.reviewNew.comment || this.reviewNew.comment.trim().length === 0,
      purchasedSize: !this.reviewNew.purchasedSize || this.reviewNew.purchasedSize.length === 0,
      gender: !this.reviewNew.gender || this.reviewNew.gender.length === 0,
      ageGroup: !this.reviewNew.ageGroup || this.reviewNew.ageGroup.length === 0,
      location: !this.selectedItem,
      height: !this.reviewNew.height || this.reviewNew.height.length === 0,
      weight: !this.reviewNew.weight || this.reviewNew.weight.length === 0,
      shoeSize: !this.reviewNew.shoeSize || this.reviewNew.shoeSize.length === 0,
    };

    // Kiểm tra nếu có lỗi
    for (let key in this.errorFields) {
      if (this.errorFields[key]) {
        isValid = false;
      }
    }


    if (!this.terms) {
      this.notifyError = false;
      setTimeout(() => {
        this.notifyError = true;
      }, 10);
      return false
    }


    // Nếu có lỗi, mở modal thông báo
    if (!isValid) {
      this.notifyError = false;
      setTimeout(() => {
        this.notifyError = true;
      }, 10);
    }
    return isValid;
  }






}
