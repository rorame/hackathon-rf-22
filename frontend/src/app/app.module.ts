import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { Store } from 'store';

// feature modules
import { AuthModule } from './containers/auth/auth.module';

// containers
import { AppComponent } from './containers/app/app.component';

// components

// routes
export const ROUTES: Routes = [];

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(ROUTES),
    AuthModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    Store
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}



// Import the functions you need from the SDKs you need

//! import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
//! const firebaseConfig = {
//!   apiKey: "AIzaSyApT-9aea2310v1mu9dKtRaGTUnTKMcgSI",
//!   authDomain: "fitness-app-17e6f.firebaseapp.com",
//!   databaseURL: "https://!fitness-app-17e6f-default-rtdb.firebaseio.com",
//!   projectId: "fitness-app-17e6f",
//!   storageBucket: "fitness-app-17e6f.appspot.com",
//!   messagingSenderId: "147009321449",
//!   appId: "1:147009321449:web:0d6d6abc3b3d52b1fc7378"
//! };

// Initialize Firebase
//! const app = initializeApp(firebaseConfig);
