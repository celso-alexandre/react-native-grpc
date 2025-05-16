import { AbortSignal } from 'abort-controller';
import type { Deferred, DeferredCallMap, DeferredCalls } from './types';

export const deferredMap: DeferredCallMap = new Map<number, DeferredCalls>();

export function createDeferred<T>(signal: AbortSignal) {
  const deferred: Deferred<T> = { completed: false } as Deferred<T>;

  deferred.promise = new Promise<T>((resolve, reject) => {
    deferred.resolve = (value) => {
      deferred.completed = true;

      resolve(value);
    };
    deferred.reject = (reason) => {
      deferred.completed = true;

      reject(reason);
    };
  });

  signal.addEventListener('abort', () => {
    if (!deferred.completed) {
      deferred.reject('aborted');
    }
  });

  return deferred;
}
