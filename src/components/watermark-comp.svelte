<template lang="pug">
  svelte:options(tag="watermark-comp")
  +if("$isShowWatermark && isShow")
    .patterns(bind:this="{patternsDom}" style="{patternsStyle}")
      +each("list as pattern, pIndex (pIndex)")
        .pattern(style="{patternStyle}")
          +each("pattern as line, lIndex (lIndex)")
            .line(style="{lineStyle}")
              +each("line as dot, dIndex (dIndex)")
                .dot(class:invis="{!dot}" style="{dotStyle}")
</template>

<script>
  import { onMount, tick } from 'svelte';
  import { get, watermarkParams, isShowWatermark, clear } from '@/store/store';
  import throttle from 'lodash/throttle';

  let isShow = false;
  let list = [];
  let patternsDom = null;

  $: params = get(watermarkParams);
  $: patterns = $watermarkParams.patterns || [];
  $: patternsStyle = `padding: ${params.patternGap / 2}px 0 0 ${
    params.patternGap / 2
  }px; gap: ${params.patternGap}px`;
  $: patternStyle = `gap: ${params.dotGap}px`;
  $: lineStyle = `gap: ${params.dotGap}px`;
  $: dotStyle = `width: ${params.dotSize}px; height: ${params.dotSize}px; background-color: ${params.color};`;

  const getPatternList = throttle(() => {
    const { patternGap, dotSize, dotGap } = params;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const patternSize = dotSize * 3 + dotGap * 2 + patternGap;
    const countInRow = Math.ceil(W / patternSize);
    const countInCol = Math.ceil(H / patternSize);
    const count = countInRow * countInCol;
    while (list.length < count) {
      list.push(...patterns);
    }
  }, 300);

  const persistIfNeeded = (time = 1000) => {
    if (!params.persisted) return;
    if (!$isShowWatermark) return;
    setTimeout(() => {
      if (!patternsDom || !patternsDom.clientHeight) {
        window.webAssistant.reset();
      } else {
        persistIfNeeded();
      }
    }, time);
    // let observer = new MutationObserver(mutations => {
    //   console.log('changed');
    // });
    // observer.observe(patternsDom, {
    //   childList: true,
    //   attributes: true,
    //   subtree: true
    // });
  };

  onMount(() => {
    isShow = true;
    getPatternList();
    window.addEventListener('resize', getPatternList, false);
    tick().then(() => {
      persistIfNeeded();
    });
  });
</script>

<style lang="less">
  .patterns {
    position: fixed;
    display: flex;
    flex-wrap: wrap;
    z-index: 9999;
    z-index: 999999;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    pointer-events: none;
    .pattern {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      .line {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          &.invis {
            background: none !important;
          }
        }
      }
    }
  }
</style>
