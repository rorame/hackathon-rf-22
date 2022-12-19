import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NewsComponent } from './news.component';
import { NewsMapComponent } from './newsMap/newsMap.component';

// containers

export const ROUTES: Routes = [{ path: 'news', component: NewsComponent }];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(ROUTES)],
  declarations: [NewsComponent, NewsMapComponent],
})
export class NewsModule {}
