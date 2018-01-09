# silly
Silly text game

## Installing

Install node, npm, and gulp. For adding content, you should install also Typescript (`tsc`).

Then simply:

`npm install .`

## Building

`npm run build -- -b dev`

The built app will be in `build`.

## Running

Run the local content server with `node server/server.js`.

Then start the development Webpack server:

`npm run develop -- -b dev`

## Adding content

Modify or add `.json` files in `server/content/`. Some sort of format documentation can be found in the `types/` folder.

Type check content with `gulp typecheck` (requires `tsc` in the path):

`gulp typecheck --file server/content/core/area-bedroom.json --type area`

This might be very unreliable right now

