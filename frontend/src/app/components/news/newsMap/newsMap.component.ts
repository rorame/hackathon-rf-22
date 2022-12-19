import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as _ from 'lodash';
import { News } from 'src/app/containers/app/hello.component/hello.component.component';
import { PostsService } from '../../../containers/app/hello.component/hello.service';

@Component({
  selector: 'app-newsMap',
  templateUrl: './newsMap.component.html',
  styleUrls: ['./newsMap.component.scss'],
})
export class NewsMapComponent implements OnInit {
  map: any;
  name = 'Angular';
  news: News[];
  location: any;
  marker = null;
  mapMarker = L.marker;
  constructor(private newsService: PostsService) {}

  ngOnInit() {
    this.getNews().then((news) => {
      this.map = L.map('map').setView([54.7040731, 20.515808], 6);

      const onMapClick = (e: { latlng: L.LatLngExpression }) => {
        console.log('🚀  e', e);
      };
      this.map.on('contextmenu', onMapClick);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.news.forEach((n) => {
        const position = [
          this.location.find((l: { id: any }) => l.id === n.id).lat,
          this.location.find((l: { id: any }) => l.id === n.id).lon,
        ];
        new L.Marker(position as any)
          .addTo(this.map)
          .bindPopup(n.title)
          .openPopup()
          .on('click', onMapClick);
      });
      // this.displayPolygonForMishaFavor(poly);
      // this.displayMarkersForMishaFavor(markers);
    });
  }
  displayPolygonForMishaFavor(poly: any) {
    L.polygon(poly, { color: 'red' }).addTo(this.map);
    this.map.fitBounds(poly);
  }

  displayMarkersForMishaFavor(markers: any[]) {
    console.log(this.news);
    markers.forEach((m: L.LatLngExpression) =>
      L.circleMarker(m)
        .addTo(this.map)
        .on('click', function (event: any) {
          console.log('🚀  event', event);
        })
    );
  }

  async getNews() {
    return await this.newsService.getAll().then((news) => {
      this.news = news;
      this.location = this.news.map((el) => {
        const _location = {
          ...el,
          lat: el.location.split(',')[0].trim(),
          lon: el.location.split(',')[1].trim(),
        };
        return _location;
      });
    });
  }
}
