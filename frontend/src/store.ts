import { pluck } from 'rxjs/operators';

import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { User } from './interfaces/user.interface';

export interface State {
  user: User | undefined;
  [key: string]: any;
}

const state: State = {
  user: undefined,
};

export class Store {
  private subject = new BehaviorSubject<State>(state);
  private store = this.subject.asObservable().pipe(distinctUntilChanged());

  get value() {
    return this.subject.value;
  }

  select<T>(name: string): Observable<T> {
    return this.store.pipe(pluck(name));
  }

  set(name: string, state: any) {
    this.subject.next({ ...this.value, [name]: state });
  }
}
