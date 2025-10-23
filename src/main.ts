import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { createApp } from './app';
import { config } from './config/env';

const startServer = async () => {
  try {
    // Initialize database connection
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    // Create Express app
    const app = createApp();

    // Start server
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 SISFIN API - Sistema Financeiro         ║
║                                               ║
║   Server running on port ${config.port}               ║
║   Environment: ${config.env}                 ║
║   URL: http://localhost:${config.port}               ║
║                                               ║
║   API Documentation:                          ║
║   http://localhost:${config.port}/health            ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
