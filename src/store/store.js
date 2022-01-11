import { writable, derived, get } from 'svelte/store';
export { get } from 'svelte/store';
import { tick } from 'svelte';
import { noop } from '@/helper/func';
import _t from '@/helper/i18n';

export const isShowIntro = writable(false);
export const isShowGuide = writable(false);
export const isShowFeedback = writable(false);

export const introParams = writable({});
export const guideParams = writable({});
export const feedbackParams = writable({});

export const setIntroParams = function (payload) {
  let params = {
    title: 'Intro',
    list: [],
    dangerouslyUseHTMLString: false,
    showClose: false,
    onClose: noop,
    prevText: _t('prev'),
    nextText: _t('next'),
    confirmText: _t('confirm'),
    onConfirm: noop,
    style: {}
  };
  params = Object.assign(params, payload);
  introParams.set(params);
}

export const setGuideParams = function (payload) { }

export const setFeedbackParams = function (payload) { }