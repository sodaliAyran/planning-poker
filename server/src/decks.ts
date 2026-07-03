import type { DeckType } from '@poker/shared';

export const DECKS: Record<DeckType, string[]> = {
  fibonacci:    ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
  modifiedFib:  ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'],
  tshirt:       ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
  powersOfTwo:  ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕'],
  linear:       ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?'],
};

export const DECK_LABELS: Record<DeckType, string> = {
  fibonacci:   'Fibonacci',
  modifiedFib: 'Modified Fibonacci',
  tshirt:      'T-Shirt Sizes',
  powersOfTwo: 'Powers of 2',
  linear:      'Linear (1–10)',
};
