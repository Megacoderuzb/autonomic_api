export type CustomQuery = {
  page?: number;
  limit?: number | 'all';
  baseUrl?: string;
  filter?: object;
  populate?: string[];
  [key: string]: any;
};
