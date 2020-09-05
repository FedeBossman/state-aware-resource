import {Directive, Input} from '@angular/core';
import {Resource} from "state-aware-resource";

export class ResourceDirectiveContext<T> {
  public $implicit: Resource<T>

  get data(): T {
    return !!this.$implicit ? this.$implicit.data : null;
  }
}

@Directive({ selector: '[swResource]'})
export class ResourceOldDirective<T = unknown> {
  private _context: ResourceDirectiveContext<T> = new ResourceDirectiveContext<T>();

  constructor() {
  }

  @Input('swResource') set resource(resource: Resource<T>) {
    this._context.$implicit = resource;
  }

  get resource(): Resource<T> {
    return this._context.$implicit;
  }

  static ngTemplateGuard_resource<T>(dir: ResourceOldDirective, expr: Resource<T>): expr is Resource<T> { return true; };
}
