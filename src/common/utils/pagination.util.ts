import { FilterQuery, Model } from 'mongoose';
import { CustomQuery } from '../types/Query.type';

function buildUrl(
  baseUrl: string,
  page: number,
  perPage: number,
  filter: Record<string, any> = {},
  isAll = false,
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', isAll ? 'all' : perPage.toString());

  if (Object.keys(filter).length > 0) {
    url.searchParams.set('filter', JSON.stringify(filter));
  }

  return url.toString();
}

function normalizeQuery(query: {
  [key: string]: string | string[];
}): CustomQuery {
  const getSingle = (val: string | string[] | undefined): string | undefined =>
    Array.isArray(val) ? val[0] : val;

  const normalizedQuery: CustomQuery = {
    page: query.page ? parseInt(getSingle(query.page) || '1', 10) : 1,
    limit:
      query.limit === 'all'
        ? 'all'
        : parseInt(getSingle(query.limit) || '10', 10),
    baseUrl: getSingle(query.baseUrl),
    populate: Array.isArray(query.populate)
      ? query.populate
      : query.populate
        ? [query.populate]
        : undefined,
    sort: Array.isArray(query.sort)
      ? query.sort
      : query.sort
        ? [query.sort]
        : undefined,
    filter: {},
  };

  for (const key in query) {
    if (key.startsWith('filter[') && key.endsWith(']')) {
      const filterKey = key.slice(7, -1);
      normalizedQuery.filter![filterKey] = getSingle(query[key]);
    }
  }

  return normalizedQuery;
}

function normalizeSort(
  sort: string | string[] | undefined,
): Record<string, 1 | -1> | undefined {
  if (!sort) return undefined;

  const sortArray = Array.isArray(sort) ? sort : [sort];
  const sortObject: Record<string, 1 | -1> = {};

  for (const field of sortArray) {
    if (field.startsWith('-')) {
      sortObject[field.slice(1)] = -1;
    } else {
      sortObject[field] = 1;
    }
  }

  return sortObject;
}
export async function paginate(
  model: Model<any>,
  query: CustomQuery,
  populateConfig?: string[],
) {
  const normalizedQuery: CustomQuery = normalizeQuery(query);

  const page = Math.max(1, Number(normalizedQuery.page || 1));
  const isAll = normalizedQuery.limit === 'all';
  const perPage = isAll
    ? Number.MAX_SAFE_INTEGER
    : Math.max(1, Math.min(100, Number(normalizedQuery.limit || 10)));
  const filter: FilterQuery<any> = normalizedQuery.filter || {};
  const baseUrl = normalizedQuery.baseUrl || '';
  const skip = (page - 1) * perPage;

  try {
    const queryBuilder = model.find(filter);

    if (normalizedQuery.sort) {
      queryBuilder.sort(normalizeSort(normalizedQuery.sort));
    }

    if (!isAll) {
      queryBuilder.skip(skip).limit(perPage);
    }

    if (populateConfig?.length) {
      for (const field of populateConfig) {
        queryBuilder.populate(field);
      }
    }

    const [data, totalCount] = await Promise.all([
      queryBuilder.exec(),
      model.countDocuments(filter),
    ]);

    const totalPages = isAll ? 1 : Math.ceil(totalCount / perPage);

    return {
      data,
      _meta: {
        currentPage: isAll ? 1 : page,
        perPage: isAll ? totalCount : perPage,
        totalCount,
        totalPages,
      },
      _links: {
        self: buildUrl(baseUrl, isAll ? 1 : page, perPage, filter, isAll),
        first: buildUrl(baseUrl, 1, perPage, filter, isAll),
        prev:
          isAll || page <= 1
            ? null
            : buildUrl(baseUrl, page - 1, perPage, filter, isAll),
        next:
          isAll || page >= totalPages
            ? null
            : buildUrl(baseUrl, page + 1, perPage, filter, isAll),
        last: buildUrl(baseUrl, isAll ? 1 : totalPages, perPage, filter, isAll),
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Pagination failed: ${error.message}`);
    }
    throw new Error('Pagination failed: Unknown error');
  }
}
