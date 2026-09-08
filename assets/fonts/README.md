# Fonts for generated images

Space Grotesk and IBM Plex Mono as **TTF**, used only by
`app/country/[iso3]/opengraph-image.tsx`.

They are here and not in `public/` because nothing should serve them to a
browser — the site's own faces come from `next/font`, self-hosted and subsetted.
These copies exist because Satori, which renders `ImageResponse`, reads TTF and
OTF and **cannot read WOFF2**, which is the only format `next/font` produces.

Both families are SIL Open Font License 1.1, which permits redistribution; see
`OFL-SpaceGrotesk.txt` and `OFL-IBMPlexMono.txt`. Fetched from Google Fonts:

- Space Grotesk 500 / 700 — https://fonts.google.com/specimen/Space+Grotesk
- IBM Plex Mono 500 — https://fonts.google.com/specimen/IBM+Plex+Mono

If a weight is added here, add it to the `fonts` array in the image route too —
Satori silently falls back rather than erroring on a weight it was not given.
