import type { CreditsData, GenerationData } from './types.js';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

function getAuthToken(): string {
  return (
    process.env.OPENROUTER_API_KEY ??
    process.env.ANTHROPIC_AUTH_TOKEN ??
    process.env.ANTHROPIC_API_KEY ??
    ''
  );
}

async function getJson(path: string, apiKey: string): Promise<unknown> {
  const response = await fetch(`${OPENROUTER_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function fetchGeneration(id: string, apiKey = getAuthToken()): Promise<GenerationData | null> {
  if (!apiKey) {
    return null;
  }

  try {
    const json = (await getJson(`/generation?id=${encodeURIComponent(id)}`, apiKey)) as {
      data?: Partial<GenerationData>;
    };
    const data = json.data;

    if (!data || typeof data.total_cost !== 'number') {
      return null;
    }

    return {
      cache_discount: typeof data.cache_discount === 'number' ? data.cache_discount : 0,
      model: typeof data.model === 'string' ? data.model : '',
      provider_name: typeof data.provider_name === 'string' ? data.provider_name : '',
      total_cost: data.total_cost,
    };
  } catch {
    return null;
  }
}

export async function fetchCredits(apiKey = getAuthToken()): Promise<CreditsData | null> {
  if (!apiKey) {
    return null;
  }

  try {
    const json = (await getJson('/credits', apiKey)) as {
      data?: Partial<CreditsData>;
    };
    const data = json.data;

    if (
      !data ||
      typeof data.total_credits !== 'number' ||
      typeof data.total_usage !== 'number'
    ) {
      return null;
    }

    return {
      total_credits: data.total_credits,
      total_usage: data.total_usage,
    };
  } catch {
    return null;
  }
}

export { getAuthToken };
