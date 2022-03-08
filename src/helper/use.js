export const clickOutside = (dom, callback) => {
  dom.addEventListener('click', e => e.stopPropagation());
  const bodyClickHandler = e => {
    callback(e);
  }
  document.body.addEventListener('click', bodyClickHandler);
  return {
    destroy() {
      document.body.removeEventListener('click', bodyClickHandler);
    }
  }
};
