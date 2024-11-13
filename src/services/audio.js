const debug = require('debug')('renderer:audio');
const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');

class AudioService {
  constructor(config) {
    this.config = config;
    this.currentStream = null;
  }

  async play(uri) {
    debug('Starting audio playback:', uri);
    if (this.currentStream) {
      await this.stop();
    }

    return new Promise((resolve, reject) => {
      try {
        const transcoder = this.createTranscoder(uri);
        const player = this.createPlayer();
        
        transcoder.pipe(player.stdin);

        player.on('error', (error) => {
          debug('Player error:', error);
          reject(error);
        });

        this.currentStream = {
          transcoder,
          player,
          kill: () => {
            transcoder.kill();
            player.kill();
          }
        };

        resolve();
      } catch (error) {
        debug('Failed to start playback:', error);
        reject(error);
      }
    });
  }

  async stop() {
    if (this.currentStream) {
      this.currentStream.kill();
      this.currentStream = null;
      debug('Playback stopped');
    }
    return true;
  }

  createTranscoder(uri) {
    return ffmpeg(uri)
      .format('wav')
      .audioFrequency(this.config.audio.sampleRate)
      .audioChannels(this.config.audio.channels)
      .audioCodec('pcm_s16le');
  }

  createPlayer() {
    return spawn('aplay', [
      '-D', this.config.audio.device,
      '-f', this.config.audio.format,
      '-c', this.config.audio.channels,
      '-r', this.config.audio.sampleRate
    ]);
  }
}

module.exports = { AudioService };