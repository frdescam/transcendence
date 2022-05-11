<template>
  <router-view></router-view>
</template>

<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  mounted () {
    this.goToLogin();
    window.onpopstate = (e) =>
    {
      e.preventDefault();
      e.stopImmediatePropagation();
      console.log('stop');
    };
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    },
  },
  watch: {
    '$route' (to, from) {
      console.log(to, from);
    }
  }
})
</script>
