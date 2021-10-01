# DJ Slice!
Built with [A-Frame](https://aframe.io), a web framework for building virtual reality experiences.

## Overview

This is a work in progress.

## Development

### Install the required components:

This is known to work from a clean version of npm.

```
npm install -g npm
npm install -D node
npm install -g typescript
npm install -g webpack
npm install -D webpack-cli
npm i -g webpack-cli
npm i --save-dev html-webpack-plugin
npm install -g three
npm install -g aframe
npm install -g @types/aframe
npm i --save-dev @types/aframe
```

### Building and deploying

From the dj-slice directory:

```
tsc -p ts/tsconfig.json

webpack
```

Start an HTTP server from python (you can leave this running):

```
python3 -m http.server 8888
```

Then you can browse to the page on localhost:

http://localhost:8888/dist

Happy coding!