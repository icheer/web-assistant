<template lang="pug">
  svelte:options(tag="introduce-comp")
  +if("isShow")
    mask-comp(transition:fade="{{duration: 150}}")
      .modal({style})
        .header
          span.title {title}
          +if("canClose")
            .close(title="{_t('close')}" on:click="{closeHandler}") ✖
        .body.scrollbar
          +each("list as item, index (index)")
            +if("idx === index")
              .content(in:fly="{transitionInParams}" out:fly="{transitionOutParams}")
                +if("!isHtml")
                  div {item.text || ''}
                +if("isHtml")
                  div {@html item.text || ''}
        .footer
          +if("canPrev")
            .btn.prev(on:click="{prevHandler}" class:disabled="{btnDisabled}") {prevText}
          +if("canNext")
            .btn.next(on:click="{nextHandler}" class:disabled="{btnDisabled}")
              span {nextText}
              +if("showSteps")
                span &nbsp;({idx + 1}/{list.length})
          +if("canConfirm")
            .btn.confirm(on:click="{confirmHandler}" class:disabled="{btnDisabled}") {confirmText}
</template>

<script>
  import './mask-comp.svelte';
  import _t from '@/helper/i18n';
  import { fade, fly } from 'svelte/transition';
  import { get, introParams, clear } from '@/store/store';
  import { tick, onMount } from 'svelte';
  import { sleep } from '@/helper/func';

  let isShow = false;
  let idx = 0;
  let lastIdx = -1;
  let btnDisabled = false;
  let style = '';

  $: params = get(introParams);
  $: canClose = getAttr('canClose');
  $: title = getAttr('title', 'Intro');
  $: onClose = getAttr('onClose');
  $: list = getAttr('list', []);
  $: showSteps = getAttr('showSteps');
  $: isHtml = getAttr('dangerouslyUseHTMLString');
  $: prevText = getAttr('prevText');
  $: nextText = getAttr('nextText');
  $: confirmText = getAttr('confirmText');
  $: onConfirm = getAttr('onConfirm');

  $: canPrev = idx > 0;
  $: canNext = idx < list.length - 1;
  $: transitionInParams = {
    x: idx >= lastIdx ? 300 : -300,
    duration: 300,
    delay: 150
  };
  $: transitionOutParams = {
    x: idx >= lastIdx ? -300 : 300,
    duration: 300
  };
  $: canConfirm = idx === list.length - 1;
  $: {
    const {
      width = '75vw',
      height = '60vh',
      top = '13vh'
    } = params.style || {};
    style = `width: ${width}; height: ${height}; top: ${top}`;
  }

  onMount(() => {
    show();
  });

  function getAttr(name, defaultValue) {
    const val = params[name];
    return val !== undefined ? val : defaultValue;
  }

  function show() {
    isShow = true;
  }

  function hide() {
    isShow = false;
    clear();
  }

  function closeHandler() {
    hide();
    onClose();
  }

  function prevHandler() {
    if (btnDisabled) return;
    lockBtn(500);
    idx--;
    setTimeout(() => {
      lastIdx = idx;
    }, 0);
  }

  function nextHandler() {
    if (btnDisabled) return;
    lockBtn(500);
    idx++;
    setTimeout(() => {
      lastIdx = idx;
    }, 0);
  }

  function confirmHandler() {
    if (btnDisabled) return;
    hide();
    onConfirm();
  }

  function lockBtn(time = 300) {
    btnDisabled = true;
    setTimeout(() => {
      btnDisabled = false;
    }, time);
  }
</script>

<style lang="less">
  @import '../assets/common.less';
  .modal {
    position: absolute;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    left: 0;
    right: 0;
    margin: 0 auto;
    padding: 12px 25px 16px;
    box-sizing: border-box;
    background-color: #fff;
    border-radius: 4px;
    font-size: 16px;
    color: #000;
    & > div {
      flex-grow: 0;
      flex-shrink: 0;
    }
    .header {
      white-space: nowrap;
      height: 50px;
      line-height: 50px;
      color: #333;
      border-bottom: 0.5px solid #e5e5e5;
      box-sizing: border-box;
      .title {
        font-size: 18px;
        font-weight: 700;
      }
      .close {
        position: absolute;
        top: 12px;
        right: 22px;
        line-height: 30px;
        margin: 10px 0;
        width: 30px;
        text-align: center;
        font-size: 20px;
        color: #888;
        user-select: none;
        cursor: pointer;
      }
    }
    .body {
      position: relative;
      flex-grow: 1;
      flex-shrink: 1;
      padding: 12px 4px 0;
      margin-bottom: 12px;
      max-height: calc(100% - 80px);
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto;
      .content {
        position: absolute;
        line-height: 1.5;
        white-space: pre-wrap;
        text-align: justify;
      }
    }
    .footer {
      display: flex;
      justify-content: flex-end;
      user-select: none;
      .btn {
        min-width: 60px;
        height: 18px;
        line-height: 18px;
        padding: 6px 12px;
        box-sizing: content-box;
        background-color: #409eff;
        color: #fff;
        text-align: center;
        font-size: 14px;
        user-select: none;
        cursor: pointer;
        border-radius: 3px;
        transition: all 0.15s;
        & + .btn {
          margin-left: 16px;
        }
        &.disabled {
          opacity: 0.5;
        }
        &.prev {
          background-color: #eee;
          color: #555;
        }
      }
    }
  }
</style>
