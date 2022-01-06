import { writable, derived, get } from 'svelte/store';
import { tick } from 'svelte';

export const quizData = writable({});
export const questions = writable([]);
export const answers = writable({});
export const isDesign = derived(quizData, $quizData => $quizData.design);