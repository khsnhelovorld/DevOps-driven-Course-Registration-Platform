import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Registration service listening on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('Registration service failed to start:', err);
  process.exit(1);
});
