<template lang="pug">
  svelte:options(tag="mask-comp")
  .web-assistant-mask(
    on:click|stopPropagation
    on:mousedown|stopPropagation
    on:mouseup|stopPropagation
    on:touchstart|stopPropagation
    on:touchend|stopPropagation
    on:wheel|stopPropagation
    on:mousewheel|stopPropagation
    class:transparent="{transparent}"
    class:none="{none}"
  )
    slot
</template>

<script>
  export let transparent = false;
  export let none = false;
</script>

<style lang="less">
  .web-assistant-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    z-index: 999998;
    &.transparent {
      background: none;
    }
    &.none {
      background: none;
      width: 0;
      height: 0;
      overflow: visible;
    }
  }
</style>
