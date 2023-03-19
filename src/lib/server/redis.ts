import { REDIS_URL } from '$env/static/private'
import { Redis } from 'ioredis'

const redis = global.redis || new Redis(REDIS_URL)
if (process.env.NODE_ENV === 'development') global.redis = redis

export default redis
