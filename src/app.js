import { $, $ce } from '@/helper/func';
import { isShowIntro, isShowGuide, isShowFeedback, setIntroParams, setGuideParams, setFeedbackParams } from '@/store/store';
(function (window) {
  if (!window) return;
  if (window.webAssistant) return;
  const checkIfHasComp = () => !!$('body web-assistant');
  if (checkIfHasComp()) return console.error('already have a <web-assistant /> in html');

  window.webAssistant = {
    // insert web component
    init() {
      if (checkIfHasComp()) return;
      const comp = $ce('web-assistant');
      document.body.appendChild(comp);
    },
    // show introduction modal
    intro(payload) {
      this.init();
      if (!payload) return console.error('no params');
      setIntroParams(payload);
      isShowIntro.set(true);
    },
    // show guideline
    guideline(payload) {
      this.init();
      if (!payload) return console.error('no params');
      setGuideParams(payload);
      isShowGuide.set(true);
    },
    // show feedback
    feedback(payload) {
      this.init();
      if (!payload) return console.error('no params');
      setFeedbackParams(payload);
      isShowFeedback.set(true);
    }
  };
})(window);

export const webAssistant = window.webAssistant;
