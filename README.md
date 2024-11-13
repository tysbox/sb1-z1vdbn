# UPnP Audio Renderer for Debian

A UPnP audio renderer implementation that uses `aplay` for audio playback.

## Prerequisites

```bash
# Install required system packages
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  libupnp-dev \
  alsa-utils \
  ffmpeg

# Install Node.js dependencies
npm install
```

## Usage

```bash
# Start the renderer
DEBUG=renderer:* npm start
```

## Configuration

Edit `src/config.js` to modify:
- Device information
- Network interfaces
- Audio settings
- UPnP port

## Features

- UPnP MediaRenderer device
- Audio format transcoding with FFmpeg
- ALSA audio output
- Automatic network interface detection
- Graceful shutdown handling