/**
 * Country names in running text.
 *
 * A handful of names are grammatically plural or take a definite article, and
 * dropping it produces copy that reads as though a template forgot a word:
 * "where United Arab Emirates actually sits", "United Arab Emirates's grid".
 * Both shipped on the homepage before this existed.
 *
 * scripts/generate-facts.js carries the same list for the generated hooks. KEEP
 * THE TWO IN SYNC — it is a small list and it changes about never, but a name
 * added to one and not the other reads as a bug in exactly one place.
 */
const TAKES_THE =
  /^(United States|United Kingdom|Netherlands|Philippines|Bahamas|Maldives|Comoros|Seychelles|Marshall Islands|Solomon Islands|Cayman Islands|Falkland Islands|Faroe Islands|Cook Islands|Turks and Caicos Islands|United Arab Emirates|Czechia|Gambia|Democratic Republic of Congo|Republic of Congo|Congo)$/;

/** "the United Arab Emirates", but "Ireland". */
export function theName(name: string): string {
  return TAKES_THE.test(name) ? `the ${name}` : name;
}

/** Sentence-initial: "The United Arab Emirates", "Ireland". */
export function subjectName(name: string): string {
  const n = theName(name);
  return n.charAt(0).toUpperCase() + n.slice(1);
}

/** "the United Arab Emirates'", "Ireland's". */
export function possessiveName(name: string): string {
  const n = theName(name);
  return n.endsWith('s') ? `${n}'` : `${n}'s`;
}
