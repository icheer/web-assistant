<template lang="pug">
  svelte:options(tag="web-assistant")
  +if("isShowMask")
    .web-assistant-mask(transition:fade="{{duration: 150}}")
      +if("$isShowIntro")
        introduce-comp
      +if("$isShowGuide")
        guideline-comp
</template>

<script>
  import '_/introduce-comp.svelte';
  import '_/guideline-comp.svelte';
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { isShowIntro, isShowGuide } from '@/store/store';
  import { sleep, copy, genRandId, dispatchEvent } from '@/helper/func';

  $: isShowMask = $isShowIntro || $isShowGuide;

  onMount(async () => {
    return;
  });
</script>

<style lang="less">
  .web-assistant-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
