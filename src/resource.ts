import {Observable, of} from 'rxjs';
import {catchError, concatAll, map} from 'rxjs/operators';

/**
 * Resource - Parameterized wrapper for an async loading resource.
 * Initial loading state and possible success, failure and empty outcomes.
 */
export class Resource<T> {
  get isFailure(): boolean {
    return !this.isLoading && this.error !== null;
  }

  get isEmpty(): boolean {
    if (this.isLoading || this.isFailure) {
      return false;
    }
    if (this.data === null || this.data === undefined) {
      return true;
    }
    if (typeof this.data === 'string') {
      return this.data.length === 0;
    }
    if (Array.isArray(this.data)) {
      return this.data.length === 0;
    }
    return false;
  }

  get isSuccess(): boolean {
    return !this.isLoading && !this.isFailure && !this.isEmpty;
  }

  readonly isLoading: boolean;
  readonly data: T;
  readonly error: any;

  constructor(data: T, error: any = null, loading: boolean = false) {
    this.data = data;
    this.error = error;
    this.isLoading = loading;
    if (this.isLoading && (this.error || this.data)) {
      throw new Error('A loading resource cannot have data or errors.');
    }
  }

  /**
   * Dynamically sets triggers for possible resource outcomes based on a PartialChecker structure
   * @param options - PartialChecker given for the current resource
   */
  on(options: PartialResourceCallbacks<T>): void {
    if (options.loading && this.isLoading) {
      options.loading();
    }
    if (options.success && this.isSuccess) {
      options.success(this.data);
    }
    if (options.failure && this.isFailure) {
      options.failure(this.error);
    }
    if (options.empty && this.isEmpty) {
      options.empty();
    }
  }
}

// https://stackoverflow.com/questions/48230773/how-to-create-a-partial-like-that-requires-a-single-property-to-be-set

type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

type ResourceCallbacks<T> = {
  success: (data: T) => void;
  failure: (err: any) => void;
  empty: () => void;
  loading: () => void;
}

/**
 * Partial type that expects at leas one attribute from ResourceCallbacks<T>
 */
type PartialResourceCallbacks<T> = AtLeastOne<ResourceCallbacks<T>>

/**
 * Maps PartialChecker options to a function.
 * To be used on a subscription
 * @param options - Options to check
 */
export function onResource<T>(options: PartialResourceCallbacks<T>): ((res: Resource<T>) => void) {
  return (res: Resource<T>) => res.on(options);
}

/**
 * Transforms any element to a resource.
 * Alternative to constructor that can be used as a map pipe in Observables.
 * @param data T
 */
export function toResource<T>(data: T): Resource<T> {
  return new Resource(data);
}

/**
 * Transforms any error to a failure resource.
 * Alternative to constructor that can be used as a map pipe in Observables.
 * @param error any
 */
export function toFailure<T>(error: any): Resource<T> {
  return new Resource<T>(null, error);
}

export const FAILURE = new Resource<any>(null, true);
export const LOADING = new Resource<any>(null, null, true);

/* Observable functions */

/**
 * Wrap resource logic around an HTTP observable
 * First response is always loading, followed up by a resource or a failure resource
 * @param request Observable - Request observable
 */
export function resourceRequestObservable<T>(request: Observable<T>): Observable<Resource<T>> {
  return of(
    of(LOADING),
    request// .pipe(catchError)
      .pipe(
        map(toResource),
        catchError((error: any) => of(toFailure<T>(error)))
      )
  ).pipe(concatAll());
}
