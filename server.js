// server.js
const http = require('http');
const app = require('./server/index'); // adjust path if index.js is in server/

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
