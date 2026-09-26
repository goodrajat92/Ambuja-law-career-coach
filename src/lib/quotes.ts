/** Typed access to the quote list + the quote of the day. */
import quotesData from '../data/quotes.json';
import { pickForDate } from './daily';
import { isoDate } from './dates';

export interface Quote {
  text: string;
  author: string;
  /** Where/when it was said or written, when known */
  context?: string;
}

export const quotes: Quote[] = quotesData;

export function quoteOfTheDay(iso: string = isoDate()): Quote {
  return pickForDate(quotes, iso) ?? quotes[0];
}
