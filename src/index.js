const debug = require('debug')('renderer:main');
const { AudioRenderer } = require('./renderer');
const { config } = require('./config');

process.on('unhandledRejection', (error) => {
  debug('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  debug('Uncaught exception:', error);
  process.exit(1);
});

async function main() {
  try {
    const renderer = new AudioRenderer(config);
    await renderer.start();
    
    process.on('SIGINT', async () => {
      debug('Shutting down...');
      await renderer.stop();
      process.exit(0);
    });
  } catch (error) {
    debug('Failed to start renderer:', error);
    process.exit(1);
  }
}

main();