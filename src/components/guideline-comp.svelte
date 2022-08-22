<template lang="pug">
  svelte:options(tag="guideline-comp")
  +if("isShow")
    mask-comp(transparent notyping)
      +if("!isBusy")
        .dummy.dummy1(bind:this="{dummyElement1}" style="{currentDummyStyle}" transition:fade="{{duration: transition ? 150 : 0}}")
        .dummy.dummy2(bind:this="{dummyElement2}" style="{currentDummyStyle}" transition:fade="{{duration: transition ? 150 : 0}}")
      +if("!isBusy")
        .popper(bind:this="{popperElement}" class="{current.position || 'bottom'}" style="{currentPopperStyle}")
          +if("!isHtml")
            span.pre {current.text || ''}
          +if("isHtml")
            span.pre {@html current.text || ''}
          .btns(class:disabled="{isBusy}")
            span
              +if("canClose && canNext")
                .btn(on:click="{closeHandler}") {closeText}
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
  import './mask-comp.svelte';
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { get, guideParams, clear } from '@/store/store';
  import { sel, copy, sleep, noop } from '@/helper/func';

  let idx = 0;
  let current = {};
  let currentDummyStyle = '';
  let currentPopperStyle = '';
  let popperElement = null;
  let dummyElement1 = null;
  let dummyElement2 = null;
  let isShow = false;
  let isBusy = false;

  $: params = get(guideParams);
  $: transition = getAttr('transition');
  $: list = getAttr('list');
  $: showSteps = getAttr('showSteps');
  $: isHtml = getAttr('dangerouslyUseHTMLString');
  $: canPrev = idx > 0 && getAttr('canPrev');
  $: canNext = idx < list.length - 1;
  $: canClose = getAttr('canClose');
  $: onClose = getAttr('onClose');
  $: closeText = getAttr('closeText');
  $: prevText = getAttr('prevText');
  $: nextText = getAttr('nextText');
  $: confirmText = getAttr('confirmText');
  $: onConfirm = getAttr('onConfirm');
  $: popperStyle = getAttr('popperStyle');

  onMount(() => {
    init();
  });

  function init() {
    const firstItem = list[0];
    if (!firstItem) return hide();
    show();
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
      return hide();
    }
    dom.scrollIntoViewIfNeeded();
    current = {};
    const { top, left, width, height } = dom.getBoundingClientRect();
    current = { ...item, domStyle: { top, left, width, height } };
    tick().then(() => {
      renderDummy();
      renderPopper();
    });
  }

  // 占位透明元素的style
  function renderDummy() {
    const keys = ['width', 'height', 'top', 'left'];
    const styleList = keys.map(k => `${k}:${current.domStyle[k] + 'px'}`);
    currentDummyStyle = styleList.join(';');
  }

  // 气泡的style
  async function renderPopper() {
    const gap = 10;
    const {
      top: imgTop,
      left: imgLeft,
      width: imgWidth,
      height: imgHeight
    } = current.domStyle || {};
    let {
      width: popperWidth = 'auto',
      maxWidth: popperMaxWidth = 'auto',
      position = 'bottom'
    } = current;
    currentPopperStyle = `width:${popperWidth};max-width:${popperMaxWidth};top:auto;left:auto;opacity:0;${popperStyle}`;
    await sleep(0);
    if (!popperElement) return console.error('no popper element');
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
    const styleStr = `width:${popperWidth};max-width:${popperMaxWidth};top:${popperTop}px;left:${popperLeft}px;opacity:0;${popperStyle}`;
    currentPopperStyle = styleStr;
    await sleep(0);
    currentPopperStyle = styleStr.replace('opacity:0;', 'opacity:1');
  }

  function getAttr(name, defaultValue) {
    const val = params[name];
    return val !== undefined ? val : defaultValue;
  }

  async function prevHandler() {
    const { onPrev = noop } = current;
    isBusy = true;
    await sleep(20);
    await onPrev();
    await process(--idx);
    isBusy = false;
  }

  async function nextHandler() {
    const { onNext = noop } = current;
    isBusy = true;
    await sleep(20);
    await onNext();
    await process(++idx);
    isBusy = false;
  }

  function confirmHandler() {
    hide();
    onConfirm();
  }

  function closeHandler() {
    hide();
    onClose();
  }

  function show() {
    isShow = true;
  }

  function hide() {
    isShow = false;
    clear();
  }
</script>

<style lang="less">
  .web-assistant-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    // background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    z-index: 999999;
  }
  .dummy {
    position: absolute;
    user-select: none;
    cursor: default;
    -webkit-touch-callout: none;
    // background-color: red;
    &.dummy {
      &:before,
      &:after {
        display: block;
        position: absolute;
        content: '';
        background-color: rgba(0, 0, 0, 0.5);
      }
      &.dummy1:before {
        top: -2000px;
        left: -3000px;
        width: 6000px;
        height: 2000px;
      }
      &.dummy1:after {
        bottom: -2000px;
        left: -3000px;
        width: 6000px;
        height: 2000px;
      }
      &.dummy2:before {
        top: 0px;
        left: -3000px;
        width: 3000px;
        height: 100%;
      }
      &.dummy2:after {
        top: 0px;
        right: -3000px;
        width: 3000px;
        height: 100%;
      }
    }
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
    // transition: all 0.15s;
    opacity: 0;
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
      display: inline-block;
      min-height: 1.5em;
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
          opacity: 0.5;
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
