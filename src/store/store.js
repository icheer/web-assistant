import { writable, get } from 'svelte/store';
export { get } from 'svelte/store';
import { noop, sleep } from '@/helper/func';
import _t from '@/helper/i18n';
const DURATION = 150;

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

export const isShowCursor = writable(false);
export const cursorParams = writable({});

export const isShowWatermark = writable(false);
export const watermarkParams = writable({});

let maskTimer = null;
export const showMask = async (payload = {}) => {
  await sleep(DURATION);
  return new Promise((resolve, reject) => {
    let params = {
      duration: 0
    };
    params = Object.assign(params, payload);
    const { duration } = params;
    isShowMask.set(true);
    if (!duration) return;
    // make sure the promise will be resolved after duration ms
    setTimeout(() => {
      resolve();
    }, duration);
    // debounce
    clearTimeout(maskTimer);
    maskTimer = setTimeout(async () => {
      isShowMask.set(false);
    }, duration);
  });

};

let toastTimer = null;
export const showToast = async payload => {
  await sleep(DURATION);
  return new Promise((resolve, reject) => {
    const isEmptyPayload = ['', undefined, null].includes(payload);
    if (isEmptyPayload) reject('invalid params: ', payload);
    const type = typeof payload;
    let params = {
      text: '',
      duration: 3000,
      position: 'bottom'
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
    const { duration } = params;
    // make sure the promise will be resolved after duration ms
    setTimeout(() => {
      resolve();
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
  await sleep(DURATION);
  isShowIntro.set(false);
  isShowGuide.set(false);
  isShowCursor.set(false);
  isShowMask.set(false);
  isShowToast.set(false);
};

export const setIntroParams = async payload => {
  await sleep(DURATION);
  let params = {
    title: 'Intro',
    transition: true,
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
  isShowMask.set(false);
};

export const setGuideParams = async payload => {
  await sleep(DURATION);
  let params = {
    list: [],
    transition: true,
    showSteps: false,
    dangerouslyUseHTMLString: false,
    canClose: false,
    closeText: _t('close'),
    onClose: noop,
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
  isShowMask.set(false);
};

export const setFeedbackParams = async payload => {
  if (!payload) {
    isShowFeedback.set(false);
    return;
  }
  isShowFeedback.set(false);
  await sleep(0);
  let params = {
    title: _t('suggestion'),
    bottom: '15px',
    emailVisible: true,
    emailRequired: false,
    nameVisible: false,
    nameRequired: false,
    problemVisible: false,
    problemRequired: true,
    problemList: [],
    screenshotVisible: true,
    screenshotNeeded: false,
    isFold: true,
    placeholder: '',
    callback: noop
  };
  params = Object.assign(params, payload);
  feedbackParams.set(params);
  isShowFeedback.set(true);
};

let cursorTimer = null;
export const setCursorParams = async payload => {
  if (cursorTimer) {
    clearTimeout(cursorTimer);
    cursorTimer = null;
    isShowCursor.set(false);
    await sleep(0);
  }
  if (!payload) {
    isShowCursor.set(false);
    return;
  }
  const durationDefault = 1500;
  const durationStayDefault = 150;
  const durationAtEnd = 300;
  const durationBeforeClick = 150;
  const durationClick = 150;
  const scaleDefault = 1;
  let params = {
    type: 'default',
    scale: scaleDefault,
    duration: durationDefault,
    stay: durationStayDefault,
    clickAfterMove: false,
    clickEffect: false,
    overlay: false
  };
  params = Object.assign(params, payload);
  if (params.scale < 0.2 || params.scale > 5) {
    params.scale = scaleDefault;
  }
  if (params.duration < 10 || params.duration > 10000 || !Number.isFinite(params.duration)) {
    params.duration = durationDefault;
  }
  if (params.stay < 0 || !Number.isFinite(params.stay)) {
    params.stay = durationStayDefault;
  }
  cursorParams.set(params);
  isShowCursor.set(true);
  const totalTime = params.duration
    + params.stay
    + durationAtEnd
    + (params.clickAfterMove && durationBeforeClick || 0)
    + (params.clickEffect && durationClick || 0);
  return new Promise(resolve => {
    cursorTimer = setTimeout(() => {
      isShowCursor.set(false);
      resolve();
    }, totalTime);
  });
};

export const setWatermarkParams = async payload => {
  await sleep(DURATION);
  let params = {
    persisted: false,
    dotSize: 5,
    dotGap: 15,
    patternGap: 165,
    color: '#ddd',
    patterns: []
  };
  params = Object.assign(params, payload);
  watermarkParams.set(params);
  isShowWatermark.set(true);
};