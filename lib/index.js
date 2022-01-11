(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.WebAssistant = {}));
})(this, (function (exports) { 'use strict';

  const $ = sel => document.querySelector(sel);

  const $ce = (tag, attrs = {}) => {
    const el = document.createElement(tag);
    for (let key in attrs) {
      const val = attrs[key];
      el.setAttribute(key, val);
    }
    return el;
  };

  const noop$1 = () => null;

  function noop() { }
  const identity = x => x;
  function run(fn) {
      return fn();
  }
  function blank_object() {
      return Object.create(null);
  }
  function run_all(fns) {
      fns.forEach(run);
  }
  function is_function(thing) {
      return typeof thing === 'function';
  }
  function safe_not_equal(a, b) {
      return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
  }
  function is_empty(obj) {
      return Object.keys(obj).length === 0;
  }
  function subscribe(store, ...callbacks) {
      if (store == null) {
          return noop;
      }
      const unsub = store.subscribe(...callbacks);
      return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  function get_store_value(store) {
      let value;
      subscribe(store, _ => value = _)();
      return value;
  }
  function component_subscribe(component, store, callback) {
      component.$$.on_destroy.push(subscribe(store, callback));
  }
  function set_store_value(store, ret, value) {
      store.set(value);
      return ret;
  }

  const is_client = typeof window !== 'undefined';
  let now = is_client
      ? () => window.performance.now()
      : () => Date.now();
  let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

  const tasks = new Set();
  function run_tasks(now) {
      tasks.forEach(task => {
          if (!task.c(now)) {
              tasks.delete(task);
              task.f();
          }
      });
      if (tasks.size !== 0)
          raf(run_tasks);
  }
  /**
   * Creates a new task that runs on each raf frame
   * until it returns a falsy value or is aborted
   */
  function loop(callback) {
      let task;
      if (tasks.size === 0)
          raf(run_tasks);
      return {
          promise: new Promise(fulfill => {
              tasks.add(task = { c: callback, f: fulfill });
          }),
          abort() {
              tasks.delete(task);
          }
      };
  }
  function append(target, node) {
      target.appendChild(node);
  }
  function get_root_for_style(node) {
      if (!node)
          return document;
      const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
      if (root && root.host) {
          return root;
      }
      return node.ownerDocument;
  }
  function append_empty_stylesheet(node) {
      const style_element = element('style');
      append_stylesheet(get_root_for_style(node), style_element);
      return style_element;
  }
  function append_stylesheet(node, style) {
      append(node.head || node, style);
  }
  function insert(target, node, anchor) {
      target.insertBefore(node, anchor || null);
  }
  function detach(node) {
      node.parentNode.removeChild(node);
  }
  function element(name) {
      return document.createElement(name);
  }
  function text(data) {
      return document.createTextNode(data);
  }
  function empty() {
      return text('');
  }
  function listen(node, event, handler, options) {
      node.addEventListener(event, handler, options);
      return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
      if (value == null)
          node.removeAttribute(attribute);
      else if (node.getAttribute(attribute) !== value)
          node.setAttribute(attribute, value);
  }
  function children(element) {
      return Array.from(element.childNodes);
  }
  function set_data(text, data) {
      data = '' + data;
      if (text.wholeText !== data)
          text.data = data;
  }
  function custom_event(type, detail, bubbles = false) {
      const e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, bubbles, false, detail);
      return e;
  }
  function attribute_to_object(attributes) {
      const result = {};
      for (const attribute of attributes) {
          result[attribute.name] = attribute.value;
      }
      return result;
  }

  const active_docs = new Set();
  let active = 0;
  // https://github.com/darkskyapp/string-hash/blob/master/index.js
  function hash(str) {
      let hash = 5381;
      let i = str.length;
      while (i--)
          hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
      return hash >>> 0;
  }
  function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
      const step = 16.666 / duration;
      let keyframes = '{\n';
      for (let p = 0; p <= 1; p += step) {
          const t = a + (b - a) * ease(p);
          keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
      }
      const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
      const name = `__svelte_${hash(rule)}_${uid}`;
      const doc = get_root_for_style(node);
      active_docs.add(doc);
      const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
      const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
      if (!current_rules[name]) {
          current_rules[name] = true;
          stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
      }
      const animation = node.style.animation || '';
      node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
      active += 1;
      return name;
  }
  function delete_rule(node, name) {
      const previous = (node.style.animation || '').split(', ');
      const next = previous.filter(name
          ? anim => anim.indexOf(name) < 0 // remove specific animation
          : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
      );
      const deleted = previous.length - next.length;
      if (deleted) {
          node.style.animation = next.join(', ');
          active -= deleted;
          if (!active)
              clear_rules();
      }
  }
  function clear_rules() {
      raf(() => {
          if (active)
              return;
          active_docs.forEach(doc => {
              const stylesheet = doc.__svelte_stylesheet;
              let i = stylesheet.cssRules.length;
              while (i--)
                  stylesheet.deleteRule(i);
              doc.__svelte_rules = {};
          });
          active_docs.clear();
      });
  }

  let current_component;
  function set_current_component(component) {
      current_component = component;
  }
  function get_current_component() {
      if (!current_component)
          throw new Error('Function called outside component initialization');
      return current_component;
  }
  function onMount(fn) {
      get_current_component().$$.on_mount.push(fn);
  }

  const dirty_components = [];
  const binding_callbacks = [];
  const render_callbacks = [];
  const flush_callbacks = [];
  const resolved_promise = Promise.resolve();
  let update_scheduled = false;
  function schedule_update() {
      if (!update_scheduled) {
          update_scheduled = true;
          resolved_promise.then(flush);
      }
  }
  function add_render_callback(fn) {
      render_callbacks.push(fn);
  }
  // flush() calls callbacks in this order:
  // 1. All beforeUpdate callbacks, in order: parents before children
  // 2. All bind:this callbacks, in reverse order: children before parents.
  // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
  //    for afterUpdates called during the initial onMount, which are called in
  //    reverse order: children before parents.
  // Since callbacks might update component values, which could trigger another
  // call to flush(), the following steps guard against this:
  // 1. During beforeUpdate, any updated components will be added to the
  //    dirty_components array and will cause a reentrant call to flush(). Because
  //    the flush index is kept outside the function, the reentrant call will pick
  //    up where the earlier call left off and go through all dirty components. The
  //    current_component value is saved and restored so that the reentrant call will
  //    not interfere with the "parent" flush() call.
  // 2. bind:this callbacks cannot trigger new flush() calls.
  // 3. During afterUpdate, any updated components will NOT have their afterUpdate
  //    callback called a second time; the seen_callbacks set, outside the flush()
  //    function, guarantees this behavior.
  const seen_callbacks = new Set();
  let flushidx = 0; // Do *not* move this inside the flush() function
  function flush() {
      const saved_component = current_component;
      do {
          // first, call beforeUpdate functions
          // and update components
          while (flushidx < dirty_components.length) {
              const component = dirty_components[flushidx];
              flushidx++;
              set_current_component(component);
              update(component.$$);
          }
          set_current_component(null);
          dirty_components.length = 0;
          flushidx = 0;
          while (binding_callbacks.length)
              binding_callbacks.pop()();
          // then, once components are updated, call
          // afterUpdate functions. This may cause
          // subsequent updates...
          for (let i = 0; i < render_callbacks.length; i += 1) {
              const callback = render_callbacks[i];
              if (!seen_callbacks.has(callback)) {
                  // ...so guard against infinite loops
                  seen_callbacks.add(callback);
                  callback();
              }
          }
          render_callbacks.length = 0;
      } while (dirty_components.length);
      while (flush_callbacks.length) {
          flush_callbacks.pop()();
      }
      update_scheduled = false;
      seen_callbacks.clear();
      set_current_component(saved_component);
  }
  function update($$) {
      if ($$.fragment !== null) {
          $$.update();
          run_all($$.before_update);
          const dirty = $$.dirty;
          $$.dirty = [-1];
          $$.fragment && $$.fragment.p($$.ctx, dirty);
          $$.after_update.forEach(add_render_callback);
      }
  }

  let promise;
  function wait() {
      if (!promise) {
          promise = Promise.resolve();
          promise.then(() => {
              promise = null;
          });
      }
      return promise;
  }
  function dispatch(node, direction, kind) {
      node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
  }
  const outroing = new Set();
  let outros;
  function group_outros() {
      outros = {
          r: 0,
          c: [],
          p: outros // parent group
      };
  }
  function check_outros() {
      if (!outros.r) {
          run_all(outros.c);
      }
      outros = outros.p;
  }
  function transition_in(block, local) {
      if (block && block.i) {
          outroing.delete(block);
          block.i(local);
      }
  }
  function transition_out(block, local, detach, callback) {
      if (block && block.o) {
          if (outroing.has(block))
              return;
          outroing.add(block);
          outros.c.push(() => {
              outroing.delete(block);
              if (callback) {
                  if (detach)
                      block.d(1);
                  callback();
              }
          });
          block.o(local);
      }
  }
  const null_transition = { duration: 0 };
  function create_bidirectional_transition(node, fn, params, intro) {
      let config = fn(node, params);
      let t = intro ? 0 : 1;
      let running_program = null;
      let pending_program = null;
      let animation_name = null;
      function clear_animation() {
          if (animation_name)
              delete_rule(node, animation_name);
      }
      function init(program, duration) {
          const d = (program.b - t);
          duration *= Math.abs(d);
          return {
              a: t,
              b: program.b,
              d,
              duration,
              start: program.start,
              end: program.start + duration,
              group: program.group
          };
      }
      function go(b) {
          const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
          const program = {
              start: now() + delay,
              b
          };
          if (!b) {
              // @ts-ignore todo: improve typings
              program.group = outros;
              outros.r += 1;
          }
          if (running_program || pending_program) {
              pending_program = program;
          }
          else {
              // if this is an intro, and there's a delay, we need to do
              // an initial tick and/or apply CSS animation immediately
              if (css) {
                  clear_animation();
                  animation_name = create_rule(node, t, b, duration, delay, easing, css);
              }
              if (b)
                  tick(0, 1);
              running_program = init(program, duration);
              add_render_callback(() => dispatch(node, b, 'start'));
              loop(now => {
                  if (pending_program && now > pending_program.start) {
                      running_program = init(pending_program, duration);
                      pending_program = null;
                      dispatch(node, running_program.b, 'start');
                      if (css) {
                          clear_animation();
                          animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                      }
                  }
                  if (running_program) {
                      if (now >= running_program.end) {
                          tick(t = running_program.b, 1 - t);
                          dispatch(node, running_program.b, 'end');
                          if (!pending_program) {
                              // we're done
                              if (running_program.b) {
                                  // intro — we can tidy up immediately
                                  clear_animation();
                              }
                              else {
                                  // outro — needs to be coordinated
                                  if (!--running_program.group.r)
                                      run_all(running_program.group.c);
                              }
                          }
                          running_program = null;
                      }
                      else if (now >= running_program.start) {
                          const p = now - running_program.start;
                          t = running_program.a + running_program.d * easing(p / running_program.duration);
                          tick(t, 1 - t);
                      }
                  }
                  return !!(running_program || pending_program);
              });
          }
      }
      return {
          run(b) {
              if (is_function(config)) {
                  wait().then(() => {
                      // @ts-ignore
                      config = config();
                      go(b);
                  });
              }
              else {
                  go(b);
              }
          },
          end() {
              clear_animation();
              running_program = pending_program = null;
          }
      };
  }
  function mount_component(component, target, anchor, customElement) {
      const { fragment, on_mount, on_destroy, after_update } = component.$$;
      fragment && fragment.m(target, anchor);
      if (!customElement) {
          // onMount happens before the initial afterUpdate
          add_render_callback(() => {
              const new_on_destroy = on_mount.map(run).filter(is_function);
              if (on_destroy) {
                  on_destroy.push(...new_on_destroy);
              }
              else {
                  // Edge case - component was destroyed immediately,
                  // most likely as a result of a binding initialising
                  run_all(new_on_destroy);
              }
              component.$$.on_mount = [];
          });
      }
      after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
      const $$ = component.$$;
      if ($$.fragment !== null) {
          run_all($$.on_destroy);
          $$.fragment && $$.fragment.d(detaching);
          // TODO null out other refs, including component.$$ (but need to
          // preserve final state?)
          $$.on_destroy = $$.fragment = null;
          $$.ctx = [];
      }
  }
  function make_dirty(component, i) {
      if (component.$$.dirty[0] === -1) {
          dirty_components.push(component);
          schedule_update();
          component.$$.dirty.fill(0);
      }
      component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
  }
  function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
      const parent_component = current_component;
      set_current_component(component);
      const $$ = component.$$ = {
          fragment: null,
          ctx: null,
          // state
          props,
          update: noop,
          not_equal,
          bound: blank_object(),
          // lifecycle
          on_mount: [],
          on_destroy: [],
          on_disconnect: [],
          before_update: [],
          after_update: [],
          context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
          // everything else
          callbacks: blank_object(),
          dirty,
          skip_bound: false,
          root: options.target || parent_component.$$.root
      };
      append_styles && append_styles($$.root);
      let ready = false;
      $$.ctx = instance
          ? instance(component, options.props || {}, (i, ret, ...rest) => {
              const value = rest.length ? rest[0] : ret;
              if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                  if (!$$.skip_bound && $$.bound[i])
                      $$.bound[i](value);
                  if (ready)
                      make_dirty(component, i);
              }
              return ret;
          })
          : [];
      $$.update();
      ready = true;
      run_all($$.before_update);
      // `false` as a special case of no DOM component
      $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
      if (options.target) {
          if (options.hydrate) {
              const nodes = children(options.target);
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.l(nodes);
              nodes.forEach(detach);
          }
          else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.c();
          }
          if (options.intro)
              transition_in(component.$$.fragment);
          mount_component(component, options.target, options.anchor, options.customElement);
          flush();
      }
      set_current_component(parent_component);
  }
  let SvelteElement;
  if (typeof HTMLElement === 'function') {
      SvelteElement = class extends HTMLElement {
          constructor() {
              super();
              this.attachShadow({ mode: 'open' });
          }
          connectedCallback() {
              const { on_mount } = this.$$;
              this.$$.on_disconnect = on_mount.map(run).filter(is_function);
              // @ts-ignore todo: improve typings
              for (const key in this.$$.slotted) {
                  // @ts-ignore todo: improve typings
                  this.appendChild(this.$$.slotted[key]);
              }
          }
          attributeChangedCallback(attr, _oldValue, newValue) {
              this[attr] = newValue;
          }
          disconnectedCallback() {
              run_all(this.$$.on_disconnect);
          }
          $destroy() {
              destroy_component(this, 1);
              this.$destroy = noop;
          }
          $on(type, callback) {
              // TODO should this delegate to addEventListener?
              const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
              callbacks.push(callback);
              return () => {
                  const index = callbacks.indexOf(callback);
                  if (index !== -1)
                      callbacks.splice(index, 1);
              };
          }
          $set($$props) {
              if (this.$$set && !is_empty($$props)) {
                  this.$$.skip_bound = true;
                  this.$$set($$props);
                  this.$$.skip_bound = false;
              }
          }
      };
  }

  const subscriber_queue = [];
  /**
   * Create a `Writable` store that allows both updating and reading by subscription.
   * @param {*=}value initial value
   * @param {StartStopNotifier=}start start and stop notifications for subscriptions
   */
  function writable(value, start = noop) {
      let stop;
      const subscribers = new Set();
      function set(new_value) {
          if (safe_not_equal(value, new_value)) {
              value = new_value;
              if (stop) { // store is ready
                  const run_queue = !subscriber_queue.length;
                  for (const subscriber of subscribers) {
                      subscriber[1]();
                      subscriber_queue.push(subscriber, value);
                  }
                  if (run_queue) {
                      for (let i = 0; i < subscriber_queue.length; i += 2) {
                          subscriber_queue[i][0](subscriber_queue[i + 1]);
                      }
                      subscriber_queue.length = 0;
                  }
              }
          }
      }
      function update(fn) {
          set(fn(value));
      }
      function subscribe(run, invalidate = noop) {
          const subscriber = [run, invalidate];
          subscribers.add(subscriber);
          if (subscribers.size === 1) {
              stop = start(set) || noop;
          }
          run(value);
          return () => {
              subscribers.delete(subscriber);
              if (subscribers.size === 0) {
                  stop();
                  stop = null;
              }
          };
      }
      return { set, update, subscribe };
  }

  let lang = document.querySelector('html').getAttribute('lang');
  if (/^zh/i.test(lang)) {
    lang = 'cn';
  } else {
    lang = 'en';
  }

  const dict = {
    cn: {
      confirm: '确定',
      cancel: '取消',
      close: '关闭',
      ok: '好的',
      yes: '是',
      no: '否',
      ack: '我知道了',
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
      disagree: '不同意'
    },
    en: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      close: 'Close',
      ok: 'OK',
      yes: 'Yes',
      no: 'No',
      ack: 'OK',
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
      disagree: 'Disagree'
    }
  };

  const _t = key => {
    const group = dict[lang] || {};
    return group[key] || '';
  };

  const isShowIntro = writable(false);
  const isShowGuide = writable(false);
  const isShowFeedback = writable(false);

  const introParams = writable({});

  const setIntroParams = function (payload) {
    let params = {
      title: 'Intro',
      list: [],
      dangerouslyUseHTMLString: false,
      showClose: false,
      onClose: noop$1,
      prevText: _t('prev'),
      nextText: _t('next'),
      confirmText: _t('confirm'),
      onConfirm: noop$1,
      style: {}
    };
    params = Object.assign(params, payload);
    introParams.set(params);
  };

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
        isShowGuide.set(true);
      },
      // show feedback
      feedback(payload) {
        this.init();
        if (!payload) return console.error('no params');
        isShowFeedback.set(true);
      }
    };
  })(window);

  const webAssistant = window.webAssistant;

  /* src\components\introduce-comp.svelte generated by Svelte v3.44.3 */

  function create_if_block_5(ctx) {
  	let div;
  	let t;
  	let div_title_value;
  	let mounted;
  	let dispose;

  	return {
  		c() {
  			div = element("div");
  			t = text("✖");
  			attr(div, "class", "close");
  			attr(div, "title", div_title_value = _t('close'));
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);

  			if (!mounted) {
  				dispose = listen(div, "click", /*closeHandler*/ ctx[11]);
  				mounted = true;
  			}
  		},
  		p: noop,
  		d(detaching) {
  			if (detaching) detach(div);
  			mounted = false;
  			dispose();
  		}
  	};
  }

  // (1:262) {#if !isHtml}
  function create_if_block_4(ctx) {
  	let div;
  	let t;

  	return {
  		c() {
  			div = element("div");
  			t = text(/*currentText*/ ctx[4]);
  			attr(div, "class", "content");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*currentText*/ 16) set_data(t, /*currentText*/ ctx[4]);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  		}
  	};
  }

  // (1:320) {#if isHtml}
  function create_if_block_3(ctx) {
  	let div;

  	return {
  		c() {
  			div = element("div");
  			attr(div, "class", "content");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			div.innerHTML = /*currentText*/ ctx[4];
  		},
  		p(ctx, dirty) {
  			if (dirty & /*currentText*/ 16) div.innerHTML = /*currentText*/ ctx[4];		},
  		d(detaching) {
  			if (detaching) detach(div);
  		}
  	};
  }

  // (1:409) {#if canPrev}
  function create_if_block_2$1(ctx) {
  	let div;
  	let t;
  	let mounted;
  	let dispose;

  	return {
  		c() {
  			div = element("div");
  			t = text(/*prevText*/ ctx[7]);
  			attr(div, "class", "btn prev");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);

  			if (!mounted) {
  				dispose = listen(div, "click", /*prevHandler*/ ctx[12]);
  				mounted = true;
  			}
  		},
  		p(ctx, dirty) {
  			if (dirty & /*prevText*/ 128) set_data(t, /*prevText*/ ctx[7]);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  			mounted = false;
  			dispose();
  		}
  	};
  }

  // (1:490) {#if canNext}
  function create_if_block_1$1(ctx) {
  	let div;
  	let t;
  	let mounted;
  	let dispose;

  	return {
  		c() {
  			div = element("div");
  			t = text(/*nextText*/ ctx[6]);
  			attr(div, "class", "btn next");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);

  			if (!mounted) {
  				dispose = listen(div, "click", /*nextHandler*/ ctx[13]);
  				mounted = true;
  			}
  		},
  		p(ctx, dirty) {
  			if (dirty & /*nextText*/ 64) set_data(t, /*nextText*/ ctx[6]);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  			mounted = false;
  			dispose();
  		}
  	};
  }

  // (1:571) {#if canConfirm}
  function create_if_block$1(ctx) {
  	let div;
  	let t;
  	let mounted;
  	let dispose;

  	return {
  		c() {
  			div = element("div");
  			t = text(/*confirmText*/ ctx[5]);
  			attr(div, "class", "btn confirm");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);

  			if (!mounted) {
  				dispose = listen(div, "click", /*confirmHandler*/ ctx[14]);
  				mounted = true;
  			}
  		},
  		p(ctx, dirty) {
  			if (dirty & /*confirmText*/ 32) set_data(t, /*confirmText*/ ctx[5]);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  			mounted = false;
  			dispose();
  		}
  	};
  }

  function create_fragment$1(ctx) {
  	let div3;
  	let div0;
  	let span;
  	let t;
  	let div1;
  	let if_block1_anchor;
  	let div2;
  	let if_block3_anchor;
  	let if_block4_anchor;
  	let if_block0 = /*canClose*/ ctx[10] && create_if_block_5(ctx);
  	let if_block1 = !/*isHtml*/ ctx[8] && create_if_block_4(ctx);
  	let if_block2 = /*isHtml*/ ctx[8] && create_if_block_3(ctx);
  	let if_block3 = /*canPrev*/ ctx[3] && create_if_block_2$1(ctx);
  	let if_block4 = /*canNext*/ ctx[2] && create_if_block_1$1(ctx);
  	let if_block5 = /*canConfirm*/ ctx[1] && create_if_block$1(ctx);

  	return {
  		c() {
  			div3 = element("div");
  			div0 = element("div");
  			span = element("span");
  			t = text(/*title*/ ctx[9]);
  			if (if_block0) if_block0.c();
  			div1 = element("div");
  			if (if_block1) if_block1.c();
  			if_block1_anchor = empty();
  			if (if_block2) if_block2.c();
  			div2 = element("div");
  			if (if_block3) if_block3.c();
  			if_block3_anchor = empty();
  			if (if_block4) if_block4.c();
  			if_block4_anchor = empty();
  			if (if_block5) if_block5.c();
  			this.c = noop;
  			attr(span, "class", "title");
  			attr(div0, "class", "header");
  			attr(div1, "class", "body scrollbar");
  			attr(div2, "class", "footer");
  			attr(div3, "class", "modal");
  			attr(div3, "style", /*style*/ ctx[0]);
  		},
  		m(target, anchor) {
  			insert(target, div3, anchor);
  			append(div3, div0);
  			append(div0, span);
  			append(span, t);
  			if (if_block0) if_block0.m(div0, null);
  			append(div3, div1);
  			if (if_block1) if_block1.m(div1, null);
  			append(div1, if_block1_anchor);
  			if (if_block2) if_block2.m(div1, null);
  			append(div3, div2);
  			if (if_block3) if_block3.m(div2, null);
  			append(div2, if_block3_anchor);
  			if (if_block4) if_block4.m(div2, null);
  			append(div2, if_block4_anchor);
  			if (if_block5) if_block5.m(div2, null);
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*title*/ 512) set_data(t, /*title*/ ctx[9]);

  			if (/*canClose*/ ctx[10]) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_5(ctx);
  					if_block0.c();
  					if_block0.m(div0, null);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (!/*isHtml*/ ctx[8]) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_4(ctx);
  					if_block1.c();
  					if_block1.m(div1, if_block1_anchor);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if (/*isHtml*/ ctx[8]) {
  				if (if_block2) {
  					if_block2.p(ctx, dirty);
  				} else {
  					if_block2 = create_if_block_3(ctx);
  					if_block2.c();
  					if_block2.m(div1, null);
  				}
  			} else if (if_block2) {
  				if_block2.d(1);
  				if_block2 = null;
  			}

  			if (/*canPrev*/ ctx[3]) {
  				if (if_block3) {
  					if_block3.p(ctx, dirty);
  				} else {
  					if_block3 = create_if_block_2$1(ctx);
  					if_block3.c();
  					if_block3.m(div2, if_block3_anchor);
  				}
  			} else if (if_block3) {
  				if_block3.d(1);
  				if_block3 = null;
  			}

  			if (/*canNext*/ ctx[2]) {
  				if (if_block4) {
  					if_block4.p(ctx, dirty);
  				} else {
  					if_block4 = create_if_block_1$1(ctx);
  					if_block4.c();
  					if_block4.m(div2, if_block4_anchor);
  				}
  			} else if (if_block4) {
  				if_block4.d(1);
  				if_block4 = null;
  			}

  			if (/*canConfirm*/ ctx[1]) {
  				if (if_block5) {
  					if_block5.p(ctx, dirty);
  				} else {
  					if_block5 = create_if_block$1(ctx);
  					if_block5.c();
  					if_block5.m(div2, null);
  				}
  			} else if (if_block5) {
  				if_block5.d(1);
  				if_block5 = null;
  			}

  			if (dirty & /*style*/ 1) {
  				attr(div3, "style", /*style*/ ctx[0]);
  			}
  		},
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (detaching) detach(div3);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			if (if_block2) if_block2.d();
  			if (if_block3) if_block3.d();
  			if (if_block4) if_block4.d();
  			if (if_block5) if_block5.d();
  		}
  	};
  }

  function instance$1($$self, $$props, $$invalidate) {
  	let params;
  	let canClose;
  	let title;
  	let onClose;
  	let list;
  	let isHtml;
  	let prevText;
  	let nextText;
  	let confirmText;
  	let onConfirm;
  	let currentItem;
  	let currentText;
  	let canPrev;
  	let canNext;
  	let canConfirm;
  	let $isShowIntro;
  	component_subscribe($$self, isShowIntro, $$value => $$invalidate(22, $isShowIntro = $$value));
  	let idx = 0;
  	let style = '';

  	function getAttr(name, defaultValue = true) {
  		const val = params[name];
  		return val !== undefined ? val : defaultValue;
  	}

  	function closeHandler() {
  		set_store_value(isShowIntro, $isShowIntro = false, $isShowIntro);
  		onClose();
  	}

  	function prevHandler() {
  		$$invalidate(15, idx--, idx);
  	}

  	function nextHandler() {
  		$$invalidate(15, idx++, idx);
  	}

  	function confirmHandler() {
  		onConfirm();
  	}

  	$$self.$$.update = () => {
  		if ($$self.$$.dirty & /*list, idx*/ 163840) {
  			$$invalidate(18, currentItem = list[idx] || {});
  		}

  		if ($$self.$$.dirty & /*currentItem*/ 262144) ;

  		if ($$self.$$.dirty & /*currentItem*/ 262144) {
  			$$invalidate(4, currentText = currentItem.text || '');
  		}

  		if ($$self.$$.dirty & /*idx*/ 32768) {
  			$$invalidate(3, canPrev = idx > 0);
  		}

  		if ($$self.$$.dirty & /*idx, list*/ 163840) {
  			$$invalidate(2, canNext = idx < list.length - 1);
  		}

  		if ($$self.$$.dirty & /*idx, list*/ 163840) {
  			$$invalidate(1, canConfirm = idx === list.length - 1);
  		}

  		if ($$self.$$.dirty & /*params*/ 65536) {
  			{
  				const { width = '75vw', height = '60vh', top = '13vh' } = params.style || {};
  				$$invalidate(0, style = `width: ${width}; height: ${height}; top: ${top}`);
  			}
  		}
  	};

  	$$invalidate(16, params = get_store_value(introParams));
  	$$invalidate(10, canClose = getAttr('canClose'));
  	$$invalidate(9, title = getAttr('title', 'Intro'));
  	onClose = getAttr('onClose');
  	$$invalidate(17, list = getAttr('list', []));
  	$$invalidate(8, isHtml = getAttr('dangerouslyUseHTMLString'));
  	$$invalidate(7, prevText = getAttr('prevText'));
  	$$invalidate(6, nextText = getAttr('nextText'));
  	$$invalidate(5, confirmText = getAttr('confirmText'));
  	onConfirm = getAttr('onConfirm');

  	return [
  		style,
  		canConfirm,
  		canNext,
  		canPrev,
  		currentText,
  		confirmText,
  		nextText,
  		prevText,
  		isHtml,
  		title,
  		canClose,
  		closeHandler,
  		prevHandler,
  		nextHandler,
  		confirmHandler,
  		idx,
  		params,
  		list,
  		currentItem
  	];
  }

  class Introduce_comp extends SvelteElement {
  	constructor(options) {
  		super();
  		this.shadowRoot.innerHTML = `<style>.scrollbar::-webkit-scrollbar{width:7px;height:7px;background-color:#F5F5F5;cursor:pointer}.scrollbar::-webkit-scrollbar-track{box-shadow:inset 0 0 6px rgba(0, 0, 0, 0.3);border-radius:3.5px;background-color:#F5F5F5;cursor:pointer}.scrollbar::-webkit-scrollbar-thumb{position:relative;display:block;width:0;height:0;cursor:pointer;border-radius:3.5px;background-color:rgba(115, 136, 173, 0.3);transition:0.3s background-color}.scrollbar::-webkit-scrollbar-thumb:hover{background-color:rgba(174, 17, 41, 0.5)}.modal{position:absolute;display:flex;flex-direction:column;overflow:hidden;left:0;right:0;margin:0 auto;padding:12px 25px 16px;box-sizing:border-box;background-color:#fff;border-radius:4px;font-size:16px;color:#000}.modal>div{flex-grow:0;flex-shrink:0}.modal .header{white-space:nowrap;height:50px;line-height:50px;color:#333;border-bottom:0.5px solid #e5e5e5;box-sizing:border-box}.modal .header .title{font-size:18px;font-weight:700}.modal .header .close{position:absolute;top:12px;right:22px;line-height:30px;margin:10px 0;width:30px;text-align:center;font-size:20px;color:#888;user-select:none;cursor:pointer}.modal .body{position:relative;flex-grow:1;flex-shrink:1;padding:12px 4px 0;margin-bottom:12px;max-height:calc(100% - 80px);box-sizing:border-box;overflow-x:hidden;overflow-y:auto}.modal .body .content{line-height:1.5;white-space:pre-wrap;text-align:justify}.modal .footer{display:flex;justify-content:flex-end;user-select:none}.modal .footer .btn{text-align:center;min-width:56px;height:18px;line-height:18px;padding:6px 12px;box-sizing:content-box;background-color:#409eff;color:#fff;font-size:14px;cursor:pointer;border-radius:3px}.modal .footer .btn+.btn{margin-left:16px}.modal .footer .btn.prev{background-color:#eee;color:#555}</style>`;

  		init(
  			this,
  			{
  				target: this.shadowRoot,
  				props: attribute_to_object(this.attributes),
  				customElement: true
  			},
  			instance$1,
  			create_fragment$1,
  			safe_not_equal,
  			{},
  			null
  		);

  		if (options) {
  			if (options.target) {
  				insert(options.target, this, options.anchor);
  			}
  		}
  	}
  }

  customElements.define("introduce-comp", Introduce_comp);

  function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
      const o = +getComputedStyle(node).opacity;
      return {
          delay,
          duration,
          easing,
          css: t => `opacity: ${t * o}`
      };
  }

  /* src\app.svelte generated by Svelte v3.44.3 */

  function create_if_block(ctx) {
  	let div;
  	let if_block0_anchor;
  	let div_transition;
  	let current;
  	let if_block0 = /*$isShowIntro*/ ctx[1] && create_if_block_2();
  	let if_block1 = /*$isShowGuide*/ ctx[0] && create_if_block_1();

  	return {
  		c() {
  			div = element("div");
  			if (if_block0) if_block0.c();
  			if_block0_anchor = empty();
  			if (if_block1) if_block1.c();
  			attr(div, "class", "web-assistant-mask");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			if (if_block0) if_block0.m(div, null);
  			append(div, if_block0_anchor);
  			if (if_block1) if_block1.m(div, null);
  			current = true;
  		},
  		p(ctx, dirty) {
  			if (/*$isShowIntro*/ ctx[1]) {
  				if (if_block0) ; else {
  					if_block0 = create_if_block_2();
  					if_block0.c();
  					if_block0.m(div, if_block0_anchor);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*$isShowGuide*/ ctx[0]) {
  				if (if_block1) ; else {
  					if_block1 = create_if_block_1();
  					if_block1.c();
  					if_block1.m(div, null);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}
  		},
  		i(local) {
  			if (current) return;

  			add_render_callback(() => {
  				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 150 }, true);
  				div_transition.run(1);
  			});

  			current = true;
  		},
  		o(local) {
  			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 150 }, false);
  			div_transition.run(0);
  			current = false;
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			if (detaching && div_transition) div_transition.end();
  		}
  	};
  }

  // (1:137) {#if $isShowIntro}
  function create_if_block_2(ctx) {
  	let introduce_comp;

  	return {
  		c() {
  			introduce_comp = element("introduce-comp");
  		},
  		m(target, anchor) {
  			insert(target, introduce_comp, anchor);
  		},
  		d(detaching) {
  			if (detaching) detach(introduce_comp);
  		}
  	};
  }

  // (1:193) {#if $isShowGuide}
  function create_if_block_1(ctx) {
  	let guideline_comp;

  	return {
  		c() {
  			guideline_comp = element("guideline-comp");
  		},
  		m(target, anchor) {
  			insert(target, guideline_comp, anchor);
  		},
  		d(detaching) {
  			if (detaching) detach(guideline_comp);
  		}
  	};
  }

  function create_fragment(ctx) {
  	let if_block_anchor;
  	let current;
  	let if_block = /*isShowMask*/ ctx[2] && create_if_block(ctx);

  	return {
  		c() {
  			if (if_block) if_block.c();
  			if_block_anchor = empty();
  			this.c = noop;
  		},
  		m(target, anchor) {
  			if (if_block) if_block.m(target, anchor);
  			insert(target, if_block_anchor, anchor);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			if (/*isShowMask*/ ctx[2]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);

  					if (dirty & /*isShowMask*/ 4) {
  						transition_in(if_block, 1);
  					}
  				} else {
  					if_block = create_if_block(ctx);
  					if_block.c();
  					transition_in(if_block, 1);
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			} else if (if_block) {
  				group_outros();

  				transition_out(if_block, 1, 1, () => {
  					if_block = null;
  				});

  				check_outros();
  			}
  		},
  		i(local) {
  			if (current) return;
  			transition_in(if_block);
  			current = true;
  		},
  		o(local) {
  			transition_out(if_block);
  			current = false;
  		},
  		d(detaching) {
  			if (if_block) if_block.d(detaching);
  			if (detaching) detach(if_block_anchor);
  		}
  	};
  }

  function instance($$self, $$props, $$invalidate) {
  	let isShowMask;
  	let $isShowGuide;
  	let $isShowIntro;
  	component_subscribe($$self, isShowGuide, $$value => $$invalidate(0, $isShowGuide = $$value));
  	component_subscribe($$self, isShowIntro, $$value => $$invalidate(1, $isShowIntro = $$value));

  	onMount(async () => {
  		return;
  	});

  	$$self.$$.update = () => {
  		if ($$self.$$.dirty & /*$isShowIntro, $isShowGuide*/ 3) {
  			$$invalidate(2, isShowMask = $isShowIntro || $isShowGuide);
  		}
  	};

  	return [$isShowGuide, $isShowIntro, isShowMask];
  }

  class App extends SvelteElement {
  	constructor(options) {
  		super();
  		this.shadowRoot.innerHTML = `<style>.web-assistant-mask{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:rgba(0, 0, 0, 0.5)}</style>`;

  		init(
  			this,
  			{
  				target: this.shadowRoot,
  				props: attribute_to_object(this.attributes),
  				customElement: true
  			},
  			instance,
  			create_fragment,
  			safe_not_equal,
  			{},
  			null
  		);

  		if (options) {
  			if (options.target) {
  				insert(options.target, this, options.anchor);
  			}
  		}
  	}
  }

  customElements.define("web-assistant", App);

  exports["default"] = App;
  exports.webAssistant = webAssistant;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
