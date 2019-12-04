!function(){"use strict";var t=function(t){var e=0;t+="x";for(var n=parseInt(65745979961613.07),r=0;r<t.length;r++)e>n&&(e=parseInt(e/137)),e=131*e+t.charCodeAt(r);return e},e=function(t,e,n){var r=n<.5?n*(1+e):n+e-n*e,o=2*n-r;return[(t/=360)+1/3,t,t-1/3].map((function(t){return t<0&&t++,t>1&&t--,t=t<1/6?o+6*(r-o)*t:t<.5?r:t<2/3?o+6*(r-o)*(2/3-t):o,Math.round(255*t)}))},n=function(e){var n=[(e=e||{}).lightness,e.saturation].map((function(t){return t=t||[.35,.5,.65],"[object Array]"===Object.prototype.toString.call(t)?t.concat():[t]}));this.L=n[0],this.S=n[1],this.hash=e.hash||t};n.prototype.hsl=function(t){var e,n,r=this.hash(t);return e=r%359,r=parseInt(r/360),n=this.S[r%this.S.length],r=parseInt(r/this.S.length),[e,n,this.L[r%this.L.length]]},n.prototype.rgb=function(t){var n=this.hsl(t);return e.apply(this,n)},n.prototype.hex=function(t){var e,n=this.rgb(t);return e="#",n.forEach((function(t){t<16&&(e+=0),e+=t.toString(16)})),e};var r=n;const o=[];let i,c;function s(t){function e(n){if(0===arguments.length)return i&&!e.o.has(i)&&(e.o.add(i),i.u.push(e)),t;if(c)return e.t===o&&c.push(e),e.t=n,n;t=n;const r=i;return i=void 0,e.i=new Set(e.o),e.i.forEach(t=>t.s=!1),e.i.forEach(t=>{t.s||t()}),i=r,t}return e.$o=!0,e.o=new Set,e.t=o,e}function l(t,e){function n(){const r=i;i&&i.__c.push(n);const o=n.__c;return u(n),n.s=!0,i=n,e=t(e),o.forEach(t=>{-1===n.__c.indexOf(t)&&(t.s=!0)}),function t(e){return e.reduce((e,n)=>e.concat(n,t(n.__c)),[])}(n.__c).forEach(t=>{t.s&&t.u.forEach(e=>{e.i&&e.i.delete(t)})}),i=r,e}return t.v=n,f(n),n(),function(){return n.s?n.u.forEach(t=>t()):e=n(),e}}function a(t){return l(t),()=>u(t.v)}function u(t){t.__c.forEach(u),t.u.forEach(e=>{e.o.delete(t)}),t.S.forEach(t=>t()),f(t)}function f(t){t.u=[],t.__c=[],t.S=[]}var h=Object.freeze({__proto__:null,S:l,cleanup:function(t){return i&&i.S.push(t),t},computed:l,isListening:function(){return!!i},o:s,observable:s,root:function(t){const e=i,n=()=>{};i=n,f(n);const r=t(()=>{u(n),i=void 0});return i=e,r},sample:function(t){const e=i;i=void 0;const n=t();return i=e,n},subscribe:a,transaction:function(t){c=[];const e=t();let n=c;return c=void 0,n.forEach(t=>{if(t.t!==o){const e=t.t;t.t=o,t(e)}}),e},unsubscribe:function(t){u(t.v)}});const p={},d=[],m="__g";function _(t,e,n,r){if(n){if(e){if(!r){const e=(r=n.previousSibling||t.lastChild)[m];if(e)for(r=r.previousSibling;r&&r[m]!==e;)r=r.previousSibling}let e;for(;r&&r!==n;)e=r.nextSibling,t.removeChild(r),r[m]=0,r=e}}else t.textContent=""}let y=0;function g(t,e,n,r,o){t=n&&n.parentNode||t;const i=typeof e;return e===r||(!e&&0!==e||!0===e?(_(t,r,n,o),r=null):r&&"string"!=typeof r||!("string"===i||"number"===i&&(e+=""))?"function"===i?p.subscribe((function(){r=p.insert(t,e(),n,r)})):(_(t,r,n,o),e instanceof Node||(e=p.h(d,e)),11===e.nodeType&&e.firstChild!==e.lastChild&&(e.firstChild[m]=e.lastChild[m]=++y),t.insertBefore(e,n||null),r=e):(null!=r&&t.firstChild?n?(n.previousSibling||t.lastChild).data=e:t.firstChild.data=e:n?t.insertBefore(document.createTextNode(e),n):t.textContent=e,r=e)),r}function v(t,e,n,r,o){if(!t||"attrs"===t&&(r=!0))for(t in e)v(t,e[t],n,r,o);else"o"!==t[0]||"n"!==t[1]||e.$o?"function"==typeof e?e.$t?e.$t(2,v,n,t):p.subscribe(()=>{v(t,e(),n,r,o)}):o?n.style.setProperty(t,e):r||"data-"===t.slice(0,5)||"aria-"===t.slice(0,5)?n.setAttribute(t,e):"style"===t?"string"==typeof e?n.style.cssText=e:v(null,e,n,r,!0):("class"===t&&(t+="Name"),n[t]=e):function(t,e,n){e=e.slice(2);const r=p.cleanup(()=>t.removeEventListener(e,b));n?t.addEventListener(e,b):r(),(t.t||(t.t={}))[e]=n}(n,t,e)}function b(t){return this.t[t.type](t)}function E(t,e){for(let e in t)p[e]=t[e];function n(){const t=d.slice.call(arguments);let n;return t.forEach((function r(o){const i=typeof o;if(null==o);else if("string"===i)n?n.appendChild(document.createTextNode(o)):n=e?document.createElementNS("http://www.w3.org/2000/svg",o):document.createElement(o);else if(Array.isArray(o))n||(n=document.createDocumentFragment()),o.forEach(r);else if(o instanceof Node)n?n.appendChild(o):n=o;else if("object"===i)v(null,o,n,e);else if("function"===i)if(n){const t=n.appendChild(document.createTextNode(""));o.$t?o.$t(1,g,n,""):g(n,o,t)}else n=o.apply(null,t.splice(1));else n.appendChild(document.createTextNode(""+o))})),n}return p.insert=g,p.property=v,p.h=n,n}const S=E(h),x=E(h,!0),A=s,k=[],C={};let w;function F(t,e){let n;return[e,t.__p,t.__c||t].forEach((function e(r){if(r instanceof Node)(n=r).i=n.i||0;else if(Array.isArray(r))r.forEach(e);else if(n){let e=B(n)[n.i];if(e)if(r===C)n.i++;else if("object"==typeof r)if(null===r.type)n.i++,e.u=!0,e.data.trim()!==r.__p.trim()&&(r.t.__c.length!==B(n).length&&e.splitText(e.data.indexOf(r.__p)+r.__p.length),e.data.trim()!==r.__p.trim()&&(e.data=r.__p));else if(r.type)F(r,e),n.i++;else for(let e in r)p.property(e,r[e],n,t.o);else if("function"==typeof r){let t,o,i,c=e.data,s="";p.subscribe((function(){w=t;let l=r();const a="string"==typeof l||"number"==typeof l;l=a?s+l:l,t?c=p.insert(n,l,o,c,i):(a?(n.i++,r.t.__c.length!==B(n).length&&(e.splitText(e.data.indexOf(l)+l.length),s=c.match(/^\s*/)[0])):(Array.isArray(l)&&(i=e,e=n),F(l,e),c=[]),o=n.insertBefore(document.createTextNode(""),B(n)[n.i]||null)),w=!1,t=!0}))}}})),n}function B(t){let e=t.firstChild,n=[];for(;e;)(3!==e.nodeType||e.data.trim()||e.u)&&n.push(e),e=e.nextSibling;return n}const N=function(t){return function(){if(w)return(t?x:S).apply(null,arguments);const e=k.slice.call(arguments),n={__c:[]};function r(t,e){t.__c.push(e),e.t=t}return e.forEach((function e(o){t&&(n.o=t),null==o||(o===C||"function"==typeof o?r(n,o):Array.isArray(o)?o.forEach(e):"object"==typeof o?o.type?r(n,o):n.__p=o:n.type?r(n,{type:null,__p:o}):n.type=o)})),n.type?n:n.__c.length>1?n.__c:n.__c[0]}}(),D={vanillajs:"#FFDD57",sinuous:"#70EDAC",solid:"#481B82",knockout:"#DB5A03",hyperapp:"#037FFF",redom:"#E7DC64",bobril:"#936037",preact:"#673AB8",react:"#61DAFB",mikado:"#59ABE9",inferno:"#E41E1D",wasm:"#644FF0",vue:"#40B883",angular:"#A6130C",ember:"#E04E39",svelte:"#FF3E00",lit:"#FF6C6A",mithril:"#1E5799"},T=["01_run1k","02_replace1k","03_update10th1k_x16","04_select1k","05_swap1k","06_remove-one-1k","07_create10k","08_create1k-after1k_x2","09_clear1k_x8","21_ready-memory","22_run-memory","23_update5-memory","24_run5-memory","25_run-clear-memory","31_startup-ci","32_startup-bt","34_startup-totalbytes"];function j(t){return t.id||t.framework}function I(t){return j(t).split("-")[0]}function L(t){if(0===t.length)return 0;t.sort((function(t,e){return t-e}));var e=Math.floor(t.length/2);return t.length%2?t[e]:(t[e-1]+t[e])/2}const q=A(document.querySelector(".load-input").value),$=A([]),M=A("#10-fastest"),O=l(()=>{const t=$().map(t=>t.benchmark);return function(t){return[...new Set(t)]}(t.length?t:T).sort()}),P=A(!1),W=A(!1);function z(){location.hash&&M(location.hash)}function R(t){t.preventDefault(),document.getElementById(t.target.href.split("#")[1]).scrollIntoView({behavior:"smooth"})}async function V(){P(!0);const t=await fetch(q()),e=await t.json();$(Array.isArray(e)?e:e.results),P(!1)}let G,H=[];function J(){$().length&&(cancelAnimationFrame(G),H=O().slice(),console.log("Restart plotting!"),W(!0),K())}function K(){const t=H.shift();if(!t)return console.log("Finished plotting!"),void W(!1);!function(t){let e=$().filter(t=>!j(t).includes("non-keyed")).filter(e=>e.benchmark===t).sort((t,e)=>L(t.values)>L(e.values)?1:-1);const n=M().match(/\d+/);n&&(e=e.slice(0,parseInt(n[0])));let o=[];const i=e.map(t=>(o=o.concat(t.values),{name:j(t),marker:{color:D[I(t)]||(new r).hex(I(t))},y:t.values,type:"box"})),c=t.startsWith("0")?"Duration in ms (lower is better)":t.startsWith("2")?"Memory in MB (lower is better)":t.startsWith("3")?"Startup metrics":"",s={title:t,yaxis:{title:c,range:[0,Math.max(...o)]}};Plotly.newPlot(t,i,s,{responsive:!0})}(t),G=requestAnimationFrame(K)}!function(){const t=()=>P()?" is-loading":"";F(N("div",null,N("div",{class:function(){return"select is-small"+t()}},N("select",{onchange:t=>q(t.target.value)}))),document.querySelector(".select-bench")),document.querySelectorAll(".filter-list a").forEach(t=>{F(N("a",{class:()=>t.href.includes(M())?"is-active":""}),t)}),a(V),document.querySelector(".benchmarks-list").append(S([()=>O().map(t=>S("li",null,S("a",{onclick:R,href:function(){return"#"+("function"==typeof t?t():t)}},t)))])),document.querySelector(".results").append(S([()=>O().map(t=>S("div",{class:"benchmark is-12 column"},S("div",{id:t})))])),a(J),window.addEventListener("hashchange",z),z()}()}();