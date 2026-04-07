# Archives Restore Korea

> Explore Korea's national archival restoration cases through an interactive, modern web experience.

National Archives of Korea's document restoration cases — reimagined with interactive before/after comparisons, timeline visualizations, and a beautiful dark-themed interface.

## Features

- **Before/After Image Comparison** — Drag slider to compare restoration results
- **Interactive Timeline** — Explore 45 restoration cases from 2009 to 2025
- **Smart Filtering** — Filter by category, year, organization, and support type
- **Real-time Search** — Instant search across all restoration cases
- **Gallery View** — Masonry grid with fullscreen lightbox
- **Dark Mode** — Beautiful dark theme with gold/red accents inspired by Korean heritage
- **Fully Responsive** — Optimized for mobile, tablet, and desktop
- **Accessible** — Keyboard navigation, ARIA labels, semantic HTML

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Styling | Tailwind CSS 4 + CSS Variables |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Deployment | Vercel |
| Language | TypeScript 5 (strict mode) |

## Data Source

All restoration case data is sourced from the [National Archives of Korea](https://www.archives.go.kr/) (국가기록원).

- **45 restoration cases** (39 paper + 6 audiovisual)
- **34 requesting organizations**
- **88 before/after images**
- **Year range**: 2009-2025

## Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/archives-restore-kr.git
cd archives-restore-kr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home - Hero + Stats + Recent cases
│   ├── cases/
│   │   ├── page.tsx       # Case list with search and filters
│   │   └── [id]/page.tsx  # Case detail with Before/After slider
│   ├── timeline/page.tsx  # Interactive timeline
│   ├── gallery/page.tsx   # Masonry gallery with lightbox
│   └── about/page.tsx     # About page
├── components/            # React components
│   ├── NavigationBar.tsx  # Responsive nav with dark mode toggle
│   ├── HeroSection.tsx    # Full-screen hero banner
│   ├── ImageCompareSlider.tsx  # Before/After drag comparison
│   ├── StatsCounter.tsx   # Animated statistics
│   ├── RecordCard.tsx     # Case card component
│   ├── FilterBar.tsx      # Category/year/org filters
│   ├── SearchBar.tsx      # Real-time search
│   ├── TimelineView.tsx   # Timeline visualization
│   └── GalleryGrid.tsx    # Masonry grid + lightbox
├── lib/
│   ├── supabase.ts        # Supabase client configuration
│   └── queries.ts         # Data fetching functions
└── types/
    └── index.ts           # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Acknowledgments

- Data: [National Archives of Korea](https://www.archives.go.kr/) (국가기록원)
- Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), [Vercel](https://vercel.com/)
