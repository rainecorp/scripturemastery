/* 00-namespace.js
   The one global this app adds. Every split file registers its top-level
   bindings on SQ so the later ES-module conversion (T15) is mechanical.
   The in-file bindings remain authoritative; SQ is a registry, not a
   replacement. New in T2 — the only non-verbatim JS in the split. */
var SQ = window.SQ || (window.SQ = {});
