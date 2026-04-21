const WINDOW_MS = 5 * 60 * 1000; // 5-minute rolling window

// Map<productId, number[]> of timestamps
const views = new Map();

function recordView(productId) {
  const now = Date.now();
  const prev = views.get(productId) || [];
  const recent = prev.filter(t => now - t < WINDOW_MS);
  recent.push(now);
  views.set(productId, recent);
}

function getLiveViewCounts() {
  const now = Date.now();
  const result = [];
  for (const [productId, timestamps] of views.entries()) {
    const count = timestamps.filter(t => now - t < WINDOW_MS).length;
    if (count > 0) result.push({ productId, count });
  }
  return result.sort((a, b) => b.count - a.count);
}

module.exports = { recordView, getLiveViewCounts };
