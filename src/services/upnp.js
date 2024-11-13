const debug = require('debug')('renderer:upnp');
const SSDP = require('node-ssdp').Server;
const http = require('http');
const os = require('os');

class UPnPService {
  constructor(config) {
    this.config = config;
    this.handlers = new Map();
    this.ssdp = null;
    this.httpServer = null;
  }

  async start() {
    debug('Initializing UPnP service');
    await this.startHttpServer();
    await this.startSSDP();
    debug('UPnP service started');
  }

  async startHttpServer() {
    return new Promise((resolve) => {
      this.httpServer = http.createServer((req, res) => {
        if (req.url === '/description.xml') {
          res.writeHead(200, { 'Content-Type': 'application/xml' });
          res.end(this.generateDeviceDescription());
        } else {
          res.writeHead(404);
          res.end();
        }
      });

      this.httpServer.listen(this.config.upnp.port, () => {
        debug(`HTTP server listening on port ${this.config.upnp.port}`);
        resolve();
      });
    });
  }

  async startSSDP() {
    const location = `http://${this.getLocalIP()}:${this.config.upnp.port}/description.xml`;
    
    this.ssdp = new SSDP({
      location,
      udn: `uuid:${this.config.device.serialNumber}`,
      sourcePort: 1900
    });

    this.ssdp.addUSN('upnp:rootdevice');
    this.ssdp.addUSN('urn:schemas-upnp-org:device:MediaRenderer:1');
    this.ssdp.addUSN('urn:schemas-upnp-org:service:AVTransport:1');
    this.ssdp.addUSN('urn:schemas-upnp-org:service:RenderingControl:1');

    this.ssdp.start();
    debug('SSDP server started');
  }

  async stop() {
    if (this.ssdp) {
      this.ssdp.stop();
    }
    if (this.httpServer) {
      await new Promise(resolve => this.httpServer.close(resolve));
    }
    debug('UPnP service stopped');
  }

  getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
      for (const addr of iface) {
        if (addr.family === 'IPv4' && !addr.internal) {
          return addr.address;
        }
      }
    }
    return '127.0.0.1';
  }

  generateDeviceDescription() {
    return `<?xml version="1.0"?>
<root xmlns="urn:schemas-upnp-org:device-1-0">
  <specVersion>
    <major>1</major>
    <minor>0</minor>
  </specVersion>
  <device>
    <deviceType>urn:schemas-upnp-org:device:MediaRenderer:1</deviceType>
    <friendlyName>${this.config.device.friendlyName}</friendlyName>
    <manufacturer>${this.config.device.manufacturer}</manufacturer>
    <manufacturerURL>${this.config.device.manufacturerURL}</manufacturerURL>
    <modelName>${this.config.device.modelName}</modelName>
    <modelNumber>${this.config.device.modelNumber}</modelNumber>
    <modelDescription>${this.config.device.modelDescription}</modelDescription>
    <UDN>uuid:${this.config.device.serialNumber}</UDN>
    <serviceList>
      <service>
        <serviceType>urn:schemas-upnp-org:service:AVTransport:1</serviceType>
        <serviceId>urn:upnp-org:serviceId:AVTransport</serviceId>
        <SCPDURL>/AVTransport.xml</SCPDURL>
        <controlURL>/AVTransport/control</controlURL>
        <eventSubURL>/AVTransport/event</eventSubURL>
      </service>
      <service>
        <serviceType>urn:schemas-upnp-org:service:RenderingControl:1</serviceType>
        <serviceId>urn:upnp-org:serviceId:RenderingControl</serviceId>
        <SCPDURL>/RenderingControl.xml</SCPDURL>
        <controlURL>/RenderingControl/control</controlURL>
        <eventSubURL>/RenderingControl/event</eventSubURL>
      </service>
    </serviceList>
  </device>
</root>`;
  }

  on(event, handler) {
    this.handlers.set(event, handler);
  }

  emit(event, ...args) {
    const handler = this.handlers.get(event);
    if (handler) {
      return handler(...args);
    }
    return false;
  }
}

module.exports = { UPnPService };