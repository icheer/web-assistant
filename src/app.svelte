<template lang="pug">
  svelte:options(tag="web-questionnaire")
  .quiz-wrap
    +if("!design")
      +if("$quizData.title")
        h2.quiz-title {$quizData.title}
      +if("$quizData.intro")
        p.quiz-intro {$quizData.intro}
      +else
        .toolbar
          button.btn.btn-save 保存
        input.input(type="text" placeholder="请输入问卷标题" bind:value="{data.title}")
        input.input(type="text" placeholder="请输入问卷简介" bind:value="{data.intro}")
    +each("visibleQuestions as q, qIndex (q.id)")
      question-item(question="{q}" index="{qIndex}")
    +if("design")
      .btn-add(on:click="{questionAddHandler}") + 新增题目
</template>

<script>
  import { onMount, afterUpdate, tick } from 'svelte';
  import { quizData, questions } from '@/store/store';
  import { sleep, copy, genRandId, dispatchEvent } from '@/helper/func';
  import '_/question-item.svelte';

  export let data = {};
  export let design = false;
  export let id = '';
  export let version = 0;

  $: {
    let shouldRerender = false;
    $questions.forEach(q => {
      const { props = {} } = q;
      const { showIf } = props;
      if (!showIf) return;
      const [qId, answerWanted] = showIf.split(':==');
      const thatQ = $questions.find(q => q.id === qId);
      if (!thatQ) return;
      const flag = thatQ.answer === answerWanted;
      const flagOld = q.isVisible || false;
      if (flag !== flagOld) shouldRerender = true;
      q.isVisible = design ? true : flag;
    });
    if (shouldRerender) {
      $questions = copy($questions);
    }
  }
  $: visibleQuestions = $questions.filter(q => q.isVisible);

  // 新增题目
  function questionAddHandler() {
    console.log('insert');
    const newQuestion = {
      id: genRandId(),
      title: '',
      type: 'textarea',
      items: [],
      attrs: {},
      props: {},
      style: '',
      isVisible: true,
      answer: '',
      extraAnswer: '',
      wantedAnswer: ''
    };
    const data = copy($quizData);
    data.questions.push(newQuestion);
    $quizData = copy(data);
    $questions = copy(data.questions);
    console.log($quizData);
  }

  onMount(async () => {
    await sleep(50);
    console.log('mounted');
    if (!data || !data.questions) {
      if (!design) return;
      data = {
        title: '',
        intro: '',
        questions: []
      };
    }
    data.design = !!design;
    data.questions.forEach(q => {
      q.isVisible = true;
      q.answer = '';
      q.extraAnswer = '';
      q.wantedAnswer = '';
      q.style ||= '';
    });
    $quizData = data;
    $questions = data.questions;
  });

  // afterUpdate(() => {
  //   if (!columns.length || !data.length) return;
  //   emitEventWhenChanged();
  // });
</script>

<style lang="less">
  .quiz-wrap {
    padding: 20px 30px 20px;
    .toolbar {
      display: flex;
      justify-content: flex-end;
    }
    input.input {
      display: block;
      padding: 0.4em;
      margin: 1em 0;
      min-width: 300px;
      box-sizing: border-box;
    }
    .btn-add {
      width: 150px;
      height: 75px;
      line-height: 75px;
      margin: 15px auto;
      text-align: center;
      color: #666;
      border-radius: 10px;
      border: 1px dashed #ccc;
      cursor: pointer;
      user-select: none;
    }
  }
</style>
