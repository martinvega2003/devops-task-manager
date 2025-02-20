import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

// Start server
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
