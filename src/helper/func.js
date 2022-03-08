export const sel = sel => document.querySelector(sel);

export const selAll = sel => [...document.querySelectorAll(sel)];

export const CE = (tag, attrs = {}) => {
  const el = document.createElement(tag);
  for (let key in attrs) {
    const val = attrs[key];
    el.setAttribute(key, val);
  }
  return el;
}

export const noop = () => undefined;

export const nope = () => false;

export const sleep = time => new Promise(resolve => setTimeout(resolve, time));

export const copy = json => JSON.parse(JSON.stringify(json));

// transfix.js
export const transfix = transtion => {
  return (node, params) => {
    Object.defineProperty(node, 'ownerDocument', { get: function () { return { head: node.parentNode }; } });
    return transtion(node, params)
  }
}

export const genRandId = () => {
  const prefix = (+new Date().toLocaleString().replace(/\D/g, '').replace(/^20/, '')).toString(16);
  const rand = Math.random().toString(16).replace(/^0\./, '');
  return (prefix + rand).slice(0, 18);
}

export const getLabelFromDict = (value, dict) => {
  if (!dict || !dict.length) return '';
  const type = typeof value;
  if (type === 'string') {
    const item = dict.find(i => i.value === value);
    return item && item.label || '';
  } else {
    const labels = value.map(v => {
      const item = dict.find(i => i.value === v);
      return item && item.label || '';
    });
    return labels.filter(l => !!l).join(',');
  }
}

export const dispatchEvent = (dom, eventName, params) => {
  if (!dom || !dom.nodeType) {
    return console.error('The first param should be DOM');
  }
  if (typeof eventName !== 'string') {
    return console.error('The second param should be event name <string>');
  }
  // 1. Create the custom event.
  const event = new CustomEvent(eventName, {
    detail: params,
    bubbles: true,
    cancelable: true,
    composed: true // makes the event jump shadow DOM boundary
  });
  // 2. Dispatch the custom event.
  dom.dispatchEvent(event);
};

// 判断是否中文页面
export function checkIfCn() {
  const lang = document.querySelector('html').getAttribute('lang') || '';
  return /zh-/i.test(lang);
}
