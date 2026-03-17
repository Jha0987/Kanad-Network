class CacheService {
  constructor() {
    this.memoryStore = new Map();
    this.redisClient = null;
    this.redisEnabled = false;
  }

  async connect() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return false;
    }

    try {
      const { createClient } = await import('redis');
      this.redisClient = createClient({ url: redisUrl });
      this.redisClient.on('error', () => {
        this.redisEnabled = false;
      });
      await this.redisClient.connect();
      this.redisEnabled = true;
      return true;
    } catch (error) {
      this.redisEnabled = false;
      return false;
    }
  }

  async get(key) {
    if (this.redisEnabled) {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key, value, ttlSeconds = 60) {
    if (this.redisEnabled) {
      await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
      return;
    }

    this.memoryStore.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }

  async delByPrefix(prefix) {
    if (this.redisEnabled) {
      const keys = await this.redisClient.keys(`${prefix}*`);
      if (keys.length) await this.redisClient.del(keys);
      return;
    }

    for (const key of this.memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryStore.delete(key);
      }
    }
  }
}

export default new CacheService();
