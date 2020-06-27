import { Injectable } from '@angular/core';
import {forkJoin, Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ToDo} from "../todo";
import {Resource, resourceRequestObservable} from "state-aware-resource";

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosUrl = 'api/todos';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor( private http: HttpClient) { }

  getToDos(): Observable<Resource<ToDo[]>> {
    return resourceRequestObservable<ToDo[]>(this.http.get<ToDo[]>(this.todosUrl));
  }

  /** POST: add a new to do item to the server */
  addToDo(todo: ToDo): Observable<Resource<ToDo>> {
    const request: Observable<ToDo> = this.http.post<ToDo>(this.todosUrl, todo, this.httpOptions);
    return resourceRequestObservable<ToDo>(request);
  }

  /** GET to do item by id. Will 404 if id not found */
  getToDo(id: number): Observable<ToDo> {
    const url = `${this.todosUrl}/${id}`;
    return this.http.get<ToDo>(url);
  }

  deleteToDos(todos: ToDo[]) {
    const requests = todos.map(todo => {
      const url = `${this.todosUrl}/${todo.id}`;
      return this.http.delete<ToDo>(url);
    });
    return forkJoin(requests);
  }
}
