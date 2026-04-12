<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript 5"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss" alt="Tailwind 4"/>
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel" alt="Vercel"/>
  <img src="https://img.shields.io/badge/i18n-13_languages-gold" alt="13 Languages"/>
  <img src="https://img.shields.io/badge/PWA-Installable-purple" alt="PWA"/>
  <img src="https://img.shields.io/badge/a11y-WCAG_2.2-green" alt="Accessibility"/>
</p>

<h1 align="center">
  <br/>
  <span style="color: #D4A853">&#x1F3DB;</span> Archives Restoration Korea
  <br/>
  <sub>&#xAE30;&#xB85D;&#xC720;&#xC0B0; &#xBCF5;&#xC6D0; &#xC544;&#xCE74;&#xC774;&#xBE0C;</sub>
</h1>

<p align="center">
  <strong>An interactive reimagining of Korea's National Archives restoration data</strong>
  <br/>
  <em>Bringing damaged records back through technology</em>
</p>

<p align="center">
  <a href="https://projectrestore.vercel.app"><strong>Live Demo</strong></a> &middot;
  <a href="https://github.com/changgi/archives-restore-kr"><strong>GitHub</strong></a> &middot;
  <a href="docs/PLAN.md"><strong>Plan</strong></a> &middot;
  <a href="docs/TECHNICAL.md"><strong>Technical Docs</strong></a> &middot;
  <a href="docs/BUILD.md"><strong>Build Guide</strong></a> &middot;
  <a href="docs/SOCIAL_CAROUSEL.md"><strong>Social Kit</strong></a>
</p>

---

## What is this?

The National Archives of Korea publicly shares restoration case data across static HTML tables. This project transforms that data into a **museum-grade interactive experience** with before/after comparisons, exhibition-style storytelling, AI-analyzed video education, and real-time multilingual dubbing.

> **45** restoration cases &middot; **4** curated exhibitions &middot; **8** educational videos &middot; **88** before/after images &middot; **13** languages &middot; **0** cost

---

## Features

### Core Experience
- **Before/After Drag Slider** &mdash; Compare restoration results with keyboard, touch, and mouse support
- **Exhibition Storytelling** &mdash; 4 curated stories with parallax scroll, item galleries, and original document viewers
- **Timeline Visualization** &mdash; Horizontal scroll rail with proportional volume indicators per year
- **Gallery** &mdash; Masonry grid with Before/After tabs, fullscreen lightbox, touch-swipe navigation
- **Smart Search & Filters** &mdash; Instant debounced search + category/year/organization filters with active chips
- **Related Cases** &mdash; Auto-recommended cases by organization and category

### AI & Media
- **8 Educational Videos** &mdash; Self-hosted 480p (49 MB total) with HD toggle to original 1080p
- **AI Video Analysis** &mdash; Summary + key points per video, extracted via content analysis
- **192 Transcript Segments** &mdash; Generated via Whisper (narrated) + Tesseract OCR (on-screen subtitles)
- **YouTube-style Sidebar** &mdash; Timeline / Transcript / Related tabs with click-to-seek
- **Buffering Intelligence** &mdash; Preload detection, seek-ahead spinner, long-buffer messaging

### Multilingual (13 Languages)
- **UI Translation** &mdash; Every button, heading, filter, tooltip, error, and loading state translated
- **Auto-Translate** &mdash; Chrome-style DOM walker translates ALL remaining Korean text (DB content, titles, descriptions) via Google Translate public endpoint with localStorage cache
- **Real-Time Voice Dubbing** &mdash; Browser SpeechSynthesis reads each subtitle segment in the user's language, synchronized to video playback
- **Predictive TTS-Video Sync** &mdash; Video pauses at exact frame boundaries when dubbed speech runs longer than the original segment, then resumes automatically
- **Karaoke Subtitle Overlay** &mdash; Currently-spoken text overlaid on the video with backdrop-blur
- **SRT Subtitle Export** &mdash; Download translated subtitles for offline use
- **Dub Settings** &mdash; Voice on/off, subtitles on/off, speed control (0.75x-1.5x), sync pausing toggle
- **RTL Support** &mdash; Arabic layout automatically mirrors, with proper `dir="rtl"` and Arabic system fonts
- **Voice Availability Markers** &mdash; Language switcher shows which languages have native browser voices

**Supported**: Korean, English, Japanese, Chinese (Simplified), Chinese (Traditional/HK), Russian, Spanish, French, Arabic, Vietnamese, Afrikaans, Quechua, Fijian

### Design System
- **Museum-style headers** &mdash; Consistent pattern across all pages: English eyebrow, gold dividers, dot pattern background, vertical gold accent
- **Dark/Gold theme** &mdash; `#0F0F0F` background, `#D4A853` gold accent, `#C53030` red for "before" states
- **Light mode** &mdash; Full light theme via toggle
- **Pretendard font** &mdash; Korean-optimized variable font with CJK/Arabic/Cyrillic system fallbacks

