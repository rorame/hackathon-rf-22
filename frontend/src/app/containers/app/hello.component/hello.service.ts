import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { News } from './hello.component.component';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertComponent } from '../alert/alert.component';

@Injectable({ providedIn: 'root' })
export class PostsService {
  idUpdate: string;
  noteUpdate: string;
  valueNoteLS = [];
  subject = new BehaviorSubject('') as any;

  constructor(private http: HttpClient, public snackBar: MatSnackBar) {}

  async getAll(): Promise<any> {
    const resp = await fetch(
      'https://ivanborisof.pythonanywhere.com/api/v1.0/events/'
    );
    const data = await resp.json();
    this.subject.next(data.response);

    return data.response as News[];
  }

  async update(news: any) {
    let newList;
    this.subject.subscribe((el: any) => {
      const news = el;
      newList = news.map((o: { id: any }) => {
        if (o.id === news.id) {
          return news;
        }
        return o;
      });
      console.log('🚀  newList', newList)
    });
    this.subject.next(newList);

    const updateMethod = {
      method: 'PATCH',
      body: JSON.stringify({
        news,
      }),
    };
    try {
      const resp = await fetch(
        'https://ivanborisof.pythonanywhere.com/api/v1.0/events/' + news.id,
        updateMethod
      );
      const data = await resp.json();
      return data.response;
    } catch (e) {
      this.openSnackBarWarningUpdate();
    }
  }
  async create() {}
  async delete(id: string) {
    const deleteMethod = {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
    try {
      const resp = await fetch(
        'https://ivanborisof.pythonanywhere.com/api/v1.0/events/' + id,
        deleteMethod
      );
      const data = await resp.json();
      return data.response;
    } catch (error) {
      this.openSnackBarWarning();
    }
  }
  openSnackBarWarning() {
    this.snackBar.open('новость удалена успешно');
  }
  openSnackBarWarningUpdate() {
    this.snackBar.open('новость успешно изменена');
  }
}
