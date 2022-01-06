<template lang="pug">
svelte:options(tag="question-item")
.q-item(style="{question.style}")
  h3
    span { index + 1 }.{ type === 'multi-choice' ? ' [多选题] ' : ' ' }
    +if("!$isDesign") { question.title }
      +else
        input.input(type="text" bind:value="{question.title}" placeholder="题目标题" style="width: 350px" on:change="{onChange}")
  +if("type === 'input'")
    input.input(type="text" bind:value="{value}" disabled="{$isDesign}" placeholder="请填写" on:input="{onChange}" "{...attrs}")
  +if("type === 'textarea'")
    textarea(rows="3" bind:value="{value}" disabled="{$isDesign}" placeholder="请填写" on:input="{onChange}" "{...attrs}")
  +if("type === 'single-choice'")
    +each("question.items as item (item.value)")
      label
        input(type="radio" name="question.id" value="{item.value}" disabled="{$isDesign}" on:change="{onChange}" "{...attrs}")
        span { item.label }
  +if("type === 'multi-choice'")
    +each("question.items as item (item.value)")
      label
        input(type="checkbox" name="question.id" value="{item.value}" disabled="{$isDesign}" on:change="{onChange}" "{...attrs}")
        span { item.label }
  +if("type === 'rating'")
    span.stars
      +each("stars as item, index (index)")
        span.star(value="{index + 1}" class:active!="{value >= index + 1}" disabled="{$isDesign}" on:click!="{onChange}" "{...attrs}")
</template>

<script>
export let question = {};
export let index = 0;
let value = '';

import { copy } from '@/helper/func';
import { questions, isDesign } from '@/store/store';
import { each } from 'svelte/internal';

$: questionId = question.id;
$: type = question.type || 'input';
$: attrs = question.attrs || {};
$: stars = new Array(question.max || 5).fill('');

// 值改变时
function onChange(e) {
  const dom = e.path[0];
  const v = dom.value || dom.getAttribute('value');
  if (type === 'multi-choice') {
    const { checked } = dom;
    if (!value) value = [];
    if (checked) {
      if (value.includes(v)) return;
      // 保持多选答案的顺序
      const newAnswers = [...value, v];
      value = question.items.map(i => i.value).filter(i => newAnswers.includes(i));
    } else {
      const idx = value.indexOf(v);
      if (idx < 0) return;
      value.splice(idx, 1);
    }
  } else if (type === 'rating') {
    value = +v;
  } else {
    value = v;
  }
  const q = $questions.find(q => q.id === questionId);
  q.answer = value;
  question = copy(q);
  $questions = copy($questions);
}
</script>

<style lang="less">
.q-item {
  position: relative;
  overflow: hidden;
  h3 {
    margin: 1em 0 0.65em;
  }
  label {
    display: block;
    width: 100%;
    margin: 4px 0;
    line-height: 2em;
    &:hover {
      background-color: #f3f3f3;
    }
    span {
      margin-left: 4px;
      user-select: none;
    }
  }
  input.input,
  textarea {
    padding: 0.4em;
    min-width: 300px;
    max-width: 600px;
    box-sizing: border-box;
  }
  textarea {
    min-height: 60.66px;
  }
  ::-webkit-input-placeholder {
    color: #bbb !important;
  }
  .star {
    position: relative;
    display: inline-block;
    width: 25px;
    height: 25px;
    vertical-align: middle;
    background: url(@svg-empty) 0 0 no-repeat;
    background-size: 25px 25px;
    cursor: pointer;
    padding-right: 2px;
    &:hover,
    &.active {
      background: url(@svg-fill) 0 0 no-repeat;
      background-size: 25px 25px;
    }
    &:hover:after {
      position: absolute;
      top: 0;
      left: 0;
      content: '';
      display: block;
      width: 100%;
      height: 100%;
      background: url(@svg-empty) 0 0 no-repeat;
      background-size: 25px 25px;
      opacity: 0.2;
      transform: scale(1.07);
    }
  }
  .stars:hover {
    .star {
      background: url(@svg-fill) 0 0 no-repeat;
      background-size: 25px 25px;
      &:hover ~ .star {
        background: url(@svg-empty) 0 0 no-repeat;
        background-size: 25px 25px;
      }
    }
  }
}

