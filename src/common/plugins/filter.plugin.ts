import { Schema, Query } from 'mongoose';

export function filterPlugin(schema: Schema): void {
  if (!schema.path('deleted')) {
    schema.add({ deleted: { type: Boolean, default: false } });
  }

  const autoFilterNotDeleted = function (this: Query<any, any>) {
    const filter = this.getFilter();
    if (!('deleted' in filter)) {
      this.setQuery({ ...filter, deleted: false });
    }
  };

  schema.pre('find', autoFilterNotDeleted);
  schema.pre('findOne', autoFilterNotDeleted);
  schema.pre('countDocuments', autoFilterNotDeleted);
}
