import sample from 'lodash/sample'
import last from 'lodash/last'
import UIElement from '../lib/UIElement'
import UIList from '../common/list/UIList'
import UIHexagonBackground from './UIHexagonBackground'
import {HEXAGON_BACKGROUND_LAYER, NO_TEAR_EFFECT_LAYER, TEAR_EFFECT_LAYER} from '../../layers'
import {approximately} from '../../../utils/math'
import UICategorySpecific from './UICategorySpecific'
import UIProjectSpecific from './UIProjectSpecific'
import {getNextBy, getPreviousBy} from '../../../utils/array'
import {down} from '../../../utils/breakpoints'
import {loadResponsiveVideoTexture} from "../../utils/loaders";

export default class UIWorksContainer extends UIElement {
  ignoreInLayout = true
  currentCategoryId = null
  currentProjectId = null
  wasDisplayedOnce = false
  currentHexagonBackground = 'first'
  _displayed = true
  opened = false

  async init(categories, projects) {
    this.categories = categories
    this.projects = projects

    this.projectsByCategories = Object.fromEntries(this.categories.map(({id, projects}) => {
      return [id, projects]
    }))


   this.currentCategoryId = this.categories[0]?.id
    console.log('this.currentCategoryId', this.currentCategoryId)
    this.currentProjectId = this.projectsByCategories[this.currentCategoryId][0]?.id
    console.log('this.currentProjectId', this.currentProjectId)
    console.log(this)
    
    this.projects.map(async (p, index) => {
      if (index === 0) {
        await loadResponsiveVideoTexture(p.video, {autoplay: true}).then(videoTexture => {
          p.videoTexture = videoTexture
        })

        return
      }
      if (index !== 0) {
        loadResponsiveVideoTexture(p.video, {autoplay: true}).then(videoTexture => {
          p.videoTexture = videoTexture
        })
      }

    })
    // Load video textures
    // await Promise.all(
    //   this.projects.map(p => loadResponsiveVideoTexture(p.video, { autoplay: false }).then(videoTexture => {
    //     p.videoTexture = videoTexture
    //   })),
    // )

    // Create categories list
    this.categoriesList = new UIList(TEAR_EFFECT_LAYER, NO_TEAR_EFFECT_LAYER, this.categories)
    this.categoriesList.pixelX = 6
    this.categoriesList.setAnchors(0, 1, 0, 1)
    this.categoriesList.addEventListener('select', this.selectCategory.bind(this))


    // Create hexagon backgrounds
    this.hexagonBackgroundScales = [1, 1.15, 1.24, 1.31, 1.5, 1.62]
    this.hexagonBackground1 = new UIHexagonBackground(HEXAGON_BACKGROUND_LAYER)
    this.hexagonBackground2 = new UIHexagonBackground(HEXAGON_BACKGROUND_LAYER)
    this.hexagonBackground1.setAnchors(0.5, 0.5, 0.5, 0.5)
    this.hexagonBackground2.setAnchors(0.5, 0.5, 0.5, 0.5)

    // Setup hexagon backgrounds
    this.hexagonBackground1.texture = this.currentProject.videoTexture
    this.hexagonBackground1.backgroundScale = sample(this.hexagonBackgroundScales)
    this.hexagonBackground1.displayed = this._displayed
    this.hexagonBackground2.displayed = false
    this.currentProject?.videoTexture?.play()

    // Create category specific ui for transitions between categories
    this.categorySpecificUI = {}
    for (const category of this.categories) {
      const projects = this.projectsByCategories[category.id]
      const uiCategorySpecific = new UICategorySpecific(projects)
      uiCategorySpecific.addEventListener('selectProject', ({project, open}) => {
        if (project.id === this.currentProjectId) {
          this.opened ? this.closeProject() : this.openProject()
          return
        }
        this.selectProject(project)
        if (open) {
          this.openProject()
        }
      })
      this.categorySpecificUI[category.id] = uiCategorySpecific
      uiCategorySpecific.visible = false
      this.add(uiCategorySpecific)
    }

    this.categorySpecificUI[this.currentCategoryId].visible = true


    // Create project specific ui for transitions between projects
    this.projectSpecificUI = Object.fromEntries(this.categories.map(c => [c.id, []]))
    for (const category of this.categories) {
      const projects = this.projectsByCategories[category.id]
      for (const project of projects) {
        const uiProjectSpecific = new UIProjectSpecific(projects, project)
        uiProjectSpecific.addEventListener('back', () => this.closeProject())
        uiProjectSpecific.addEventListener('selectProject', ({project}) => this.selectProject(project))
        this.projectSpecificUI[category.id][project.id] = uiProjectSpecific
        uiProjectSpecific.visible = false
        this.add(uiProjectSpecific)
      }
    }


    // Add everything to the container
    this.add(this.categoriesList)
    this.add(this.hexagonBackground1)
    this.add(this.hexagonBackground2)
  }

