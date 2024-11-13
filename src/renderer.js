const debug = require('debug')('renderer:core');
const { UPnPService } = require('./services/upnp');
const { AudioService } = require('./services/audio');

class AudioRenderer {
  constructor(config) {
    this.config = config;
    this.upnpService = new UPnPService(config);
    this.audioService = new AudioService(config);
  }

  async start() {
    debug('Starting Audio Renderer');
    await this.initializeServices();
    this.setupEventHandlers();
    debug('Audio Renderer started successfully');
  }

  async stop() {
    debug('Stopping Audio Renderer');
    await Promise.all([
      this.audioService.stop(),
      this.upnpService.stop()
    ]);
    debug('Audio Renderer stopped');
  }

  async initializeServices() {
    await this.upnpService.start();
    this.bindUPnPHandlers();
  }

  setupEventHandlers() {
    process.on('SIGTERM', () => this.stop());
    debug('Event handlers configured');
  }

  bindUPnPHandlers() {
    this.upnpService.on('setTransportURI', (uri) => this.handleSetTransportURI(uri));
    this.upnpService.on('play', () => this.handlePlay());
    this.upnpService.on('stop', () => this.handleStop());
    this.upnpService.on('pause', () => this.handlePause());
  }

  async handleSetTransportURI(uri) {
    try {
      await this.audioService.play(uri);
      return true;
    } catch (error) {
      debug('Failed to set transport URI:', error);
      return false;
    }
  }

  async handlePlay() {
    return true; // Playback starts automatically when URI is set
  }

  async handleStop() {
    return this.audioService.stop();
  }

  async handlePause() {
    return this.audioService.stop();
  }
}

module.exports = { AudioRenderer };