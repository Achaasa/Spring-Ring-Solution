import { createClient } from "redis";

// Use the credentials provided by the Redis service
const redisClient = createClient({
  username: "default", // Use 'default' username if it's the one provided
  password: "hgTVUdGFyOjsZ2Ju0N7z43FfKVgpRUwM", // The password provided
  socket: {
    host: "redis-12094.c10.us-east-1-2.ec2.redns.redis-cloud.com", // The Redis host provided
    port: 12094, // The Redis port provided
  },
});

// Log any errors for easier debugging
redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

export default redisClient;
