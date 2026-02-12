import { get } from 'svelte/store';
import { lang } from '$lib/stores';
import { nederlands } from './nl';
import { english } from './en';

export function t(text){
  if (get(lang) === 'en') {
    return english[text] || text
  }
  return nederlands[text] || text
}