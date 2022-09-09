import { env } from 'process';

export default {
  origin: (
    env.NODE_ENV === 'production'
      ? [env.API_HOST]
      : ['http://127.0.0.1:3000', 'http://0.0.0.0:3000', 'http://localhost:3000']
  ),
  allowedHeaders: ['Content-Type', 'Authentication', 'Refresh'],
  credentials: true
};