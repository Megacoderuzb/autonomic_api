type Primitive = string | number | boolean | null | undefined;
type NestedObject = {
  [key: string]: Primitive | NestedObject | NestedObject[];
};
type Item = Record<string, unknown>;

type FilterByLang = (
  items: Item[] | Item,
  lang: string,
  fieldPaths: string[],
) => Item[] | Item;

const filterByLang: FilterByLang = (items, lang, fieldPaths): Item[] | Item => {
  if (!lang) return items;

  const langSuffix = lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
  const allLangSuffixes = ['Uz', 'Ru', 'En'];

  const deepClone = (obj: Item): Item =>
    JSON.parse(JSON.stringify(obj)) as Item;

  const processField = (obj: NestedObject, fieldPath: string[]): void => {
    let current: NestedObject | undefined = obj;
    const lastIndex = fieldPath.length - 1;

    for (let i = 0; i < lastIndex; i++) {
      const key = fieldPath[i];
      if (
        typeof current[key] !== 'object' ||
        current[key] === null ||
        Array.isArray(current[key])
      ) {
        return;
      }
      current = current[key];
    }

    const lastField = fieldPath[lastIndex];
    const langField = `${lastField}${langSuffix}`;

    if (current && Object.prototype.hasOwnProperty.call(current, langField)) {
      (current as Record<string, unknown>)[lastField] = (
        current as Record<string, unknown>
      )[langField];

      allLangSuffixes.forEach((suffix) => {
        const fieldWithSuffix = `${lastField}${suffix}`;
        if (Object.prototype.hasOwnProperty.call(current, fieldWithSuffix)) {
          delete (current as Record<string, unknown>)[fieldWithSuffix];
        }
      });
    }
  };

  const processItem = (item: Item): Item => {
    const source =
      '_doc' in item && typeof item._doc === 'object' ? item._doc : item;
    const newItem = deepClone(source as Item);

    fieldPaths.forEach((fieldPath) => {
      processField(newItem as NestedObject, fieldPath.split('.'));
    });

    return newItem;
  };

  if (Array.isArray(items)) {
    return items.map((item) => processItem(item));
  }

  return processItem(items);
};

export default filterByLang;
