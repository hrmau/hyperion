/**
 * No metadata here. page.tsx derives the title and description from ?a= and ?b=,
 * and a static title in the layout would only be the thing someone edits by
 * mistake when the dynamic one looks wrong.
 */

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
