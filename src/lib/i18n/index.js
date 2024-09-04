import { browser } from '$app/environment'
import { init, register } from 'svelte-i18n'

const defaultLocale = 'en'

register('nl', () => import('./nl.json'))
register('en', () => import('./en.json'))

init({
	fallbackLocale: defaultLocale,
	// initialLocale: browser ? window.navigator.language : defaultLocale,
})