import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.use((req, res, next) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        next();
    });
    await app.listen(3000);
}
bootstrap();