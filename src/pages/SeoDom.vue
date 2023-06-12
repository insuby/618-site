<template>
  <main :class="$style.main">
    <section id="about">
      <h1>{{ $t('about.title') }}</h1>
      <p>{{ $t('about.description') }}</p>
      <a :href="$t('about.phoneNumberUrl')" target="_blank" rel="noopener noreferrer">{{ $t('about.phoneNumber') }}</a>
      <a :href="'mailto:' + $t('about.email')" target="_blank" rel="noopener noreferrer">{{ $t('about.email') }}</a>
    </section>
    <section id="works">
      <nav id="categories">
        <span v-for="category of categories" :key="category.id" v-html="category.title"></span>
      </nav>
      <div id="projects">
        <article v-for="project of projects" :key="project.id">
          <h2>{{ project.title }}</h2>
          <p>{{ project.description }}</p>
          <div>
            <a v-for="link of project.links" :key="link.title" target="_blank" rel="noopener noreferrer" :href="link.link">{{ link.title }}</a>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
<script>
  export default {
    name: 'SeoDom',
    computed: {
      categories() {
        return this.$store.state.categories
      },
      projects() {
        return this.$store.state.projects
      },
    },
  }
</script>
<style lang="scss" module>
  .main {
    pointer-events: none;
    opacity: 0.001;
  }
</style>
