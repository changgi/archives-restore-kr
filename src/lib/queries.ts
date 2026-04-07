import { createServerClient } from './supabase'
import type { RestorationCase, Organization, CaseFilters, Stats } from '@/types'

export async function getAllCases(filters?: CaseFilters): Promise<RestorationCase[]> {
  const supabase = createServerClient()

  let query = supabase
    .from('restoration_cases')
    .select(`
      *,
      organizations ( name ),
      case_images ( * )
    `)
    .order('support_year', { ascending: false })

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters?.year) {
    query = query.eq('support_year', parseInt(filters.year))
  }

  if (filters?.organization) {
    query = query.eq('requesting_org_id', filters.organization)
  }

  if (filters?.support_type) {
    query = query.eq('support_type', filters.support_type)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching cases:', error)
    return []
  }

  return (data as unknown as RestorationCase[]) || []
}

export async function getCaseById(id: string): Promise<RestorationCase | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('restoration_cases')
    .select(`
      *,
      organizations ( name ),
      case_images ( * )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching case:', error)
    return null
  }

  return data as unknown as RestorationCase
}

export async function getRelatedCases(
  currentId: string,
  orgId: string | null,
  category: string
): Promise<RestorationCase[]> {
  const supabase = createServerClient()

  let query = supabase
    .from('restoration_cases')
    .select(`
      *,
      organizations ( name ),
      case_images ( * )
    `)
    .neq('id', currentId)
    .limit(3)

  if (orgId) {
    query = query.eq('requesting_org_id', orgId)
  } else {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching related cases:', error)
    return []
  }

  if (data && data.length > 0) {
    return data as unknown as RestorationCase[]
  }

  // Fallback: get by same category if org query returned nothing
  if (orgId) {
    const { data: fallback } = await supabase
      .from('restoration_cases')
      .select(`*, organizations ( name ), case_images ( * )`)
      .neq('id', currentId)
      .eq('category', category)
      .limit(3)

    return (fallback as unknown as RestorationCase[]) || []
  }

  return []
}

export async function getOrganizations(): Promise<Organization[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching organizations:', error)
    return []
  }

  return data || []
}

export async function getYearStats(): Promise<{ year: number; count: number }[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('restoration_cases')
    .select('support_year')

  if (error) {
    console.error('Error fetching year stats:', error)
    return []
  }

  const yearMap = new Map<number, number>()
  data?.forEach((row) => {
    if (row.support_year) {
      yearMap.set(row.support_year, (yearMap.get(row.support_year) || 0) + 1)
    }
  })

  return Array.from(yearMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year)
}

export async function getStats(): Promise<Stats> {
  const supabase = createServerClient()

  const [casesRes, orgsRes, yearsRes] = await Promise.all([
    supabase.from('restoration_cases').select('id', { count: 'exact', head: true }),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('restoration_cases').select('support_year'),
  ])

  const years = yearsRes.data
    ?.map((r) => r.support_year)
    .filter((y): y is number => y !== null) || []

  return {
    totalCases: casesRes.count || 0,
    totalOrganizations: orgsRes.count || 0,
    yearRange: {
      min: years.length > 0 ? Math.min(...years) : 2009,
      max: years.length > 0 ? Math.max(...years) : 2025,
    },
  }
}
