import { Redis } from "@upstash/redis";
import env from "./env.js";

export const redis = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_TOKEN,
});

export const getCache = async (key) => {
  return await redis.get(key);
};

export const setCache = async (key, value, ttl = 600) => {
  await redis.set(key, value, {
    ex: ttl,
  });
};

export const deleteCache = async (key) => {
  await redis.del(key);
};

export const deletePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Redis deletePattern error:", error);
  }
};