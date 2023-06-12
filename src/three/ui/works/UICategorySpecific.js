import UIElement from '../lib/UIElement'
import UIProjectsSlider from './projectsSlider/UIProjectsSlider'
import { NO_TEAR_EFFECT_LAYER, TEAR_EFFECT_LAYER } from '../../layers'
import UIList from '../common/list/UIList'
import { getNextBy, getPreviousBy } from '../../../utils/array'

export default class UICategorySpecific extends UIElement {
  constructor(projects) {
    super()

    this.ignoreInLayout = true
    this.projects = projects
    this.currentProjectId = projects[0].id


    this.slider = new UIProjectsSlider(TEAR_EFFECT_LAYER, NO_TEAR_EFFECT_LAYER, projects)
    this.slider.addEventListener('select', p => this.selectProject(p, true, true))
    this.slider.setAnchors(0, 0, 0.5, 0.5)


    this.list = new UIList(TEAR_EFFECT_LAYER, NO_TEAR_EFFECT_LAYER, projects.map(p => ({ id: p.id })))
    this.list.addEventListener('select', this.selectProject.bind(this))
    this.list.setAnchors(1, 0, 1, 0)


    this.add(this.list)
    this.add(this.slider)

    this.onResize()
  }

  selectPreviousProject() {
    this.selectProject(getPreviousBy(this.projects, p => p.id === this.currentProjectId))
  }

  selectNextProject() {
    this.selectProject(getNextBy(this.projects, p => p.id === this.currentProjectId))
  }

  selectProject(project, dispatchEvent = true, open = false) {
    this.slider.selectProject(project.id)
    this.list.select(project.id)
    this.currentProjectId = project.id
    if (dispatchEvent) {
      this.dispatchEvent({ type: 'selectProject', project, open })
    }
  }

  onResize() {
    this.list.pixelX = -15 - 15
    this.list.pixelY = 15
  }
}
