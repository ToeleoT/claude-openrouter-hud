import { getAuthToken } from './api.js';
import { buildCreditsSnapshot, buildHudLine } from './render.js';
import { refreshCredits, refreshSessionState } from './state.js';
import type { StatuslineInput } from './types.js';

async function readStdin(): Promise<string> {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  return input.trim();
}

function safeParseInput(raw: string): StatuslineInput | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StatuslineInput;
  } catch {
    return null;
  }
}

function fallbackModel(input: StatuslineInput | null): string {
  return input?.model?.display_name ?? input?.model?.id ?? 'unknown-model';
}

export async function main(): Promise<void> {
  const apiKey = getAuthToken();
  if (!apiKey) {
    process.stdout.write('[OpenRouter] [missing API key]');
    return;
  }

  const rawInput = await readStdin();
  const input = safeParseInput(rawInput);
  if (!input?.session_id || !input.transcript_path) {
    process.stdout.write('[OpenRouter] [ready]');
    return;
  }

  const session = await refreshSessionState(input.session_id, input.transcript_path, apiKey);
  const credits = await refreshCredits(apiKey);

  process.stdout.write(
    buildHudLine({
      cacheDiscount: session.total_cache_discount,
      credits: credits
        ? buildCreditsSnapshot({
            totalCredits: credits.total_credits,
            totalUsage: credits.total_usage,
          })
        : null,
      model: session.last_model || fallbackModel(input),
      provider: session.last_provider,
      sessionCost: session.total_cost,
      title: 'OpenRouter',
      useColor: true,
    }),
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stdout.write(`[OpenRouter] [error ${message}]`);
});
