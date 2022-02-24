# web-assistant

A simple web component built with [svelte](https://github.com/sveltejs/svelte), providing version introduction & guidline instruction UI.

- dependency free
- compatible with any javascript framework/UI library
- light-weighted (gzip: 57KB)
- non-invasive design, drive the UI simply by javascript
- auto switch languages(CN or EN) depends on your \<html lang="___"\>

## Live demo

<a href="https://guidebook.vercel.app" target="_blank">https://guidebook.vercel.app</a>

<a href="https://guidebook.vercel.app" target="_blank">
  <img src="https://i.ibb.co/jyGnQ53/20220223181550.png" alt="screenshot" />
</a>

## How to use

Install with npm:

```bash
npm install web-assistant --save
```

and import it in your code:

```js
import 'web-assistant';
```

You can **also** load the code from a CDN such as jsdelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/web-assistant@latest/lib/index.min.js"></script>
```

Then you can call `window.webAssistant.guideline(...)` or `window.webAssistant.intro(...)` directly in your js code.

The guideline parameters example:
```js
window.webAssistant.guideline({
  list: [
    {
      selector: 'h1',
      position: 'bottom-end',
      text: 'Line1\nLine2\nLine3\nThis is a title',
      width: '220px',
      onNext: () => console.log('next tips')
    },
    {
      selector: '.desc',
      position: 'top-end',
      text: 'This a testing paragraph...',
      maxWidth: '380px',
      onPrev: () => console.log('prev')
    },
    {
      selector: '.btn',
      position: 'right',
      text: 'This is the submit button, and the guideline ends here.'
    }
  ],
  canClose: false,
  showSteps: true,
  confirmText: 'I know',
  onConfirm: () => console.log('confirmed')
});
```

The introduction parameters example:
```js
window.webAssistant.intro({
  title: 'v1.20 - New Feature',
  list: [
    {
      text: 'Surprise steepest recurred landlord mr wandered amounted of.\nContinuing devonshire but considered its.\nRose past oh shew roof is song neat.\nDo depend better praise do friend garden an wonder to.\nIntention age nay otherwise but breakfast.\nAround garden beyond to extent by.'
    },
    {
      text: 'Kindness to he horrible reserved ye. Effect twenty indeed beyond for not had county. The use him without greatly can private. Increasing it unpleasant no of contrasted no continuing. Nothing colonel my no removed in weather. It dissimilar in up devonshire inhabiting.'
    },
    {
      text: 'This is <b>an example of</b> rich text<img src="https://news-bos.cdn.bcebos.com/mvideo/log-news.png" alt="baidu" style="height: 36px" />'
    }
  ],
  dangerouslyUseHTMLString: true,
  showSteps: true,
  canClose: true,
  onClose: () => console.log('closed'),
  confirmText: 'I know',
  onConfirm: () => console.log('confirmed'),
  style: {
    width: '50vw',
    height: '40vh'
  }
});
```

## PARAMETERS
### guideline params:
| Key | Description | Type | Default value |
| ---- | ---- | ---- | ---- |
| list | [Required] guideline list | Array | (See guideline list item ↓) |
| showSteps | Decide whether shows steps in the "Next" button or not | Boolean | false |
| dangerouslyUseHTMLString | Decide the guideline content renders HTML tag or not | Boolean | false |
| canClose | Decide the guideline can be closed before it is finished | Boolean | false |
| closeText | The close button's text | String | Close/关闭 |
| onClose | Function called after closed | Function | noop |
| canPrev | Decide the guideline can go previous step or not | Boolean | true |
| prevText | The prev button's text | String | Previous/上一条 |
| nextText | The next button's text | String | Next/下一条 |
| confirmText | The confirm button's text | String | Confirm/确定 |
| onConfirm | Function called after confirmed | Function | noop |
| popperStyle | Inline style string that attached to the popper element | String | - |

### *guideline list item*:
| Key | Description | Type | Default value |
| ---- | ---- | ---- | ---- |
| selector | [Required] CSS selector to find the DOM | String | - |
| position | The popper's position: <br>top-start/top/top-end/bottom-start/bottom/bottom-end/left-start/left/left-end/right-start/right/right-end | String | bottom |
| text | The popper's content text | String | - |
| width | The popper's width | String | - |
| maxWidth | The popper's max-width | String | - |
| onPrev | Function called when going previous step | Function | noop |
| onNext | Function called when going next step | Function | noop |

---

### intro params:
| Key | Description | Type | Default value |
| ---- | ---- | ---- | ---- |
| title | Intro's title | String | Intro |
| list | [Required] intro list | Array | (See intro list item ↓) |
| showSteps | Decide whether shows steps in the "Next" button or not | Boolean | false |
| dangerouslyUseHTMLString | Decide the intro content renders HTML tag or not | Boolean | false |
| canClose |  Decide the intro can be closed before it is finished | Boolean | false |
| onClose | Function called after closed | Function | noop |
| prevText | The prev button's text | String | Previous/上一条 |
| nextText | The next button's text | String | Next/下一条 |
| confirmText | The confirm button's text | String | Confirm/确定 |
| onConfirm | Function called after confirmed | Function | noop |
| style | Style object that affects intro element | Object | {} |

### *intro list item*:
| Key | Description | Type | Default value |
| ---- | ---- | ---- | ---- |
| text | The intro content | String | - |

### mask parameters:
| Key | Description | Type | Default value |
| ---- | ---- | ---- | ---- |
| duration | milliseconds.<br>empty or 0 means mask never dismiss,<br>then you should call window.webAssistant.clear() to dismiss it manually. | Number | - |

### toast parameters:
| Key | Description | Type | Default value |
| ---- | ---- | ---- | ---- |
| text | The toast text | String | - |
| duration | milliseconds | Number | 3000 |
| position | The toast position: bottom/top/center | String | bottom |
| callback | Function called after toast dismisses | Function | noop |

## TODO
- [ ] feedback component
- [ ] ...
