export interface DatabasePort {
  create<Entity>(model: string, data: Partial<Entity>): Promise<Entity>;
  findOne<Entity>(model: string, where: Partial<Entity>): Promise<Entity | null>;
  findAll<Entity>(model: string, where?: Partial<Entity>): Promise<Entity[]>;
  update<Entity>(model: string, where: Partial<Entity>, data: Partial<Entity>): Promise<Entity>;
  delete<Entity>(model: string, where: Partial<Entity>): Promise<void>;
}
