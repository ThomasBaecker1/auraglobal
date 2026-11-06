/* Load privacy-friendly video embeds only after a direct user action.
   One player at a time; leaving the story card stops playback by unloading its iframe. */
(()=>{'use strict';
  const buttons=[...document.querySelectorAll('[data-official-video]')];
  if(!buttons.length)return;
  let active=null;
  const stop=()=>{
    if(!active)return;
    active.frame.replaceWith(active.button);
    active.button.setAttribute('aria-pressed','false');
    active=null;
  };
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
    if(active&&entries.some(entry=>entry.target===active.card&&!entry.isIntersecting))stop();
  },{threshold:.12}):null;
  buttons.forEach(button=>{
    button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>{
      const id=button.dataset.officialVideo||'';
      if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
      stop();
      const card=button.closest('.ag-moment')||button.parentElement;
      const frame=document.createElement('iframe');
      frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0&playsinline=1';
      frame.title=button.dataset.videoTitle||'Markenvideo';
      frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.referrerPolicy='strict-origin-when-cross-origin';
      frame.allowFullscreen=true;
      frame.loading='eager';
      frame.className='ag-video-player';
      frame.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0';
      button.setAttribute('aria-pressed','true');
      button.replaceWith(frame);
      active={button,card,frame};
      if(observer)observer.observe(card);
    });
  });
  if(!observer){
    const check=()=>{if(!active)return;const rect=active.card.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)stop()};
    addEventListener('scroll',check,{passive:true});addEventListener('resize',check);
  }
})();
