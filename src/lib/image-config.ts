// 이미지 URL을 중앙 관리하여 원본 사이트 폐쇄 시 쉽게 교체
// Supabase Storage나 다른 CDN으로 마이그레이션할 때 이 파일만 수정하면 됨

export const IMAGE_BASE_URL = 'https://www.archives.go.kr/next/images/site2/archives_restore'
export const IMAGE_DETAIL_BASE_URL = `${IMAGE_BASE_URL}/archive_img`
export const DOCUMENT_VIEWER_BASE_URL = 'https://theme.archives.go.kr/viewer/common/archWebViewerStream.do'

// 원본 사이트가 폐쇄될 경우 아래 URL로 교체
// export const IMAGE_BASE_URL = 'https://YOUR_SUPABASE_URL/storage/v1/object/public/images'

export function getImageUrl(path: string): string {
  return `${IMAGE_BASE_URL}/${path}`
}

export function getDetailImageUrl(path: string): string {
  return `${IMAGE_DETAIL_BASE_URL}/${path}`
}
