/**
 * Site navigation — the ONE place tabs and sub-tabs are defined.
 *
 * Adding a tab or sub-tab = adding one entry here. The header, the mobile
 * bottom bar, the home page cards, sub-tab bars and placeholder pages all
 * read from this list. Never hardcode nav links anywhere else.
 *
 * `href` values are written WITHOUT the base path; components wrap them
 * with url() from src/lib/links.ts.
 */
import type { IconName } from '../lib/icons';

export interface NavItem {
  /** Full label (desktop nav, page titles) */
  label: string;
  /** Short label for the mobile bottom bar (defaults to `label`) */
  shortLabel?: string;
  href: string;
  icon: IconName;
  /** One-line description used on cards and page headers */
  description: string;
  /** Sub-tabs, rendered as a tab bar on the parent section's pages */
  children?: NavChild[];
}

export interface NavChild {
  label: string;
  /** URL segment under the parent, e.g. 'drafting' -> /practice/drafting */
  slug: string;
  description: string;
}

export const nav: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: 'home',
    description: 'Your daily dashboard: quote, news, practice and progress.',
  },
  {
    label: 'Learn',
    href: '/learn',
    icon: 'book',
    description: 'A structured library of laws, concepts and skills for deal lawyers.',
  },
  {
    label: 'Practice',
    href: '/practice',
    icon: 'pen',
    description: 'Hands-on drafting, review, research and negotiation exercises.',
    children: [
      { label: 'Drafting', slug: 'drafting', description: 'Draft clauses and documents: NDAs, term sheets, SHA clauses, resolutions.' },
      { label: 'Contract review', slug: 'review', description: 'Spot the issues in a flawed clause or agreement.' },
      { label: 'Research & memos', slug: 'research', description: 'Research a legal question and write a crisp memo.' },
      { label: 'Client communication', slug: 'communication', description: 'Explain legal points to clients in plain language.' },
      { label: 'Negotiation', slug: 'negotiation', description: 'Work through investor vs. founder positions.' },
      { label: 'Case & deal analysis', slug: 'analysis', description: 'Break down a judgment or a transaction.' },
      { label: 'Quizzes & flashcards', slug: 'quiz', description: 'Quick recall practice, with spaced repetition later.' },
    ],
  },
  {
    label: 'News',
    href: '/news',
    icon: 'newspaper',
    description: 'Daily legal and deal news from India and around the world.',
  },
  {
    label: 'Think Ahead',
    shortLabel: 'Ahead',
    href: '/think-ahead',
    icon: 'compass',
    description: 'Trends, foresight and career strategy.',
  },
  {
    label: 'Notes',
    href: '/notes',
    icon: 'notebook',
    description: 'Your private notebook, stored on this device.',
  },
];

/** Find a top-level nav item by its href ('/practice'). */
export function navItem(href: string): NavItem {
  const item = nav.find((n) => n.href === href);
  if (!item) throw new Error(`No nav entry for ${href}. Add it to src/data/nav.ts.`);
  return item;
}
