import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CoordinatesComponent } from './coordinates.component';
import { MapComponent } from 'src/app/containers/app/map/map.component';
import { HelloComponentComponent } from 'src/app/containers/app/hello.component/hello.component.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
} from '@angular/material';

// containers

export const ROUTES: Routes = [
  { path: 'coordinates', component: CoordinatesComponent },
];

@NgModule({
  imports: [
    MatCardModule,
    ScrollingModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    MatDividerModule,
    RouterModule.forChild(ROUTES),
  ],
  declarations: [CoordinatesComponent, MapComponent, HelloComponentComponent],
})
export class CoordinatesModule {}
