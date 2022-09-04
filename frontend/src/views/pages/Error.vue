<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">{{ $t('error.404') }}</div>
      <div class="text-h2" style="opacity:.4">{{ $t('error.title') }}</div>
      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        no-caps
        :label="$t('error.label')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'ErrorNotFound'
});
</script>
