import { isNumber, isString } from './common.helpers';

describe('common helpers', () => {
  describe('isString', () => {
    it('should check for the string type correctly', () => {
      expect(isString('')).toBeTruthy();
      expect(isString(null)).toBeFalsy();
      expect(isString(1)).toBeFalsy();
      expect(isString(undefined)).toBeFalsy();
      expect(isString({})).toBeFalsy();
      expect(isString([])).toBeFalsy();
    });
  });

  describe('isNumber', () => {
    it('should check for the number type correctly', () => {
      expect(isNumber(1)).toBeTruthy();
      expect(isNumber('')).toBeFalsy();
      expect(isNumber(null)).toBeFalsy();
      expect(isNumber(undefined)).toBeFalsy();
      expect(isNumber({})).toBeFalsy();
      expect(isNumber([])).toBeFalsy();
    });
  });
});
