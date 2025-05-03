import { Routes } from "@angular/router";
import { StaffComponent } from "./staff.component";
import { TestStaffComponent } from "./test-staff/test-staff.component";
import {StaffCheckoutComponent} from './staff-checkout/staff-checkout.component';
import {StoreLoginComponent} from './store-login/store-login.component';
import {StoreDashboardComponent} from './store-dashboard/store-dashboard.component';
import {AuthGuardFn} from '../../guards/auth.guard';
import {StoreGuardFn} from '../../guards/store.guard';
import {StockComponent} from './stock/stock.component';
import {StockHistoryComponent} from './stock/stock-history/stock-history.component';
import {StoreInventoryTranferComponent} from './store-inventory-tranfer/store-inventory-tranfer.component';
import {
  StoreInventoryTransferDetailComponent
} from './store-inventory-tranfer/store-inventory-transfer-detail/store-inventory-transfer-detail.component';
import {StoreOrderComponent} from './store-order/store-order.component';
import {StoreOrderDetailComponent} from './store-order/store-order-detail/store-order-detail.component';
import {ManagerComponent} from './manager/manager.component';
import {StaffDetailComponent} from './manager/staff-detail/staff-detail.component';
import {StoreStatisticComponent} from './store-statistic/store-statistic.component';
import {DateRangeStatisticComponent} from './store-statistic/date-range-statistic/date-range-statistic.component';
import {DailyChartComponent} from './store-statistic/daily-chart/daily-chart.component';
import {NotificationComponent} from './notification/notification.component';
import {MomoStoreSuccessComponent} from './momo-store-success/momo-store-success.component';


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
        path: "momo-store-success",
        component: MomoStoreSuccessComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "stock",
        component: StockComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "stock-history",
        component: StockHistoryComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "stock-transfer",
        component: StoreInventoryTranferComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "stock-transfer/:id",
        component: StoreInventoryTransferDetailComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "store-order",
        component: StoreOrderComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "store-order/:id",
        component: StoreOrderDetailComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "staff-manager",
        component: ManagerComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "staff-manager/:userId",
        component: StaffDetailComponent,
        canActivate: [StoreGuardFn],
      },
      {
        path: "store-statistic",
        component: StoreStatisticComponent,
        canActivate: [StoreGuardFn],
        children: [
          {
            path: "date-range-statistic",
            component: DateRangeStatisticComponent,
          },
          {
            path: "daily-statistic",
            component: DailyChartComponent,
          }
        ],
      },
      {
        path: "login",
        component: StoreLoginComponent
      },
      {
        path: "notify",
        component: NotificationComponent,
        canActivate: [StoreGuardFn],
      }
    ]
  }
]
