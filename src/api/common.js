export default (axios, i18n) => ({
  async getLanguages() {
    const r = await axios.get('/locales')
    return r.data.data
  },
  async getCategories() {
    const r = await axios.get(`${i18n.locale}/project-categories`)
    return r.data.data
  },
  async getProjects() {
    const r = await axios.get(`${i18n.locale}/projects`)
    return r.data.data
  },
  async getCommonTranslations() {
    const r = await axios.get(`${i18n.locale}/common`)
    return r.data.data[0]
  },
  async getPagesData() {
    const r = await axios.get(`${i18n.locale}/pages`)
    return r.data.data
  },
})
