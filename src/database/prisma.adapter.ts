import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DatabasePort } from './database.port';

@Injectable()
export class PrismaAdapter extends PrismaClient implements DatabasePort {
  async create<Entity>(model: string, data: Partial<Entity>): Promise<Entity> {
    return this[model].create({ data });
  }

  async findOne<Entity>(model: string, where: Partial<Entity>): Promise<Entity | null> {
    return this[model].findUnique({ where });
  }

  async findAll<Entity>(model: string, where?: Partial<Entity>): Promise<Entity[]> {
    return this[model].findMany({ where });
  }

  async update<Entity>(model: string, where: Partial<Entity>, data: Partial<Entity>): Promise<Entity> {
    return this[model].update({ where, data });
  }

  async delete<Entity>(model: string, where: Partial<Entity>): Promise<void> {
    await this[model].delete({ where });
  }
}
