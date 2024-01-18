// Mapper for environment variables
export const environment = process.env.NODE_ENV;
export const port = process.env.PORT;
export const timezone = process.env.TZ;

export const db = {
  name: process.env.DB_NAME || '',
  host: process.env.DB_HOST || '',
  port: process.env.DB_PORT || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_USER_PWD || '',
};

export const corsUrl = process.env.CORS_URL;

export const tokenInfo = {
  accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || '0'),
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY_SEC || '0'),
  issuer: process.env.TOKEN_ISSUER || '',
  audience: process.env.TOKEN_AUDIENCE || '',
};

export const logDirectory = process.env.LOG_DIR;

export const redis = {
  host: process.env.REDIS_HOST || '',
  port: parseInt(process.env.REDIS_PORT || '0'),
  password: process.env.REDIS_PASSWORD || '',
};

export const caching = {
  contentCacheDuration: parseInt(
    process.env.CONTENT_CACHE_DURATION_MILLIS || '600000',
  ),
};

// Cookie options
export const accessTokenCookieOptions = {
  expires: new Date(
    Date.now() +
      (process.env.ACCESS_COOKIE_EXPIRES_IN &&
      !isNaN(Number(process.env.ACCESS_COOKIE_EXPIRES_IN))
        ? Number(process.env.ACCESS_COOKIE_EXPIRES_IN) * 60 * 1000
        : 600000), // Default value if the environment variable is not set or is not a valid number
  ),
  maxAge: 24 * 60 * 1000,
  httpOnly: false,
  sameSite: 'lax',
};

export const refreshTokenCookieOptions = {
  expires: new Date(
    Date.now() +
      (process.env.ACCESS_COOKIE_EXPIRES_IN &&
      !isNaN(Number(process.env.ACCESS_COOKIE_EXPIRES_IN))
        ? Number(process.env.ACCESS_COOKIE_EXPIRES_IN) * 60 * 1000
        : 600000), // Default value if the environment variable is not set or is not a valid number
  ),
  // maxAge: process.env.REFRESH_COOKIE_EXPIRES_IN * 60 * 1000,
  maxAge: 59 * 60 * 1000,
  httpOnly: false,
  sameSite: 'lax',
};
