import {Component, OnInit} from '@angular/core';
import {onResource, Resource} from "state-aware-resource";
import {TodoService} from "./services/todo.service";
import {ToDo} from "./todo";
import {mergeMap} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'demo-angular';

  todos: ToDo[];
  loading: boolean;
  showEmptyView: boolean;
  error: any;

  constructor(private todoService: TodoService) {
  }

  ngOnInit(): void {
    this.loadToDosList();
  }

  private loadToDosList() {
    this.todoService.getToDos()
      .subscribe(onResource<ToDo[]>({
          loading: () => {
            this.loading = true;
          },
          always: () => {
            this.loading = false;
          },
          empty: () => {
            this.showEmptyView = true;
          },
          failure: (error) => {
            this.error = error;
          },
          success: (data) => {
            this.todos = data;
          }
        }));
  }

  onAddToDo() {
    this.todoService.addToDo({name: 'hola'})
      .subscribe(onResource<ToDo>({
        loading: () => {
          this.loading = true;
        },
        failure: (_) => {
          this.loading = false;
          console.log(_);
        },
        success: (data) => {
          this.loading = false;
          this.todos.push(data);
        }
      }));
  }

  clearToDoList() {
    this.todoService.deleteToDos(this.todos).subscribe(() => this.loadToDosList());
  }
}
