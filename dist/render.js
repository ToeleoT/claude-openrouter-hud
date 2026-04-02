const RESET = '\x1b[0m';
const COLORS = {
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function color(text, ansi, useColor) {
  if (!useColor) {
    return text;
  }
  return `${ansi}${text}${RESET}`;
}

function bracket(segment) {
  return `[${segment}]`;
}

function makeBar(percent, width = 10) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)}`;
}

function levelColor(level) {
  if (level === 'critical') {
    return COLORS.red;
  }
  if (level === 'warning') {
    return COLORS.yellow;
  }
  return COLORS.green;
}

export function formatMoney(value) {
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  const trimmed = value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  if (!trimmed.includes('.')) {
    return `$${trimmed}.00`;
  }
  const [, decimals = ''] = trimmed.split('.');
  if (decimals.length === 1) {
    return `$${trimmed}0`;
  }
  return `$${trimmed}`;
}

export function buildCreditsSnapshot(input) {
  const totalCredits = Math.max(0, input.totalCredits);
  const totalUsage = Math.max(0, input.totalUsage);
  const remainingCredits = Math.max(0, totalCredits - totalUsage);
  const depletionPercent =
    totalCredits > 0 ? Math.max(0, Math.min(100, Math.round((totalUsage / totalCredits) * 100))) : 0;
  const level =
    depletionPercent >= 85 ? 'critical' : depletionPercent >= 60 ? 'warning' : 'healthy';

  return {
    depletionPercent,
    level,
    remainingCredits,
    totalCredits,
    totalUsage,
  };
}

export function shortModelName(model) {
  return model.replace(/^[^/]+\//, '').replace(/-\d{8}$/, '');
}

export function buildHudLine(input) {
  const useColor = input.useColor ?? false;
  const segments = [];

  segments.push(bracket(color(input.title, COLORS.cyan, useColor)));
  segments.push(bracket(color(shortModelName(input.model), COLORS.magenta, useColor)));

  if (input.credits) {
    const creditsLabel = `credits ${makeBar(input.credits.depletionPercent)} ${input.credits.depletionPercent}%`;
    segments.push(color(creditsLabel, levelColor(input.credits.level), useColor));
    segments.push(bracket(color(`Left ${formatMoney(input.credits.remainingCredits)}`, COLORS.cyan, useColor)));
  }

  segments.push(bracket(color(`Cost ${formatMoney(input.sessionCost)}`, COLORS.yellow, useColor)));

  return segments.join(color(' ', COLORS.dim, useColor));
}
