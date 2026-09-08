/**
 * The social card, declared once.
 *
 * It has to be repeated at every route that declares an `openGraph` of its own,
 * because Next replaces the parent block rather than merging into it - the same
 * behaviour that made every page share as the homepage when the root layout
 * carried an `og:title`. So `/compare` and `/country/[iso3]` spread this in
 * explicitly; everything else inherits it from the root layout.
 *
 * 1200x628 rather than the more common 1200x630, which is what the artwork is.
 * The dimensions are declared so a crawler can lay the card out before the image
 * has finished downloading.
 */
export const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 628,
  alt: 'Grid Gorilla - every country on Earth runs on something',
} as const;

/**
 * `summary_large_image` and not `summary`: at 1.91:1 the artwork is a banner,
 * and a `summary` card crops it to a square thumbnail beside the text, which
 * loses the wordmark and most of the sentence.
 */
export const TWITTER_CARD = 'summary_large_image' as const;
