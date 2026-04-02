import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { CreditsData, SessionState } from './types.js';
import { fetchCredits, fetchGeneration } from './api.js';

const CREDITS_TTL_MS = 60_000;

const defaultSessionState = (): SessionState => ({
  last_model: '',
  last_provider: '',
  seen_ids: [],
  total_cache_discount: 0,
  total_cost: 0,
});

function readJsonFile<T>(path: string, fallback: T): T {
  if (!existsSync(path)) {
    return fallback;
  }

  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 2));
}

function extractGenerationIds(transcriptPath: string): string[] {
  if (!transcriptPath || !existsSync(transcriptPath)) {
    return [];
  }

  const ids = new Set<string>();
  const lines = readFileSync(transcriptPath, 'utf-8').split('\n');

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    try {
      const entry = JSON.parse(line) as {
        message?: { id?: string };
      };
      const messageId = entry.message?.id;
      if (typeof messageId === 'string' && messageId.startsWith('gen-')) {
        ids.add(messageId);
      }
    } catch {
      continue;
    }
  }

  return [...ids];
}

export async function refreshSessionState(sessionId: string, transcriptPath: string, apiKey: string): Promise<SessionState> {
  const statePath = `/tmp/claude-openrouter-hud-session-${sessionId}.json`;
  const state = readJsonFile<SessionState>(statePath, defaultSessionState());
  const seen = new Set(state.seen_ids);

  for (const id of extractGenerationIds(transcriptPath)) {
    if (seen.has(id)) {
      continue;
    }

    const generation = await fetchGeneration(id, apiKey);
    if (!generation) {
      continue;
    }

    state.total_cost += generation.total_cost ?? 0;
    state.total_cache_discount += generation.cache_discount ?? 0;
    if (generation.provider_name) {
      state.last_provider = generation.provider_name;
    }
    if (generation.model) {
      state.last_model = generation.model;
    }
    state.seen_ids.push(id);
    seen.add(id);
  }

  writeJsonFile(statePath, state);
  return state;
}

export async function refreshCredits(apiKey: string): Promise<CreditsData | null> {
  const cachePath = '/tmp/claude-openrouter-hud-credits.json';
  const cached = readJsonFile<{ fetched_at?: number; data?: CreditsData | null }>(
    cachePath,
    { fetched_at: 0, data: null },
  );

  if (
    cached.data &&
    typeof cached.fetched_at === 'number' &&
    Date.now() - cached.fetched_at < CREDITS_TTL_MS
  ) {
    return cached.data;
  }

  const fresh = await fetchCredits(apiKey);
  if (fresh) {
    writeJsonFile(cachePath, { data: fresh, fetched_at: Date.now() });
    return fresh;
  }

  return cached.data ?? null;
}
