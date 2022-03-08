import { sel, CE, sleep } from '@/helper/func';
import { showMask, showToast, setIntroParams, setGuideParams, setFeedbackParams, isShowFeedback, clear } from '@/store/store';
(function (window) {
  if (!window) return;
  if (window.webAssistant) return;
  const checkIfHasComp = () => !!sel('body web-assistant');
  if (checkIfHasComp()) return console.error('already have a <web-assistant /> in html');

  const obj = {
    // insert web component
    init() {
      if (checkIfHasComp()) return;
      const comp = CE('web-assistant');
      document.body.appendChild(comp);
      window.addEventListener('keyup', e => {
        if (e.key === 'Escape') {
          clear();
        }
      });
    },
    // show mask
    mask(payload) {
      this.init();
      return showMask(payload);
    },
    // show toast
    toast(payload) {
      this.init();
      return showToast(payload);
    },
    // hide
    clear() {
      this.init();
      return clear();
    },
    // show introduction modal
    intro(payload) {
      this.init();
      if (!payload) return console.error('no params');
      return setIntroParams(payload);
    },
    // show guideline
    guideline(payload) {
      this.init();
      if (!payload) return console.error('no params');
      return setGuideParams(payload);
    },
    // show feedback
    feedback(payload) {
      this.init();
      if (!payload) return console.error('no params');
      return setFeedbackParams(payload);
    },
    sleep(time) {
      return sleep(time);
    }
  };
  obj.intro.clear = clear;
  obj.guideline.clear = clear;
  obj.feedback.clear = () => isShowFeedback.set(false);
  window.webAssistant = obj;
})(window);

export const webAssistant = window.webAssistant;
