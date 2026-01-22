# Bykugan

> Lightweight, cross-browser usage screen recording utility for web and mobile.

Bykugan is a simple wrapper around the MediaRecorder API that specifically target screen recording (via `getDisplayMedia`). It provides an easy-to-use API to start, stop, and save screen recordings.

## Features

- 🎥 **Easy Screen Recording**: Simple `start()` and `stop()` methods.
- 💾 **Auto-Save**: built-in `save()` method to download the recording.
- ⚙️ **Configurable**: Support for custom MediaStreamConstraints and MIME types.
- 📱 **Lightweight**: Zero external dependencies (only dev dependencies).

## Installation

```bash
npm install bykugan
```

## Usage

### Basic Example

```javascript
import { BykuganRecorder } from 'bykugan';

const recorder = new BykuganRecorder();

// Start recording
// This will prompt the user to select a screen/window to share
await recorder.start();

// ... some time later ...

// Stop recording
// Returns a Blob of the recording
const blob = await recorder.stop();

// Download the recording
recorder.save('my-recording.webm');
```

### Checking Support

```javascript
import { BykuganRecorder } from 'bykugan';

if (BykuganRecorder.isSupported()) {
    console.log("Screen recording is supported!");
} else {
    console.warn("Screen recording is not supported in this browser.");
}
```

## API

### `new BykuganRecorder(options)`

Creates a new recorder instance.

- **options** `Object` (optional)
  - `timeSlice` `number`: The number of milliseconds to record into each Blob (default: `1000`).
  - `mimeType` `string`: The MIME type to use for the recording (e.g., `'video/webm'`). If not provided, it attempts to find the best supported type.
  - `constraints` `MediaStreamConstraints`: Constraints passed to `getDisplayMedia` (default: `{ video: true, audio: false }`).

### Methods

#### `recorder.start()`
- Starts the screen capture.
- Returns: `Promise<MediaStream>` - The media stream of the screen capture.

#### `recorder.stop()`
- Stops the recording.
- Returns: `Promise<Blob>` - The recorded video blob.

#### `recorder.save(filename)`
- Downloads the recorded blob to the user's device.
- **filename** `string`: The name of the file to download (default: `'recording.webm'`).

#### `recorder.getBlob()`
- Returns the current recorded `Blob`.

#### `static BykuganRecorder.isSupported()`
- Returns `true` if the browser supports `navigator.mediaDevices.getDisplayMedia` and `MediaRecorder`.

## License

MIT
