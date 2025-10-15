import { Global, Module } from '@nestjs/common';
import { PrismaAdapter } from './prisma.adapter';

@Global()
@Module({
  providers: [PrismaAdapter],
  exports: [PrismaAdapter],
})
export class DatabaseModule {}
