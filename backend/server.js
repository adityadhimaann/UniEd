import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import { connectRedis } from './src/config/redis.js';
import { configureCloudinary } from './src/config/cloudinary.js';
import { initializeSocket } from './src/socket/socketHandler.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (optional - won't crash if fails)
    await connectRedis();

    // Configure Cloudinary
    configureCloudinary();

    // Create HTTP server
    const server = createServer(app);

    // Initialize Socket.io
    initializeSocket(server);

    // Start server
    server.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api/v1`);
      console.log(`🔌 Socket.io: ws://localhost:${PORT}`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log('═══════════════════════════════════════════');
      console.log('');
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
