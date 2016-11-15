# Blockstack Desktop App

+ [Installation](#installation)
	+ [Toggling Chrome DevTools](#toggling-chrome-devtools)
	+ [Toggling Redux DevTools](#toggling-redux-devtools)
+ [Development](#development)
+ [Packaging](#packaging)

## Installation

```bash
npm install
```

*Requirements: node >= 4, npm >= 2*

## Development

Run the following command:

```bash
npm run dev
```

It starts two processes, `npm run hot-server` and `npm run start-hot`, which start the server and client respectively.
If the terminal displays `webpack: bundle is now VALID.` and the browser still doesn't display any content, you'll need to 
instruct the browser to reload the content by selecting Reload from the View menu.

#### Toggling Chrome DevTools

- OS X: <kbd>Cmd</kbd> <kbd>Alt</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Linux: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>

*See [electron-debug](https://github.com/sindresorhus/electron-debug) for more information.*

#### Toggling Redux DevTools

- All platforms: <kbd>Ctrl+H</kbd>

*See [redux-devtools-dock-monitor](https://github.com/gaearon/redux-devtools-dock-monitor) for more information.*

## Packaging

To package apps for your platform only:

```bash
npm run package
```

To package apps for all platforms:

```bash
npm run package-all
```
