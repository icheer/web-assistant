import { sel, CE } from '@/helper/func';
import { showMask, showToast, setIntroParams, setGuideParams, setFeedbackParams, clear } from '@/store/store';
(function (window) {
  if (!window) return;
  if (window.webAssistant) return;
  const checkIfHasComp = () => !!sel('body web-assistant');
  if (checkIfHasComp()) return console.error('already have a <web-assistant /> in html');

  window.webAssistant = {
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
    mask() {
      this.init();
      showMask();
    },
    // show toast
    toast(payload) {
      this.init();
      return showToast(payload);
    },
    // hide
    clear() {
      this.init();
      clear();
    },
    // show introduction modal
    intro(payload) {
      this.init();
      if (!payload) return console.error('no params');
      setIntroParams(payload);
    },
    // show guideline
    guideline(payload) {
      this.init();
      if (!payload) return console.error('no params');
      setGuideParams(payload);
    },
    // show feedback
    feedback(payload) {
      this.init();
      if (!payload) return console.error('no params');
      setFeedbackParams(payload);
    }
  };
})(window);

export const webAssistant = window.webAssistant;
