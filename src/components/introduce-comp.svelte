<template lang="pug">
  svelte:options(tag="introduce-comp")
  .modal({style})
    .header
      span.title {title}
      +if("canClose")
        .close(title="{_t('close')}" on:click="{closeHandler}") ✖
    .body.scrollbar
      +if("!isHtml")
        .content {currentText}
      +if("isHtml")
        .content {@html currentText}
    .footer
      +if("canPrev")
        .btn.prev(on:click="{prevHandler}") {prevText}
      +if("canNext")
        .btn.next(on:click="{nextHandler}") {nextText}
      +if("canConfirm")
        .btn.confirm(on:click="{confirmHandler}") {confirmText}
</template>

<script>
  import _t from '@/helper/i18n';
  import { get, isShowIntro, introParams } from '@/store/store';

  let idx = 0;
  let style = '';

  $: params = get(introParams);
  $: canClose = getAttr('canClose');
  $: title = getAttr('title', 'Intro');
  $: onClose = getAttr('onClose');
  $: list = getAttr('list', []);
  $: isHtml = getAttr('dangerouslyUseHTMLString');
  $: prevText = getAttr('prevText');
  $: nextText = getAttr('nextText');
  $: confirmText = getAttr('confirmText');
  $: onConfirm = getAttr('onConfirm');

  $: currentItem = list[idx] || {};
  $: currentId = currentItem.id;
  $: currentText = currentItem.text || '';
  $: canPrev = idx > 0;
  $: canNext = idx < list.length - 1;
  $: canConfirm = idx === list.length - 1;
  $: {
    const {
      width = '75vw',
      height = '60vh',
      top = '13vh'
    } = params.style || {};
    style = `width: ${width}; height: ${height}; top: ${top}`;
  }

  function getAttr(name, defaultValue = true) {
    const val = params[name];
    return val !== undefined ? val : defaultValue;
  }

  function closeHandler() {
    $isShowIntro = false;
    onClose();
  }

  function prevHandler() {
    idx--;
  }

  function nextHandler() {
    idx++;
  }

  function confirmHandler() {
    onConfirm();
  }
</script>

<style lang="less">
  @import '../assets/common.less';
  .modal {
    position: absolute;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    // top: 13vh;
    left: 0;
    right: 0;
    margin: 0 auto;
    // width: 75vw;
    // height: 60vh;
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
        text-align: center;
        min-width: 56px;
        height: 18px;
        line-height: 18px;
        padding: 6px 12px;
        box-sizing: content-box;
        background-color: #409eff;
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        border-radius: 3px;
        & + .btn {
          margin-left: 16px;
        }
        &.prev {
          background-color: #eee;
          color: #555;
        }
      }
    }
  }
</style>
