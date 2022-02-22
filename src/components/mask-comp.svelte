<template lang="pug">
  svelte:options(tag="mask-comp")
  .web-assistant-mask
    slot
</template>

<style lang="less">
  .web-assistant-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    z-index: 999999;
  }
</style>
