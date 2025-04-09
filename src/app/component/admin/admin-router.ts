import { Routes } from "@angular/router";
import { AdminComponent } from "./admin.component";

import { ListCategoryComponent } from "./categoty/list-category/list-category.component";
import { EditCategoryComponent } from "./categoty/edit-category/edit-category.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ListOrderComponent } from "./order/list-order/list-order.component";
import { EditOrderComponent } from "./order/edit-order/edit-order.component";
import { EditAttributeComponent } from "./attribute/edit-attribute/edit-attribute.component";
import { EditProductComponent } from "./product/edit-product/edit-product.component";
import { LoginAdminComponent } from "./login-admin/login-admin.component";
import { EditCouponComponent } from './coupon/edit-coupon/edit-coupon.component';
import { ListCouponComponent } from './coupon/list-coupon/list-coupon.component';

import { ListAttributeComponent } from "./attribute/list-attribute/list-attribute.component";
import { ListProductComponent } from "./product/list-product/list-product.component";
import { OrderDetailComponent } from './order/order-detail/order-detail.component';
import { EditProductVariantComponent } from "./product/edit-product-variant/edit-product-variant.component";
import { StatisticalComponent } from './statistical/statistical.component';
import { CreateProductComponent } from "./product/create-product/create-product.component";
import { ShippingComponent } from '../client/checkout/shipping/shipping.component';
import {
  EditCategoryForProductComponent
} from './product/edit-product/edit-category-for-product/edit-category-for-product.component';
import { ListPromotionComponent } from './promotions/list-promotion/list-promotion.component';
import { EditPromotionComponent } from './promotions/edit-promotion/edit-promotion.component';
import { CreatePromotionComponent } from './promotions/create-promotion/create-promotion.component';
import { InventoryComponent } from "./inventory/inventory/inventory.component";
import { AdminGuard, AdminGuardFn } from '../../guards/admin.guard';
import { EditStoreComponent } from "./store/edit-store/edit-store.component";
import { ListStoreComponent } from "./store/list-store/list-store.component";
import { HistoryTransferComponent } from "./inventory/history-transfer/history-transfer.component";
import { TransferDetailComponent } from "./inventory/transfer-detail/transfer-detail.component";
import {WishlistComponent} from './wishlist/wishlist.component';
import {
  DateRangeStatisticComponent
} from '../staff/store-statistic/date-range-statistic/date-range-statistic.component';
import {DailyChartComponent} from '../staff/store-statistic/daily-chart/daily-chart.component';
import {StoreStatisticalComponent} from './store-statistical/store-statistical.component';
import {
  StoreDateRangeStatisticComponent
} from './store-statistical/store-date-range-statistic/store-date-range-statistic.component';
import {StoreDailyChartComponent} from './store-statistical/store-daily-chart/store-daily-chart.component';
import {StoreDashboardComponent} from '../staff/store-dashboard/store-dashboard.component';
import {
  StoreStatisticDashboardComponent
} from './store-statistical/store-statistic-dashboard/store-statistic-dashboard.component';


export const adminRouter: Routes = [
  {
    path: '',
    component: AdminComponent,
    children:
      [
        {
          path: "edit_store/:id",
          component: EditStoreComponent,
          canActivate: [AdminGuardFn],
        },
        {
          path: "transfer_detail/:id",
          component: TransferDetailComponent,
          canActivate: [AdminGuardFn],
        },
        {
          path: 'list_store',
          component: ListStoreComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_store',
          component: EditStoreComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'history_transfer',
          component: HistoryTransferComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'inventory',
          component: InventoryComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'inventory/edit_qty/:idInventory',
          component: InventoryComponent
        },


        {
          path: 'login_admin',
          component: LoginAdminComponent
        },

        {

          path:'list_category',
          component: ListCategoryComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_category/:id',
          component: EditCategoryComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_category',
          component: EditCategoryComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'dashboard',
          component: DashboardComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'list_order',
          component: ListOrderComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'statistical',
          component: StatisticalComponent,
          canActivate: [AdminGuardFn],
        },

        {
          path: 'wishlists',
          component: WishlistComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'order_detail/:orderId',
          component: OrderDetailComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_attribute',
          component: EditAttributeComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_attribute/size/:id',
          component: EditAttributeComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_attribute/color/:id',
          component: EditAttributeComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'list_attribute',
          component: ListAttributeComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'create_product',
          component: CreateProductComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'create_product/:id',
          component: CreateProductComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_product/:id',
          component: EditProductComponent,
          children: [
            { path: 'edit-category-for-product', component: EditCategoryForProductComponent },
          ],
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_productVariant/:id/:productId',
          component: EditProductVariantComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'list_product',
          component: ListProductComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_coupon',
          component: EditCouponComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'list_coupon',
          component: ListCouponComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_coupon/:id',
          component: EditCouponComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'create_promotion',
          component: CreatePromotionComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'list_promotions',
          component: ListPromotionComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'edit_promotion/:id',
          component: EditPromotionComponent,
          canActivate: [AdminGuardFn]
        },
        {
          path: 'store-statistical',
          component: StoreStatisticalComponent,
          canActivate: [AdminGuardFn],
          children: [
            {
              path: "dashboard1",
              component: StoreStatisticDashboardComponent,
            },
            {
              path: "date-range-statistic",
              component: StoreDateRangeStatisticComponent,
            },
            {
              path: "daily-statistic",
              component: StoreDailyChartComponent,
            }
          ],
        },
      ]
  }
]
