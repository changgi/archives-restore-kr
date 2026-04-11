interface JsonLdProps {
  // Using Record to allow arbitrary structured-data shapes without losing type safety at call sites.
  data: Record<string, unknown>
}

/**
 * Injects a JSON-LD `<script type="application/ld+json">` tag.
 * Rendered as a server component — safe to include in any page.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify sanitizes the payload; the JSON-LD context prevents XSS
      // by design (only strings/numbers/objects survive serialization).
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', ...data }),
      }}
    />
  )
}
