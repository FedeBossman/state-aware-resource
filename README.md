# State Aware Resource

> Stop checking in on the state of your http requests!

Oftentimes, the applications we develop have one or more asynchronous events occurring while users interact. 

This might include network requests, a long-lasting background task, or a persistence operation.

This module offers a Resource, or a wrapper object with a declarative interface, reducing boilerplate in the application.

The Resource object assumes that the consumed resources will follow this state flow.

![Resource States](docs/resource-states.png)

The module was build for Angular projects, therefore it is written in Typescript and contains extra interfaces that adapt to RxJs.

This repo contains the exported module on `src`, as well as a simple demo on `demo-angular`.

## Usage
When making a http request, the original observable can be wrapped to return the Resource object instead:
```ts
getToDos(): Observable<Resource<ToDo[]>> {
  return resourceRequestObservable<ToDo[]>(this.http.get<ToDo[]>(this.todosUrl));
}
```

When consuming the function, onResource allows for a declarative interface. 
```ts
this.todoService.getToDos()
   .subscribe(onResource<ToDo[]>({
     loading: () => {
       this.loadingSubject.next(true);
     },
     always: () => {
       this.loadingSubject.next(false);
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
```

## Installation

With [npm](https://npmjs.org/):

```shell
npm install state-aware-resource --save
```

With [yarn](https://yarnpkg.com/en/):

```shell
yarn add state-aware-resource
```
