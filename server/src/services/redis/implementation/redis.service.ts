import redis from "../../../config/redis";
import { IRedisService } from "../interface/IRedisService";

export class RedisService implements IRedisService {
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await redis.set(key, value, "EX", ttl);
    } else {
      await redis.set(key, value);
    }
  }
  async get(key: string): Promise<string | null> {
    return await redis.get(key);
  }
  async del(key: string): Promise<void> {
    await redis.del(key);
  }
}
