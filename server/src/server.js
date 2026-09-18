import './config/env.js';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5001;

// Verify database connection
await connectDB();

app.listen(PORT, () => {
  console.log(`Quantum Server running on port ${PORT}`);
});
