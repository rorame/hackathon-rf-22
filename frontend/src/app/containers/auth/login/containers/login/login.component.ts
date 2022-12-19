import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  error: any;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {}
  loginUser(event: any) {
    const { email, password } = event;

    this.authService
      .loginUser(email, password)
      .then((user) => {
        console.log('user: ', user);
        this.router.navigate(['/coordinates']);
        // User created now create the database user
      })
      .then((success) => {
        // Success
        console.log('success: ', success);
      })
      .catch((err: any) => {
        // Error
        console.log('error: ', err.message);
        this.error = err.message;
      });
  }
}
