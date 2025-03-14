import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

// Start server
const PORT = process.env.PORT || 5002;

app.listen(PORT, '0.0.0.0', () => { //0.0.0.0 allows the app to listen on all network interfaces, not just localhost or 127.0.0.1.
  console.log(`Server started on port ${PORT}`);
});
