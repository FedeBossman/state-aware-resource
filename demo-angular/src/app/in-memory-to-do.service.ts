import { Injectable } from '@angular/core';
import {InMemoryDbService} from "angular-in-memory-web-api";
import {Observable, of} from "rxjs";
import {ToDo} from "./todo";

@Injectable({
  providedIn: 'root'
})
export class InMemoryToDoService implements InMemoryDbService {

  constructor() { }

  createDb(): {} | Observable<{}> | Promise<{}> {
    let todos: ToDo[] = [
      { id: 1, name: 'Create a library' },
      { id: 2, name: 'Publish library' },
      { id: 3, name: 'Write demo' },
      { id: 4, name: 'Write blog' },
      { id: 5, name: '????' },
      { id: 6, name: 'Profit' }
    ];
    return of({todos});
  }
}
