<template>
  <footer class="footer">
    <div class="container">
      <div class="content has-text-centered">
        <p class="social">
          <a :href="'https://github.com/' + repository" target="_blank">
            <span class="icon">
              <i class="fa fa-github"></i>
            </span>
          </a>
        </p>
        <p><span class="icon"><i class="fa fa-code"></i></span> with <span class="icon"><i class="fa fa-heart"></i></span> by <a href="https://github.com/CCIP-App" target="_blank">CCIP-App</a>.</p>
        <p>Code licensed under <a :href="'https://github.com/' + repository + '/blob/master/LICENSE'" target="_blank">{{ license }}</a>.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {

  data() {
    return this.$store.state.pkg
  }

}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/mixins';

.footer {
  margin-left: 180px;

  @include mobile() {
    margin-left: 0;
  }

  .social a {
    border-bottom: none !important;
  }

  .content a:visited {
    color: #4a4a4a;
  }

  .fa.fa-heart {
    color: red;
  }
}
</style>
