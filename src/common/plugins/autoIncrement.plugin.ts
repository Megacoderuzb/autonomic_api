import { Schema } from 'mongoose';
import { CounterDocument } from 'src/schemas/Counter.schema';

interface AutoIncrementOptions {
  field?: string;
  modelName: string;
}

export function AutoIncrement(
  schema: Schema,
  options: AutoIncrementOptions,
): void {
  const fieldName = options.field || '_id';
  const modelName = options.modelName;

  schema.add({ [fieldName]: Number });

  schema.pre('save', async function (next): Promise<void> {
    if (this.isNew) {
      const counterModel = this.$model('Counter');
      const counter: CounterDocument = await counterModel.findByIdAndUpdate(
        modelName,
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );

      if (counter) {
        this._id = counter.seq;
      }
    }
    next();
  });
}
