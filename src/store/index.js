import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import api from '../api/api'
import benchmarkGPU from '../three/utils/benchmarkGPU'

const store = new Vuex.Store({
  plugins: [createPersistedState()],
  modules: {},
  state: {
    language: 'en',
    categories: [],
    projects: [],
    languages: [],
    pagesData: [],
    commonTranslations: [],
    gpuBenchmark: null,
  },
  getters: {},
  actions: {
    async init({ commit }) {
      const [categories, projects, languages, pagesData, commonTranslations, gpuBenchmark] = await Promise.all([
        api.common.getCategories(),
        api.common.getProjects(),
        api.common.getLanguages(),
        api.common.getPagesData(),
        api.common.getCommonTranslations(),
        benchmarkGPU(),
      ])

      console.log(categories, projects)

      commit('mutateField', ['categories', categories])
      commit('mutateField', ['projects', projects])
      commit('mutateField', ['languages', languages])
      commit('mutateField', ['pagesData', pagesData])
      commit('mutateField', ['commonTranslations', commonTranslations])
      commit('mutateField', ['gpuBenchmark', gpuBenchmark])
    },
    selectLanguage({ commit }, language) {
      commit('mutateField', ['language', language])
      window.location.reload()
    },
  },
  mutations: {
    mutateField(state, [name, value]) {
      state[name] = value
    },
  },
})

export default store
