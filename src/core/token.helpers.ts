export const getTokenWithoutBearer = (authorization: string) =>
  authorization.split('Bearer')[1].trim();
