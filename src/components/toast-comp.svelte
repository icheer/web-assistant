<template lang="pug">
  svelte:options(tag="toast-comp")
  +if("$isShowToast && isShow")
    .toast(class="{position}" transition:fade="{{duration: 150}}") {text}
</template>

<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { get, toastParams, isShowToast, clear } from '@/store/store';

  let isShow = false;

  $: text = ($toastParams.text || '').trim();
  $: position = $toastParams.position || 'bottom';

  onMount(() => {
    isShow = true;
  });
</script>

<style lang="less">
  .toast {
    position: fixed;
    // z-index: 9999;
    z-index: 999999;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5em 1.1em;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 5px;
    &.bottom {
      bottom: 10vh;
    }
  }
</style>
