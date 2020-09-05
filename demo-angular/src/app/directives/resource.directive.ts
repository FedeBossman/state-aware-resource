import {Directive, EmbeddedViewRef, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {Resource} from "state-aware-resource";
import {stringify} from "querystring";

export class ResourceDirectiveContext<T> {
  public $implicit: Resource<T>

  get data(): T {
    return !!this.$implicit ? this.$implicit.data : null;
  }
}

@Directive({ selector: '[appResource]'})
export class ResourceDirective<T = unknown> {
  private _context: ResourceDirectiveContext<T> = new ResourceDirectiveContext<T>();
  private _emptyTemplateRef: TemplateRef<ResourceDirectiveContext<T>>|null = null;
  private _emptyViewRef: EmbeddedViewRef<ResourceDirectiveContext<T>>|null = null;
  private _failureTemplateRef: TemplateRef<ResourceDirectiveContext<T>>|null = null;
  private _failureViewRef: EmbeddedViewRef<ResourceDirectiveContext<T>>|null = null;
  private _loadingTemplateRef: TemplateRef<ResourceDirectiveContext<T>>|null = null;
  private _loadingViewRef: EmbeddedViewRef<ResourceDirectiveContext<T>>|null = null;
  private _successTemplateRef: TemplateRef<ResourceDirectiveContext<T>>|null = null;
  private _successViewRef: EmbeddedViewRef<ResourceDirectiveContext<T>>|null = null;

  constructor(
    private templateRef: TemplateRef<ResourceDirectiveContext<T>>,
    private viewContainer: ViewContainerRef) {
    this._successTemplateRef = templateRef;
  }

  @Input('appResource') set resource(resource: Resource<T>) {
    this._context.$implicit = resource;
    this._updateView();
  }

  /**
   * A template to show if the resource status is empty.
   */
  @Input()
  set appResourceEmpty(templateRef: TemplateRef<ResourceDirectiveContext<T>>|null) {
    assertTemplate('appResourceEmpty', templateRef);
    this._emptyTemplateRef = templateRef;
    this._emptyViewRef = null;  // clear previous view if any.
    this._updateView();
  }

  /**
   * A template to show if the resource status is failure.
   */
  @Input()
  set appResourceFailure(templateRef: TemplateRef<ResourceDirectiveContext<T>>|null) {
    assertTemplate('appResourceFailure', templateRef);
    this._failureTemplateRef = templateRef;
    this._failureViewRef = null;  // clear previous view if any.
    this._updateView();
  }

  /**
   * A template to show if the resource status is loading.
   */
  @Input()
  set appResourceLoading(templateRef: TemplateRef<ResourceDirectiveContext<T>>|null) {
    assertTemplate('appResourceLoading', templateRef);
    this._loadingTemplateRef = templateRef;
    this._loadingViewRef = null;  // clear previous view if any.
    this._updateView();
  }

  /**
   * A template to show if the resource status is success.
   */
  @Input()
  set appResourceSuccess(templateRef: TemplateRef<ResourceDirectiveContext<T>>|null) {
    assertTemplate('appResourceSuccess', templateRef);
    this._successTemplateRef = templateRef;
    this._successViewRef = null;  // clear previous view if any.
    this._updateView();
  }

  private _updateView() {
    if (this._context.$implicit) {
      this._context.$implicit.on({
        success: (data) => {
          if (!this._successViewRef) {
            this.viewContainer.clear();
            this._emptyViewRef = null;
            this._failureViewRef = null;
            this._loadingViewRef = null;
            if (this._successTemplateRef) {
              this._successViewRef = this.viewContainer.createEmbeddedView(this._successTemplateRef, this._context);
            }
          }
        },
        failure: (err) => {
          if (!this._failureViewRef) {
            this.viewContainer.clear();
            this._emptyViewRef = null;
            this._successViewRef = null;
            this._loadingViewRef = null;
            if (this._failureTemplateRef) {
              this._failureViewRef = this.viewContainer.createEmbeddedView(this._failureTemplateRef, this._context);
            }
          }
        },
        loading: () => {
          if (!this._loadingViewRef) {
            this.viewContainer.clear();
            this._emptyViewRef = null;
            this._failureViewRef = null;
            this._successViewRef = null;
            if (this._loadingTemplateRef) {
              this._loadingViewRef = this.viewContainer.createEmbeddedView(this._loadingTemplateRef, this._context);
            }
          }
        },
        empty: () => {
          if (!this._emptyViewRef) {
            this.viewContainer.clear();
            this._emptyViewRef = null;
            this._failureViewRef = null;
            this._successViewRef = null;
            if (this._emptyTemplateRef) {
              this._emptyViewRef = this.viewContainer.createEmbeddedView(this._emptyTemplateRef, this._context);
            }
          }
        }
      });
    } else {
      this.viewContainer.clear();
    }
  }

  static ngTemplateGuard_resource<T>(dir: ResourceDirective, expr: Resource<T>): expr is Resource<T> { return true; };
}

function assertTemplate(property: string, templateRef: TemplateRef<any>|null): void {
  const isTemplateRefOrNull = !!(!templateRef || templateRef.createEmbeddedView);
  if (!isTemplateRefOrNull) {
    throw new Error(`${property} must be a TemplateRef, but received '${stringify(templateRef)}'.`);
  }
}
