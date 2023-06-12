import common from './common'
import axios from '../plugins/axios'
import i18n from '../plugins/i18n'

const api = {
  common: common(axios, i18n),
}

export default api
