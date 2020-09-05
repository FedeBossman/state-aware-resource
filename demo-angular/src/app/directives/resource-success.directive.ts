import {Directive, EmbeddedViewRef, Host, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {Resource} from "state-aware-resource";
import {ResourceOldDirective} from "./resource-old.directive";

class ResourceSuccessDirectiveContext<T> {
  public resource: Resource<T>;

  get error(): T {
    return !!this.resource ? this.resource.error : null;
  }

  get data(): T {
    return !!this.resource ? this.resource.data : null;
  }

  get $implicit(): T {
    return this.data;
  }
}

type ResourceState = 'success' | 'empty' | 'loading' | 'failure';
const accessors = {
  'success': 'isSuccess',
  'failure': 'isFailure',
  'empty': 'isEmpty',
  'loading': 'isLoading',
}

@Directive({ selector: '[appResourceSuccess]'})
export class ResourceSuccessDirective<T = unknown> {
  private _type: ResourceState;
  private _context: ResourceSuccessDirectiveContext<T> = new ResourceSuccessDirectiveContext<T>();
  private _viewRef: EmbeddedViewRef<ResourceSuccessDirectiveContext<T>>|null = null;
  private _resourceDirective: ResourceOldDirective;

  constructor(
    private templateRef: TemplateRef<ResourceSuccessDirectiveContext<T>>,
    private viewContainer: ViewContainerRef,
    @Host() resourceDirective: ResourceOldDirective) {
    this._resourceDirective = resourceDirective;
  }

  @Input() set appResourceSuccess(type: ResourceState | null) {
    this._type = type || 'success';
  }

  get resource(): Resource<T> {
    return this._resourceDirective.resource as Resource<any>;
  }

  get typeAccessor(): string {
    return accessors[this._type];
  }

  ngDoCheck() {
    this._updateView();
  }

  private _updateView() {
    this._context.resource = this.resource;
    if (this.resource && this.resource[this.typeAccessor]) {
      if (!this._viewRef) {
        this._viewRef = this.viewContainer.createEmbeddedView(this.templateRef, this._context);
      }
    } else {
      this._viewRef = null;
      this.viewContainer.clear();
    }
  }
}
