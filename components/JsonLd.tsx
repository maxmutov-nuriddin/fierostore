/**
 * Renders a JSON-LD structured-data script. Server-safe (no "use client").
 * Search engines read this to build rich results (product cards, sitelinks…).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; we control the shape entirely.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
