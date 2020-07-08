import {Component, OnInit} from '@angular/core';
import {onResource} from "state-aware-resource";
import {TodoService} from "./services/todo.service";
import {ToDo} from "./todo";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  todos: ToDo[];
  loading: boolean;
  showEmptyView: boolean;
  error: any;
  todoForm = new FormGroup({name: new FormControl('')});

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
    this.todoService.addToDo({name: this.todoForm.controls.name.value})
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
