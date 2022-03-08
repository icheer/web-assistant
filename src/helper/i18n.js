import { checkIfCn } from '@/helper/func';
const lang = checkIfCn() ? 'cn' : 'en';

const dict = {
  cn: {
    confirm: '确定',
    cancel: '取消',
    close: '关闭',
    ok: '好的',
    yes: '是',
    no: '否',
    ack: '我知道了',
    skip: '跳过',
    next: '下一条',
    prev: '上一条',
    forward: '前进',
    backward: '后退',
    return: '返回',
    warning: '警告',
    error: '错误',
    notice: '提示',
    attention: '注意',
    agree: '同意',
    disagree: '不同意',
    feedback: '反馈',
    suggestion: '意见反馈',
    fullName: '姓名',
    email: '电子邮箱',
    suggestionsAbout: '意见关于',
    screenshot: '页面截图',
    suggestionText: '请填写意见建议',
    submit: '提交'
  },
  en: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    ack: 'OK',
    skip: 'Skip',
    next: 'Next',
    prev: 'Previous',
    forward: 'Forward',
    backward: 'Backward',
    return: 'Return',
    warning: 'Warning',
    error: 'Error',
    notice: 'Notice',
    attention: 'Attention',
    agree: 'Agree',
    disagree: 'Disagree',
    feedback: 'Feedback',
    suggestion: 'Suggestion & Feedback',
    fullName: 'Full Name',
    email: 'Email Address',
    suggestionsAbout: 'Suggestion about',
    screenshot: 'Webpage Screenshot',
    suggestionText: 'Please type your suggestion and advice here',
    submit: 'Submit'
  }
};

const _t = key => {
  const group = dict[lang] || {};
  return group[key] || '';
};

export default _t;