import axios from "axios";

const instance = axios.create({ baseURL: "/api/analytics", timeout: 25_000 });
const CACHE_TTL_MS = 60_000;
const MAX_ENTRIES = 100;
const responses = new Map();
const pending = new Map();
let generation = 0;
const originalGet = instance.get.bind(instance);
const cacheKey = (url, config = {}) =>
  instance.getUri({ ...config, url, method: "get" });

const getCachedEnvelope = (url, config = {}) => {
  const key = cacheKey(url, config);
  const entry = responses.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    responses.delete(key);
    return undefined;
  }
  return entry.response;
};
export const hasCachedResponse = (url, config = {}) =>
  getCachedEnvelope(url, config) !== undefined;
export const clearGetResponseCache = () => {
  generation += 1;
  responses.clear();
  pending.clear();
};

instance.get = (url, config = {}) => {
  const key = cacheKey(url, config);
  const cached = getCachedEnvelope(url, config);
  if (cached) return Promise.resolve(cached);
  if (pending.has(key)) return pending.get(key);
  const requestGeneration = generation;
  const request = originalGet(url, config)
    .then((response) => {
      if (generation === requestGeneration) {
        if (responses.size >= MAX_ENTRIES)
          responses.delete(responses.keys().next().value);
        responses.set(key, { response, expiresAt: Date.now() + CACHE_TTL_MS });
      }
      return response;
    })
    .finally(() => {
      if (pending.get(key) === request) pending.delete(key);
    });
  pending.set(key, request);
  return request;
};

// Existing reports expect cached response bodies rather than Axios envelopes.
export const getCachedResponse = (url, config) =>
  getCachedEnvelope(url, config)?.data;

instance.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401 && typeof window !== "undefined") {
    clearGetResponseCache();
    window.location.assign("/login");
  } else if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("analytics:request-error"));
  }
  return Promise.reject(error);
});

export default instance;
