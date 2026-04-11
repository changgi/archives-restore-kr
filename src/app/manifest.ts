import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '기록유산 복원 아카이브',
    short_name: '기록유산',
    description:
      '국가기록원 기록물 복원 사업의 전과 후를 기록하는 디지털 아카이브',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'ko',
    dir: 'ltr',
    background_color: '#0F0F0F',
    theme_color: '#D4A853',
    categories: ['education', 'books', 'reference'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '256x256',
        type: 'image/x-icon',
      },
    ],
    shortcuts: [
      {
        name: '복원 사례',
        short_name: '사례',
        url: '/cases',
        description: '전체 복원 사례 목록',
      },
      {
        name: '기획전시',
        short_name: '전시',
        url: '/stories',
        description: '기획전시 둘러보기',
      },
      {
        name: '타임라인',
        short_name: '타임라인',
        url: '/timeline',
        description: '연도별 복원 사업 흐름',
      },
    ],
  }
}
