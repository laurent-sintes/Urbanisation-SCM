import {useEffect,useState} from 'react';
import {buildHasChanged} from './buildUpdate';
import {fetchJson,staticUrl} from './publication';

export function useBuildUpdate() {
  const [available,setAvailable]=useState(false);
  useEffect(()=>{
    // Capture only the entry points of this document, before lazy navigation.
    const assets=Array.from(document.querySelectorAll<HTMLScriptElement|HTMLLinkElement>('script[type="module"][src],link[rel="stylesheet"][href]'))
      .map(element=>'src' in element ? element.src : element.href)
      .map(url=>new URL(url).pathname.match(/\/assets\/[^/]+$/)?.[0].slice(1))
      .filter((path):path is string=>!!path);
    if(!assets.length) return;
    let stopped=false,pending=false;
    const controller=new AbortController();
    const check=async()=>{
      if(stopped||pending||document.hidden) return;
      pending=true;
      try{
        const manifest=await fetchJson(staticUrl('delivery.json'),controller.signal);
        if(!stopped && buildHasChanged(manifest,assets)) setAvailable(true);
      }catch{ /* Network failure does not interrupt the publication already read. */ }
      finally{pending=false;}
    };
    void check();
    const timer=window.setInterval(check,30000);
    document.addEventListener('visibilitychange',check);
    window.addEventListener('online',check);
    return()=>{stopped=true;controller.abort();clearInterval(timer);document.removeEventListener('visibilitychange',check);window.removeEventListener('online',check);};
  },[]);
  return available;
}
