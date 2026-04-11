/**
 * Translation message schema. All locales must implement this
 * interface so that TypeScript catches missing keys at build time.
 */
export interface Messages {
  nav: {
    home: string
    cases: string
    stories: string
    learn: string
    timeline: string
    gallery: string
    about: string
    menu: string
    theme: string
  }
  hero: {
    eyebrowTop: string // "National Archives of Korea"
    eyebrowMiddle: string // "Restoration Archive"
    titleAccent: string // "기록유산" (gold)
    titleTail: string // "의 복원과 보존" (remainder on same logical title)
    subtitle1: string
    subtitle2: string
    ctaCases: string
    ctaStories: string
    scroll: string
  }
  sections: {
    byTheNumbersEyebrow: string
    byTheNumbersTitle: string
    byTheNumbersAccent: string
    featuredExhibitionsEyebrow: string
    featuredExhibitionsTitle: string
    featuredExhibitionsAccent: string
    featuredExhibitionsSubtitle: string
    recentCasesEyebrow: string
    recentCasesTitle: string
    recentCasesAccent: string
    recentCasesSubtitle: string
    conservationEducationEyebrow: string
    conservationEducationTitle: string
    conservationEducationAccent: string
    conservationEducationSubtitle: string
    beginJourneyEyebrow: string
    beginJourneyTitleLine1: string
    beginJourneyTitleLine2Bold: string
    beginJourneyTitleLine2Accent: string
    beginJourneyDescPre: string
    beginJourneyDescTo: string
    beginJourneyDescTotal: string
    beginJourneyCtaAll: string
    beginJourneyCtaAbout: string
    viewAll: string
  }
  stats: {
    totalCases: string
    partnerOrgs: string
    timeSpan: string
    totalCasesSuffix: string // "건"
    partnerOrgsSuffix: string // "개"
    timeSpanSuffix: string // "년"
  }
  pageHeaders: {
    casesEyebrow: string
    casesTitle: string
    casesAccent: string
    casesSubtitle1: string
    casesSubtitle2: string
    storiesEyebrow: string
    storiesTitle: string
    storiesAccent: string
    storiesSubtitle1: string
    storiesSubtitle2: string
    learnEyebrow: string
    learnTitle: string
    learnAccent: string
    learnSubtitle1: string
    learnSubtitle2: string
    timelineEyebrow: string
    timelineTitle: string
    timelineAccent: string
    timelineSubtitle1: string
    timelineSubtitle2: string
    galleryEyebrow: string
    galleryTitle: string
    galleryAccent: string
    gallerySubtitle1: string
    gallerySubtitle2: string
    aboutEyebrow: string
    aboutTitleBefore: string
    aboutTitleAccent: string
    aboutTitleAfter: string
  }
  search: {
    placeholder: string
    clear: string
    kbdHint: string
  }
  filters: {
    label: string
    allCategories: string
    paper: string
    audiovisual: string
    allYears: string
    allOrganizations: string
    reset: string
    resultsCount: string // e.g. "{count}건의 복원 사례"
    resultsFiltered: string // "(필터링됨)"
    empty: string
    emptyHint: string
  }
  card: {
    beforeAfter: string
    details: string
    viewExhibition: string
    clickToExplore: string
    continueExploring: string
    previous: string
    next: string
    viewAllCases: string
    relatedCases: string
    relatedCasesAccent: string
  }
  gallery: {
    all: string
    before: string
    after: string
    totalImages: string
    close: string
    prev: string
    next: string
  }
  learn?: {
    statVideos?: string
    statRuntime?: string
    statKeyFrames?: string
    videosSuffix?: string
    runtimeSuffix?: string
    keyFramesSuffix?: string
    sidebarInfo?: string
    tabTimeline?: string
    tabTranscript?: string
    tabRelated?: string
    noTimeline?: string
    noTranscript?: string
    playingBadge?: string
    loadingVideo?: string
    currentlyPlaying?: string
    cardMore?: string
    summary?: string
    keyPoints?: string
    mainScenes?: string
  }
  about?: {
    headline1?: string
    headline2?: string
  }
  timeline: {
    yearRange: string
    totalCases: string
    peak: string
    peakCases: string // "{n}건"
  }
  share: {
    button: string
    title: string
    eyebrow: string
    copyLink: string
    copied: string
    linkLabel: string
  }
  error: {
    systemError: string
    title1: string
    title2: string
    desc1: string
    desc2: string
    retry: string
    goHome: string
    errorId: string
  }
  notFound: {
    eyebrow: string
    title: string
    desc1: string
    desc2: string
    goHome: string
    exploreCases: string
    back: string
    aboutLink: string
  }
  loading: {
    casesEyebrow: string
    casesLabel: string
    storiesEyebrow: string
    storiesLabel: string
    learnEyebrow: string
    learnLabel: string
    timelineEyebrow: string
    timelineLabel: string
    galleryEyebrow: string
    galleryLabel: string
  }
  footer: {
    description: string
    navigation: string
    archive: string
    sources: string
    caseList: string
    storyList: string
    learnList: string
    timelineList: string
    galleryList: string
    aboutList: string
    github: string
    originalSite: string
    sourceData: string
    sourceSupport: string
    copyright: string
    copyrightDetail: string
    builtWith: string
  }
  language: {
    switchLanguage: string
    uiOnlyNote: string
  }
  keyboard: {
    title: string
    eyebrow: string
    sectionNav: string
    sectionGoto: string
    sectionOther: string
    focusSearch: string
    openHelp: string
    closeDialogs: string
    footerHint: string
  }
  skipToContent: string
}
