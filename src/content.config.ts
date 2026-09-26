/**
 * Content collection schemas (Astro Content Layer API). Every content
 * type gets a typed Zod schema here — see CLAUDE.md §3.2/§3.3/§3.5 for
 * what each field means.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const learn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/learn' }),
  schema: z.object({
    title: z.string(),
    category: z.string(), // a slug from src/data/taxonomy.ts's learnCategories
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    readingTime: z.number(), // minutes
    lastReviewed: z.date(),
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })),
    related: z.array(z.string()).default([]), // slugs of related learn topics
    keyTakeaways: z.array(z.string()).default([]),
  }),
});

export const collections = { learn };
