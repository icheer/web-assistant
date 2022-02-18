<template lang="pug">
  svelte:options(tag="guideline-comp")
  +if("current.selector")
    div(transition:fade="{{duration: 150}}")
      +if("!isBusy")
        img.img(src="{current.imgSrc}" alt="" style="{currentImageStyle}" draggable="false")
      +if("!isBusy")
        .popper(bind:this="{popperElement}" class="{current.position || 'bottom'}" style="{currentPopperStyle}")
          span.pre {current.text || ''}
          .btns(class:disabled="{isBusy}")
            span
              +if("canSkip && canNext")
                .btn(on:click="{skipHandler}") {skipText}
            span
              +if("canPrev")
                .btn(on:click="{prevHandler}") {prevText}
              +if("canNext")
                .btn.next(on:click="{nextHandler}")
                  span {nextText}
                  +if("showSteps")
                    span &nbsp;({idx + 1}/{list.length})
              +if("!canNext")
                .btn.confirm(on:click="{confirmHandler}") {confirmText}
</template>

<script>
  import 'html2canvas';
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { get, isShowGuide, guideParams, clear } from '@/store/store';
  import { sel, copy, sleep, noop } from '@/helper/func';

  let idx = 0;
  let current = {};
  let currentImageStyle = '';
  let currentPopperStyle = '';
  let popperElement = null;
  let isBusy = false;

  $: params = get(guideParams);
  $: list = getAttr('list');
  $: showSteps = getAttr('showSteps');
  $: canPrev = idx > 0 && getAttr('canPrev');
  $: canNext = idx < list.length - 1;
  $: canSkip = getAttr('canSkip');
  $: onSkip = getAttr('onSkip');
  $: skipText = getAttr('skipText');
  $: prevText = getAttr('prevText');
  $: nextText = getAttr('nextText');
  $: confirmText = getAttr('confirmText');
  $: onConfirm = getAttr('onConfirm');
  $: popperStyle = getAttr('popperStyle');

  // 截图的style
  $: {
    const style = current.imgStyle || {};
    const styleList = Object.keys(style).map(
      key => `${key}:${key === 'height' ? 'auto' : style[key] + 'px'}`
    );
    currentImageStyle = styleList.join(';');
  }
  // 气泡的style
  $: {
    const gap = 10;
    const {
      top: imgTop,
      left: imgLeft,
      width: imgWidth,
      height: imgHeight
    } = current.imgStyle || {};
    let {
      width: popperWidth = 'auto',
      maxWidth: popperMaxWidth = 'auto',
      position = 'bottom'
    } = current;
    currentPopperStyle = `width:${popperWidth};max-width:${popperMaxWidth};top:auto;left:auto;opacity:0;${popperStyle}`;
    sleep(0).then(() => {
      if (!popperElement) return;
      const rect = popperElement.getBoundingClientRect();
      let popperTop = 20;
      let popperLeft = 20;
      if (position === 'top-start') {
        popperTop = imgTop - rect.height - gap;
        popperLeft = imgLeft;
      } else if (position === 'top-end') {
        popperTop = imgTop - rect.height - gap;
        popperLeft = imgLeft + imgWidth - rect.width;
      } else if (position === 'top') {
        popperTop = imgTop - rect.height - gap;
        popperLeft = imgLeft + (imgWidth - rect.width) / 2;
      } else if (position === 'left-start') {
        popperTop = imgTop;
        popperLeft = imgLeft - rect.width - gap;
      } else if (position === 'left-end') {
        popperTop = imgTop + imgHeight - rect.height;
        popperLeft = imgLeft - rect.width - gap;
      } else if (position === 'left') {
        popperTop = imgTop + (imgHeight - rect.height) / 2;
        popperLeft = imgLeft - rect.width - gap;
      } else if (position === 'right-start') {
        popperTop = imgTop;
        popperLeft = imgLeft + imgWidth + gap;
      } else if (position === 'right-end') {
        popperTop = imgTop + imgHeight - rect.height;
        popperLeft = imgLeft + imgWidth + gap;
      } else if (position === 'right') {
        popperTop = imgTop + (imgHeight - rect.height) / 2;
        popperLeft = imgLeft + imgWidth + gap;
      } else if (position === 'bottom-start') {
        popperTop = imgTop + imgHeight + gap;
        popperLeft = imgLeft;
      } else if (position === 'bottom-end') {
        popperTop = imgTop + imgHeight + gap;
        popperLeft = imgLeft + imgWidth - rect.width;
      } else if (position === 'bottom' || true) {
        popperTop = imgTop + imgHeight + gap;
        popperLeft = imgLeft + (imgWidth - rect.width) / 2;
      }
      currentPopperStyle = `width:${popperWidth};max-width:${popperMaxWidth};top:${popperTop}px;left:${popperLeft}px;${popperStyle}`;
    });
  }

  onMount(() => {
    init();
  });

  function init() {
    const firstItem = list[0];
    if (!firstItem) return clear();
    process(0);
  }

  // get DOM by index, and take a screenshot for it
  async function process(i) {
    idx = i;
    const item = list[i];
    const { selector } = item;
    const dom = sel(selector);
    if (!dom) {
      console.error(`cannot find dom: ${selector}`);
      return clear();
    }
    dom.scrollIntoViewIfNeeded();
    current = {};
    const canvas = await html2canvas(dom, { allowTaint: true, useCORS: true });
    const imgSrc = canvas.toDataURL('image/png');
    const { top, left, width, height } = dom.getBoundingClientRect();
    current = { ...item, imgSrc, imgStyle: { top, left, width, height } };
  }

  function getAttr(name, defaultValue) {
    const val = params[name];
    return val !== undefined ? val : defaultValue;
  }

  async function prevHandler() {
    const { onPrev = noop } = current;
    isBusy = true;
    await sleep(0);
    await onPrev();
    await process(--idx);
    await sleep(0);
    isBusy = false;
  }

  async function nextHandler() {
    const { onNext = noop } = current;
    isBusy = true;
    await sleep(0);
    await onNext();
    await process(++idx);
    await sleep(0);
    isBusy = false;
  }

  function confirmHandler() {
    clear();
    onConfirm();
  }

  function skipHandler() {
    clear();
    onSkip();
  }
