export function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// deepMerge(target, patch): patch (the user's config) wins on leaf conflicts.
// Arrays are unioned (target entries first, then unique patch entries).
// Keys present only in the target (bundle) are preserved as bundle defaults.
export function deepMerge(target, patch) {
  const out = { ...target };
  for (const [k, pv] of Object.entries(patch || {})) {
    const tv = target && k in target ? target[k] : undefined;
    if (Array.isArray(pv)) {
      const base = Array.isArray(tv) ? tv : [];
      out[k] = [...base, ...pv].filter((v, i, a) => a.indexOf(v) === i);
    } else if (isPlainObject(pv)) {
      out[k] = isPlainObject(tv) ? deepMerge(tv, pv) : pv;
    } else {
      out[k] = pv;
    }
  }
  return out;
}

export function mergePluginArrays(base, patch) {
  return [...new Set([...(base || []), ...(patch || [])])];
}