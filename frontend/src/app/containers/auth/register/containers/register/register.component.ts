import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  error: string = '';
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {}
  registerUser(event: any) {
    const { email, password } = event;

    this.authService
      .createUser(email, password)
      .then((user) => {
        console.log('user: ', user);
        this.router.navigate(['/coordinates']);
        // User created now create the database user
      })
      .then((success) => {
        // Success
        console.log('success: ', success);
      })
      .catch((err) => {
        // Error
        console.log('error: ', err.message);
        this.error = err.message;
      });
  }
}
