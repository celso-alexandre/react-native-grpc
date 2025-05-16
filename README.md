# react-native-grpc

gRPC for react-native

## Note
This is a direct fork of [@Mitch528/rect-native-grpc](https://github.com/Mitch528/react-native-grpc), go an try out his work first, as it is more feature complete.
I'm not doing serious changes, don't 100% know what I'm doing either; I'm just trying to make the typescript wrapper work in my new expo app.

## Installation

```sh
npm install @celsoalexandre/react-native-grpc
```

## Usage

```ts
import { GrpcClient, GrpcMetadata } from '@celsoalexandre/react-native-grpc';

GrpcClient.setHost('example.com');

// Bring your own protobuf library
// This example uses https://github.com/timostamm/protobuf-ts

const request = ExampleRequest.create({
  message: 'Hello World!',
});

const data: Uint8Array = ExampleRequest.toBinary(request);
const headers: GrpcMetadata = {};

const { response } = await GrpcClient.unaryCall(
  '/example.grpc.service.Examples/SendExampleMessage',
  data,
  headers
);

const responseMessage = ExampleMessage.fromBinary(response);
```

See `examples` project for more advanced usage.

## Limitations

This library currently only supports unary and server-side streaming type RPC calls. PRs are welcome.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