  get currentProject() {
    return this.projectsByCategories[this.currentCategoryId].find(p => p.id === this.currentProjectId)
  }

  get displayed() {
    return this._displayed
  }

  set displayed(displayed) {
    if (displayed) {
      this.projectSpecificUI[this.currentCategoryId][this.currentProjectId].visible = false
      this.categorySpecificUI[this.currentCategoryId].visible = true
    }

    this._displayed = displayed
    this.ignoreInHover = !displayed

    this.hexagonBackground1.transitionDuration = 450
    this.hexagonBackground2.transitionDuration = 450

    const currentHexagonBackground = this.currentHexagonBackground === 'first' ? this.hexagonBackground1 : this.hexagonBackground2
    if (currentHexagonBackground) {
      currentHexagonBackground.displayed = displayed
    }

    this.closeProject()

    if (displayed) {
      if (!(this._root.isLandscale && down('lg'))) {
        this.categoriesList.visible = true
      }

      if (!this.wasDisplayedOnce) {
        this.selectProject(this.projectsByCategories[this.currentCategoryId][0])
        this.wasDisplayedOnce = true
      }
    }
  }

  onResize() {
    this.categoriesList.pixelX = down('xl') ? 6 : 6
    this.categoriesList.pixelY = down('xl') ? -44 : -50

    this.closeProject(true)
  }

  selectPreviousProject() {
    if (this.opened) {
      this.categorySpecificUI[this.currentCategoryId].selectPreviousProject()
      return
    }

    const categoryProjects = this.projectsByCategories[this.currentCategoryId]
    const isFirst = categoryProjects.findIndex(p => p.id === this.currentProjectId) === 0

    if (isFirst) {
      this.selectPreviousCategory('last')
    } else {
      this.categorySpecificUI[this.currentCategoryId].selectPreviousProject()
    }
  }

  selectNextProject() {
    if (this.opened) {
      this.categorySpecificUI[this.currentCategoryId].selectNextProject()
      return
    }

    const categoryProjects = this.projectsByCategories[this.currentCategoryId]
    const isLast = categoryProjects.findIndex(p => p.id === this.currentProjectId) === categoryProjects.length - 1

    if (isLast) {
      if (this.categories.at(-1).id === this.currentCategoryId) {
        window._UIScene.openAbout.call(window._UIScene)
        return;
      }
      this.selectNextCategory('first')
    } else {
      this.categorySpecificUI[this.currentCategoryId].selectNextProject()
    }
  }

  selectNextCategory(projectBehaviour = 'first') {
    this.selectCategory(getNextBy(this.categories, c => c.id === this.currentCategoryId), projectBehaviour)
  }

  selectPreviousCategory(projectBehaviour = 'first') {
    this.selectCategory(getPreviousBy(this.categories, c => c.id === this.currentCategoryId), projectBehaviour)
  }

  selectProject(project) {
    const currentHexagonBackground = this.currentHexagonBackground === 'first' ? this.hexagonBackground1 : this.hexagonBackground2
    const newHexagonBackground = this.currentHexagonBackground === 'first' ? this.hexagonBackground2 : this.hexagonBackground1


    currentHexagonBackground.transitionDuration = 900
    newHexagonBackground.transitionDuration = 900

    currentHexagonBackground.displayed = false
    newHexagonBackground.displayed = true


    let scale = 0
    do {
      scale = sample(this.hexagonBackgroundScales)
    } while (approximately(scale, currentHexagonBackground.backgroundScale))
    newHexagonBackground.backgroundScale = scale


    const currentProjectId = this.currentProjectId
    const currentVideoTexture = this.projects.find(p => p.id === currentProjectId).videoTexture
    const newVideoTexture = this.projects.find(p => p.id === project.id).videoTexture


    setTimeout(() => {
      if (this.currentProjectId !== project.id) {
        currentVideoTexture.pause()
      }
    }, currentHexagonBackground.transitionDuration + 100)

    if (currentProjectId !== project.id) {
      newVideoTexture.play()
    }


    newHexagonBackground.texture = newVideoTexture


    for (const p of Object.values(this.projectSpecificUI[this.currentCategoryId])) {
      p.list.select(project.id)
    }
    this.categorySpecificUI[this.currentCategoryId].selectProject(project, false)


    if (this.opened) {
      this.dispatchEvent({
        type: 'transition',
        event: 'changeOpenedProject',
        fromElement: this.projectSpecificUI[this.currentCategoryId][this.currentProjectId],
        toElement: this.projectSpecificUI[this.currentCategoryId][project.id],
      })
    }

    this.currentHexagonBackground = this.currentHexagonBackground === 'first' ? 'second' : 'first'
    this.currentProjectId = project.id
  }

