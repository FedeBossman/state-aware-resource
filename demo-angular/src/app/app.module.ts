import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {InMemoryToDoService} from "./in-memory-to-do.service";
import {HttpClientInMemoryWebApiModule} from "angular-in-memory-web-api";
import {ReactiveFormsModule} from "@angular/forms";
import {UnlessDirective} from "./directives/unless.directive";
import {ResourceDirective} from "./directives/resource.directive";
import {ResourceOldDirective} from "./directives/resource-old.directive";
import {ResourceSuccessDirective} from "./directives/resource-success.directive";

@NgModule({
  declarations: [
    AppComponent,
    UnlessDirective,
    ResourceOldDirective,
    ResourceDirective,
    ResourceSuccessDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,

    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryToDoService, {dataEncapsulation: false, delay: 1000}
    ),
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
