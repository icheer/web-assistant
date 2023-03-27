<template lang="pug">
  svelte:options(tag="cursor-comp")
  mask-comp(transparent none="{noMask}")
    +if("isShow")
      .web-assistant-cursor(transition:fade="{{duration: 300}}")
        .cursor(class="{type}" class:highlight="{highlight}" class:clicking="{isClicking}")
          img(src="{imgCursor}" alt="" class="{type}" draggable="false")
    style(bind:this="{styleComp}")
</template>

<script>
  import './mask-comp.svelte';
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { get, cursorParams, isShowCursor, clear } from '@/store/store';
  import { sel, copy, sleep, noop } from '@/helper/func';

  import imgsObject from '@/assets/img';
  const durationAtEnd = 300;
  const durationBeforeClick = 150;
  const durationClick = 150;

  let isShow = false;
  let isClicking = false;
  let imgCursor = '';
  let x1 = 0;
  let y1 = 0;
  let x2 = 100;
  let y2 = 100;
  let time = 500;
  let styleComp = null;
  let timer = null;

  $: params = get(cursorParams);
  $: type = getAttr('type');
  $: scale = getAttr('scale');
  $: from = getAttr('from');
  $: to = getAttr('to');
  $: highlight = getAttr('highlight');
  $: clickAfterMove = getAttr('clickAfterMove', false);
  $: clickEffect = getAttr('clickEffect', false);
  $: stay = getAttr('stay', 0);
  $: noMask = !getAttr('overlay');
  $: imgCursor = imgsObject.cursors[type] || imgsObject.cursors['default'];

  onMount(() => {
    start();
  });

  function start() {
    if (window.webAssistantCursorTimer) {
      clearTimeout(window.webAssistantCursorTimer);
      timer = null;
    }
    time = getAttr('duration');
    const from = getTarget('from');
    const to = getTarget('to');
    if (!to) return fin();
    x2 = to.x;
    y2 = to.y;
    if (from) {
      x1 = from.x;
      y1 = from.y;
    } else {
      const pos = getStartPosition();
      x1 = pos.x;
      y1 = pos.y;
    }
    insertStyle();
    isShow = true;
    if (to.dom) {
      if (clickAfterMove) {
        window.webAssistantCursorTimer = setTimeout(() => {
          to.dom.click();
          if (clickEffect) {
            isClicking = true;
            sleep(durationClick * 0.85).then(() => {
              isClicking = false;
            });
          }
        }, time + durationBeforeClick);
      }
    }
    const totalTime =
      time + stay + ((clickEffect && durationBeforeClick + durationClick) || 0);
    fin(totalTime);
  }

  function getAttr(name, defaultValue) {
    const val = params[name];
    return val !== undefined ? val : defaultValue;
  }

  function getTarget(key) {
    let x = 0;
    let y = 0;
    let dom = null;
    let val = params[key] || '';
    if (!val) return;
    const regex = /^\d+\s*\,\s*\d+$/;
    if (regex.test(val)) {
      val = val.replace(/\s/g, '');
      const arr = val.split(',');
      x = arr[0];
      y = arr[1];
    } else {
      let el = null;
      if (val instanceof Element) {
        el = val;
      } else {
        el = sel(val);
      }
      if (!el) return console.error("can't find element");
      dom = el;
      const rect = el.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    return { x, y, dom };
  }

  function getStartPosition() {
    let x = 0;
    let y = 0;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (x2 <= 0.5 * w) {
      x = x2 + 200;
    } else {
      x = x2 - 200;
    }
    if (y2 <= 0.5 * y) {
      y = y2 + 200;
    } else {
      y = y2 - 200;
    }
    return { x, y };
  }

  function insertStyle() {
    const percentageShrink =
      time <= durationAtEnd
        ? '99%'
        : ((durationAtEnd / time) * 100).toFixed(2) + '%';
    styleComp.innerHTML = `
      .web-assistant-cursor div.cursor {
        animation: move ${time / 1000}s forwards;
      }

      @keyframes move {
        from {
          top: ${y1}px;
          left: ${x1}px;
          transform: scale(${1.5 * scale});
        }

        ${percentageShrink} {
          transform: scale(${scale});
        }

        to {
          top: ${y2}px;
          left: ${x2}px;
          transform: scale(${1 * scale});
        }
      }
    `;
  }

  function fin(duration = 0) {
    return sleep(duration).then(() => {
      isShow = false;
      isClicking = false;
    });
  }
</script>

<style lang="less">
  .none {
    width: 0;
    height: 0;
  }
  .web-assistant-cursor {
    position: absolute;
    pointer-events: none;
    .cursor {
      position: absolute;
      width: 16px;
      height: 24px;
      transform-origin: 0 0;
      user-select: none;
      &:before,
      &:after {
        position: absolute;
        z-index: 1;
        content: '';
        border-radius: 50%;
      }
      &.pointer {
        &:before {
          margin-top: -10%;
          margin-left: -20%;
        }
        &:after {
          margin-left: 14%;
        }
        img {
          margin-left: -30%;
        }
      }
      &:before {
        display: none;
        top: -8px; // 12- 半径20
        left: -14px; // 8 - 半径20
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 0, 0.3);
      }
      &:after {
        display: block;
        top: -15px;
        left: -15px;
        width: 30px;
        height: 30px;
        box-sizing: border-box;
        border: 3px solid rgba(255, 0, 0, 0.3);
        transform-origin: 50% 50%;
        transform: scale(0);
        opacity: 1;
        transition: all 0.15s;
      }
      &.clicking:after {
        transform: scale(1.25);
        opacity: 0.6;
      }
      &.highlight:before {
        display: block;
      }
      img {
        position: absolute;
        z-index: 2;
        width: 100%;
        height: auto;
      }
    }
  }
</style>