</script>

<style lang="less">
  .img {
    position: absolute;
    user-select: none;
    cursor: default;
    -webkit-touch-callout: none;
  }
  .popper {
    position: absolute;
    padding: 12px;
    background-color: #fff;
    box-sizing: border-box;
    border-radius: 4px;
    text-align: justify;
    font-size: 15px;
    line-height: 1.5;
    transition: all 0.15s;
    &:after {
      position: absolute;
      display: block;
      content: '';
      width: 10px;
      height: 10px;
      background-color: #fff;
      transform: rotate(45deg);
    }
    &.top:after {
      bottom: -5px;
      left: 0;
      right: 0;
      margin: 0 auto;
    }
    &.top-start:after {
      bottom: -5px;
      left: 12px;
    }
    &.top-end:after {
      bottom: -5px;
      right: 12px;
    }
    &.left:after {
      top: 0;
      bottom: 0;
      right: -5px;
      margin: auto 0;
    }
    &.left-start:after {
      top: 12px;
      right: -5px;
    }
    &.left-end:after {
      bottom: 12px;
      right: -5px;
    }
    &.right:after {
      top: 0;
      bottom: 0;
      left: -5px;
      margin: auto 0;
    }
    &.right-start:after {
      top: 12px;
      left: -5px;
    }
    &.right-end:after {
      bottom: 12px;
      left: -5px;
    }
    &.bottom:after {
      top: -5px;
      left: 0;
      right: 0;
      margin: 0 auto;
    }
    &.bottom-start:after {
      top: -5px;
      left: 12px;
    }
    &.bottom-end:after {
      top: -5px;
      right: 12px;
    }
  }
  .popper {
    .pre {
      white-space: pre-wrap;
    }
    .btns {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      margin-top: 16px;
      &.disabled {
        .btn {
          opacity: 0;
          pointer-events: none;
        }
      }
      .btn {
        display: inline-block;
        min-width: 50px;
        height: 18px;
        line-height: 18px;
        padding: 6px 12px;
        box-sizing: content-box;
        background-color: #eee;
        color: #555;
        text-align: center;
        font-size: 13px;
        user-select: none;
        cursor: pointer;
        border-radius: 3px;
        transition: all 0.15s;
        & + .btn {
          margin-left: 16px;
        }
        &.next,
        &.confirm {
          background-color: #409eff;
          color: #fff;
        }
      }
    }
  }
</style>
