<template>
  <router-view></router-view>
</template>

<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  mounted () {
    this.goToLogin();
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    },
  },
})
</script>
