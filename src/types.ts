import { EventEmitter } from 'eventemitter3';

export type Deferred<T> = {
  completed: boolean;
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
};

export type GrpcMetadata = Record<string, string>;
export declare type ServerOutputEvent = 'data' | 'error' | 'complete';
export declare type RemoveListener = () => void;
export declare type DataCallback = (data: Uint8Array) => void;
export declare type ErrorCallback = (reason: any) => void;
export declare type CompleteCallback = () => void;
export declare type ServerOutputEventCallback<T> = T extends 'data'
  ? DataCallback
  : T extends 'complete'
  ? CompleteCallback
  : T extends 'error'
  ? ErrorCallback
  : never;
export interface GrpcServerOutputStream {
  on<T extends ServerOutputEvent>(
    event: T,
    callback: ServerOutputEventCallback<T>
  ): RemoveListener;
}

export class ServerOutputStream implements GrpcServerOutputStream {
  #emitter = new EventEmitter<ServerOutputEvent>();

  on<T extends ServerOutputEvent>(
    event: T,
    callback: ServerOutputEventCallback<T>
  ) {
    this.#emitter.addListener(event, callback);

    return () => {
      this.#emitter.removeListener(event, callback);
    };
  }

  notifyData(data: Uint8Array): void {
    this.#emitter.emit('data', data);
  }

  notifyComplete(): void {
    this.#emitter.emit('complete');
  }

  notifyError(reason: any): void {
    this.#emitter.emit('error', reason);
  }
}

export type DeferredCalls = {
  headers?: Deferred<GrpcMetadata>;
  response?: Deferred<Uint8Array>;
  trailers?: Deferred<GrpcMetadata>;
  data?: ServerOutputStream;
};

export type DeferredCallMap = Map<number, DeferredCalls>;

export class GrpcError extends Error {
  constructor(
    public error: string,
    public code?: number,
    public trailers?: GrpcMetadata
  ) {
    super(error);
  }
}

type GrpcEventType = 'response' | 'error' | 'headers' | 'trailers';

type GrpcEventPayload =
  | {
      type: 'response';
      payload: string;
    }
  | {
      type: 'error';
      error: string;
      code?: number;
      trailers?: GrpcMetadata;
    }
  | {
      type: 'headers';
      payload: GrpcMetadata;
    }
  | {
      type: 'trailers';
      payload: GrpcMetadata;
    }
  | {
      type: 'status';
      payload: number;
    };
export type GrpcEvent = {
  id: number;
  type: GrpcEventType;
} & GrpcEventPayload;

export type GrpcRequestObject = {
  data: string;
};

export type GrpcClientSettings = {
  host: string;
  insecure?: boolean;
  compression?: boolean;
  compressionName?: string;
  compressionLimit?: number;
  responseLimit?: number;
  keepalive?: boolean;
  keepaliveInterval?: number;
  keepaliveTimeout?: number;
  requestTimeout?: number;
};
type GrpcOptions = GrpcClientSettings;

export type GrpcType = {
  setGrpcSettings(id: number, settings: GrpcOptions): void;
  destroyClient(id: number): void;
  unaryCall(
    callId: number,
    clientId: number,
    path: string,
    obj: GrpcRequestObject,
    requestHeaders?: GrpcMetadata
  ): Promise<void>;
  serverStreamingCall(
    callId: number,
    clientId: number,
    path: string,
    obj: GrpcRequestObject,
    requestHeaders?: GrpcMetadata
  ): Promise<void>;
  cancelGrpcCall: (id: number) => Promise<boolean>;
  clientStreamingCall(
    callId: number,
    clientId: number,
    path: string,
    obj: GrpcRequestObject,
    requestHeaders?: GrpcMetadata
  ): Promise<void>;
  finishClientStreaming(id: number): Promise<void>;
};

export type CompletedGrpcUnaryCall = {
  readonly method: string;
  readonly requestHeaders: GrpcMetadata;
  readonly request: Uint8Array;
  readonly headers?: GrpcMetadata;
  readonly response?: Uint8Array;
  readonly status?: number;
  readonly trailers?: GrpcMetadata;
};
