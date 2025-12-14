# roll-bot

A Discord bot that calculates dice rolls for tabletop gaming. Written in TypeScript; runs on Node.js.

## Install dependencies:

```
npm install
```

## Run the project:

Compile the project like so:

```
npx tsc
```

Run the project like so:

```
node dist/app.js
```

```
npx tsc && node dist/app.js
```

### For development:

Skip the build step and run like so:

```
npm start
```

This runs the "start" script defined in packages.json.

## Linting:

Run ESLint to fix linting errors like so:

```
npx eslint --cache --fix .
```

List linting errors without fixing:

```
npx eslint --cache .
```

## Formatting:

Format all files with Prettier:

```
npx prettier --cache --write .
```

Format a particular file:

```
npx prettier --cache --write src/app.ts
```

Check formatting without fixing (good for CI):

```
npx prettier --cache --check .
```