@svg-empty: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjI1NzM0NjAxMDQzIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwNjYgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIzODgiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNjYuNjI1IiBoZWlnaHQ9IjY0Ij48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwvc3R5bGU+PC9kZWZzPjxwYXRoIGQ9Ik02OTEuMiAzNDUuNmwtMTU3Ljg2Ny0zMjAtMTU3Ljg2NiAzMjAtMzU0LjEzNCA1MS4yIDI1NiAyNTEuNzMzLTU5LjczMyAzNTQuMTM0IDMxNS43MzMtMTY2LjQgMzE1LjczNCAxNjYuNC01OS43MzQtMzU0LjEzNCAyNTYtMjUxLjczM0w2OTEuMiAzNDUuNnpNNDA1LjMzMyAzODRsMTI4LTI2NC41MzMgMTI4IDI2NC41MzMgMjkwLjEzNCA0Mi42NjctMjA5LjA2NyAyMDQuOEw3OTMuNiA5MjEuNiA1MzMuMzMzIDc4NS4wNjcgMjczLjA2NyA5MjEuNmw1MS4yLTI5MC4xMzMtMjEzLjMzNC0yMDQuOEw0MDUuMzMzIDM4NHoiIHAtaWQ9IjIzODkiPjwvcGF0aD48L3N2Zz4=';
@svg-fill: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjI1NzM0NjA3NDI2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwODAgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI1MzciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNjcuNSIgaGVpZ2h0PSI2NCI+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj48L3N0eWxlPjwvZGVmcz48cGF0aCBzdHlsZT0iZmlsbDogI2ZmY2MwMDsiIGQ9Ik0xMDc5LjAyMDMyNSAzODcuOTI3NzY5YTM5LjkyMzc1MiAzOS45MjM3NTIgMCAwIDAtMzguMzA1MjIxLTI3LjUxNTAxOGgtMzUzLjkxODY2N2wtMTA3LjkwMjAzMi0zMzIuMzM4MjYxQTM5LjkyMzc1MiAzOS45MjM3NTIgMCAwIDAgNTM5LjUxMDE2MyAwLjAxOTk2MmE0MC40NjMyNjIgNDAuNDYzMjYyIDAgMCAwLTM4LjMwNTIyMiAyNy41MTUwMThsLTEwNy45MDIwMzIgMzMyLjg3Nzc3MUg0MC40NjMyNjJBMzkuOTIzNzUyIDM5LjkyMzc1MiAwIDAgMCAxNi43MjQ4MTUgNDMxLjYyODA5MmwyODQuODYxMzY2IDIwNS41NTMzNzJMMTkyLjYwNTEyOCA5NzEuMTM4MjU1YTQwLjQ2MzI2MiA0MC40NjMyNjIgMCAwIDAgNjIuMDQzNjY5IDQ1LjMxODg1M0w1MzkuNTEwMTYzIDgwOS4yODUyMDZsMjg0Ljg2MTM2NiAyMDUuNTUzMzcyYTQxLjU0MjI4MyA0MS41NDIyODMgMCAwIDAgMjMuNzM4NDQ3IDcuNTUzMTQyIDQyLjYyMTMwMyA0Mi42MjEzMDMgMCAwIDAgMjMuNzM4NDQ3LTcuNTUzMTQyIDQxLjAwMjc3MiA0MS4wMDI3NzIgMCAwIDAgMTQuNTY2Nzc0LTQ1LjMxODg1NGwtMTA3LjkwMjAzMi0zMzIuMzM4MjZMMTA2Mi4yOTU1MSA0MzEuNjI4MDkyYTM5LjkyMzc1MiAzOS45MjM3NTIgMCAwIDAgMTYuNzI0ODE1LTQzLjcwMDMyM3oiIHAtaWQ9IjI1MzgiPjwvcGF0aD48L3N2Zz4=';
</style>