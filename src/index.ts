import { fromByteArray, toByteArray } from 'base64-js';
import {
  DeferredCallMap,
  DeferredCalls,
  GrpcError,
  GrpcEvent,
  GrpcMetadata,
  GrpcRequestObject,
  GrpcType,
} from './types';
import { createDeferred } from './create-deferred';
import { NativeEventEmitter } from 'react-native';
import { GrpcUnaryCall } from './unary';
import AbortController from 'abort-controller';

let clientId = 1;
function getClientId(): number {
  return clientId++;
}

export class GrpcClient {
  private clientId: number;
  private grpcNativeClient: GrpcType;
  private grpcEmitter: NativeEventEmitter;
  private deferredMap: DeferredCallMap = new Map<number, DeferredCalls>();
  private requestId = 1;
  constructor(grpcNativeClient: GrpcType) {
    this.clientId = getClientId();
    this.grpcNativeClient = grpcNativeClient;
    this.grpcEmitter = new NativeEventEmitter(this.grpcNativeClient as any);
    this.grpcEmitter.addListener('grpc-call', this.handleGrpcEvent);
  }

  handleGrpcEvent = (event: GrpcEvent) => {
    const deferred = this.deferredMap.get(event.id);

    if (deferred) {
      switch (event.type) {
        case 'headers':
          deferred.headers?.resolve(event.payload);
          break;
        case 'response':
          const data = toByteArray(event.payload);
          deferred.data?.notifyData(data);
          deferred.response?.resolve(data);
          break;
        case 'trailers':
          deferred.trailers?.resolve(event.payload);
          deferred.data?.notifyComplete();
          this.deferredMap.delete(event.id);
          break;
        case 'error':
          const error = new GrpcError(event.error, event.code, event.trailers);
          deferred.response?.reject(error);
          deferred.data?.notifyError(error);
          break;
      }
    }
  };

  getId(): number {
    return this.requestId++;
  }

  async unaryCall(
    method: string,
    data: Uint8Array,
    requestMetadata: GrpcMetadata = {}
  ) {
    const id = this.getId();
    const abort = new AbortController();
    abort.signal.addEventListener('abort', () => {
      this.grpcNativeClient.cancelGrpcCall(id);
    });
    const response = createDeferred<Uint8Array>(abort.signal);
    const headers = createDeferred<GrpcMetadata>(abort.signal);
    const trailers = createDeferred<GrpcMetadata>(abort.signal);

    this.deferredMap.set(id, {
      response,
      headers,
      trailers,
    });

    const requestData = fromByteArray(data);
    const obj: GrpcRequestObject = {
      data: requestData,
    };
    this.grpcNativeClient.unaryCall(id, this.clientId, method, obj, {});
    const call = new GrpcUnaryCall(
      method,
      data,
      requestMetadata,
      headers.promise,
      response.promise,
      trailers.promise,
      abort as any
    );

    const [responseData, responseHeaders, responseTrailers] = await Promise.all(
      [call.response, call.headers, call.trailers]
    );

    return {
      responseData,
      responseHeaders,
      responseTrailers,
    };
  }
}
