import {concat, Observable, of} from 'rxjs';
import {catchError, concatAll, map} from 'rxjs/operators';

/**
 * Resource - Parameterized wrapper for an async loading resource.
 * Initial loading state and possible success, failure and empty outcomes.
 */
export class Resource<T> {
  private get isSuccess(): boolean {
    return !this.isEmpty && !this.isFailure && !this.isLoading;
  }

  private get isEmpty(): boolean {
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

  private get isFailure(): boolean {
    return this.error !== null;
  }

  private readonly isLoading: boolean;
  data: T;
  error: any;

  constructor(data: T, error: any = null, loading: boolean = false) {
    this.data = data;
    this.error = error;
    this.isLoading = loading;
    if (this.isLoading && (this.error || this.data)) {
      throw new Error('A loading resource cannot have data or errors.');
    }
  }

  /**
   * Trigger for successful resource
   * @param callback - callback to trigger if resource is of type success
   */
  private onSuccess(callback: (data: T) => void): Resource<T> {
    if (this.isSuccess) {
      callback(this.data);
    }
    return this;
  }

  /**
   * Trigger for failed resource
   * @param callback - callback to trigger if resource is of type failure
   */
  private onFailure(callback: (error: any) => void): Resource<T> {
    if (this.isFailure) {
      callback(this.error);
    }
    return this;
  }

  /**
   * Trigger for empty resource
   * @param callback - callback to trigger if resource is empty
   */
  private onEmpty(callback: () => void): Resource<T> {
    if (!this.isLoading && !this.isFailure && this.isEmpty) {
      callback();
    }
    return this;
  }

  /**
   * Trigger for loading resource
   * @param callback - callback to trigger if resource is loading
   */
  private onLoading(callback: () => void): Resource<T> {
    if (!this.isFailure && this.isLoading) {
      callback();
    }
    return this;
  }

  /**
   * Dynamically sets triggers for possible resource outcomes based on a PartialChecker structure
   * @param options - PartialChecker given for the current resource
   */
  on(options: PartialChecker<T>): void {
    if (options.success) {
      this.onSuccess(options.success);
    }
    if (options.failure) {
      this.onFailure(options.failure);
    }
    if (options.empty) {
      this.onEmpty(options.empty);
    }
    if (options.loading) {
      this.onLoading(options.loading);
    }
  }
}

/** Checker interfaces */
interface SuccessChecker<T> {
  success: (data: T) => void;
  failure?: (err: any) => void;
  empty?: () => void;
  loading?: () => void;
}

interface FailureChecker<T> {
  success?: (data: T) => void;
  failure: (err: any) => void;
  empty?: () => void;
  loading?: () => void;
}

interface EmptyChecker<T> {
  success?: (data: T) => void;
  failure?: (err: any) => void;
  empty: () => void;
  loading?: () => void;
}

interface LoadingChecker<T> {
  success?: (data: T) => void;
  failure?: (err: any) => void;
  empty?: () => void;
  loading: () => void;
}

export declare type PartialChecker<T> = SuccessChecker<T> | FailureChecker<T> | EmptyChecker<T> | LoadingChecker<T>;

/**
 * Main Checker interface
 */
export interface Checker<T> {
  success: (data: T) => void;
  failure: (err: any) => void;
  empty: () => void;
  loading: () => void;
}

/**
 * Maps PartialChecker options to a function.
 * To be used on a subscription
 * @param options - Options to check
 */
export function onResource<T>(options: PartialChecker<T>): ((res: Resource<T>) => void) {
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
  return new Resource(null, error);
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
        catchError(error => of(toFailure<T>(error)))
      )
  ).pipe(concatAll());
}
