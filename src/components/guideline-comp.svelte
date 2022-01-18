<template lang="pug">
  svelte:options(tag="guideline-comp")
  +if("current.selector")
    div(transition:fade="{{duration: 150}}")
      img.img(src="{current.imgSrc}" alt="" style="{currentImageStyle}" draggable="false")
      .popper(style="{currentPopperStyle}")
        span {current.text || ''}
</template>

<script>
  import 'html2canvas';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { get, isShowGuide, guideParams } from '@/store/store';
  import { sel, copy, sleep } from '@/helper/func';

  let idx = 0;
  let current = {};
  let currentImageStyle = '';
  let currentPopperStyle = '';

  $: params = get(guideParams);
  $: list = getAttr('list');
  $: showSteps = getAttr('showSteps');
  $: canSkip = getAttr('canSkip');
  $: onSkip = getAttr('onSkip');
  $: prevText = getAttr('prevText');
  $: nextText = getAttr('nextText');
  $: confirmText = getAttr('confirmText');
  $: onConfirm = getAttr('onConfirm');

  // 截图的style
  $: {
    const style = current.imgStyle || {};
    const styleList = Object.keys(style).map(key => `${key}:${key==='width'?'auto':style[key]}px`);
    currentImageStyle = styleList.join(';');
  }
  // 气泡的style
  $: {
    const { width = 'auto', maxWidth = 'auto' } = current;
    currentPopperStyle = `width:${width};max-width:${maxWidth}`;
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

  // get DOM by index, and take a screenshot for it
  async function process(i) {
    idx = i;
    const item = list[i];
    const { selector } = item;
    const dom = sel(selector);
    if (!dom) {
      console.error(`cannot find dom: ${selector}`);
      return hide();
    }
    dom.scrollIntoViewIfNeeded();
    const canvas = await html2canvas(dom, { allowTaint: true, useCORS: true });
    const imgSrc = canvas.toDataURL('image/png');
    const { top, left, width, height } = dom.getBoundingClientRect();
    current = { ...item, imgSrc, imgStyle: { top, left, width, height } };
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
  .popper {
    padding: 10px;
    background-color: #fff;
    box-sizing: border-box;
    border-radius: 4px;
    text-align: justify;
  }
</style>
