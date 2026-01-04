import app from './app';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  server.close(async () => {
    const { cacheService } = await import('./services/cache.service');
    await cacheService.disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  server.close(async () => {
    const { cacheService } = await import('./services/cache.service');
    await cacheService.disconnect();
    process.exit(0);
  });
});

