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

export const adminRouter: Routes =[
    {
        path: '',
         component: AdminComponent,
         children:
         [
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
                path:'edit_order',
                component: EditOrderComponent
            },
            {
                path:'edit_attribute',
                component: EditAttributeComponent
            },
            {
                path:'list_attribute',
                component: ListAttributeComponent
            },
            {
                path:'edit_product',
                component: EditProductComponent
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

         ]
    }
]
