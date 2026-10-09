/* Move the four existing manufacturer clips into the visible swipeable story rail.
   Each video iframe is moved, never duplicated: performance and original images remain intact.
   If scripts are blocked the original video cards keep their iframes. */
(()=>{function init(){
  document.querySelectorAll('[data-home-video-source]').forEach(target=>{
    const href=target.getAttribute('data-home-video-source');
    const source=[...document.querySelectorAll('.equal-wall-v6 .equal-card')].find(x=>x.getAttribute('href')===href);
    const player=source?.querySelector('.equal-video');
    const stage=target.querySelector('.ag-short-player');
    if(!player||!stage)return;
    stage.appendChild(player);
    target.classList.add('has-clip');
  });
}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();})();
