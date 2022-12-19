import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { AuthModule } from './containers/auth/auth.module';
import { AppComponent } from './containers/app/app.component';
import { Store } from 'store';
import { HeaderComponent } from './components/header/header.component';
import { NavComponent } from './components/nav/nav.component';
import { AgVirtualScrollModule } from 'ag-virtual-scroll';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatSnackBarModule,
} from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDialogModule } from '@angular/material';
import { MatInputPromptComponent } from './containers/app/mat-input-prompt/mat-input-prompt.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NewsModule } from './components/news/news.module';
import { CoordinatesModule } from './components/coordinates/coordinates.module';

export const ROUTES: Routes = [];

@NgModule({
  imports: [
    CoordinatesModule,
    MatButtonModule,
    NewsModule,
    BrowserModule,
    RouterModule.forRoot(ROUTES),
    AuthModule,
    AgVirtualScrollModule,
    HttpClientModule,
    MatIconModule,
    MatToolbarModule,
    ScrollingModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    NavComponent,
    MatInputPromptComponent,
  ],
  bootstrap: [AppComponent],
  providers: [Store],
})
export class AppModule {}
