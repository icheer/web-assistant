<template lang="pug">
  svelte:options(tag="guideline-comp")
  img.img(src="{current.src}" alt="" style="{currentImageStyle}" draggable="false")
  .popper
    span {current.text}
</template>

<script>
  import 'html2canvas';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { get, isShowGuide, guideParams } from '@/store/store';
  import { sel, copy, sleep } from '@/helper/func';

  let idx = 0;
  let current = {};
  let currentImageStyle = '';

  $: params = get(guideParams);
  $: list = getAttr('list');
  $: showSteps = getAttr('showSteps');
  $: canSkip = getAttr('canSkip');
  $: onSkip = getAttr('onSkip');
  $: prevText = getAttr('prevText');
  $: nextText = getAttr('nextText');
  $: confirmText = getAttr('confirmText');
  $: onConfirm = getAttr('onConfirm');

  $: {
    const style = current.img || {};
    const styleList = Object.keys(style).map(key => `${key}:${style[key]}px`);
    currentImageStyle = styleList.join(';');
  }

  onMount(() => {
    init();
  });

  function init() {
    const firstItem = list[0];
    if (!firstItem) return hide();
    process(0);
  }

  function hide() {
    isShowGuide.set(false);
  }

  async function process(index) {
    idx = index;
    const item = list[index];
    const { selector } = item;
    const dom = sel(selector);
    if (!dom) {
      console.error(`cannot find dom: ${selector}`);
      return hide();
    }
    dom.scrollIntoViewIfNeeded();
    await sleep(0);
    const { top, left, width, height } = dom.getBoundingClientRect();
    const canvas = await html2canvas(dom, { allowTaint: true, useCORS: true });
    const src = canvas.toDataURL('image/png');
    current = { ...item, src, img: { top, left, width, height } };
    console.log(current);
  }

  function getAttr(name, defaultValue) {
    const val = params[name];
    return val !== undefined ? val : defaultValue;
  }
</script>

<style lang="less">
  .img {
    position: absolute;
    user-select: none;
    cursor: default;
    // pointer-events: none;
  }
</style>
