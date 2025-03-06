import { Routes } from "@angular/router";
import { StaffComponent } from "./staff.component";
import { TestStaffComponent } from "./test-staff/test-staff.component";
import {StaffCheckoutComponent} from './staff-checkout/staff-checkout.component';
import {StoreLoginComponent} from './store-login/store-login.component';
import {StoreDashboardComponent} from './store-dashboard/store-dashboard.component';
import {AuthGuardFn} from '../../guards/auth.guard';
import {StoreGuardFn} from '../../guards/store.guard';
import {StockComponent} from './stock/stock.component';


export const staffRouter: Routes = [
  {
    path: ':storeId',
    component: StaffComponent,
    children: [
      {
        path: "dashboard",
        component: StoreDashboardComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "checkout",
        component: StaffCheckoutComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "stock",
        component: StockComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "login",
        component: StoreLoginComponent
      }
    ]
  }
]
