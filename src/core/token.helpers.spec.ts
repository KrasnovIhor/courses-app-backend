import { getTokenWithoutBearer } from './token.helpers';

describe('token helpers', () => {
  describe('getTokenWithoutBearer', () => {
    it('should return token without Bearer prefix', () => {
      expect(getTokenWithoutBearer('Bearer test')).toBe('test');
    });
  });
});
