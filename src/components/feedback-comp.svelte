<template lang="pug">
  svelte:options(tag="feedback-comp")
  +if("isShow")
    .feedback-wrap(bind:this="{dom}" class:busy="{isBusy}" style="bottom: {bottom}" on:click="{wrapClickHandler}")
      +if("isFold")
        .thumb(transition:fly="{{x: 40, duration: 300}}" on:click="{expandHandler}")
          img.icon.icon-feedback(src="{imgFeedback}" alt="")
          img.icon.icon-arrow(src="{imgArrowLeft}" alt="")
        .popper
          .tooltip {title}
      +if("!isFold")
        .body(
          class:cn="{checkIfCn()}"
          class:validating="{isValidating}"
          use:clickOutside="{foldHandler}"
          transition:fly="{{x: 430, duration: 300, opacity: 0.5}}"
        )
          .top-bar
            h3 {title}
            .btn(on:click="{submitHandler}") {_t('submit')}
          +if("isShowFullName")
            .line
              .label(class:required="{isRequireFullName}" draggable="none")
                span {_t('fullName')}：
              .value
                input(type="text" bind:value="{form.fullName}" class:empty="{!form.fullName.trim()}")
          +if("isShowEmail")
            .line
              .label(class:required="{isRequireEmail}" draggable="none")
                span {_t('email')}：
              .value
                input(type="text" bind:value="{form.email}" class:empty="{!form.email.trim()}")
          +if("isShowProblem")
            .line
              .label(class:required="{isRequireProblem}" draggable="none")
                span {_t('suggestionsAbout')}：
              .value
                select(bind:value="{form.suggestionsAbout}" class:empty="{!form.suggestionsAbout.trim()}")
                  +each("problemList as problemItem")
                    option(value="{problemItem.value}") {problemItem.label}
          +if("true")
            .line
              .label.required(draggable="none") {_t('suggestion')}：
              .value
                textarea(bind:value="{form.suggestionText}" class:empty="{!form.suggestionText.trim()}")
          +if("isShowScreenshot")
            .line
              .label(draggable="none")
                span {_t('screenshot')}：
              .value
                label(for="shot")
                  input(type="checkbox" id="shot" bind:checked="{isNeedScreenshot}")
                  span {_t('yes')}
</template>

<script>
  import html2canvas from 'html2canvas';
  import { onMount, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { get, feedbackParams } from '@/store/store';
  import { sel, copy, sleep, noop, checkIfCn } from '@/helper/func';
  import _t from '@/helper/i18n';
  import { clickOutside } from '@/helper/use';

  import { imgFeedback, imgArrowLeft } from '../assets/img/';
  let p = get(feedbackParams);
  let dom = null;
  let isShow = false;
  let isFold = !!p.folded;
  let isBusy = false;
  let form = {
    fullName: '',
    email: '',
    suggestionsAbout: '',
    screenshot: null,
    suggestionText: ''
  };
  let isNeedScreenshot = p.screenshotNeeded;
  let isValidating = false;

  $: title = p.title || '';
  $: bottom = p.bottom;
  $: isShowFullName = p.fullNameVisible;
  $: isRequireFullName = p.fullNameRequired;
  $: isShowEmail = p.emailVisible;
  $: isRequireEmail = p.emailRequired;
  $: isShowProblem = p.problemVisible;
  $: isRequireProblem = p.problemRequired;
  $: problemList = p.problemList || [];
  $: isShowScreenshot = p.screenshotVisible;
  $: callback = p.callback;

  onMount(() => {
    init();
  });

  function init() {
    isShow = true;
  }

  function resetForm() {
    isValidating = false;
    for (const key in form) {
      if (key === 'screenshot') {
        form[key] = null;
      } else {
        form[key] = '';
      }
    }
  }

  function expandHandler() {
    isFold = false;
  }

  function foldHandler() {
    if (isFold) return;
    isFold = true;
    isValidating = false;
  }

  function wrapClickHandler(e) {
    e.stopPropagation();
  }

  async function submitHandler() {
    isValidating = false;
    await sleep(0);
    isValidating = true;
    await sleep(0);
    const isInvalid = dom.querySelector('.label.required+.value .empty');
    if (isInvalid) return;
    isFold = true;
    if (isNeedScreenshot) {
      const blob = await screenshotBody();
      form.screenshot = blob;
    }
    const fd = new FormData();
    for (const key in form) {
      const val = form[key];
      if (key === 'screenshot') {
        if (val) {
          fd.append('file', val, `screenshot-${Date.now()}.png`);
        }
      } else {
        fd.append(key, val);
      }
    }
    resetForm();
    callback(fd);
    // dispatchEvent(dom, 'feedback', fd);
  }

  async function screenshotBody() {
    isBusy = true;
    await sleep(0);
    const canvas = await html2canvas(document.body, {
      allowTaint: true,
      useCORS: true
    }).catch(e => {
      isBusy = false;
    });
    isBusy = false;
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(blob);
      });
    });
  }
