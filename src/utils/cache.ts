import NodeCache from 'node-cache';
import { AuditResult } from '../types';

// Create cache with 5 minute expiry
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check every minute
  maxKeys: 1000 // Store max 1000 URLs
});

export function getFromCache(url: string): AuditResult | undefined {
  const key = `audit:${url}`;
  return cache.get<AuditResult>(key);
}

export function saveToCache(url: string, result: AuditResult): void {
  const key = `audit:${url}`;
  cache.set(key, result);
}

export function clearCache(): void {
  cache.flushAll();
}