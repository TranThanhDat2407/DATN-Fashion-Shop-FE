import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { NavBottomComponent } from '../nav-bottom/nav-bottom.component';
import { Router } from '@angular/router';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import { BannerService } from '../../../services/client/BannerService/banner.service';
import { BehaviorSubject, catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { BannerDTO } from '../../../models/BannerDTO';
import { response } from 'express';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { CookieService } from 'ngx-cookie-service';
import { TokenService } from '../../../services/token/token.service';
import { CartService } from '../../../services/client/CartService/cart.service';
import { TotalQty } from '../../../dto/TotalQty';
import { SessionService } from '../../../services/session/session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  providers: [CookieService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  currentLang: string = ''; // Ngôn ngữ mặc định
  currentCurrency: string = ''; // Tiền tệ mặc định
  url: string = '';
  banners: Observable<BannerDTO[] | null> = of([]);
  sessionId?: string;
  userId?: number;
  totalCart$!: Observable<number> ;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private router: Router,
              private navigationService: NavigationService,
              private cookieService: CookieService,
              private tokenService: TokenService,
              private cartService: CartService,
              private sessionService : SessionService,

              private bannerService: BannerService,) {



  }

  ngAfterViewInit(): void {
    this.userId = this.tokenService.getUserId() ?? 0;
    this.sessionId = this.sessionService.getSession() ?? ''
    this.getSession();
    // this.fetchApiCart()
    const sessionId = this.sessionService.getSession();
    this.cartService.getQtyCart(this.userId,sessionId ?? '');


    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.playVideo(), 500);

      // Đảm bảo phát video khi người dùng click vào trang
      document.addEventListener("click", this.playVideo);
    }
    this.userId = this.tokenService.getUserId() ?? 0;

  }

  playVideo = (): void => {
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      video.muted = true;
      video.play().catch(err => console.log("Autoplay blocked:", err));
    }
  };

  async ngOnInit(): Promise<void> {
    // Đảm bảo lấy sessionId trước
    this.sessionId = this.sessionService.getSession() ?? ''
    this.getSession();
    this.userId = this.tokenService.getUserId() ?? 0;
    const sessionId = this.sessionService.getSession();
    this.cartService.getQtyCart(this.userId,sessionId ?? '');
    this.totalCart$ = this.cartService.totalCart$;
    // Kiểm tra nếu sessionId chưa có thì gọi API để tạo

    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);
    this.banners = this.getBanners(this.currentLang);

    this.userId = this.tokenService.getUserId() ?? 0;

    if (this.userId !== 0 && this.sessionId) {
      this.sessionId = ''; // Đặt lại sessionId sau khi merge
    }



    console.log('User:', this.userId);
    console.log('SessionId:', this.sessionId);
  }



  getSession(): void {
    if (this.userId === 0) {
      this.sessionId = this.sessionService.getSession() ?? undefined; // Chuyển null thành undefined

      if (!this.sessionId) { // Nếu chưa có, tạo mới
        this.sessionId = this.sessionService.generateSession();
        console.log('Session mới được tạo:', this.sessionId);
      } else {
        console.log('Session đã tồn tại:', this.sessionId);
      }
    }
  }

  // Lắng nghe sự kiện scroll trên toàn bộ cửa sổ
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.handleScroll();
    }
  }

  handleScroll(): void {
    const carouselItems = document.querySelectorAll<HTMLDivElement>(".carousel-item");
    const scrollPosition = window.scrollY;
    carouselItems.forEach((item, index) => {
      const offset = index * window.innerHeight; // Tính vị trí của từng item

      if (scrollPosition >= offset && scrollPosition < offset + window.innerHeight) {
        const img = item.querySelector("img") as HTMLImageElement;
        if (img) img.style.filter = "brightness(100%)";
      } else {
        const img = item.querySelector("img") as HTMLImageElement;
        if (img) img.style.filter = "brightness(70%)";
      }
    });
  }
  // async fetchApiCart(): Promise<void> {
  //   // Nếu sessionId chưa có, lấy lại từ cookie
  //   if (!this.sessionId) {
  //     this.sessionId = this.cookieService.get('SESSION_ID') || '';
  //   }

  //   // Nếu vẫn chưa có sessionId, có thể cần tạo mới
  //   if (!this.sessionId) {
  //     console.log("Session ID chưa có, cần tạo mới...");
  //     return;
  //   }

  //   try {
  //     const response = await firstValueFrom(this.getTotalQty(this.userId ?? 0, this.sessionId));
  //     // this.qtyTotal = response?.totalCart ?? 0;
  //     console.log("Cart Items:", this.qtyTotal);
  //   } catch (error) {
  //     console.error("Lỗi khi gọi API getTotalQty:", error);
  //   }
  // }

  getBanners(lang: string): Observable<BannerDTO[] | null> {
    return this.bannerService.getBanners(lang).pipe(
      map((response: ApiResponse<BannerDTO[]>) => response.data || []),
      catchError(() => of(null))
    )
  }
  }
