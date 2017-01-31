<template>
  <div class="content">
    <div class="tile is-ancestor">
      <div class="tile is-parent is-desktop is-4 is-offset-4 column box">
        <div class="tile is-child">
          <h1 class="title has-text-centered">Login</h1>
          <label class="label">Username</label>
          <p class="control has-icon has-icon-right">
            <input class="input" type="text" placeholder="Your username">
          </p>
          <label class="label">Password</label>
          <p class="control has-icon has-icon-right">
            <input class="input" type="password" placeholder="Your password">
          </p>
          <div class="right-aligned">
            <button class="button is-primary is-medium">Login</button>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {

  data() {
    return this.$store.state.pkg
  }

}
</script>

<style lang="scss" scoped>
.is-title {
  text-transform: capitalize;
}
.right-aligned {
  justify-content: flex-end;
}
</style>
