import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable } from 'rxjs';
import { map as observableMap } from 'rxjs/operators';


@Injectable()
export class newService {
  constructor(private http: HttpClient, private routesSource: RoutesSource) {
  }


  get new(): Observable<News> {
    return this.http
      .get<RightsNews>(
        endpoint("http://ivanborisof.pythonanywhere.com/")
      )
      .pipe(observableMap(response => new News(response)));
  }
}
