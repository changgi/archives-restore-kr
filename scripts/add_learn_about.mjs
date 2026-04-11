#!/usr/bin/env node
/**
 * One-shot: append `learn` and `about` sections to every locale file
 * just before the `skipToContent` line. Idempotent — skips files that
 * already have a `learn:` block.
 */
import fs from 'node:fs'
import path from 'node:path'

const DIR = path.join(process.cwd(), 'src/i18n/messages')

const data = {
  ko: {
    learn: {
      statVideos: '편', statRuntime: '분', statKeyFrames: '장',
      videosSuffix: '편', runtimeSuffix: '분', keyFramesSuffix: '장',
      sidebarInfo: '영상 정보', tabTimeline: '타임라인', tabTranscript: '스크립트', tabRelated: '관련 영상',
      noTimeline: '타임라인 정보가 없습니다', noTranscript: '스크립트가 없습니다',
      playingBadge: '재생 중', loadingVideo: '재생 준비 중...', currentlyPlaying: '현재 재생 중인 영상입니다',
      cardMore: '자세히 보기 →', summary: '영상 요약', keyPoints: '핵심 포인트', mainScenes: '주요 장면',
    },
    about: { headline1: 'About This Project', headline2: '시간이 훼손한 기록을, 기술로 되살립니다.' },
  },
  en: {
    learn: {
      statVideos: 'Videos', statRuntime: 'Total Runtime', statKeyFrames: 'Key Frames',
      videosSuffix: '', runtimeSuffix: ' min', keyFramesSuffix: '',
      sidebarInfo: 'Video Info', tabTimeline: 'Timeline', tabTranscript: 'Transcript', tabRelated: 'Related',
      noTimeline: 'No timeline available', noTranscript: 'No transcript available',
      playingBadge: 'Playing', loadingVideo: 'Loading...', currentlyPlaying: 'Currently playing',
      cardMore: 'View details →', summary: 'Summary', keyPoints: 'Key Points', mainScenes: 'Main Scenes',
    },
    about: { headline1: 'About This Project', headline2: 'Bringing damaged records back through technology.' },
  },
  ja: {
    learn: {
      statVideos: '本', statRuntime: '合計', statKeyFrames: 'キーフレーム',
      videosSuffix: '本', runtimeSuffix: '分', keyFramesSuffix: '枚',
      sidebarInfo: '動画情報', tabTimeline: 'タイムライン', tabTranscript: 'スクリプト', tabRelated: '関連動画',
      noTimeline: 'タイムライン情報がありません', noTranscript: 'スクリプトがありません',
      playingBadge: '再生中', loadingVideo: '準備中...', currentlyPlaying: '現在再生中です',
      cardMore: '詳しく見る →', summary: '動画要約', keyPoints: '要点', mainScenes: '主要シーン',
    },
    about: { headline1: 'About This Project', headline2: '時間が傷つけた記録を、技術で蘇らせます。' },
  },
  'zh-CN': {
    learn: {
      statVideos: '视频', statRuntime: '总时长', statKeyFrames: '关键帧',
      videosSuffix: '部', runtimeSuffix: '分钟', keyFramesSuffix: '张',
      sidebarInfo: '视频信息', tabTimeline: '时间轴', tabTranscript: '字幕', tabRelated: '相关视频',
      noTimeline: '暂无时间轴', noTranscript: '暂无字幕',
      playingBadge: '正在播放', loadingVideo: '准备中...', currentlyPlaying: '正在播放此视频',
      cardMore: '查看详情 →', summary: '视频摘要', keyPoints: '要点', mainScenes: '主要场景',
    },
    about: { headline1: 'About This Project', headline2: '用技术让时间损毁的记录重获新生。' },
  },
  'zh-HK': {
    learn: {
      statVideos: '影片', statRuntime: '總時長', statKeyFrames: '關鍵影格',
      videosSuffix: '部', runtimeSuffix: '分鐘', keyFramesSuffix: '張',
      sidebarInfo: '影片資訊', tabTimeline: '時間軸', tabTranscript: '字幕', tabRelated: '相關影片',
      noTimeline: '沒有時間軸', noTranscript: '沒有字幕',
      playingBadge: '正在播放', loadingVideo: '準備中...', currentlyPlaying: '正在播放此影片',
      cardMore: '查看詳情 →', summary: '影片摘要', keyPoints: '重點', mainScenes: '主要場景',
    },
    about: { headline1: 'About This Project', headline2: '以技術讓時間損毀的記錄重獲新生。' },
  },
  ru: {
    learn: {
      statVideos: 'Видео', statRuntime: 'Всего', statKeyFrames: 'Ключевые кадры',
      videosSuffix: '', runtimeSuffix: ' мин', keyFramesSuffix: '',
      sidebarInfo: 'О видео', tabTimeline: 'Временная шкала', tabTranscript: 'Субтитры', tabRelated: 'Похожие',
      noTimeline: 'Нет временной шкалы', noTranscript: 'Субтитры недоступны',
      playingBadge: 'Играет', loadingVideo: 'Загрузка...', currentlyPlaying: 'Сейчас играет',
      cardMore: 'Подробнее →', summary: 'Краткое содержание', keyPoints: 'Ключевые моменты', mainScenes: 'Основные сцены',
    },
    about: { headline1: 'About This Project', headline2: 'Возвращаем к жизни документы, повреждённые временем.' },
  },
  es: {
    learn: {
      statVideos: 'Vídeos', statRuntime: 'Duración total', statKeyFrames: 'Fotogramas clave',
      videosSuffix: '', runtimeSuffix: ' min', keyFramesSuffix: '',
      sidebarInfo: 'Información del vídeo', tabTimeline: 'Cronología', tabTranscript: 'Transcripción', tabRelated: 'Relacionados',
      noTimeline: 'Sin cronología', noTranscript: 'Sin transcripción',
      playingBadge: 'Reproduciendo', loadingVideo: 'Cargando...', currentlyPlaying: 'Reproduciéndose ahora',
      cardMore: 'Ver detalles →', summary: 'Resumen', keyPoints: 'Puntos clave', mainScenes: 'Escenas principales',
    },
    about: { headline1: 'About This Project', headline2: 'Devolvemos a la vida los registros dañados por el tiempo.' },
  },
  fr: {
    learn: {
      statVideos: 'Vidéos', statRuntime: 'Durée totale', statKeyFrames: 'Images clés',
      videosSuffix: '', runtimeSuffix: ' min', keyFramesSuffix: '',
      sidebarInfo: 'Infos vidéo', tabTimeline: 'Chronologie', tabTranscript: 'Sous-titres', tabRelated: 'Connexes',
      noTimeline: 'Pas de chronologie', noTranscript: 'Pas de sous-titres',
      playingBadge: 'En lecture', loadingVideo: 'Chargement...', currentlyPlaying: 'En cours de lecture',
      cardMore: 'Voir détails →', summary: 'Résumé', keyPoints: 'Points clés', mainScenes: 'Scènes principales',
    },
    about: { headline1: 'About This Project', headline2: 'La technologie redonne vie aux documents abîmés par le temps.' },
  },
  ar: {
    learn: {
      statVideos: 'الفيديوهات', statRuntime: 'المدة الإجمالية', statKeyFrames: 'الإطارات الرئيسية',
      videosSuffix: '', runtimeSuffix: ' دقيقة', keyFramesSuffix: '',
      sidebarInfo: 'معلومات الفيديو', tabTimeline: 'الخط الزمني', tabTranscript: 'النص', tabRelated: 'فيديوهات ذات صلة',
      noTimeline: 'لا يوجد خط زمني', noTranscript: 'لا يوجد نص',
      playingBadge: 'قيد التشغيل', loadingVideo: 'جاري التحميل...', currentlyPlaying: 'قيد التشغيل الآن',
      cardMore: 'عرض التفاصيل ←', summary: 'ملخص الفيديو', keyPoints: 'النقاط الرئيسية', mainScenes: 'المشاهد الرئيسية',
    },
    about: { headline1: 'About This Project', headline2: 'نُعيد الحياة إلى السجلات التي أتلفها الزمن بفضل التكنولوجيا.' },
  },
  vi: {
    learn: {
      statVideos: 'Video', statRuntime: 'Tổng thời lượng', statKeyFrames: 'Khung hình chính',
      videosSuffix: '', runtimeSuffix: ' phút', keyFramesSuffix: '',
      sidebarInfo: 'Thông tin video', tabTimeline: 'Dòng thời gian', tabTranscript: 'Phụ đề', tabRelated: 'Liên quan',
      noTimeline: 'Không có dòng thời gian', noTranscript: 'Không có phụ đề',
      playingBadge: 'Đang phát', loadingVideo: 'Đang tải...', currentlyPlaying: 'Đang phát video này',
      cardMore: 'Xem chi tiết →', summary: 'Tóm tắt', keyPoints: 'Điểm chính', mainScenes: 'Cảnh chính',
    },
    about: { headline1: 'About This Project', headline2: 'Công nghệ hồi sinh những tài liệu bị thời gian làm tổn hại.' },
  },
  af: {
    learn: {
      statVideos: 'Videos', statRuntime: 'Totale tyd', statKeyFrames: 'Sleutelrame',
      videosSuffix: '', runtimeSuffix: ' min', keyFramesSuffix: '',
      sidebarInfo: 'Video-inligting', tabTimeline: 'Tydlyn', tabTranscript: 'Onderskrifte', tabRelated: 'Verwante',
      noTimeline: 'Geen tydlyn nie', noTranscript: 'Geen onderskrifte nie',
      playingBadge: 'Speel', loadingVideo: 'Laai tans...', currentlyPlaying: 'Speel tans',
      cardMore: 'Bekyk besonderhede →', summary: 'Opsomming', keyPoints: 'Sleutelpunte', mainScenes: 'Hoof-tonele',
    },
    about: { headline1: 'About This Project', headline2: 'Tegnologie bring rekords wat die tyd beskadig het weer tot lewe.' },
  },
  qu: {
    learn: {
      statVideos: 'Videokuna', statRuntime: 'Lliw pacha', statKeyFrames: 'Hamutay rikchaykuna',
      videosSuffix: '', runtimeSuffix: ' min', keyFramesSuffix: '',
      sidebarInfo: 'Video willakuy', tabTimeline: 'Pacha-siqi', tabTranscript: 'Subtitulokuna', tabRelated: 'Kaqkuna',
      noTimeline: 'Mana pacha-siqi kanchu', noTranscript: 'Mana subtitulokuna kanchu',
      playingBadge: 'Tukuchkan', loadingVideo: 'Chayamuchkan...', currentlyPlaying: 'Kunanpuni tukuchkan',
      cardMore: 'Astawan qhaway →', summary: 'Willakuy pisichasqa', keyPoints: 'Hamutay sunqukuna', mainScenes: 'Hatun rikchaykuna',
    },
    about: { headline1: 'About This Project', headline2: 'Pacha pisichisqa qillqakunata teknologiawan kawsarichiyku.' },
  },
  fj: {
    learn: {
      statVideos: 'Vidiyo', statRuntime: 'Na gauna taucoko', statKeyFrames: 'iYaloyalo bibi',
      videosSuffix: '', runtimeSuffix: ' miniti', keyFramesSuffix: '',
      sidebarInfo: 'iTukutuku ni vidiyo', tabTimeline: 'iTuvatuva', tabTranscript: 'Vakadewataki', tabRelated: 'Veimaliwai',
      noTimeline: 'E sega na iTuvatuva', noTranscript: 'E sega na vakadewataki',
      playingBadge: 'Se mai vakaraitaki', loadingVideo: 'Se keli mai...', currentlyPlaying: 'Se vakaraitaki tiko',
      cardMore: 'Raica na matailalai →', summary: 'Vakalekaleka', keyPoints: 'iVakavuvuli bibi', mainScenes: 'Tikina bibi',
    },
    about: { headline1: 'About This Project', headline2: 'Keda saga me bulataki tale na ka sa vakacacani mai na gauna.' },
  },
}

function fmt(val) {
  if (typeof val === 'string') return JSON.stringify(val)
  if (Array.isArray(val)) return '[' + val.map(fmt).join(', ') + ']'
  if (typeof val === 'object') {
    return (
      '{\n' +
      Object.entries(val)
        .map(([k, v]) => '    ' + k + ': ' + fmt(v) + ',')
        .join('\n') +
      '\n  }'
    )
  }
  return String(val)
}

for (const [code, sections] of Object.entries(data)) {
  const file = path.join(DIR, code + '.ts')
  if (!fs.existsSync(file)) {
    console.warn('missing', file)
    continue
  }
  let src = fs.readFileSync(file, 'utf8')
  if (src.includes('  learn: {')) {
    console.log(code, '→ already has learn section, skipping')
    continue
  }
  const block =
    '  learn: ' + fmt(sections.learn) + ',\n' +
    '  about: ' + fmt(sections.about) + ',\n' +
    '  skipToContent:'
  if (!src.includes('skipToContent:')) {
    console.error(code, '→ no skipToContent marker, skipping')
    continue
  }
  src = src.replace('  skipToContent:', block)
  fs.writeFileSync(file, src)
  console.log(code, '→ added learn + about')
}
