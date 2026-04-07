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
