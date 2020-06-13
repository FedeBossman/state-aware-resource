import {Component, OnInit} from '@angular/core';
import {Resource} from "state-aware-resource";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'demo-angular';

  ngOnInit(): void {
    const resource = new Resource<number>(123);
  }
}
