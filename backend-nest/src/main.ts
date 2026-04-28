import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import type { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configuredOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([
    ...configuredOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);
  const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  const allowOrigin: CustomOrigin = (origin, callback) => {
    // Allow non-browser clients and local dev servers that use random ports.
    if (!origin || allowedOrigins.has(origin) || localDevOriginPattern.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  };

  app.enableCors({
    origin: allowOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = Number(process.env.PORT ?? 4000);

  try {
    await app.listen(port, '0.0.0.0');
    logger.log(`Server listening on port ${port}`);
  } catch (error: unknown) {
    const listenError = error as NodeJS.ErrnoException;

    if (listenError?.code === 'EADDRINUSE') {
      logger.error(
        `Port ${port} is already in use. Stop the existing process or change PORT in backend-nest/.env before starting the server again.`,
      );
      await app.close();
      process.exit(1);
    }

    throw error;
  }
}
bootstrap();
