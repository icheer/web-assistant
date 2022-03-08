<template lang="pug">
  svelte:options(tag="web-assistant")
  .web-assistant
    +if("$isShowMask")
      mask-comp
    +if("$isShowIntro")
      introduce-comp
    +if("$isShowGuide")
      guideline-comp
    +if("$isShowFeedback")
      feedback-comp
    +if("$isExistToast")
      toast-comp
</template>

<script>
  import '_/introduce-comp.svelte';
  import '_/guideline-comp.svelte';
  import '_/feedback-comp.svelte';
  import '_/toast-comp.svelte';
  import '_/mask-comp.svelte';
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import {
    isShowMask,
    isShowToast,
    isExistToast,
    isShowIntro,
    isShowGuide,
    isShowFeedback
  } from '@/store/store';
</script>

<style lang="less">
</style>
