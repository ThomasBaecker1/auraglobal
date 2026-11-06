(() => {
  'use strict';
  // Dates come from dated Awin advertiser communications. Never show expired promos.
  const promoCards = [...document.querySelectorAll('[data-hot-deal]')];
  const now = new Date();
  const berlinDay = new Intl.DateTimeFormat('sv-SE', {
    timeZone:'Europe/Berlin', year:'numeric', month:'2-digit', day:'2-digit'
  }).format(now);
  const clock = new Intl.DateTimeFormat('de-DE', {
    timeZone:'Europe/Berlin', day:'2-digit', month:'2-digit'
  });
  for (const card of promoCards) {
    const start = card.dataset.start;
    const end = card.dataset.end;
    if (end && berlinDay > end) {card.remove(); continue;}
    const status = card.querySelector('[data-deal-status]');
    if (!status) continue;
    if (start && berlinDay < start) {
      card.classList.add('is-upcoming');
      status.textContent = 'Startet am ' + clock.format(new Date(start + 'T12:00:00+01:00'));
    } else {
      card.classList.add('is-active');
      status.textContent = end ? 'Bis ' + clock.format(new Date(end + 'T12:00:00+01:00')) : 'Aktion läuft';
      if (end) {
        const cutoff = new Date(end + 'T23:59:59+01:00');
        const hours = Math.ceil((cutoff.getTime() - now.getTime()) / 3600000);
        if (hours > 0 && hours <= 48) status.textContent = 'Endet in ca. ' + hours + ' Std.';
      }
    }
  }
  const active = document.querySelectorAll('[data-hot-deal]').length;
  const count = document.querySelector('[data-hot-deal-count]');
  if (count) count.textContent = active ? String(active) : '0';
  if (!active) document.querySelector('.ag-hot-deals')?.remove();

  // Real official brand videos: preview stills only, playback starts after a click.
  document.querySelectorAll('[data-official-video]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.officialVideo;
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
      const video = document.createElement('iframe');
      video.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      video.title = button.dataset.videoTitle || 'Offizielles Markenvideo';
      video.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      video.referrerPolicy = 'strict-origin-when-cross-origin';
      video.allowFullscreen = true;
      video.loading = 'lazy';
      video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
      button.replaceWith(video);
    }, {once:true});
  });
})();
