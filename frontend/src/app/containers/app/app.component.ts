import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from 'store';
import { AuthService } from '../auth/shared/services/auth/auth.service';
import { User } from 'src/interfaces/user.interface';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  user$: Observable<User> | undefined;
  subscription$: Subscription | undefined;
  isAuthenticated = false;
  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.subscription$?.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription$ = this.authService.auth$.subscribe((el) => {
      this.isAuthenticated = !!el;
      if (!this.isAuthenticated) {
        this.router.navigate(['/auth/login']);
      }
    });

    this.user$ = this.store.select<User>('user');
  }

  onLogout() {
    this.authService.logoutUser();
    this.router.navigate(['/auth/login']);
  }
}
