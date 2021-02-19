export function isString(value: any): boolean {
  return typeof value === 'string';
}

export function isNumber(value: any): boolean {
  return typeof value === 'number';
}

export function isArrayContainsOnlyString(array: any[]): boolean {
  return array.every(isString);
}
