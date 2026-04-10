export interface Organization {
  id: string
  name: string
  name_en: string | null
  case_count: number | null
  created_at: string | null
}

export interface RestorationCase {
  id: string
  title: string
  description: string | null
  category: 'paper' | 'audiovisual'
  support_type: string
  support_year: number | null
  quantity: string | null
  requesting_org_id: string | null
  created_at: string | null
  updated_at: string | null
  organizations: { name: string } | null
  case_images: CaseImage[]
}

export interface CaseImage {
  id: string
  case_id: string | null
  image_type: 'before' | 'after' | 'process'
  image_url: string
  storage_path: string | null
  alt_text: string | null
  sort_order: number | null
  created_at: string | null
}

export interface CaseFilters {
  category?: string
  year?: string
  organization?: string
  support_type?: string
  search?: string
}

export interface Stats {
  totalCases: number
  totalOrganizations: number
  yearRange: { min: number; max: number }
}

export interface FeaturedStory {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  producing_org: string | null
  production_period: string | null
  before_image_url: string | null
  after_image_url: string | null
  external_link: string | null
  external_link_label: string | null
  video_url: string | null
  sort_order: number | null
  created_at: string | null
  story_items: StoryItem[]
}

export interface StoryItem {
  id: string
  story_id: string
  title: string
  year: string | null
  repository: string | null
  thumbnail_url: string | null
  detail_link: string | null
  description: string | null
  sort_order: number | null
  created_at: string | null
  story_item_images: StoryItemImage[]
}

export interface StoryItemImage {
  id: string
  item_id: string
  image_url: string
  alt_text: string | null
  sort_order: number | null
  created_at: string | null
}

export interface OriginalDocument {
  id: string
  story_id: string
  title: string
  description: string | null
  sort_order: number
}

export interface DocumentPage {
  id: string
  document_id: string
  page_number: number
  image_url: string
  alt_text: string | null
}

export interface RelatedVideo {
  id: string
  title: string
  video_url: string
  hd_video_url: string | null
  thumbnail_url: string | null
  summary: string | null
  key_points: string[] | null
  duration_seconds: number | null
  created_at: string | null
  video_frames?: VideoFrame[]
  video_transcripts?: VideoTranscript[]
}

export interface VideoTranscript {
  id: string
  video_id: string
  start_seconds: number
  text: string
  sort_order: number | null
}

export interface VideoFrame {
  id: string
  video_id: string
  frame_url: string
  timestamp_percent: number
  caption: string | null
  sort_order: number | null
}
