if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let d={};const f=e=>i(e,o),t={module:{uri:o},exports:d,require:f};s[o]=Promise.all(r.map((e=>t[e]||f(e)))).then((e=>(n(...e),d)))}}define(["./workbox-7369c0e1"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/webfontloader-383b407c.js",revision:null},{url:"assets/webfontloader.js",revision:"1e243f336d3ff9a2222989cf6faa0193"},{url:"assets/workbox-window.prod.es5-dc90f814.js",revision:null},{url:"index-release.html",revision:"7d17427b89efde75b550bb1ba47cede0"},{url:"index.html",revision:"0da5ae8fb45fb13cab341ed5c79fbb4d"},{url:"SAGE.css",revision:"b815d8ad0c27f16de5b747e3aee3336b"},{url:"images/app-images/192x192.png",revision:"fbd2135eedf275ed0a80315a45498a09"},{url:"images/app-images/512x512.png",revision:"8bb1cea9f19fcdce6e564e41e7fd1465"},{url:"manifest.webmanifest",revision:"929ffa6d74a63fce93f950b80c77d104"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
