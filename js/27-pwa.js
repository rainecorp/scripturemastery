/* 27-pwa.js — service worker registration (T15b)
   ===========================================================================
   Registers sw.js so the app installs to a home screen and keeps working
   with the network off. Feature-detected and wrapped in try/catch on
   purpose: navigator.serviceWorker exists but registration REJECTS under
   file:// (service workers require an http/https origin), and this app
   must keep working when someone unzips it and double-clicks index.html.
   A rejected registration here is silently swallowed — the app already
   works without a service worker, this only adds the offline/install
   layer when the environment supports it. */
if("serviceWorker" in navigator){
  window.addEventListener("load", function(){
    navigator.serviceWorker.register("sw.js").catch(function(){
      /* file://, an unsupported browser, or a blocked registration —
         nothing here is fatal to the app itself. */
    });
  });
}
