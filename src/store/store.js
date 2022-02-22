import { writable, derived, get } from 'svelte/store';
export { get } from 'svelte/store';
import { tick } from 'svelte';
import { noop, sleep } from '@/helper/func';
import _t from '@/helper/i18n';
const duration = 150;

export const isShowMask = writable(false);

export const isShowToast = writable(false);
export const isExistToast = writable(false);
export const toastParams = writable({});

export const isShowIntro = writable(false);
export const introParams = writable({});

export const isShowGuide = writable(false);
export const guideParams = writable({});

export const isShowFeedback = writable(false);
export const feedbackParams = writable({});

export const showMask = async () => {
  await sleep(duration);
  isShowMask.set(true);
};

let toastTimer = null;
export const showToast = async payload => {
  await sleep(duration);
  return new Promise((resolve, reject) => {
    const isEmptyPayload = ['', undefined, null].includes(payload);
    if (isEmptyPayload) reject('invalid params: ', payload);
    const type = typeof payload;
    let params = {
      text: '',
      duration: 3000,
      position: 'bottom',
      callback: noop
    };
    if (type === 'string' || type === 'number') {
      params.text = payload.toString();
    } else if (type === 'object') {
      params = Object.assign(params, payload);
    } else {
      reject('params should be string or object');
    }
    toastParams.set(params);
    isShowToast.set(true);
    isExistToast.set(true);
    const { duration, callback } = params;
    // make sure the promise will be resolved after duration ms
    setTimeout(() => {
      const handler = callback();
      resolve(handler);
    }, duration);
    // debounce
    clearTimeout(toastTimer);
    toastTimer = setTimeout(async () => {
      isShowToast.set(false);
      await sleep(duration);
      if (!get(isShowToast)) {
        isExistToast.set(false);
      }
    }, duration);
  });
};

export const clear = async () => {
  await sleep(duration);
  isShowIntro.set(false);
  isShowGuide.set(false);
  isShowFeedback.set(false);
  isShowMask.set(false);
  isShowToast.set(false);
};

export const setIntroParams = async payload => {
  await sleep(duration);
  let params = {
    title: 'Intro',
    list: [],
    dangerouslyUseHTMLString: false,
    showSteps: false,
    canClose: false,
    onClose: noop,
    prevText: _t('prev'),
    nextText: _t('next'),
    confirmText: _t('confirm'),
    onConfirm: noop,
    style: {}
  };
  params = Object.assign(params, payload);
  introParams.set(params);
  isShowIntro.set(true);
};

export const setGuideParams = async payload => {
  await sleep(duration);
  let params = {
    list: [],
    showSteps: false,
    dangerouslyUseHTMLString: false,
    canClose: false,
    onClose: noop,
    closeText: _t('close'),
    canPrev: true,
    prevText: _t('prev'),
    nextText: _t('next'),
    confirmText: _t('confirm'),
    onConfirm: noop,
    popperStyle: ''
  };
  params = Object.assign(params, payload);
  guideParams.set(params);
  isShowGuide.set(true);
};

export const setFeedbackParams = async payload => { };