</script>

<style lang="less">
  .feedback-wrap {
    position: fixed;
    z-index: 9997;
    z-index: 999997;
    right: 0;
    .thumb {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 40px;
      height: 40px;
      background-color: #fff;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      user-select: none;
      cursor: pointer;
      // while hovering
      &:hover {
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
        .icon {
          &.icon-feedback {
            opacity: 0;
          }
          &.icon-arrow {
            opacity: 1;
          }
        }
        & + .popper {
          display: block;
        }
      }
      .icon {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 8px;
        transition: opacity 0.25s;
        &.icon-feedback {
          opacity: 1;
        }
        &.icon-arrow {
          opacity: 0;
        }
      }
    }
    .popper {
      display: none;
      position: absolute;
      bottom: 0;
      right: 48px;
      height: 40px;
      box-sizing: border-box;
      padding: 8px 12px;
      background-color: #fff;
      border: 1px solid #eee;
      border-radius: 4px;
      white-space: nowrap;
      font-size: 12px;
      user-select: none;
      .tooltip {
        display: inline-block;
        line-height: 22px;
      }
    }
    .body {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 430px;
      padding: 14px 12px 6px 14px;
      box-sizing: border-box;
      background-color: #fff;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      &.cn {
        width: 400px;
        .line .label {
          width: 80px;
        }
      }
      // show invalid red shadow
      &.validating {
        .required + .value .empty {
          animation: blink 0.5s forwards;
        }
      }
      .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        h3 {
          margin: 0;
          padding: 0;
          text-align: left;
          font-size: 17px;
          font-weight: 600;
          user-select: none;
        }
        .btn {
          min-width: 40px;
          height: 18px;
          line-height: 18px;
          padding: 4px 12px;
          box-sizing: content-box;
          background-color: #409eff;
          color: #fff;
          text-align: center;
          font-size: 14px;
          user-select: none;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.15s;
        }
      }
      .line {
        position: relative;
        display: flex;
        align-items: top;
        padding: 5px 0;
        font-weight: 600;
        color: #333;
        font-size: 13px;
        .label {
          position: relative;
          width: 170px;
          line-height: 24px;
          flex-grow: 0;
          flex-shrink: 0;
          white-space: nowrap;
          user-select: none;
          &.required {
            &:before {
              position: absolute;
              content: '*';
              margin: -1px 0 0 -7px;
              font-size: 13px;
              color: red;
            }
          }
        }
        .value {
          position: relative;
          flex-grow: 1;
          flex-shrink: 1;
          input[type='text'],
          select,
          textarea {
            width: 100%;
            box-sizing: border-box;
            // outline-color: #409eff;
            outline: none !important;
            border-color: rgb(118, 118, 118) !important;
            border-width: 1px;
            font-size: 14px;
          }
          input[type='text'],
          select {
            height: 24px;
          }
          textarea {
            resize: none;
            height: calc(6em + 6px);
            line-height: 1.5em;
            padding: 2px;
            font-family: system;
          }
          label {
            input[type='checkbox'],
            span {
              display: inline-block;
              height: 24px;
              line-height: 24px;
              padding: 0;
              margin: 0;
              vertical-align: middle;
              user-select: none;
            }
            input {
              cursor: pointer;
              & + span {
                margin-left: 6px;
              }
            }
          }
        }
      }
    }
    @keyframes blink {
      dfrom {
        box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0);
      }
      40% {
        box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0);
      }
      50% {
        box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0.8);
      }
      60% {
        box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0);
      }
      90% {
        box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0);
      }
      to {
        box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0.8);
      }
    }
  }
</style>
