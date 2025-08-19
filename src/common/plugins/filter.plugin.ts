import { Schema, Query } from 'mongoose';

export function filterPlugin(schema: Schema): void {
  if (!schema.path('isDeleted')) {
    schema.add({ isDeleted: { type: Boolean, default: false } });
  }

  const autoFilterNotDeleted = function (this: Query<any, any>) {
    const filter = this.getFilter();
    if (!('isDeleted' in filter)) {
      this.setQuery({ ...filter, isDeleted: false });
    }
  };

  schema.pre('find', autoFilterNotDeleted);
  schema.pre('findOne', autoFilterNotDeleted);
  schema.pre('countDocuments', autoFilterNotDeleted);
}