### Performance & SEO
- **next/image** &mdash; AVIF/WebP auto-conversion with responsive srcset on 6 major components
- **Preconnect hints** &mdash; DNS/TLS preflight for archives.go.kr and Supabase
- **Dynamic OG Image** &mdash; Branded 1200x630 card via next/og ImageResponse
- **JSON-LD** &mdash; CreativeWork + ExhibitionEvent + BreadcrumbList schemas
- **Sitemap** &mdash; 60 URLs (7 static + 45 cases + 8 story routes)
- **Security Headers** &mdash; XFO, XCTO, Referrer-Policy, Permissions-Policy
- **Vercel Analytics** &mdash; Real-user page views + Core Web Vitals (LCP, CLS, INP)

### Accessibility
- **Focus-visible rings** &mdash; Gold outline + glow on keyboard focus
- **Skip-to-content** &mdash; Translated link hidden until Tab focus
- **prefers-reduced-motion** &mdash; All animations collapse to 0.01ms
- **Keyboard shortcuts** &mdash; `/` search, `?` help, `g+h/c/s/l/t/a` navigation
- **ARIA** &mdash; role="slider", aria-current, aria-label, aria-expanded throughout
- **Semantic HTML** &mdash; nav, main, footer, heading hierarchy

### PWA
- **Installable** &mdash; Standalone mode, portrait orientation
- **Custom icons** &mdash; 192px Android + 180px iOS via next/og ImageResponse
- **App shortcuts** &mdash; Cases, Exhibitions, Timeline from home screen long-press
- **Theme color** &mdash; Gold `#D4A853` status bar

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, RSC, Turbopack) | 16.2 |
| Language | TypeScript (strict) | 5.x |
| UI | React | 19.2 |
| Styling | Tailwind CSS | 4.x |
| Database | Supabase (PostgreSQL + RLS) | 2.102 |
| Hosting | Vercel (Edge + Image Opt) | - |
| Icons | lucide-react | 1.7 |
| Analytics | @vercel/analytics + @vercel/speed-insights | 2.x |
| i18n | Custom (13 locales + AutoTranslate + VideoDub) | - |

---

## Data

| Table | Rows | Description |
|-------|------|-------------|
| organizations | 34 | Requesting institutions |
| restoration_cases | 45 | Paper (39) + audiovisual (6) cases |
| case_images | 88 | Before/after comparison photos |
| featured_stories | 4 | Curated exhibition narratives |
| story_items | 8 | Exhibition artifacts |
| story_item_images | 130 | High-res artifact photos |
| original_documents | 7 | Archival document sets |
| document_pages | 31 | Individual scanned pages |
| related_videos | 8 | Educational clips (~45 min total) |
| video_frames | 40 | Key scene thumbnails |
| video_transcripts | 192 | Korean subtitles (Whisper + OCR) |

Source: [National Archives of Korea](https://www.archives.go.kr/) (public data, non-profit use)

---

## Quick Start

```bash
git clone https://github.com/changgi/archives-restore-kr.git
cd archives-restore-kr
npm install

# Set up environment
cp .env.example .env.local
# Edit with your Supabase URL + anon key

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See [docs/BUILD.md](docs/BUILD.md) for the complete step-by-step reproduction guide including database schema, data pipelines, and deployment.

---

## Documentation

| Document | Audience | Contents |
|----------|----------|----------|
| [PLAN.md](docs/PLAN.md) | Decision-makers | Goals, KPIs, personas, scope, risks, milestones |
| [TECHNICAL.md](docs/TECHNICAL.md) | Engineers | Architecture, schema, queries, features, performance, a11y, security |
| [BUILD.md](docs/BUILD.md) | Developers | Full reproduction guide, cost estimates, troubleshooting |
| [SOCIAL_CAROUSEL.md](docs/SOCIAL_CAROUSEL.md) | Marketers | 9-slide Instagram carousel, Twitter thread, LinkedIn post, Threads hooks |

---

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/translate-transcripts.mjs` | Translate 192 Korean subtitles to 12 languages via OpenAI (~$0.03) |
| `scripts/translate-transcripts-free.mjs` | Same but via free Google Translate endpoint |
| `scripts/generate-tts.mjs` | Generate dubbed audio files via edge-tts (free) or OpenAI TTS |
| `scripts/rerun-whisper.mjs` | Fill transcript tail gaps via Whisper large-v3 |

---

## Contributing

Contributions welcome! Feel free to open issues or submit PRs.

## License

MIT

## Acknowledgments

- **Data source**: [National Archives of Korea](https://www.archives.go.kr/) (public data)
- **Built with**: [Next.js](https://nextjs.org/) &middot; [Supabase](https://supabase.com/) &middot; [Vercel](https://vercel.com/) &middot; [Tailwind CSS](https://tailwindcss.com/)
- **Translation**: Google Translate public API &middot; Web Speech API
- **AI analysis**: OpenAI Whisper &middot; Tesseract OCR
