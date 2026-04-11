import type { Locale } from '../config'
import type { Messages } from '../types'
import ko from './ko'
import en from './en'
import ja from './ja'
import zhCN from './zh-CN'
import zhHK from './zh-HK'
import ru from './ru'
import es from './es'
import fr from './fr'
import ar from './ar'
import vi from './vi'
import af from './af'
import qu from './qu'
import fj from './fj'

export const messages: Record<Locale, Messages> = {
  ko,
  en,
  ja,
  'zh-CN': zhCN,
  'zh-HK': zhHK,
  ru,
  es,
  fr,
  ar,
  vi,
  af,
  qu,
  fj,
}
