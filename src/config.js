const os = require('os');

function getDefaultConfig() {
  return {
    device: {
      friendlyName: 'Debian Audio Renderer',
      manufacturer: 'Custom',
      manufacturerURL: 'http://example.com',
      modelName: 'Audio Renderer',
      modelNumber: '1.0',
      modelDescription: 'UPnP Audio Renderer for Debian Linux',
      serialNumber: generateSerialNumber()
    },
    upnp: {
      port: 49494
    },
    audio: {
      device: 'default',
      sampleRate: 48000,
      channels: 2,
      format: 'S16_LE'
    }
  };
}

function generateSerialNumber() {
  return `${os.hostname()}-${Date.now()}`;
}

module.exports = {
  config: getDefaultConfig()
};