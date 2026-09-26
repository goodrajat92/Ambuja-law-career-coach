/**
 * Shared taxonomies: Learn categories, News categories and regions, and
 * Think Ahead sections. Content schemas (Phase 3+) and filters reuse these
 * lists, so a category is added in one place.
 *
 * `color` picks one of the 8 category color tokens (--cat-1 ... --cat-8).
 */
import type { IconName } from '../lib/icons';

export type CatColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Category {
  slug: string;
  label: string;
  description?: string;
  color: CatColor;
}

export const learnCategories: Category[] = [
  { slug: 'company-law', label: 'Company law', description: 'Companies Act 2013, share capital, board and shareholder matters.', color: 1 },
  { slug: 'securities', label: 'Securities & capital markets', description: 'SEBI regulations: ICDR, LODR, SAST, PIT, AIF.', color: 2 },
  { slug: 'foreign-investment', label: 'Foreign investment', description: 'FEMA, FDI policy, pricing guidelines, ODI.', color: 7 },
  { slug: 'vc-startups', label: 'VC & startup deals', description: 'Term sheets, SHA/SSA, CCPS/CCDs, convertible notes, ESOPs, cap tables.', color: 5 },
  { slug: 'mna', label: 'M&A & due diligence', description: 'Deal structures, diligence and transaction documents.', color: 3 },
  { slug: 'competition', label: 'Competition law', description: 'Merger control and the deal value threshold.', color: 4 },
  { slug: 'insolvency', label: 'Insolvency (IBC)', description: 'The Insolvency and Bankruptcy Code in practice.', color: 8 },
  { slug: 'contracts', label: 'Contracts', description: 'Indian Contract Act, boilerplate, indemnities, reps and warranties.', color: 6 },
  { slug: 'tax', label: 'Tax basics for deals', description: 'Stamp duty and investment-related tax.', color: 5 },
  { slug: 'data-tech', label: 'Data protection & tech', description: 'DPDP Act 2023, IT law and AI regulation.', color: 2 },
  { slug: 'disputes', label: 'Dispute resolution', description: 'The Arbitration and Conciliation Act.', color: 4 },
  { slug: 'gift-city', label: 'GIFT City / IFSC', description: 'The international financial services centre regime.', color: 7 },
  { slug: 'business-skills', label: 'Business skills', description: 'Reading financials, valuation basics, negotiation, client management.', color: 3 },
];

export const newsRegions = ['India', 'US', 'UK', 'EU', 'Singapore', 'Global'] as const;

export const newsCategories: Category[] = [
  { slug: 'securities', label: 'Securities / SEBI', color: 2 },
  { slug: 'vc-pe', label: 'VC & PE', color: 5 },
  { slug: 'startups', label: 'Startups', color: 6 },
  { slug: 'mna', label: 'M&A', color: 3 },
  { slug: 'fema-fdi', label: 'FEMA / FDI', color: 7 },
  { slug: 'company-law', label: 'Company law', color: 1 },
  { slug: 'competition', label: 'Competition', color: 4 },
  { slug: 'tax', label: 'Tax', color: 5 },
  { slug: 'data-tech', label: 'Data & tech / AI', color: 2 },
  { slug: 'arbitration', label: 'Arbitration', color: 4 },
  { slug: 'insolvency', label: 'Insolvency', color: 8 },
  { slug: 'regulatory', label: 'Regulatory updates', color: 1 },
  { slug: 'other', label: 'Other', color: 8 },
];

export interface Section {
  title: string;
  description: string;
  icon: IconName;
}

export const thinkAheadSections: Section[] = [
  { title: 'Trend briefs', description: 'AI and legaltech, the funding climate, GIFT City, regulatory direction, cross-border deals.', icon: 'trending' },
  { title: 'Career paths', description: 'Partner track, in-house and GC, fund counsel, policy, legaltech.', icon: 'compass' },
  { title: 'Skills roadmap', description: 'What to learn next, linked into Learn and Practice.', icon: 'layers' },
  { title: 'Reading list', description: 'Books, newsletters and podcasts worth your time.', icon: 'book' },
  { title: 'Weekly reflection', description: 'A prompt each week; your answers are saved to Notes.', icon: 'pen' },
  { title: "What's changing", description: "A weekly brief distilled from the past week's news.", icon: 'sparkles' },
];
