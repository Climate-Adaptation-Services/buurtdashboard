import { browser } from '$app/environment'
import '$lib/i18n/index.js' // Import to initialize. Important :)
import { locale, waitLocale } from 'svelte-i18n'

export function load(){
  async () => {
    if (browser) {
      locale.set(window.navigator.language)
    }
    await waitLocale()
  }
}





