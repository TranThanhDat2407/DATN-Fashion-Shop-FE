import { Routes } from "@angular/router";
import { AdminComponent } from "./admin.component";

import { ListCategoryComponent } from "./categoty/list-category/list-category.component";
import { EditCategoryComponent } from "./categoty/edit-category/edit-category.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ListOrderComponent } from "./order/list-order/list-order.component";
import { EditOrderComponent } from "./order/edit-order/edit-order.component";
import { ListUserComponent } from "./user/list-user/list-user.component";
import { EditUserComponent } from "./user/edit-user/edit-user.component";
import { EditAttributeComponent } from "./attribute/edit-attribute/edit-attribute.component";
import { EditProductComponent } from "./product/edit-product/edit-product.component";
import { LoginAdminComponent } from "./login-admin/login-admin.component";
import {EditCouponComponent} from './coupon/edit-coupon/edit-coupon.component';
import {ListCouponComponent} from './coupon/list-coupon/list-coupon.component';

import { ListAttributeComponent } from "./attribute/list-attribute/list-attribute.component";
import { ListProductComponent } from "./product/list-product/list-product.component";
import {OrderDetailComponent} from './order/order-detail/order-detail.component';
import { EditProductVariantComponent } from "./product/edit-product-variant/edit-product-variant.component";
import { CreateProductComponent } from "./product/create-product/create-product.component";
import {ShippingComponent} from '../client/checkout/shipping/shipping.component';
import {
  EditCategoryForProductComponent
} from './product/edit-product/edit-category-for-product/edit-category-for-product.component';
import {ListPromotionComponent} from './promotions/list-promotion/list-promotion.component';
import {EditPromotionComponent} from './promotions/edit-promotion/edit-promotion.component';
import {CreatePromotionComponent} from './promotions/create-promotion/create-promotion.component';
import { InventoryComponent } from "./inventory/inventory/inventory.component";

export const adminRouter: Routes =[
  {
    path: '',
    component: AdminComponent,
    children:
      [
        
        {
          path:'inventory',
          component: InventoryComponent
        },
        {
          path:'inventory/edit_qty/:idInventory',
          component: InventoryComponent
        },
        {
          path:'list_user',
          component: ListUserComponent
        },
        {
          path:'login_admin',
          component: LoginAdminComponent
        },
        {
          path:'edit_user',
          component: EditUserComponent
        },
        {
          path:'edit_user/:id',
          component: EditUserComponent
        },
        {
          path:'list_category',
          component: ListCategoryComponent
        },
        {
          path:'edit_category/:id',
          component: EditCategoryComponent
        },
        {
          path:'edit_category',
          component: EditCategoryComponent
        },
        {
          path:'dashboard',
          component: DashboardComponent
        },
        {
          path:'list_order',
          component: ListOrderComponent
        },
        {
          path:'order_detail/:orderId',
          component: OrderDetailComponent
        },
        {
          path:'edit_attribute',
          component: EditAttributeComponent
        },
        {
          path:'edit_attribute/size/:id',
          component: EditAttributeComponent
        },
        {
          path:'edit_attribute/color/:id',
          component: EditAttributeComponent
        },
        {
          path:'list_attribute',
          component: ListAttributeComponent
        },
        {
          path:'create_product',
          component: CreateProductComponent
        },
        {
          path:'create_product/:id',
          component: CreateProductComponent
        },
        {
          path:'edit_product/:id',
          component: EditProductComponent,
          children: [
            { path: 'edit-category-for-product', component: EditCategoryForProductComponent },
          ],
        },
        {
          path:'edit_productVariant/:id/:productId',
          component: EditProductVariantComponent
        },
        {
          path:'list_product',
          component: ListProductComponent
        },
        {
          path:'edit_coupon',
          component: EditCouponComponent
        },
        {
          path:'list_coupon',
          component: ListCouponComponent
        },
        {
          path:'edit_coupon/:id',
          component: EditCouponComponent
        },
        {
          path:'create_promotion',
          component: CreatePromotionComponent
        },
        {
          path:'list_promotions',
          component: ListPromotionComponent
        },
        {
          path:'edit_promotion/:id',
          component: EditPromotionComponent
        },
      ]
  }
]
