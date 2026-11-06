import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API route to get local IP addresses for LAN sharing info
app.get('/api/lan-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const name of Object.keys(interfaces)) {
    const netInterface = interfaces[name];
    if (netInterface) {
      for (const net of netInterface) {
        if (net.family === 'IPv4' && !net.internal) {
          addresses.push(net.address);
        }
      }
    }
  }
  res.json({
    port: PORT,
    ipAddresses: addresses,
    school: 'UPTD SDN RAJASINGA 2',
    npsn: '20215757'
  });
});

// Serve static files in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`============================================================`);
  console.log(`📚 BUKU INDUK DIGITAL & ADMINISTRASI UPTD SDN RAJASINGA 2`);
  console.log(`============================================================`);
  console.log(`Server running and accessible on LAN at port ${PORT}`);
  
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const netInterface = interfaces[name];
    if (netInterface) {
      for (const net of netInterface) {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`> Network URL: http://${net.address}:${PORT}`);
        }
      }
    }
  }
  console.log(`> Localhost:   http://localhost:${PORT}`);
  console.log(`============================================================`);
});
