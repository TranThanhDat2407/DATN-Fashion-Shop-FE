import {Route, RouterModule, Routes} from "@angular/router";

import {LanguageCurrencyResolver} from '../../resolvers/language-currency.resolver';
import {routes} from '../../app.routes';
import {NgModule} from '@angular/core';
import {AuthGuardFn} from '../../guards/auth.guard';
import {GuestComponent} from './guest.component';


export const guestRounter: Routes =[
    {

        path: ':currency/:lang', // Thêm tham số tiền tệ, ngôn ngữ
        component: GuestComponent,
        resolve:{langCurrency: LanguageCurrencyResolver },
        children: [
            {
                path: '',
                component: GuestComponent
            },

        ]
    },



    { path: '', redirectTo: 'VND/vi', pathMatch: 'full' } // Mặc định là 'vi'
]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
