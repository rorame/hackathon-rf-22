import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as _ from 'lodash';
import { News } from '../hello.component/hello.component.component';
import { PostsService } from '../hello.component/hello.service';
const polygon = [
  20.5056406, 54.7041476, 20.498406, 54.7049998, 20.4989637, 54.7066863,
  20.4998022, 54.7088596, 20.5002741, 54.7100499, 20.4948686, 54.7107195,
  20.4928093, 54.7098268, 20.4915223, 54.7090084, 20.4900637, 54.7077932,
  20.4900637, 54.7066773, 20.4890341, 54.7059828, 20.4898921, 54.704842,
  20.4915652, 54.7028082, 20.4918655, 54.6995094, 20.492938, 54.6976738,
  20.4958124, 54.6961606, 20.4982148, 54.6962598, 20.5008318, 54.6954164,
  20.5034487, 54.6947466, 20.5168377, 54.6951187, 20.5170522, 54.6969048,
  20.5186824, 54.6973513, 20.5172238, 54.6979963, 20.5180818, 54.699559,
  20.5172238, 54.7007744, 20.5164087, 54.7026098, 20.5158081, 54.7040731,
  20.5144782, 54.705834, 20.5145211, 54.707446, 20.514564, 54.7084132,
  20.5142208, 54.7085372, 20.5125047, 54.708562, 20.5083433, 54.709058,
  20.507614, 54.7079172, 20.5068418, 54.7062804, 20.5056406, 54.7041476,
];
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  map: any;
  name = 'Angular';
  news: News[];
  location: any;
  marker = null;

  constructor(private newsService: PostsService) {}

  ngOnInit(): void {
    this.getNews().then((news) => {
      this.map = L.map('map').setView([54.7040731, 20.515808], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
      // Makerを配置

      console.log('🚀  this.map', this.map);

      const poly = _.chunk(polygon, 2).map((ll) => ll.reverse());
      var pointLowRightOut = { lat: 20.498601, lon: 54.7053132 };
      var pointTopLeftOut = { lat: 20.5028676, lon: 54.7065623 };
      var pointLowRightIn = { lat: 20.5151802, lon: 54.6969138 };
      var pointTopLeftIn = { lat: 20.4946307, lon: 54.7079263 };
      var pointBottomOut = { lat: 20.5059136, lon: 54.6930935 };
      var pointTopOut = { lat: 20.4996072, lon: 54.7124147 };
      var pointLeftOut = { lat: 20.4821465, lon: 54.7052974 };
      var pointRightOut = { lat: 20.5229452, lon: 54.7028421 };
      const markers = this.location.map(
        (x: { lon: any; lat: any; id: any }) => ({
          lat: x.lon,
          lng: x.lat,
          id: x.id,
        })
      );
      // this.displayPolygonForMishaFavor(poly);
      // this.displayMarkersForMishaFavor(markers);
      // L.marker([0, 0]).addTo(this.map);
    });
  }
  displayPolygonForMishaFavor(poly: any) {
    L.polygon(poly, { color: 'red' }).addTo(this.map);
    this.map.fitBounds(poly);
  }

  displayMarkersForMishaFavor(markers: any[]) {
    console.log('🚀  markers', markers);
    markers.forEach((m: L.LatLngExpression) =>
      L.circleMarker(m).addTo(this.map)
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
  getMap(
    position: L.LatLngExpression,
    tooltip: ((layer: L.Layer) => L.Content) | L.Content | L.Popup
  ) {
    if (this.map === null) {
      this.map = L.map('map').setView(position, 15);
    } else {
      // перемещение к следующей позиции
      this.map.flyTo(position);
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = new L.Marker(position)
      .addTo(this.map)
      .bindPopup(tooltip)
      .openPopup() as any;
  }
  onClickLocation(event: any): void {
    const position = [
      this.location.find((l: { id: any }) => l.id === event.id).lat,
      this.location.find((l: { id: any }) => l.id === event.id).lon,
    ];
    const tooltip = event.title;

    this.getMap(position as L.LatLngExpression, tooltip);
  }
}
