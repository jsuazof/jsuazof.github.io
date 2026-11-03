import createSlug from "./createSlug";

interface BlogEntry {
  id: string;
  data: { title: string };
}

export default function createBlogSlugs(entries: BlogEntry[]) {
  const baseSlugs = new Map(entries.map((entry) => [
    entry.id,
    createSlug(entry.data.title, entry.id),
  ]));
  const counts = new Map<string, number>();

  for (const slug of baseSlugs.values()) {
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  const slugs = new Map<string, string>();
  const used = new Set<string>();

  for (const entry of entries) {
    const base = baseSlugs.get(entry.id)!;
    if ((counts.get(base) ?? 0) === 1) {
      slugs.set(entry.id, base || entry.id);
      used.add(base || entry.id);
    }
  }

  for (const entry of entries) {
    const base = baseSlugs.get(entry.id)!;
    if ((counts.get(base) ?? 0) === 1) continue;

    const id = createSlug(entry.id, entry.id);
    const preferred = `${base || entry.id}-${id || entry.id}`;
    let candidate = preferred;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${preferred}-${suffix++}`;
    }

    slugs.set(entry.id, candidate);
    used.add(candidate);
  }

  return slugs;
}