  selectCategory({id}, projectBehaviour = 'first') {
    this.dispatchEvent({
      type: 'transition',
      fromElement: this.opened
        ? this.projectSpecificUI[this.currentCategoryId][this.currentProjectId]
        : this.categorySpecificUI[this.currentCategoryId],
      toElement: this.categorySpecificUI[id],
    })

    if (this.opened) {
      this.projectSpecificUI[this.currentCategoryId][this.currentProjectId].ignoreInHover = true
      this.opened = false
      this.hexagonBackground1.opened = false
      this.hexagonBackground2.opened = false
    }

    for (const uiCategorySpecific of Object.values(this.categorySpecificUI)) {
      uiCategorySpecific.ignoreInHover = true
    }

    this.categorySpecificUI[id].ignoreInHover = false
    this.categoriesList.select(id)

    this.currentCategoryId = id

    let newProject = null
    if (projectBehaviour === 'keep') {
      newProject = this.projects.find(p => p.id === this.categorySpecificUI[this.currentCategoryId].currentProjectId)
    } else if (projectBehaviour === 'first') {
      newProject = this.projectsByCategories[this.currentCategoryId][0]
    } else if (projectBehaviour === 'last') {
      newProject = last(this.projectsByCategories[this.currentCategoryId])
    }

    this.selectProject(newProject)
  }

  hideCategorySpecificUI() {
    this.categorySpecificUI[this.currentCategoryId].visible = false
  }

  // Ужасные костыли
  openProject(aboutContainer) {
    if (this.opened) {
      return
    }
    this.opened = true

    for (const uiCategorySpecific of Object.values(this.categorySpecificUI)) {
      uiCategorySpecific.ignoreInHover = true
    }

    this.projectSpecificUI[this.currentCategoryId][this.currentProjectId].ignoreInHover = false

    const fromElements = []
    const toElements = [this.projectSpecificUI[this.currentCategoryId][this.currentProjectId]]
    if (aboutContainer) {
      fromElements.push(aboutContainer)
    }
    if (this.categorySpecificUI[this.currentCategoryId].visible) {
      fromElements.push(this.categorySpecificUI[this.currentCategoryId])
    } else if (!(this._root.isLandscale && down('lg'))) {
      toElements.push(this.categoriesList)
    }

    if (this.categorySpecificUI[this.currentCategoryId].visible && this._root.isLandscale && down('lg')) {
      fromElements.push(this.categoriesList)
    }


    this.dispatchEvent({
      type: 'transition',
      event: 'openProject',
      fromElements,
      toElements,
    })

    this.hexagonBackground1.opened = true
    this.hexagonBackground2.opened = true
  }

  // Soooo bad
  closeProject(includeCategoriesList = false) {
    if (!this.opened) {
      return
    }

    const toElements = [this.categorySpecificUI[this.currentCategoryId]]
    if (this._root.isLandscale && down('lg') || includeCategoriesList) {
      toElements.push(this.categoriesList)
    }

    if (this._displayed) {
      this.dispatchEvent({
        type: 'transition',
        event: 'closeProject',
        fromElement: this.projectSpecificUI[this.currentCategoryId][this.currentProjectId],
        toElements,
      })
    }

    this.categorySpecificUI[this.currentCategoryId].ignoreInHover = false
    this.projectSpecificUI[this.currentCategoryId][this.currentProjectId].ignoreInHover = true

    this.opened = false
    this.hexagonBackground1.opened = false
    this.hexagonBackground2.opened = false
  }
}
