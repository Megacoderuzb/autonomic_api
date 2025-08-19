import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MulterModule } from '@nestjs/platform-express';
import { TranslationsModule } from './modules/translations/translations.module';
import { LoggerMiddleware } from './core/middleware/logger.middleware';
import { GlobalJwtModule } from './core/config/jwt.module';
import { DatabaseModule } from './core/config/database.module';
import { GlobalConfigModule } from './core/config/config.module';
import { UsersModule } from './modules/users/users.module';
import { Counter, CounterSchema } from './schemas/Counter.schema';
import { FilesModule } from './modules/files/files.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AdminsModule } from './modules/admins/admins.module';
import { ContactTelegramModule } from './modules/telegram/telegram.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),
    GlobalConfigModule,
    DatabaseModule,
    GlobalJwtModule,
    MulterModule.register({
      dest: './uploads',
    }),
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    TranslationsModule,
    UsersModule,
    FilesModule,
    SettingsModule,
    AdminsModule,
    ContactTelegramModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('');
  }
}
