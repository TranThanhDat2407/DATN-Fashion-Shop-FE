import { Routes } from "@angular/router";
import { StoreManagerComponent } from "./store-manager.component";
import { TestManagerComponent } from "./test-manager/test-manager.component";
 
 
export const storeManagerRouter: Routes =[
    {
        path: '',
         component: StoreManagerComponent,
         children:
         [
            {
                path:'testManager',
                component: TestManagerComponent
            }
         ]

    }
]