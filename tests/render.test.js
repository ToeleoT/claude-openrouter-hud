import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCreditsSnapshot,
  buildHudLine,
  formatMoney,
} from '../dist/render.js';

test('buildCreditsSnapshot calculates depletion, remaining balance, and status level', () => {
  const snapshot = buildCreditsSnapshot({
    totalCredits: 20,
    totalUsage: 17,
  });

  assert.equal(snapshot.remainingCredits, 3);
  assert.equal(snapshot.depletionPercent, 85);
  assert.equal(snapshot.level, 'critical');
});

test('formatMoney keeps compact dollar precision for small and large values', () => {
  assert.equal(formatMoney(0.18423), '$0.1842');
  assert.equal(formatMoney(12.8), '$12.80');
});

test('buildHudLine renders provider, model, credits bar, balance, session cost, and cache savings', () => {
  const line = buildHudLine({
    title: 'OpenRouter',
    provider: 'Anthropic',
    model: 'claude-sonnet-4.5',
    credits: buildCreditsSnapshot({
      totalCredits: 20,
      totalUsage: 8,
    }),
    sessionCost: 0.1842,
    cacheDiscount: 0.04,
  });

  assert.match(line, /\[OpenRouter\]/);
  assert.match(line, /\[claude-sonnet-4\.5\]/);
  assert.doesNotMatch(line, /Anthropic/);
  assert.match(line, / credits [^\[]+40% /);
  assert.match(line, /\[Left \$12\.00\]/);
  assert.match(line, /\[Cost \$0\.1842\]/);
  assert.doesNotMatch(line, /\[cache /);
});

test('buildHudLine degrades gracefully when credits data is unavailable', () => {
  const line = buildHudLine({
    title: 'OpenRouter',
    provider: '',
    model: 'claude-opus-4.1',
    credits: null,
    sessionCost: 0.01,
    cacheDiscount: 0,
  });

  assert.match(line, /\[OpenRouter\]/);
  assert.match(line, /\[claude-opus-4.1\]/);
  assert.doesNotMatch(line, /\[Left /);
  assert.match(line, /\[Cost \$0\.01\]/);
  assert.doesNotMatch(line, /\[cache /);
});
