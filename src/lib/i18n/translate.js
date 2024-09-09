import { get } from 'svelte/store';
import { lang } from '$lib/stores';
import { nederlands } from './nl';
import { english } from './en';

export function t(text){
  return (get(lang) === 'en')
    ? english[text]
    : nederlands[text]
}