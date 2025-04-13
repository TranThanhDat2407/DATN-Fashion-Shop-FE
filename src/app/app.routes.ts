import {Routes} from '@angular/router';

export const routes: Routes =
  [
    {
      path: 'client',
      loadChildren: () => import('../app/component/client/client-router').then(m => m.clientRouter)
    },
    {
      path: 'admin',
      loadChildren: () => import('../app/component/admin/admin-router').then(m => m.adminRouter)
    },
    {
      path: 'staff',
      loadChildren: () => import('../app/component/staff/staff-router').then(m => m.staffRouter)
    },
    {
      path: 'guest',
      loadChildren: () => import('../app/component/guest/guest-router').then(m => m.guestRounter)
    },
    {
      path: 'store_manager',
      loadChildren: () => import('../app/component/store-manager/store_manager-router').then(m => m.storeManagerRouter)
    },
    {
      path: '', // Nếu không có đường dẫn, chuyển hướng đến client với ngôn ngữ mặc định 'vi'
      redirectTo: 'client/vi',
      pathMatch: 'full',
    },
  ];
