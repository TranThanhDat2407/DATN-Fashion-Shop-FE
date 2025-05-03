import {Component, OnInit} from '@angular/core';
import {HeaderAdminComponent} from '../../header-admin/header-admin.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {ListStoreDTO} from '../../../../dto/ListStoreDTO';
import {StoreService} from '../../../../services/client/store/store.service';
import {ActivatedRoute} from '@angular/router';
import {response} from 'express';
import {RegisterDTO} from '../../../../dto/user/register.dto';
import {RoleService} from '../../../../services/role/role.service';
import {UserService} from '../../../../services/user/user.service';
import {debounceTime, distinctUntilChanged, Subject, switchMap} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {
  ModalRegisterSuccessComponent
} from '../../../client/Modal-notify/modal-register-success/modal-register-success.component';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    HeaderAdminComponent,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgForOf,
    NgIf,
    TranslatePipe,
    ModalRegisterSuccessComponent
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit {

  dateOfBirth = '';
  stores: ListStoreDTO[] = [];
  filteredStores: any[] = [];
  errorMessage: string = '';
  roles: any[] = [];
  notifySuccsess: boolean = false
  emailExists = false;
  phoneExists = false;

  constructor(
    private storeService: StoreService,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private userService: UserService,
    ) {
  }

  ngOnInit(): void {
    this.emailCheck$.pipe(
      debounceTime(500), // Giảm số lần gọi API
      distinctUntilChanged(),
      switchMap(email => this.userService.checkEmail(email))
    ).subscribe(exists => {
      this.emailExists = exists;
    });

    this.phoneCheck$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(phone => this.userService.checkPhone(phone))
    ).subscribe(exists => {
      this.phoneExists = exists;
    });

    this.fetchStores();
    this.fetchRoles();
  }

  checkEmail() {
    if (this.email) {
      this.emailCheck$.next(this.email);
    }
  }

  checkPhone() {
    if (this.phone) {
      this.phoneCheck$.next(this.phone);
    }
  }

  fetchStores(): void {
    this.storeService.getStoresForLogin(0, 100, '').subscribe(response => {
      if (response?.data) {
        this.stores = response.data.content;
        this.filteredStores = [...this.stores];
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = decodeURIComponent(params['error']);
      }
    });
  }

  fetchRoles() {
    this.roleService.getRoles()
      .subscribe(
        (res) => {
          this.roles = res;
        },
        (err) => {
          console.error('Error fetching roles:', err);
        }
      );
  }

    first_name= '';
    last_name= '';
    phone= '';
    email= '';
    password='';
    passwordMatching= true;
    gender= '';
    isActive= true;
    storeId= 0;
    role_id= 0;

  private emailCheck$ = new Subject<string>();
  private phoneCheck$ = new Subject<string>();

  onSubmit(form: any) {
    if (form.valid) {

      const formattedDate = new Date(this.dateOfBirth).toISOString();

      const userData = new RegisterDTO({
        first_name: this.first_name,
        last_name: this.last_name,
        phone: this.phone,
        email: this.email,
        password: this.password,
        retype_password: this.password,
        gender: this.gender,
        dateOfBirth: formattedDate,
        storeId: this.storeId,
        role_id: this.role_id
      });

      this.userService.register(userData).subscribe({
        next: (response) => {

          this.notifySuccsess = false;
          setTimeout(() => {
            this.notifySuccsess = true;
          }, 100);

          form.resetForm();
        },
        error: (error) => {
          this.notifySuccsess = false;
          setTimeout(() => {
            this.notifySuccsess = true;
          }, 100);
          console.log(error)
          form.resetForm();
        }
      });
    } else {
      console.log('Form invalid');
      alert('Please fill in all required fields correctly!');
    }
  }


}
