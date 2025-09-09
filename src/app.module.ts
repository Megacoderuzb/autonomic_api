import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MulterModule } from '@nestjs/platform-express';
import { TranslationsModule } from './modules/translations/translations.module';
import { LoggerMiddleware } from './core/middleware/logger.middleware';
import { GlobalJwtModule } from './core/config/jwt.module';
import { DatabaseModule } from './core/config/database.module';
import { GlobalConfigModule } from './core/config/config.module';
import { Counter, CounterSchema } from './schemas/Counter.schema';
import { FilesModule } from './modules/files/files.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AdminsModule } from './modules/admins/admins.module';
import { ContactTelegramModule } from './modules/telegram/telegram.module';
import { BrandModule } from './modules/brand/brand.module';
import { ColorModule } from './modules/color/color.module';
import { ModelsModule } from './modules/models/models.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ClientTypesModule } from './modules/client-types/client-types.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductsModule } from './modules/products/products.module';
import { CreditTypesModule } from './modules/credit-types/credit-types.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    // MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb'),
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    TranslationsModule,
    FilesModule,
    SettingsModule,
    AdminsModule,
    ContactTelegramModule,
    BrandModule,
    ColorModule,
    ModelsModule,
    ClientsModule,
    ClientTypesModule,
    CategoryModule,
    ProductsModule,
    CreditTypesModule,
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
