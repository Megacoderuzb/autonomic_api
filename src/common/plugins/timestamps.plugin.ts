import { Schema, Document } from 'mongoose';

export function timestampsPlugin(schema: Schema): void {
  if (!schema.path('createdAt')) {
    schema.add({ createdAt: { type: Date } });
  }

  if (!schema.path('updatedAt')) {
    schema.add({ updatedAt: { type: Date } });
  }

  type TimestampedDoc = Document & {
    createdAt?: number;
    updatedAt?: number;
  };

  schema.pre('save', function (this: TimestampedDoc) {
    const now = Date.now();
    if (this.isNew) {
      this.createdAt = now;
    }
    this.updatedAt = now;
  });

  schema.pre('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
  });

  schema.pre('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
  });
}
