import Vue from 'vue'

import './polyfills'

import './plugins/vuex'
import './plugins/isTouchScreen'
import './plugins/touchEvents'
import i18n from './plugins/i18n'
import './plugins/axios'
import 'tocca'

import store from './store'

import '../assets/styles/global.scss'

import App from './App'
import isDev from './utils/isDev'

if (isDev) {
  Vue.config.productionTip = false
  Vue.config.performance = true
  // Vue.config.devtools = false
}

window.tocca({
  swipeThreshold: 30,
})

function initMetaLanguages(languages, currentLanguage) {
  // Current language
  {
    const meta = document.createElement('meta')
    meta.setAttribute('property', 'og:locale')
    meta.content = currentLanguage
    document.head.append(meta)
  }

  // Alternative languages
  for (const { key: language } of languages) {
    if (language === currentLanguage) {
      continue
    }
    const meta = document.createElement('meta')
    meta.setAttribute('property', 'og:locale:alternate')
    meta.content = language
    document.head.append(meta)
  }

  document.documentElement.lang = currentLanguage
}

async function init() {
  i18n.locale = store.state.language

  await store.dispatch('init')

  initMetaLanguages(store.state.languages, store.state.language)

  const worksData = store.state.pagesData.find(p => p.slug === '/works')
  const aboutData = store.state.pagesData.find(p => p.slug === '/about')

  i18n.setLocaleMessage(i18n.locale, {
    common: store.state.commonTranslations,
    works: {
      menuTitle: worksData.menuTitle,
    },
    about: {
      menuTitle: aboutData.menuTitle,
      title: aboutData.title,
      description: aboutData.description,
      phoneNumber: aboutData?.contacts[0]?.title,
      phoneNumberUrl: aboutData?.contacts[0]?.link,
      email: aboutData?.contacts[1]?.title,
    },
  })

  // Init Vue and everything else
  new Vue({
    name: '',
    store,
    i18n,
    render: h => h(App),
  }).$mount('#app')
}
init()


