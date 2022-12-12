import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/shared/guards/auth.guard';

export const ROUTES: Routes = [
  { path: 'map', canActivate: [AuthGuard], loadChildren: './map/map.module#MapModule' },
  { path: 'news', canActivate: [AuthGuard], loadChildren: './news/news.module#newsModule' },
];

@NgModule({
  imports: [
    RouterModule.forChild(ROUTES)
  ]
})
export class MapNewsModule {}
