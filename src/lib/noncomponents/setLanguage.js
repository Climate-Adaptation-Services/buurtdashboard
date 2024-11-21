import { lang } from "$lib/stores"

export function setLanguage(data){
  if(data.lang === 'en'){
    lang.set('en')
  }else{
    lang.set('nl')
  }
}