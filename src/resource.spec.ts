import {LOADING, onResource, Resource, resourceRequestObservable, toFailure, toResource} from './resource';
import {of, throwError} from 'rxjs';
import {take} from 'rxjs/operators';
// import {fakeAsync, tick} from '@angular/core/testing';

describe('Resource<T>', () => {
  it('should have a data attribute', () => {
    const res = new Resource('test');
    expect(res.data).toBe('test');
    expect(res.error).toBeNull();
  });

  describe('constructor', () => {
    it('should throw error when creating a resource as loading and with data', () => {
      expect(() => new Resource('test', null, true)).toThrowError();
    });
    it('should throw error when creating a resource as loading and with errors', () => {
      try {
        const res = new Resource(null, {message: 'There is an error'}, true);
        expect(true).toBe(false, 'Should throw an exception and not pass through here');
      } catch (e) {
        expect().nothing();
      }
    });
  });

  describe('on.({success})', () => {
    it('should respond on.({success})', () => {
      const testObject = {
        notCalled: () => {
        },
        success: () => {
        }
      };
      const spy = spyOn(testObject, 'notCalled');
      const successSpy = spyOn(testObject, 'success');

      const res = new Resource('test');

      res.on({
        success: testObject.success,
        failure: testObject.notCalled,
        empty: testObject.notCalled,
        loading: testObject.notCalled,
      });

      // @ts-ignore
      expect(successSpy).toHaveBeenCalledWith('test');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('on.({failure})', () => {
    it('should respond on.({failure}) when an error is set in the constructor', () => {
      const testObject = {
        notCalled: () => {
        },
        failure: () => {
        }
      };
      const spy = spyOn(testObject, 'notCalled');
      const failureSpy = spyOn(testObject, 'failure');

      const res = new Resource(null, {message: 'There is an error'});

      res.on({
        failure: testObject.failure,
        success: testObject.notCalled,
        empty: testObject.notCalled,
        loading: testObject.notCalled,
      });

      expect(spy).not.toHaveBeenCalled();
      // @ts-ignore
      expect(failureSpy).toHaveBeenCalledWith({message: 'There is an error'});
    });
  });

  describe('onEmpty', () => {
    it('should respond on.({empty}) when data is an empty array', () => {
      const testObject = {
        notCalled: () => {
        },
        empty: () => {
        }
      };
      const spy = spyOn(testObject, 'notCalled');
      const emptySpy = spyOn(testObject, 'empty');

      const res = new Resource([]);

      res.on({
        failure: testObject.notCalled,
        success: testObject.notCalled,
        empty: testObject.empty,
        loading: testObject.notCalled,
      });

      expect(spy).not.toHaveBeenCalled();
      expect(emptySpy).toHaveBeenCalled();
    });

    it('should respond on.({empty}) on empty string, empty array, null and undefined', () => {
      const testObject = {
        empty: () => {
        },
      };
      const emptySpy = spyOn(testObject, 'empty');

      // String case
      let res: Resource<any> = new Resource('');
      res.on({empty: testObject.empty});
      // Array case
      res = new Resource([]);
      res.on({empty: testObject.empty});
      // Null case
      res = new Resource(null);
      res.on({empty: testObject.empty});
      // Undefined case
      res = new Resource(undefined);
      res.on({empty: testObject.empty});

      expect(emptySpy).toHaveBeenCalledTimes(4);
    });


    it('should respond on.({empty}) on 0 case', () => {
      const testObject = {
        zero: () => {
        },
      };
      const zeroSpy = spyOn(testObject, 'zero');

      // Zero case
      const res = new Resource(0);
      res.on({empty: testObject.zero});

      expect(zeroSpy).not.toHaveBeenCalled();
    });

    it('should respond on.({empty}) on empty object case', () => {
      const testObject = {
        object: () => {
        }
      };
      const objectSpy = spyOn(testObject, 'object');

      // Object case
      const res = new Resource({});
      res.on({empty: testObject.object});

      expect(objectSpy).not.toHaveBeenCalled();
    });
  });

  describe('on.({loading})', () => {
    it('should respond on.({loading}) when resource is constructed as LOADING', () => {
      const testObject = {
        notCalled: () => {
        },
        loading: () => {
        }
      };
      const spy = spyOn(testObject, 'notCalled');
      const loadingSpy = spyOn(testObject, 'loading');

      LOADING.on({
        failure: testObject.notCalled,
        success: testObject.notCalled,
        empty: testObject.notCalled,
        loading: testObject.loading,
      });

      expect(spy).not.toHaveBeenCalled();
      expect(loadingSpy).toHaveBeenCalled();
    });
  });
});

describe('onResource', () => {
  it('should subscribe a resource to its events when passed as parameter', () => {
    const testObject = {
      success: () => {
      }
    };
    const successSpy = spyOn(testObject, 'success');

    const res = new Resource('test');
    onResource({
      success: testObject.success,
    })(res);

    // @ts-ignore
    expect(successSpy).toHaveBeenCalledWith('test');
  });
});

describe('toResource', () => {
  it('should create a success resource when calling toResource', () => {
    const res = toResource('test');
    expect(res.data).toBe('test');
  });
});

describe('toFailure', () => {
  it('should create a failure resource when calling toFailure', () => {
    const res = toFailure({message: 'error'});
    expect(res.data).toBe(null);
    expect(res.error.message).toBe('error');
  });
});

// describe('resourceRequestObservable<T>', () => {
//   it('should merge an observable with an initial loading resource and map original data to a resource object',
//     fakeAsync(() => {
//       const observable = resourceRequestObservable(of('test'));
//       let result = null;
//       observable.pipe(take(1)).subscribe((resource: Resource<string>) => result = resource);
//       tick();
//       expect(result.data).toBe(null);
//       observable.pipe(take(2)).subscribe((resource: Resource<string>) => result = resource);
//       tick();
//       expect(result.data).toBe('test');
//     }));
//
//   it('should map original data to a failure resource object',
//     fakeAsync(() => {
//       const observable = resourceRequestObservable(throwError('error'));
//       let result: Resource<string> = null;
//       observable.pipe(take(2)).subscribe((resource: Resource<string>) => result = resource);
//       tick();
//       expect(result.data).toBe(null);
//       expect(result.error).toBe('error');
//     }));
// });
