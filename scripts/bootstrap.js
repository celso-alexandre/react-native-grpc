const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const options = {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
  encoding: 'utf-8',
};

let result;

if (process.cwd() !== root || args.length) {
  // We're not in the root of the project, or additional arguments were passed
  // In this case, forward the command to `yarn`
  result = child_process.spawnSync('yarn', args, options);
} else {
  // If `yarn` is run without arguments, perform bootstrap
  result = child_process.spawnSync('yarn', ['bootstrap'], options);
}

const scriptsDest = path.join(
  root,
  'example/node_modules/@celsoalexandre/react-native-grpc/scripts'
);

if (!fs.existsSync(path.dirname(scriptsDest))) {
  fs.mkdirSync(scriptsDest, {
    recursive: true,
  });
}

process.exitCode = result.status;
