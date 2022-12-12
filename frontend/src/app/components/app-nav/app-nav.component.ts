import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['app-nav.component.scss'],
  template: `
    <div class="app-nav">
      <div class="wrapper">
        <a routerLink="map" routerLinkActive="active">Карта</a>
        <a routerLink="news" routerLinkActive="active">Новости</a>
      </div>
    </div>
  `
})
export class AppNavComponent {
  constructor() {}
}
