# silly
Silly text game

## Installing

Install node, npm, and gulp globally. For type checking, install also Typescript (`tsc`).

`npm install .`

Also install gulp globally.

Uses Ramda and Bacon.js on the client.

## Building

`gulp build`.

The built app will be in ./build/.

## Running

Run the local server with `node server/server.js`.

Browse to `http://localhost:3000/build/index.html`.

## Adding content

Modify or add `.json` files in `server/content/`. Some sort of format documentation can be found in the `types/` folder.

Type check content with `gulp typecheck` (requires `tsc` in the path):

`gulp typecheck --file server/content/core/area-bedroom.json --type area`

