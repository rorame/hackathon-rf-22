import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from 'src/interfaces/user.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input()
  user!: User | null;

  @Output()
  logout = new EventEmitter<any>();

  logoutUser() {
    this.logout.emit();
  }
  constructor() {}

  ngOnInit(): void {}
}
