import type { JsonLdObject } from '@/lib/structuredData';

/**
 * Renders one JSON-LD block.
 *
 * `<` is escaped rather than emitted raw: the payload carries country names and
 * hero copy, and an unescaped `</script` in any of them would close the tag and
 * put the rest of the JSON into the document as markup. The strings come from
 * our own generated data rather than from user input, so this is a belt not a
 * fix - but it costs one replace, and the data file is regenerated weekly from
 * an upstream nobody here controls.
 *
 * A plain script tag, which CSP allows: `application/ld+json` is a data block
 * and is never executed, and `script-src` already carries `unsafe-inline` for
 * Next's own bootstrap.
 */
export default function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
