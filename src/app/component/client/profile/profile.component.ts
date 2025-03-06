import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import {TokenService} from '../../../services/token/token.service';
import { TranslateModule } from '@ngx-translate/core';
import {UserService} from '../../../services/user/user.service';
import {UserResponse} from '../../../dto/Response/user/user.response';
import {UserDetailDTO} from '../../../dto/UserDetailDTO';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterOutlet, CommonModule
    , RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, AfterViewInit  {
  userId: number = 0;
  userDetail!: UserDetailDTO;
  isLoading = false;
  currentActiveElement: HTMLElement | null = null;
  currentLang: string = '';
  currentCurrency: string = '';

  constructor(
    private router: Router,
    private cdr:
  ChangeDetectorRef,
    private navigationService: NavigationService,
    private tokenService: TokenService,
    private userService: UserService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
        this.cdr.detectChanges();
      } else if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 200);
      }
    });
  }

  ngOnInit(): void {
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });

    this.userId = this.tokenService.getUserId();
    this.getUserDetails();
  }


  ngAfterViewInit(): void {
    this.addFirstElement()
  }
  addFirstElement() {
    const firstElement = document.querySelector('.list-group-item') as HTMLElement;
    if (firstElement) {
      firstElement.classList.add('active-link');
      this.currentActiveElement = firstElement;
    }
  }

  logout(): void {
    this.tokenService.removeToken();
    this.router.navigate([`/client/${this.currentCurrency}/${this.currentLang}/login`]);
  }

  getUserDetails(): void {
    const token = this.tokenService.getToken(); // Lấy token từ service
    if (!token) {
      this.isLoading = false;
      return;
    }

    this.userService.getUserDetail(token).subscribe({
      next: (user: UserDetailDTO) => {
        this.userDetail = user;
        this.isLoading = false;
        console.log("User Detail:", this.userDetail);
      },
      error: (error) => {

      }
    });

  }


  setActiveClass(event: MouseEvent, router: string) {
    console.log(event.target)
    const clickedElement = event.target as HTMLElement;

    if (this.currentActiveElement) {
      this.currentActiveElement.classList.remove('active-link');
    }

    clickedElement.classList.add('active-link');
    this.currentActiveElement = clickedElement;
  }
}
