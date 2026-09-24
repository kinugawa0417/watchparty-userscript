// ==UserScript==
// @name         KINUGAWA Party Theater（Prime を自動で合わせる）
// @namespace    watchparty-fixed
// @version      1.0.18
// @description  友だちと一緒に Prime Video / Netflix を見るとき、ホストの再生位置に自動で合わせます。KINUGAWA Party Theater の画面の「ブラウザで見る」から開いたときだけ動きます。
// @match        https://www.amazon.co.jp/*
// @match        https://www.primevideo.com/*
// @match        https://www.netflix.com/*
// @noframes
// @run-at       document-idle
// @inject-into  page
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    /*
     * 招待のリンク（?wp= / #wp=）から開いたタブでなければ、ここで終わる。通信の部品も何も読み込まない（2026-09-14）。
     * Android の Firefox で、このスクリプトを入れていると Amazon の再生が始まらなくなった（スクリプトを切ると再生できた）。
     * 原因の特定の前に、ふだんの Amazon のページには一切触れない形にした。
     */
    if (!['www.amazon.co.jp', 'www.primevideo.com', 'www.netflix.com'].includes(location.hostname)) return;
    {
        let invited = /(?:^|[?&#])wp=/.test(location.search + '&' + location.hash);
        try { invited = invited || Boolean(sessionStorage.getItem('wp:userscript')); } catch { /* 使えない設定 */ }
        if (!invited) return;
    }
    // bridge.js に「スマホのスクリプトの中で動いている」ことを伝える（ホストだけが要る重い処理を省く）
    const __WP_USERSCRIPT__ = true;
    const __WP_SERVER__ = "https://wp-sync-w4kqv7.fly.dev";
    // 招待ページのドメイン（環境で違う。PC のゲストがチャットを別の窓で開くのに使う）
    const __WP_HUB_HOST__ = "watchparty-hub.pages.dev";
    // 入っているスクリプトの版（チャット欄の見出しに出す。入れ直せたかを確かめられるように）
    const __WP_VERSION__ = "1.0.18";

    // ---- socket.io クライアント（サーバーから取らず、ここに入れておく）----
    // ページに io という名前を残さないよう、読み込んだら取り出して元に戻す
    const __WP_IO__ = (function () {
        const had = Object.prototype.hasOwnProperty.call(globalThis, 'io');
        const prev = globalThis.io;
        (function (exports, module, define) {
/*!
 * Socket.IO v4.8.3
 * (c) 2014-2025 Guillermo Rauch
 * Released under the MIT License.
 */
!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):(t="undefined"!=typeof globalThis?globalThis:t||self).io=n()}(this,(function(){"use strict";function t(t,n){(null==n||n>t.length)&&(n=t.length);for(var i=0,r=Array(n);i<n;i++)r[i]=t[i];return r}function n(t,n){for(var i=0;i<n.length;i++){var r=n[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,f(r.key),r)}}function i(t,i,r){return i&&n(t.prototype,i),r&&n(t,r),Object.defineProperty(t,"prototype",{writable:!1}),t}function r(n,i){var r="undefined"!=typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(!r){if(Array.isArray(n)||(r=function(n,i){if(n){if("string"==typeof n)return t(n,i);var r={}.toString.call(n).slice(8,-1);return"Object"===r&&n.constructor&&(r=n.constructor.name),"Map"===r||"Set"===r?Array.from(n):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?t(n,i):void 0}}(n))||i&&n&&"number"==typeof n.length){r&&(n=r);var e=0,o=function(){};return{s:o,n:function(){return e>=n.length?{done:!0}:{done:!1,value:n[e++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var s,u=!0,h=!1;return{s:function(){r=r.call(n)},n:function(){var t=r.next();return u=t.done,t},e:function(t){h=!0,s=t},f:function(){try{u||null==r.return||r.return()}finally{if(h)throw s}}}}function e(){return e=Object.assign?Object.assign.bind():function(t){for(var n=1;n<arguments.length;n++){var i=arguments[n];for(var r in i)({}).hasOwnProperty.call(i,r)&&(t[r]=i[r])}return t},e.apply(null,arguments)}function o(t){return o=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},o(t)}function s(t,n){t.prototype=Object.create(n.prototype),t.prototype.constructor=t,h(t,n)}function u(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){})))}catch(t){}return(u=function(){return!!t})()}function h(t,n){return h=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,n){return t.__proto__=n,t},h(t,n)}function f(t){var n=function(t,n){if("object"!=typeof t||!t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var r=i.call(t,n||"default");if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===n?String:Number)(t)}(t,"string");return"symbol"==typeof n?n:n+""}function c(t){return c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},c(t)}function a(t){var n="function"==typeof Map?new Map:void 0;return a=function(t){if(null===t||!function(t){try{return-1!==Function.toString.call(t).indexOf("[native code]")}catch(n){return"function"==typeof t}}(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==n){if(n.has(t))return n.get(t);n.set(t,i)}function i(){return function(t,n,i){if(u())return Reflect.construct.apply(null,arguments);var r=[null];r.push.apply(r,n);var e=new(t.bind.apply(t,r));return i&&h(e,i.prototype),e}(t,arguments,o(this).constructor)}return i.prototype=Object.create(t.prototype,{constructor:{value:i,enumerable:!1,writable:!0,configurable:!0}}),h(i,t)},a(t)}var v=Object.create(null);v.open="0",v.close="1",v.ping="2",v.pong="3",v.message="4",v.upgrade="5",v.noop="6";var l=Object.create(null);Object.keys(v).forEach((function(t){l[v[t]]=t}));var p,d={type:"error",data:"parser error"},y="function"==typeof Blob||"undefined"!=typeof Blob&&"[object BlobConstructor]"===Object.prototype.toString.call(Blob),b="function"==typeof ArrayBuffer,w=function(t){return"function"==typeof ArrayBuffer.isView?ArrayBuffer.isView(t):t&&t.buffer instanceof ArrayBuffer},g=function(t,n,i){var r=t.type,e=t.data;return y&&e instanceof Blob?n?i(e):m(e,i):b&&(e instanceof ArrayBuffer||w(e))?n?i(e):m(new Blob([e]),i):i(v[r]+(e||""))},m=function(t,n){var i=new FileReader;return i.onload=function(){var t=i.result.split(",")[1];n("b"+(t||""))},i.readAsDataURL(t)};function k(t){return t instanceof Uint8Array?t:t instanceof ArrayBuffer?new Uint8Array(t):new Uint8Array(t.buffer,t.byteOffset,t.byteLength)}for(var A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",j="undefined"==typeof Uint8Array?[]:new Uint8Array(256),E=0;E<64;E++)j[A.charCodeAt(E)]=E;var O,B="function"==typeof ArrayBuffer,S=function(t,n){if("string"!=typeof t)return{type:"message",data:C(t,n)};var i=t.charAt(0);return"b"===i?{type:"message",data:N(t.substring(1),n)}:l[i]?t.length>1?{type:l[i],data:t.substring(1)}:{type:l[i]}:d},N=function(t,n){if(B){var i=function(t){var n,i,r,e,o,s=.75*t.length,u=t.length,h=0;"="===t[t.length-1]&&(s--,"="===t[t.length-2]&&s--);var f=new ArrayBuffer(s),c=new Uint8Array(f);for(n=0;n<u;n+=4)i=j[t.charCodeAt(n)],r=j[t.charCodeAt(n+1)],e=j[t.charCodeAt(n+2)],o=j[t.charCodeAt(n+3)],c[h++]=i<<2|r>>4,c[h++]=(15&r)<<4|e>>2,c[h++]=(3&e)<<6|63&o;return f}(t);return C(i,n)}return{base64:!0,data:t}},C=function(t,n){return"blob"===n?t instanceof Blob?t:new Blob([t]):t instanceof ArrayBuffer?t:t.buffer},T=String.fromCharCode(30);function U(){return new TransformStream({transform:function(t,n){!function(t,n){y&&t.data instanceof Blob?t.data.arrayBuffer().then(k).then(n):b&&(t.data instanceof ArrayBuffer||w(t.data))?n(k(t.data)):g(t,!1,(function(t){p||(p=new TextEncoder),n(p.encode(t))}))}(t,(function(i){var r,e=i.length;if(e<126)r=new Uint8Array(1),new DataView(r.buffer).setUint8(0,e);else if(e<65536){r=new Uint8Array(3);var o=new DataView(r.buffer);o.setUint8(0,126),o.setUint16(1,e)}else{r=new Uint8Array(9);var s=new DataView(r.buffer);s.setUint8(0,127),s.setBigUint64(1,BigInt(e))}t.data&&"string"!=typeof t.data&&(r[0]|=128),n.enqueue(r),n.enqueue(i)}))}})}function M(t){return t.reduce((function(t,n){return t+n.length}),0)}function x(t,n){if(t[0].length===n)return t.shift();for(var i=new Uint8Array(n),r=0,e=0;e<n;e++)i[e]=t[0][r++],r===t[0].length&&(t.shift(),r=0);return t.length&&r<t[0].length&&(t[0]=t[0].slice(r)),i}function I(t){if(t)return function(t){for(var n in I.prototype)t[n]=I.prototype[n];return t}(t)}I.prototype.on=I.prototype.addEventListener=function(t,n){return this.t=this.t||{},(this.t["$"+t]=this.t["$"+t]||[]).push(n),this},I.prototype.once=function(t,n){function i(){this.off(t,i),n.apply(this,arguments)}return i.fn=n,this.on(t,i),this},I.prototype.off=I.prototype.removeListener=I.prototype.removeAllListeners=I.prototype.removeEventListener=function(t,n){if(this.t=this.t||{},0==arguments.length)return this.t={},this;var i,r=this.t["$"+t];if(!r)return this;if(1==arguments.length)return delete this.t["$"+t],this;for(var e=0;e<r.length;e++)if((i=r[e])===n||i.fn===n){r.splice(e,1);break}return 0===r.length&&delete this.t["$"+t],this},I.prototype.emit=function(t){this.t=this.t||{};for(var n=new Array(arguments.length-1),i=this.t["$"+t],r=1;r<arguments.length;r++)n[r-1]=arguments[r];if(i){r=0;for(var e=(i=i.slice(0)).length;r<e;++r)i[r].apply(this,n)}return this},I.prototype.emitReserved=I.prototype.emit,I.prototype.listeners=function(t){return this.t=this.t||{},this.t["$"+t]||[]},I.prototype.hasListeners=function(t){return!!this.listeners(t).length};var R="function"==typeof Promise&&"function"==typeof Promise.resolve?function(t){return Promise.resolve().then(t)}:function(t,n){return n(t,0)},L="undefined"!=typeof self?self:"undefined"!=typeof window?window:Function("return this")();function _(t){for(var n=arguments.length,i=new Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];return i.reduce((function(n,i){return t.hasOwnProperty(i)&&(n[i]=t[i]),n}),{})}var D=L.setTimeout,P=L.clearTimeout;function $(t,n){n.useNativeTimers?(t.setTimeoutFn=D.bind(L),t.clearTimeoutFn=P.bind(L)):(t.setTimeoutFn=L.setTimeout.bind(L),t.clearTimeoutFn=L.clearTimeout.bind(L))}function F(){return Date.now().toString(36).substring(3)+Math.random().toString(36).substring(2,5)}var V=function(t){function n(n,i,r){var e;return(e=t.call(this,n)||this).description=i,e.context=r,e.type="TransportError",e}return s(n,t),n}(a(Error)),q=function(t){function n(n){var i;return(i=t.call(this)||this).writable=!1,$(i,n),i.opts=n,i.query=n.query,i.socket=n.socket,i.supportsBinary=!n.forceBase64,i}s(n,t);var i=n.prototype;return i.onError=function(n,i,r){return t.prototype.emitReserved.call(this,"error",new V(n,i,r)),this},i.open=function(){return this.readyState="opening",this.doOpen(),this},i.close=function(){return"opening"!==this.readyState&&"open"!==this.readyState||(this.doClose(),this.onClose()),this},i.send=function(t){"open"===this.readyState&&this.write(t)},i.onOpen=function(){this.readyState="open",this.writable=!0,t.prototype.emitReserved.call(this,"open")},i.onData=function(t){var n=S(t,this.socket.binaryType);this.onPacket(n)},i.onPacket=function(n){t.prototype.emitReserved.call(this,"packet",n)},i.onClose=function(n){this.readyState="closed",t.prototype.emitReserved.call(this,"close",n)},i.pause=function(t){},i.createUri=function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return t+"://"+this.i()+this.o()+this.opts.path+this.u(n)},i.i=function(){var t=this.opts.hostname;return-1===t.indexOf(":")?t:"["+t+"]"},i.o=function(){return this.opts.port&&(this.opts.secure&&443!==Number(this.opts.port)||!this.opts.secure&&80!==Number(this.opts.port))?":"+this.opts.port:""},i.u=function(t){var n=function(t){var n="";for(var i in t)t.hasOwnProperty(i)&&(n.length&&(n+="&"),n+=encodeURIComponent(i)+"="+encodeURIComponent(t[i]));return n}(t);return n.length?"?"+n:""},n}(I),X=function(t){function n(){var n;return(n=t.apply(this,arguments)||this).h=!1,n}s(n,t);var r=n.prototype;return r.doOpen=function(){this.v()},r.pause=function(t){var n=this;this.readyState="pausing";var i=function(){n.readyState="paused",t()};if(this.h||!this.writable){var r=0;this.h&&(r++,this.once("pollComplete",(function(){--r||i()}))),this.writable||(r++,this.once("drain",(function(){--r||i()})))}else i()},r.v=function(){this.h=!0,this.doPoll(),this.emitReserved("poll")},r.onData=function(t){var n=this;(function(t,n){for(var i=t.split(T),r=[],e=0;e<i.length;e++){var o=S(i[e],n);if(r.push(o),"error"===o.type)break}return r})(t,this.socket.binaryType).forEach((function(t){if("opening"===n.readyState&&"open"===t.type&&n.onOpen(),"close"===t.type)return n.onClose({description:"transport closed by the server"}),!1;n.onPacket(t)})),"closed"!==this.readyState&&(this.h=!1,this.emitReserved("pollComplete"),"open"===this.readyState&&this.v())},r.doClose=function(){var t=this,n=function(){t.write([{type:"close"}])};"open"===this.readyState?n():this.once("open",n)},r.write=function(t){var n=this;this.writable=!1,function(t,n){var i=t.length,r=new Array(i),e=0;t.forEach((function(t,o){g(t,!1,(function(t){r[o]=t,++e===i&&n(r.join(T))}))}))}(t,(function(t){n.doWrite(t,(function(){n.writable=!0,n.emitReserved("drain")}))}))},r.uri=function(){var t=this.opts.secure?"https":"http",n=this.query||{};return!1!==this.opts.timestampRequests&&(n[this.opts.timestampParam]=F()),this.supportsBinary||n.sid||(n.b64=1),this.createUri(t,n)},i(n,[{key:"name",get:function(){return"polling"}}])}(q),H=!1;try{H="undefined"!=typeof XMLHttpRequest&&"withCredentials"in new XMLHttpRequest}catch(t){}var z=H;function J(){}var K=function(t){function n(n){var i;if(i=t.call(this,n)||this,"undefined"!=typeof location){var r="https:"===location.protocol,e=location.port;e||(e=r?"443":"80"),i.xd="undefined"!=typeof location&&n.hostname!==location.hostname||e!==n.port}return i}s(n,t);var i=n.prototype;return i.doWrite=function(t,n){var i=this,r=this.request({method:"POST",data:t});r.on("success",n),r.on("error",(function(t,n){i.onError("xhr post error",t,n)}))},i.doPoll=function(){var t=this,n=this.request();n.on("data",this.onData.bind(this)),n.on("error",(function(n,i){t.onError("xhr poll error",n,i)})),this.pollXhr=n},n}(X),Y=function(t){function n(n,i,r){var e;return(e=t.call(this)||this).createRequest=n,$(e,r),e.l=r,e.p=r.method||"GET",e.m=i,e.k=void 0!==r.data?r.data:null,e.A(),e}s(n,t);var i=n.prototype;return i.A=function(){var t,i=this,r=_(this.l,"agent","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","autoUnref");r.xdomain=!!this.l.xd;var e=this.j=this.createRequest(r);try{e.open(this.p,this.m,!0);try{if(this.l.extraHeaders)for(var o in e.setDisableHeaderCheck&&e.setDisableHeaderCheck(!0),this.l.extraHeaders)this.l.extraHeaders.hasOwnProperty(o)&&e.setRequestHeader(o,this.l.extraHeaders[o])}catch(t){}if("POST"===this.p)try{e.setRequestHeader("Content-type","text/plain;charset=UTF-8")}catch(t){}try{e.setRequestHeader("Accept","*/*")}catch(t){}null===(t=this.l.cookieJar)||void 0===t||t.addCookies(e),"withCredentials"in e&&(e.withCredentials=this.l.withCredentials),this.l.requestTimeout&&(e.timeout=this.l.requestTimeout),e.onreadystatechange=function(){var t;3===e.readyState&&(null===(t=i.l.cookieJar)||void 0===t||t.parseCookies(e.getResponseHeader("set-cookie"))),4===e.readyState&&(200===e.status||1223===e.status?i.O():i.setTimeoutFn((function(){i.B("number"==typeof e.status?e.status:0)}),0))},e.send(this.k)}catch(t){return void this.setTimeoutFn((function(){i.B(t)}),0)}"undefined"!=typeof document&&(this.S=n.requestsCount++,n.requests[this.S]=this)},i.B=function(t){this.emitReserved("error",t,this.j),this.N(!0)},i.N=function(t){if(void 0!==this.j&&null!==this.j){if(this.j.onreadystatechange=J,t)try{this.j.abort()}catch(t){}"undefined"!=typeof document&&delete n.requests[this.S],this.j=null}},i.O=function(){var t=this.j.responseText;null!==t&&(this.emitReserved("data",t),this.emitReserved("success"),this.N())},i.abort=function(){this.N()},n}(I);if(Y.requestsCount=0,Y.requests={},"undefined"!=typeof document)if("function"==typeof attachEvent)attachEvent("onunload",G);else if("function"==typeof addEventListener){addEventListener("onpagehide"in L?"pagehide":"unload",G,!1)}function G(){for(var t in Y.requests)Y.requests.hasOwnProperty(t)&&Y.requests[t].abort()}var Q,W=(Q=tt({xdomain:!1}))&&null!==Q.responseType,Z=function(t){function n(n){var i;i=t.call(this,n)||this;var r=n&&n.forceBase64;return i.supportsBinary=W&&!r,i}return s(n,t),n.prototype.request=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return e(t,{xd:this.xd},this.opts),new Y(tt,this.uri(),t)},n}(K);function tt(t){var n=t.xdomain;try{if("undefined"!=typeof XMLHttpRequest&&(!n||z))return new XMLHttpRequest}catch(t){}if(!n)try{return new(L[["Active"].concat("Object").join("X")])("Microsoft.XMLHTTP")}catch(t){}}var nt="undefined"!=typeof navigator&&"string"==typeof navigator.product&&"reactnative"===navigator.product.toLowerCase(),it=function(t){function n(){return t.apply(this,arguments)||this}s(n,t);var r=n.prototype;return r.doOpen=function(){var t=this.uri(),n=this.opts.protocols,i=nt?{}:_(this.opts,"agent","perMessageDeflate","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","localAddress","protocolVersion","origin","maxPayload","family","checkServerIdentity");this.opts.extraHeaders&&(i.headers=this.opts.extraHeaders);try{this.ws=this.createSocket(t,n,i)}catch(t){return this.emitReserved("error",t)}this.ws.binaryType=this.socket.binaryType,this.addEventListeners()},r.addEventListeners=function(){var t=this;this.ws.onopen=function(){t.opts.autoUnref&&t.ws.C.unref(),t.onOpen()},this.ws.onclose=function(n){return t.onClose({description:"websocket connection closed",context:n})},this.ws.onmessage=function(n){return t.onData(n.data)},this.ws.onerror=function(n){return t.onError("websocket error",n)}},r.write=function(t){var n=this;this.writable=!1;for(var i=function(){var i=t[r],e=r===t.length-1;g(i,n.supportsBinary,(function(t){try{n.doWrite(i,t)}catch(t){}e&&R((function(){n.writable=!0,n.emitReserved("drain")}),n.setTimeoutFn)}))},r=0;r<t.length;r++)i()},r.doClose=function(){void 0!==this.ws&&(this.ws.onerror=function(){},this.ws.close(),this.ws=null)},r.uri=function(){var t=this.opts.secure?"wss":"ws",n=this.query||{};return this.opts.timestampRequests&&(n[this.opts.timestampParam]=F()),this.supportsBinary||(n.b64=1),this.createUri(t,n)},i(n,[{key:"name",get:function(){return"websocket"}}])}(q),rt=L.WebSocket||L.MozWebSocket,et=function(t){function n(){return t.apply(this,arguments)||this}s(n,t);var i=n.prototype;return i.createSocket=function(t,n,i){return nt?new rt(t,n,i):n?new rt(t,n):new rt(t)},i.doWrite=function(t,n){this.ws.send(n)},n}(it),ot=function(t){function n(){return t.apply(this,arguments)||this}s(n,t);var r=n.prototype;return r.doOpen=function(){var t=this;try{this.T=new WebTransport(this.createUri("https"),this.opts.transportOptions[this.name])}catch(t){return this.emitReserved("error",t)}this.T.closed.then((function(){t.onClose()})).catch((function(n){t.onError("webtransport error",n)})),this.T.ready.then((function(){t.T.createBidirectionalStream().then((function(n){var i=function(t,n){O||(O=new TextDecoder);var i=[],r=0,e=-1,o=!1;return new TransformStream({transform:function(s,u){for(i.push(s);;){if(0===r){if(M(i)<1)break;var h=x(i,1);o=!(128&~h[0]),e=127&h[0],r=e<126?3:126===e?1:2}else if(1===r){if(M(i)<2)break;var f=x(i,2);e=new DataView(f.buffer,f.byteOffset,f.length).getUint16(0),r=3}else if(2===r){if(M(i)<8)break;var c=x(i,8),a=new DataView(c.buffer,c.byteOffset,c.length),v=a.getUint32(0);if(v>Math.pow(2,21)-1){u.enqueue(d);break}e=v*Math.pow(2,32)+a.getUint32(4),r=3}else{if(M(i)<e)break;var l=x(i,e);u.enqueue(S(o?l:O.decode(l),n)),r=0}if(0===e||e>t){u.enqueue(d);break}}}})}(Number.MAX_SAFE_INTEGER,t.socket.binaryType),r=n.readable.pipeThrough(i).getReader(),e=U();e.readable.pipeTo(n.writable),t.U=e.writable.getWriter();!function n(){r.read().then((function(i){var r=i.done,e=i.value;r||(t.onPacket(e),n())})).catch((function(t){}))}();var o={type:"open"};t.query.sid&&(o.data='{"sid":"'.concat(t.query.sid,'"}')),t.U.write(o).then((function(){return t.onOpen()}))}))}))},r.write=function(t){var n=this;this.writable=!1;for(var i=function(){var i=t[r],e=r===t.length-1;n.U.write(i).then((function(){e&&R((function(){n.writable=!0,n.emitReserved("drain")}),n.setTimeoutFn)}))},r=0;r<t.length;r++)i()},r.doClose=function(){var t;null===(t=this.T)||void 0===t||t.close()},i(n,[{key:"name",get:function(){return"webtransport"}}])}(q),st={websocket:et,webtransport:ot,polling:Z},ut=/^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,ht=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];function ft(t){if(t.length>8e3)throw"URI too long";var n=t,i=t.indexOf("["),r=t.indexOf("]");-1!=i&&-1!=r&&(t=t.substring(0,i)+t.substring(i,r).replace(/:/g,";")+t.substring(r,t.length));for(var e,o,s=ut.exec(t||""),u={},h=14;h--;)u[ht[h]]=s[h]||"";return-1!=i&&-1!=r&&(u.source=n,u.host=u.host.substring(1,u.host.length-1).replace(/;/g,":"),u.authority=u.authority.replace("[","").replace("]","").replace(/;/g,":"),u.ipv6uri=!0),u.pathNames=function(t,n){var i=/\/{2,9}/g,r=n.replace(i,"/").split("/");"/"!=n.slice(0,1)&&0!==n.length||r.splice(0,1);"/"==n.slice(-1)&&r.splice(r.length-1,1);return r}(0,u.path),u.queryKey=(e=u.query,o={},e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,(function(t,n,i){n&&(o[n]=i)})),o),u}var ct="function"==typeof addEventListener&&"function"==typeof removeEventListener,at=[];ct&&addEventListener("offline",(function(){at.forEach((function(t){return t()}))}),!1);var vt=function(t){function n(n,i){var r;if((r=t.call(this)||this).binaryType="arraybuffer",r.writeBuffer=[],r.M=0,r.I=-1,r.R=-1,r.L=-1,r._=1/0,n&&"object"===c(n)&&(i=n,n=null),n){var o=ft(n);i.hostname=o.host,i.secure="https"===o.protocol||"wss"===o.protocol,i.port=o.port,o.query&&(i.query=o.query)}else i.host&&(i.hostname=ft(i.host).host);return $(r,i),r.secure=null!=i.secure?i.secure:"undefined"!=typeof location&&"https:"===location.protocol,i.hostname&&!i.port&&(i.port=r.secure?"443":"80"),r.hostname=i.hostname||("undefined"!=typeof location?location.hostname:"localhost"),r.port=i.port||("undefined"!=typeof location&&location.port?location.port:r.secure?"443":"80"),r.transports=[],r.D={},i.transports.forEach((function(t){var n=t.prototype.name;r.transports.push(n),r.D[n]=t})),r.opts=e({path:"/engine.io",agent:!1,withCredentials:!1,upgrade:!0,timestampParam:"t",rememberUpgrade:!1,addTrailingSlash:!0,rejectUnauthorized:!0,perMessageDeflate:{threshold:1024},transportOptions:{},closeOnBeforeunload:!1},i),r.opts.path=r.opts.path.replace(/\/$/,"")+(r.opts.addTrailingSlash?"/":""),"string"==typeof r.opts.query&&(r.opts.query=function(t){for(var n={},i=t.split("&"),r=0,e=i.length;r<e;r++){var o=i[r].split("=");n[decodeURIComponent(o[0])]=decodeURIComponent(o[1])}return n}(r.opts.query)),ct&&(r.opts.closeOnBeforeunload&&(r.P=function(){r.transport&&(r.transport.removeAllListeners(),r.transport.close())},addEventListener("beforeunload",r.P,!1)),"localhost"!==r.hostname&&(r.$=function(){r.F("transport close",{description:"network connection lost"})},at.push(r.$))),r.opts.withCredentials&&(r.V=void 0),r.q(),r}s(n,t);var i=n.prototype;return i.createTransport=function(t){var n=e({},this.opts.query);n.EIO=4,n.transport=t,this.id&&(n.sid=this.id);var i=e({},this.opts,{query:n,socket:this,hostname:this.hostname,secure:this.secure,port:this.port},this.opts.transportOptions[t]);return new this.D[t](i)},i.q=function(){var t=this;if(0!==this.transports.length){var i=this.opts.rememberUpgrade&&n.priorWebsocketSuccess&&-1!==this.transports.indexOf("websocket")?"websocket":this.transports[0];this.readyState="opening";var r=this.createTransport(i);r.open(),this.setTransport(r)}else this.setTimeoutFn((function(){t.emitReserved("error","No transports available")}),0)},i.setTransport=function(t){var n=this;this.transport&&this.transport.removeAllListeners(),this.transport=t,t.on("drain",this.X.bind(this)).on("packet",this.H.bind(this)).on("error",this.B.bind(this)).on("close",(function(t){return n.F("transport close",t)}))},i.onOpen=function(){this.readyState="open",n.priorWebsocketSuccess="websocket"===this.transport.name,this.emitReserved("open"),this.flush()},i.H=function(t){if("opening"===this.readyState||"open"===this.readyState||"closing"===this.readyState)switch(this.emitReserved("packet",t),this.emitReserved("heartbeat"),t.type){case"open":this.onHandshake(JSON.parse(t.data));break;case"ping":this.J("pong"),this.emitReserved("ping"),this.emitReserved("pong"),this.K();break;case"error":var n=new Error("server error");n.code=t.data,this.B(n);break;case"message":this.emitReserved("data",t.data),this.emitReserved("message",t.data)}},i.onHandshake=function(t){this.emitReserved("handshake",t),this.id=t.sid,this.transport.query.sid=t.sid,this.I=t.pingInterval,this.R=t.pingTimeout,this.L=t.maxPayload,this.onOpen(),"closed"!==this.readyState&&this.K()},i.K=function(){var t=this;this.clearTimeoutFn(this.Y);var n=this.I+this.R;this._=Date.now()+n,this.Y=this.setTimeoutFn((function(){t.F("ping timeout")}),n),this.opts.autoUnref&&this.Y.unref()},i.X=function(){this.writeBuffer.splice(0,this.M),this.M=0,0===this.writeBuffer.length?this.emitReserved("drain"):this.flush()},i.flush=function(){if("closed"!==this.readyState&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length){var t=this.G();this.transport.send(t),this.M=t.length,this.emitReserved("flush")}},i.G=function(){if(!(this.L&&"polling"===this.transport.name&&this.writeBuffer.length>1))return this.writeBuffer;for(var t,n=1,i=0;i<this.writeBuffer.length;i++){var r=this.writeBuffer[i].data;if(r&&(n+="string"==typeof(t=r)?function(t){for(var n=0,i=0,r=0,e=t.length;r<e;r++)(n=t.charCodeAt(r))<128?i+=1:n<2048?i+=2:n<55296||n>=57344?i+=3:(r++,i+=4);return i}(t):Math.ceil(1.33*(t.byteLength||t.size))),i>0&&n>this.L)return this.writeBuffer.slice(0,i);n+=2}return this.writeBuffer},i.W=function(){var t=this;if(!this._)return!0;var n=Date.now()>this._;return n&&(this._=0,R((function(){t.F("ping timeout")}),this.setTimeoutFn)),n},i.write=function(t,n,i){return this.J("message",t,n,i),this},i.send=function(t,n,i){return this.J("message",t,n,i),this},i.J=function(t,n,i,r){if("function"==typeof n&&(r=n,n=void 0),"function"==typeof i&&(r=i,i=null),"closing"!==this.readyState&&"closed"!==this.readyState){(i=i||{}).compress=!1!==i.compress;var e={type:t,data:n,options:i};this.emitReserved("packetCreate",e),this.writeBuffer.push(e),r&&this.once("flush",r),this.flush()}},i.close=function(){var t=this,n=function(){t.F("forced close"),t.transport.close()},i=function i(){t.off("upgrade",i),t.off("upgradeError",i),n()},r=function(){t.once("upgrade",i),t.once("upgradeError",i)};return"opening"!==this.readyState&&"open"!==this.readyState||(this.readyState="closing",this.writeBuffer.length?this.once("drain",(function(){t.upgrading?r():n()})):this.upgrading?r():n()),this},i.B=function(t){if(n.priorWebsocketSuccess=!1,this.opts.tryAllTransports&&this.transports.length>1&&"opening"===this.readyState)return this.transports.shift(),this.q();this.emitReserved("error",t),this.F("transport error",t)},i.F=function(t,n){if("opening"===this.readyState||"open"===this.readyState||"closing"===this.readyState){if(this.clearTimeoutFn(this.Y),this.transport.removeAllListeners("close"),this.transport.close(),this.transport.removeAllListeners(),ct&&(this.P&&removeEventListener("beforeunload",this.P,!1),this.$)){var i=at.indexOf(this.$);-1!==i&&at.splice(i,1)}this.readyState="closed",this.id=null,this.emitReserved("close",t,n),this.writeBuffer=[],this.M=0}},n}(I);vt.protocol=4;var lt=function(t){function n(){var n;return(n=t.apply(this,arguments)||this).Z=[],n}s(n,t);var i=n.prototype;return i.onOpen=function(){if(t.prototype.onOpen.call(this),"open"===this.readyState&&this.opts.upgrade)for(var n=0;n<this.Z.length;n++)this.tt(this.Z[n])},i.tt=function(t){var n=this,i=this.createTransport(t),r=!1;vt.priorWebsocketSuccess=!1;var e=function(){r||(i.send([{type:"ping",data:"probe"}]),i.once("packet",(function(t){if(!r)if("pong"===t.type&&"probe"===t.data){if(n.upgrading=!0,n.emitReserved("upgrading",i),!i)return;vt.priorWebsocketSuccess="websocket"===i.name,n.transport.pause((function(){r||"closed"!==n.readyState&&(c(),n.setTransport(i),i.send([{type:"upgrade"}]),n.emitReserved("upgrade",i),i=null,n.upgrading=!1,n.flush())}))}else{var e=new Error("probe error");e.transport=i.name,n.emitReserved("upgradeError",e)}})))};function o(){r||(r=!0,c(),i.close(),i=null)}var s=function(t){var r=new Error("probe error: "+t);r.transport=i.name,o(),n.emitReserved("upgradeError",r)};function u(){s("transport closed")}function h(){s("socket closed")}function f(t){i&&t.name!==i.name&&o()}var c=function(){i.removeListener("open",e),i.removeListener("error",s),i.removeListener("close",u),n.off("close",h),n.off("upgrading",f)};i.once("open",e),i.once("error",s),i.once("close",u),this.once("close",h),this.once("upgrading",f),-1!==this.Z.indexOf("webtransport")&&"webtransport"!==t?this.setTimeoutFn((function(){r||i.open()}),200):i.open()},i.onHandshake=function(n){this.Z=this.nt(n.upgrades),t.prototype.onHandshake.call(this,n)},i.nt=function(t){for(var n=[],i=0;i<t.length;i++)~this.transports.indexOf(t[i])&&n.push(t[i]);return n},n}(vt),pt=function(t){function n(n){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r="object"===c(n)?n:i;return(!r.transports||r.transports&&"string"==typeof r.transports[0])&&(r.transports=(r.transports||["polling","websocket","webtransport"]).map((function(t){return st[t]})).filter((function(t){return!!t}))),t.call(this,n,r)||this}return s(n,t),n}(lt);pt.protocol;var dt="function"==typeof ArrayBuffer,yt=function(t){return"function"==typeof ArrayBuffer.isView?ArrayBuffer.isView(t):t.buffer instanceof ArrayBuffer},bt=Object.prototype.toString,wt="function"==typeof Blob||"undefined"!=typeof Blob&&"[object BlobConstructor]"===bt.call(Blob),gt="function"==typeof File||"undefined"!=typeof File&&"[object FileConstructor]"===bt.call(File);function mt(t){return dt&&(t instanceof ArrayBuffer||yt(t))||wt&&t instanceof Blob||gt&&t instanceof File}function kt(t,n){if(!t||"object"!==c(t))return!1;if(Array.isArray(t)){for(var i=0,r=t.length;i<r;i++)if(kt(t[i]))return!0;return!1}if(mt(t))return!0;if(t.toJSON&&"function"==typeof t.toJSON&&1===arguments.length)return kt(t.toJSON(),!0);for(var e in t)if(Object.prototype.hasOwnProperty.call(t,e)&&kt(t[e]))return!0;return!1}function At(t){var n=[],i=t.data,r=t;return r.data=jt(i,n),r.attachments=n.length,{packet:r,buffers:n}}function jt(t,n){if(!t)return t;if(mt(t)){var i={_placeholder:!0,num:n.length};return n.push(t),i}if(Array.isArray(t)){for(var r=new Array(t.length),e=0;e<t.length;e++)r[e]=jt(t[e],n);return r}if("object"===c(t)&&!(t instanceof Date)){var o={};for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(o[s]=jt(t[s],n));return o}return t}function Et(t,n){return t.data=Ot(t.data,n),delete t.attachments,t}function Ot(t,n){if(!t)return t;if(t&&!0===t._placeholder){if("number"==typeof t.num&&t.num>=0&&t.num<n.length)return n[t.num];throw new Error("illegal attachments")}if(Array.isArray(t))for(var i=0;i<t.length;i++)t[i]=Ot(t[i],n);else if("object"===c(t))for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(t[r]=Ot(t[r],n));return t}var Bt,St=["connect","connect_error","disconnect","disconnecting","newListener","removeListener"];!function(t){t[t.CONNECT=0]="CONNECT",t[t.DISCONNECT=1]="DISCONNECT",t[t.EVENT=2]="EVENT",t[t.ACK=3]="ACK",t[t.CONNECT_ERROR=4]="CONNECT_ERROR",t[t.BINARY_EVENT=5]="BINARY_EVENT",t[t.BINARY_ACK=6]="BINARY_ACK"}(Bt||(Bt={}));var Nt=function(){function t(t){this.replacer=t}var n=t.prototype;return n.encode=function(t){return t.type!==Bt.EVENT&&t.type!==Bt.ACK||!kt(t)?[this.encodeAsString(t)]:this.encodeAsBinary({type:t.type===Bt.EVENT?Bt.BINARY_EVENT:Bt.BINARY_ACK,nsp:t.nsp,data:t.data,id:t.id})},n.encodeAsString=function(t){var n=""+t.type;return t.type!==Bt.BINARY_EVENT&&t.type!==Bt.BINARY_ACK||(n+=t.attachments+"-"),t.nsp&&"/"!==t.nsp&&(n+=t.nsp+","),null!=t.id&&(n+=t.id),null!=t.data&&(n+=JSON.stringify(t.data,this.replacer)),n},n.encodeAsBinary=function(t){var n=At(t),i=this.encodeAsString(n.packet),r=n.buffers;return r.unshift(i),r},t}(),Ct=function(t){function n(n){var i;return(i=t.call(this)||this).reviver=n,i}s(n,t);var i=n.prototype;return i.add=function(n){var i;if("string"==typeof n){if(this.reconstructor)throw new Error("got plaintext data when reconstructing a packet");var r=(i=this.decodeString(n)).type===Bt.BINARY_EVENT;r||i.type===Bt.BINARY_ACK?(i.type=r?Bt.EVENT:Bt.ACK,this.reconstructor=new Tt(i),0===i.attachments&&t.prototype.emitReserved.call(this,"decoded",i)):t.prototype.emitReserved.call(this,"decoded",i)}else{if(!mt(n)&&!n.base64)throw new Error("Unknown type: "+n);if(!this.reconstructor)throw new Error("got binary data when not reconstructing a packet");(i=this.reconstructor.takeBinaryData(n))&&(this.reconstructor=null,t.prototype.emitReserved.call(this,"decoded",i))}},i.decodeString=function(t){var i=0,r={type:Number(t.charAt(0))};if(void 0===Bt[r.type])throw new Error("unknown packet type "+r.type);if(r.type===Bt.BINARY_EVENT||r.type===Bt.BINARY_ACK){for(var e=i+1;"-"!==t.charAt(++i)&&i!=t.length;);var o=t.substring(e,i);if(o!=Number(o)||"-"!==t.charAt(i))throw new Error("Illegal attachments");r.attachments=Number(o)}if("/"===t.charAt(i+1)){for(var s=i+1;++i;){if(","===t.charAt(i))break;if(i===t.length)break}r.nsp=t.substring(s,i)}else r.nsp="/";var u=t.charAt(i+1);if(""!==u&&Number(u)==u){for(var h=i+1;++i;){var f=t.charAt(i);if(null==f||Number(f)!=f){--i;break}if(i===t.length)break}r.id=Number(t.substring(h,i+1))}if(t.charAt(++i)){var c=this.tryParse(t.substr(i));if(!n.isPayloadValid(r.type,c))throw new Error("invalid payload");r.data=c}return r},i.tryParse=function(t){try{return JSON.parse(t,this.reviver)}catch(t){return!1}},n.isPayloadValid=function(t,n){switch(t){case Bt.CONNECT:return Mt(n);case Bt.DISCONNECT:return void 0===n;case Bt.CONNECT_ERROR:return"string"==typeof n||Mt(n);case Bt.EVENT:case Bt.BINARY_EVENT:return Array.isArray(n)&&("number"==typeof n[0]||"string"==typeof n[0]&&-1===St.indexOf(n[0]));case Bt.ACK:case Bt.BINARY_ACK:return Array.isArray(n)}},i.destroy=function(){this.reconstructor&&(this.reconstructor.finishedReconstruction(),this.reconstructor=null)},n}(I),Tt=function(){function t(t){this.packet=t,this.buffers=[],this.reconPack=t}var n=t.prototype;return n.takeBinaryData=function(t){if(this.buffers.push(t),this.buffers.length===this.reconPack.attachments){var n=Et(this.reconPack,this.buffers);return this.finishedReconstruction(),n}return null},n.finishedReconstruction=function(){this.reconPack=null,this.buffers=[]},t}();var Ut=Number.isInteger||function(t){return"number"==typeof t&&isFinite(t)&&Math.floor(t)===t};function Mt(t){return"[object Object]"===Object.prototype.toString.call(t)}var xt=Object.freeze({__proto__:null,protocol:5,get PacketType(){return Bt},Encoder:Nt,Decoder:Ct,isPacketValid:function(t){return"string"==typeof t.nsp&&(void 0===(n=t.id)||Ut(n))&&function(t,n){switch(t){case Bt.CONNECT:return void 0===n||Mt(n);case Bt.DISCONNECT:return void 0===n;case Bt.EVENT:return Array.isArray(n)&&("number"==typeof n[0]||"string"==typeof n[0]&&-1===St.indexOf(n[0]));case Bt.ACK:return Array.isArray(n);case Bt.CONNECT_ERROR:return"string"==typeof n||Mt(n);default:return!1}}(t.type,t.data);var n}});function It(t,n,i){return t.on(n,i),function(){t.off(n,i)}}var Rt=Object.freeze({connect:1,connect_error:1,disconnect:1,disconnecting:1,newListener:1,removeListener:1}),Lt=function(t){function n(n,i,r){var o;return(o=t.call(this)||this).connected=!1,o.recovered=!1,o.receiveBuffer=[],o.sendBuffer=[],o.it=[],o.rt=0,o.ids=0,o.acks={},o.flags={},o.io=n,o.nsp=i,r&&r.auth&&(o.auth=r.auth),o.l=e({},r),o.io.et&&o.open(),o}s(n,t);var o=n.prototype;return o.subEvents=function(){if(!this.subs){var t=this.io;this.subs=[It(t,"open",this.onopen.bind(this)),It(t,"packet",this.onpacket.bind(this)),It(t,"error",this.onerror.bind(this)),It(t,"close",this.onclose.bind(this))]}},o.connect=function(){return this.connected||(this.subEvents(),this.io.ot||this.io.open(),"open"===this.io.st&&this.onopen()),this},o.open=function(){return this.connect()},o.send=function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];return n.unshift("message"),this.emit.apply(this,n),this},o.emit=function(t){var n,i,r;if(Rt.hasOwnProperty(t))throw new Error('"'+t.toString()+'" is a reserved event name');for(var e=arguments.length,o=new Array(e>1?e-1:0),s=1;s<e;s++)o[s-1]=arguments[s];if(o.unshift(t),this.l.retries&&!this.flags.fromQueue&&!this.flags.volatile)return this.ut(o),this;var u={type:Bt.EVENT,data:o,options:{}};if(u.options.compress=!1!==this.flags.compress,"function"==typeof o[o.length-1]){var h=this.ids++,f=o.pop();this.ht(h,f),u.id=h}var c=null===(i=null===(n=this.io.engine)||void 0===n?void 0:n.transport)||void 0===i?void 0:i.writable,a=this.connected&&!(null===(r=this.io.engine)||void 0===r?void 0:r.W());return this.flags.volatile&&!c||(a?(this.notifyOutgoingListeners(u),this.packet(u)):this.sendBuffer.push(u)),this.flags={},this},o.ht=function(t,n){var i,r=this,e=null!==(i=this.flags.timeout)&&void 0!==i?i:this.l.ackTimeout;if(void 0!==e){var o=this.io.setTimeoutFn((function(){delete r.acks[t];for(var i=0;i<r.sendBuffer.length;i++)r.sendBuffer[i].id===t&&r.sendBuffer.splice(i,1);n.call(r,new Error("operation has timed out"))}),e),s=function(){r.io.clearTimeoutFn(o);for(var t=arguments.length,i=new Array(t),e=0;e<t;e++)i[e]=arguments[e];n.apply(r,i)};s.withError=!0,this.acks[t]=s}else this.acks[t]=n},o.emitWithAck=function(t){for(var n=this,i=arguments.length,r=new Array(i>1?i-1:0),e=1;e<i;e++)r[e-1]=arguments[e];return new Promise((function(i,e){var o=function(t,n){return t?e(t):i(n)};o.withError=!0,r.push(o),n.emit.apply(n,[t].concat(r))}))},o.ut=function(t){var n,i=this;"function"==typeof t[t.length-1]&&(n=t.pop());var r={id:this.rt++,tryCount:0,pending:!1,args:t,flags:e({fromQueue:!0},this.flags)};t.push((function(t){if(i.it[0],null!==t)r.tryCount>i.l.retries&&(i.it.shift(),n&&n(t));else if(i.it.shift(),n){for(var e=arguments.length,o=new Array(e>1?e-1:0),s=1;s<e;s++)o[s-1]=arguments[s];n.apply(void 0,[null].concat(o))}return r.pending=!1,i.ft()})),this.it.push(r),this.ft()},o.ft=function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(this.connected&&0!==this.it.length){var n=this.it[0];n.pending&&!t||(n.pending=!0,n.tryCount++,this.flags=n.flags,this.emit.apply(this,n.args))}},o.packet=function(t){t.nsp=this.nsp,this.io.ct(t)},o.onopen=function(){var t=this;"function"==typeof this.auth?this.auth((function(n){t.vt(n)})):this.vt(this.auth)},o.vt=function(t){this.packet({type:Bt.CONNECT,data:this.lt?e({pid:this.lt,offset:this.dt},t):t})},o.onerror=function(t){this.connected||this.emitReserved("connect_error",t)},o.onclose=function(t,n){this.connected=!1,delete this.id,this.emitReserved("disconnect",t,n),this.yt()},o.yt=function(){var t=this;Object.keys(this.acks).forEach((function(n){if(!t.sendBuffer.some((function(t){return String(t.id)===n}))){var i=t.acks[n];delete t.acks[n],i.withError&&i.call(t,new Error("socket has been disconnected"))}}))},o.onpacket=function(t){if(t.nsp===this.nsp)switch(t.type){case Bt.CONNECT:t.data&&t.data.sid?this.onconnect(t.data.sid,t.data.pid):this.emitReserved("connect_error",new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));break;case Bt.EVENT:case Bt.BINARY_EVENT:this.onevent(t);break;case Bt.ACK:case Bt.BINARY_ACK:this.onack(t);break;case Bt.DISCONNECT:this.ondisconnect();break;case Bt.CONNECT_ERROR:this.destroy();var n=new Error(t.data.message);n.data=t.data.data,this.emitReserved("connect_error",n)}},o.onevent=function(t){var n=t.data||[];null!=t.id&&n.push(this.ack(t.id)),this.connected?this.emitEvent(n):this.receiveBuffer.push(Object.freeze(n))},o.emitEvent=function(n){if(this.bt&&this.bt.length){var i,e=r(this.bt.slice());try{for(e.s();!(i=e.n()).done;){i.value.apply(this,n)}}catch(t){e.e(t)}finally{e.f()}}t.prototype.emit.apply(this,n),this.lt&&n.length&&"string"==typeof n[n.length-1]&&(this.dt=n[n.length-1])},o.ack=function(t){var n=this,i=!1;return function(){if(!i){i=!0;for(var r=arguments.length,e=new Array(r),o=0;o<r;o++)e[o]=arguments[o];n.packet({type:Bt.ACK,id:t,data:e})}}},o.onack=function(t){var n=this.acks[t.id];"function"==typeof n&&(delete this.acks[t.id],n.withError&&t.data.unshift(null),n.apply(this,t.data))},o.onconnect=function(t,n){this.id=t,this.recovered=n&&this.lt===n,this.lt=n,this.connected=!0,this.emitBuffered(),this.ft(!0),this.emitReserved("connect")},o.emitBuffered=function(){var t=this;this.receiveBuffer.forEach((function(n){return t.emitEvent(n)})),this.receiveBuffer=[],this.sendBuffer.forEach((function(n){t.notifyOutgoingListeners(n),t.packet(n)})),this.sendBuffer=[]},o.ondisconnect=function(){this.destroy(),this.onclose("io server disconnect")},o.destroy=function(){this.subs&&(this.subs.forEach((function(t){return t()})),this.subs=void 0),this.io.wt(this)},o.disconnect=function(){return this.connected&&this.packet({type:Bt.DISCONNECT}),this.destroy(),this.connected&&this.onclose("io client disconnect"),this},o.close=function(){return this.disconnect()},o.compress=function(t){return this.flags.compress=t,this},o.timeout=function(t){return this.flags.timeout=t,this},o.onAny=function(t){return this.bt=this.bt||[],this.bt.push(t),this},o.prependAny=function(t){return this.bt=this.bt||[],this.bt.unshift(t),this},o.offAny=function(t){if(!this.bt)return this;if(t){for(var n=this.bt,i=0;i<n.length;i++)if(t===n[i])return n.splice(i,1),this}else this.bt=[];return this},o.listenersAny=function(){return this.bt||[]},o.onAnyOutgoing=function(t){return this.gt=this.gt||[],this.gt.push(t),this},o.prependAnyOutgoing=function(t){return this.gt=this.gt||[],this.gt.unshift(t),this},o.offAnyOutgoing=function(t){if(!this.gt)return this;if(t){for(var n=this.gt,i=0;i<n.length;i++)if(t===n[i])return n.splice(i,1),this}else this.gt=[];return this},o.listenersAnyOutgoing=function(){return this.gt||[]},o.notifyOutgoingListeners=function(t){if(this.gt&&this.gt.length){var n,i=r(this.gt.slice());try{for(i.s();!(n=i.n()).done;){n.value.apply(this,t.data)}}catch(t){i.e(t)}finally{i.f()}}},i(n,[{key:"disconnected",get:function(){return!this.connected}},{key:"active",get:function(){return!!this.subs}},{key:"volatile",get:function(){return this.flags.volatile=!0,this}}])}(I);function _t(t){t=t||{},this.ms=t.min||100,this.max=t.max||1e4,this.factor=t.factor||2,this.jitter=t.jitter>0&&t.jitter<=1?t.jitter:0,this.attempts=0}_t.prototype.duration=function(){var t=this.ms*Math.pow(this.factor,this.attempts++);if(this.jitter){var n=Math.random(),i=Math.floor(n*this.jitter*t);t=1&Math.floor(10*n)?t+i:t-i}return 0|Math.min(t,this.max)},_t.prototype.reset=function(){this.attempts=0},_t.prototype.setMin=function(t){this.ms=t},_t.prototype.setMax=function(t){this.max=t},_t.prototype.setJitter=function(t){this.jitter=t};var Dt=function(t){function n(n,i){var r,e;(r=t.call(this)||this).nsps={},r.subs=[],n&&"object"===c(n)&&(i=n,n=void 0),(i=i||{}).path=i.path||"/socket.io",r.opts=i,$(r,i),r.reconnection(!1!==i.reconnection),r.reconnectionAttempts(i.reconnectionAttempts||1/0),r.reconnectionDelay(i.reconnectionDelay||1e3),r.reconnectionDelayMax(i.reconnectionDelayMax||5e3),r.randomizationFactor(null!==(e=i.randomizationFactor)&&void 0!==e?e:.5),r.backoff=new _t({min:r.reconnectionDelay(),max:r.reconnectionDelayMax(),jitter:r.randomizationFactor()}),r.timeout(null==i.timeout?2e4:i.timeout),r.st="closed",r.uri=n;var o=i.parser||xt;return r.encoder=new o.Encoder,r.decoder=new o.Decoder,r.et=!1!==i.autoConnect,r.et&&r.open(),r}s(n,t);var i=n.prototype;return i.reconnection=function(t){return arguments.length?(this.kt=!!t,t||(this.skipReconnect=!0),this):this.kt},i.reconnectionAttempts=function(t){return void 0===t?this.At:(this.At=t,this)},i.reconnectionDelay=function(t){var n;return void 0===t?this.jt:(this.jt=t,null===(n=this.backoff)||void 0===n||n.setMin(t),this)},i.randomizationFactor=function(t){var n;return void 0===t?this.Et:(this.Et=t,null===(n=this.backoff)||void 0===n||n.setJitter(t),this)},i.reconnectionDelayMax=function(t){var n;return void 0===t?this.Ot:(this.Ot=t,null===(n=this.backoff)||void 0===n||n.setMax(t),this)},i.timeout=function(t){return arguments.length?(this.Bt=t,this):this.Bt},i.maybeReconnectOnOpen=function(){!this.ot&&this.kt&&0===this.backoff.attempts&&this.reconnect()},i.open=function(t){var n=this;if(~this.st.indexOf("open"))return this;this.engine=new pt(this.uri,this.opts);var i=this.engine,r=this;this.st="opening",this.skipReconnect=!1;var e=It(i,"open",(function(){r.onopen(),t&&t()})),o=function(i){n.cleanup(),n.st="closed",n.emitReserved("error",i),t?t(i):n.maybeReconnectOnOpen()},s=It(i,"error",o);if(!1!==this.Bt){var u=this.Bt,h=this.setTimeoutFn((function(){e(),o(new Error("timeout")),i.close()}),u);this.opts.autoUnref&&h.unref(),this.subs.push((function(){n.clearTimeoutFn(h)}))}return this.subs.push(e),this.subs.push(s),this},i.connect=function(t){return this.open(t)},i.onopen=function(){this.cleanup(),this.st="open",this.emitReserved("open");var t=this.engine;this.subs.push(It(t,"ping",this.onping.bind(this)),It(t,"data",this.ondata.bind(this)),It(t,"error",this.onerror.bind(this)),It(t,"close",this.onclose.bind(this)),It(this.decoder,"decoded",this.ondecoded.bind(this)))},i.onping=function(){this.emitReserved("ping")},i.ondata=function(t){try{this.decoder.add(t)}catch(t){this.onclose("parse error",t)}},i.ondecoded=function(t){var n=this;R((function(){n.emitReserved("packet",t)}),this.setTimeoutFn)},i.onerror=function(t){this.emitReserved("error",t)},i.socket=function(t,n){var i=this.nsps[t];return i?this.et&&!i.active&&i.connect():(i=new Lt(this,t,n),this.nsps[t]=i),i},i.wt=function(t){for(var n=0,i=Object.keys(this.nsps);n<i.length;n++){var r=i[n];if(this.nsps[r].active)return}this.St()},i.ct=function(t){for(var n=this.encoder.encode(t),i=0;i<n.length;i++)this.engine.write(n[i],t.options)},i.cleanup=function(){this.subs.forEach((function(t){return t()})),this.subs.length=0,this.decoder.destroy()},i.St=function(){this.skipReconnect=!0,this.ot=!1,this.onclose("forced close")},i.disconnect=function(){return this.St()},i.onclose=function(t,n){var i;this.cleanup(),null===(i=this.engine)||void 0===i||i.close(),this.backoff.reset(),this.st="closed",this.emitReserved("close",t,n),this.kt&&!this.skipReconnect&&this.reconnect()},i.reconnect=function(){var t=this;if(this.ot||this.skipReconnect)return this;var n=this;if(this.backoff.attempts>=this.At)this.backoff.reset(),this.emitReserved("reconnect_failed"),this.ot=!1;else{var i=this.backoff.duration();this.ot=!0;var r=this.setTimeoutFn((function(){n.skipReconnect||(t.emitReserved("reconnect_attempt",n.backoff.attempts),n.skipReconnect||n.open((function(i){i?(n.ot=!1,n.reconnect(),t.emitReserved("reconnect_error",i)):n.onreconnect()})))}),i);this.opts.autoUnref&&r.unref(),this.subs.push((function(){t.clearTimeoutFn(r)}))}},i.onreconnect=function(){var t=this.backoff.attempts;this.ot=!1,this.backoff.reset(),this.emitReserved("reconnect",t)},n}(I),Pt={};function $t(t,n){"object"===c(t)&&(n=t,t=void 0);var i,r=function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",i=arguments.length>2?arguments[2]:void 0,r=t;i=i||"undefined"!=typeof location&&location,null==t&&(t=i.protocol+"//"+i.host),"string"==typeof t&&("/"===t.charAt(0)&&(t="/"===t.charAt(1)?i.protocol+t:i.host+t),/^(https?|wss?):\/\//.test(t)||(t=void 0!==i?i.protocol+"//"+t:"https://"+t),r=ft(t)),r.port||(/^(http|ws)$/.test(r.protocol)?r.port="80":/^(http|ws)s$/.test(r.protocol)&&(r.port="443")),r.path=r.path||"/";var e=-1!==r.host.indexOf(":")?"["+r.host+"]":r.host;return r.id=r.protocol+"://"+e+":"+r.port+n,r.href=r.protocol+"://"+e+(i&&i.port===r.port?"":":"+r.port),r}(t,(n=n||{}).path||"/socket.io"),e=r.source,o=r.id,s=r.path,u=Pt[o]&&s in Pt[o].nsps;return n.forceNew||n["force new connection"]||!1===n.multiplex||u?i=new Dt(e,n):(Pt[o]||(Pt[o]=new Dt(e,n)),i=Pt[o]),r.query&&!n.query&&(n.query=r.queryKey),i.socket(r.path,n)}return e($t,{Manager:Dt,Socket:Lt,io:$t,connect:$t}),$t}));


        })();
        const lib = globalThis.io;
        if (had) globalThis.io = prev; else delete globalThis.io;
        return lib;
    })();

    // ---- userscript/common.js ----
/**
 * 固定版ユーザースクリプトの共通部品（hub.js と shim.js の両方から使う）。
 *
 * ■ 安全の決まり（このスクリプトの存在理由）
 * 同期サーバー（Fly.io）を乗っ取られても、友達の画面に偽の画面や悪いプログラムを出せないようにする。
 * そのため、サーバーから届くものは**すべて「ただのデータ」として扱う**:
 *
 *   - 文字（名前・チャット）は textContent でしか画面に入れない（HTML として解釈させない）
 *   - 作品 ID はサービスごとの形を検査し、合わないものは捨てる
 *   - 開くアドレスは、このファイルに書いた Netflix / Amazon / YouTube の決まった形でしか作らない
 *     （サーバーが送ってくる url は使わない）
 *   - 時刻は数として検査する
 *
 * サーバーを乗っ取られても出来るのは、再生を勝手に動かす・変なチャットを流す、の嫌がらせまで。
 * スクリプトの中身は友達の iPhone に入っている固定のファイルで、サーバーからは変えられない
 * （@require / @updateURL を使わないのはこのため）。
 */
const WP_US = (() => {
    const SERVER = __WP_SERVER__;
    const ROOM_RE = /^[A-Z0-9]{4,12}$/;

    const ID_RE = {
        netflix: /^\d{4,12}$/,
        // 拡張機能（adapters/prime.js）が拾う形: ASIN・長い英数字の ID・GTI（英数字と . だけ。.. は不可）
        prime: /^(?!.*\.\.)(?:[A-Za-z0-9.]{10,80}|amzn1\.dv\.gti\.[0-9a-f-]{36})$/,
        youtube: /^[A-Za-z0-9_-]{11}$/
    };
    const GTI_RE = /^amzn1\.dv\.gti\.[0-9a-f-]{36}$/;
    const MAX_SEC = 24 * 3600;
    // Android の準備で開く、決まったアドレス
    const FIREFOX_PLAY_URL = 'https://play.google.com/store/apps/details?id=org.mozilla.firefox';
    const VIOLENTMONKEY_URL = 'https://addons.mozilla.org/ja/android/addon/violentmonkey/';

    /** サーバーから届いた作品情報を検査して、使える形だけ返す。駄目なら null */
    function cleanVideo(v) {
        if (!v || typeof v !== 'object') return null;
        const service = v.service;
        if (!Object.prototype.hasOwnProperty.call(ID_RE, service)) return null;
        const contentId = typeof v.contentId === 'string' && ID_RE[service].test(v.contentId) ? v.contentId : null;
        if (!contentId) return null;
        const appId = typeof v.appId === 'string' && GTI_RE.test(v.appId) ? v.appId : null;
        return { service, contentId, appId };
    }

    /** Prime の広告の入る位置 { fullMs, breaks: [ms] }（サーバーから届いた数）を検査する。駄目なら null */
    function cleanPlan(p) {
        if (!p || typeof p !== 'object') return null;
        const fullMs = p.fullMs;
        if (typeof fullMs !== 'number' || !Number.isFinite(fullMs) || fullMs < 300000 || fullMs > MAX_SEC * 1000) return null;
        if (!Array.isArray(p.breaks) || p.breaks.length > 40) return null;
        const breaks = p.breaks.filter(ms => typeof ms === 'number' && Number.isFinite(ms) && ms >= 0 && ms <= fullMs);
        return { fullMs, breaks };
    }

    /** 秒として使える数か。駄目なら null */
    function cleanSec(n) {
        return typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= MAX_SEC ? n : null;
    }

    function cleanRoom(r) {
        const s = String(r || '').toUpperCase();
        return ROOM_RE.test(s) ? s : null;
    }

    function hhmmss(sec) {
        if (!Number.isFinite(sec) || sec < 0) return '--:--';
        const s = Math.floor(sec % 60);
        const m = Math.floor(sec / 60) % 60;
        const h = Math.floor(sec / 3600);
        const pad = (n) => String(n).padStart(2, '0');
        return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
    }

    const enc = encodeURIComponent;

    // スクリプトの版（0.16.0 の形）と公開日（2026-09-14 の形）
    const VERSION_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
    /*
     * 招待ページの版（https://<8桁>.watchparty-hub.pages.dev/ の 8 桁）。PC のゲストがチャットを別の窓で開くのに使う（2026-09-14）。
     * アドレスの指定は誰でも作れるので、開く先はこの形（自分たちの Cloudflare Pages の版）に限る。
     * ドメインは組み立てのときに入る（本番は watchparty-hub、テストは watchparty-hub-stg。tools/env.js）
     */
    const HUB_ID_RE = /^[0-9a-f]{8}$/;
    const HUB_HOST = __WP_HUB_HOST__;
    const hubUrl = (id) => (HUB_ID_RE.test(id || '') ? `https://${id}.${HUB_HOST}/` : null);

    /** 版 a が版 b より古いか（形が違えば false） */
    function olderVersion(a, b) {
        if (!VERSION_RE.test(a) || !VERSION_RE.test(b)) return false;
        const x = a.split('.').map(Number), y = b.split('.').map(Number);
        for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i];
        return false;
    }

    /** 2026-09-14 → 9月14日（形が違えば空） */
    function dateLabel(d) {
        const m = DATE_RE.exec(String(d || ''));
        return m ? `${Number(m[2])}月${Number(m[3])}日` : '';
    }

    /**
     * 最新のスクリプトの版と公開日を、Amazon のページで動くスクリプトに伝える指定（&wpv=&wpd=）。
     * スクリプトは自分の版と比べて、古ければ「スクリプトが更新されました」と出す（2026-09-14）
     */
    function scriptQuery(s) {
        const ver = s && VERSION_RE.test(s.version) && DATE_RE.test(s.date) ? `&wpv=${s.version}&wpd=${s.date}` : '';
        return ver + (s && HUB_ID_RE.test(s.hub || '') ? `&wph=${s.hub}` : '');
    }

    /*
     * 開くアドレスは、ここに書いた形でしか作らない。
     * v は cleanVideo() を通したもの、t は整数の秒。
     */
    const urls = {
        /** アプリがその時刻から開く形（Netflix / YouTube は実機で確認済み） */
        app(v, t) {
            const sec = Math.max(0, Math.min(MAX_SEC, Math.round(t) || 0));
            if (v.service === 'netflix') return `https://www.netflix.com/watch/${enc(v.contentId)}?t=${sec}`;
            if (v.service === 'youtube') return `https://www.youtube.com/watch?v=${enc(v.contentId)}&t=${sec}s`;
            if (v.service === 'prime') {
                // 日本版アプリは app.primevideo.com でないと開かない。時刻は無視される（実機で確認）
                const gti = v.appId || (GTI_RE.test(v.contentId) ? v.contentId : null);   // ドラマの話は contentId が GTI
                return gti
                    ? `https://app.primevideo.com/detail?gti=${enc(gti)}&autoplay=1&t=${sec}`
                    : `https://app.primevideo.com/detail?asin=${enc(v.contentId)}&autoplay=1&t=${sec}`;
            }
            return null;
        },

        /**
         * Prime をブラウザで開く形。wp= / wpn= は Amazon のページで動くこのスクリプトが、
         * 入るルームとなまえを知るため（Amazon は知らない指定を無視する）。
         * 時刻の指定は Web プレイヤーも無視するので付けない。合わせるのはスクリプトの仕事。
         */
        primeWeb(v, room, name, android, script) {
            if (v.service !== 'prime') return null;
            const q = `wp=${enc(room)}&wpn=${enc(name)}${scriptQuery(script)}`;
            /*
             * **`#` の後ろにも同じ印を付ける**（2026-09-25。NZ の人だけ動かない報告から）。
             * ログインや地域の選びで別のアドレスへ回されると `?` 以降は消えるが、`#` の後ろは残る。
             * 消えるとスクリプトは「招待から来たタブではない」と判断して最初の行で終了してしまう。
             * Netflix では 2026-09-14 に同じ対策を入れてある（netflixWeb）。読む側（shim.js の readRoom）は
             * もともと `?` が無ければ `#` を見る作りなので、付けるだけでよい。
             */
            const path = `www.amazon.co.jp/gp/video/detail/${enc(v.contentId)}/?autoplay=1&${q}#${q}`;
            /*
             * Android は **Firefox で開く**（2026-09-14）。Chrome は拡張機能が使えず、自動で合わせるスクリプトが動かない。
             * Firefox なら Violentmonkey で同じスクリプトが動く。intent:// でアプリを指定し、
             * Firefox が入っていなければ Google Play の Firefox のページへ回す。
             */
            return android ? urls.firefox(`https://${path}`) : `https://${path}`;
        },

        /**
         * Prime Video だけ契約の人（primevideo.com のアカウント。海外など）向けに、primevideo.com で開く形（2026-09-14）。
         * amazon.co.jp にはログインできないので、こちらで開く。作品 ID は国をまたいで同じ作品を指す GTI があればそれ、
         * 無ければ ASIN（primevideo.com/detail/<ASIN>/ でも同じ作品が開くことを確認済み）。
         */
        primeVideoWeb(v, room, name, android, script) {
            if (v.service !== 'prime') return null;
            // `#` にも印を付ける理由は primeWeb と同じ。**海外の人はこちらを使うので、こちらこそ効く**
            const q = `wp=${enc(room)}&wpn=${enc(name)}${scriptQuery(script)}`;
            const path = `www.primevideo.com/detail/${enc(v.appId || v.contentId)}/?autoplay=1&${q}#${q}`;
            return android ? urls.firefox(`https://${path}`) : `https://${path}`;
        },

        /**
         * （試験・2026-09-14）Netflix をブラウザで開く形。Prime と同じく、そのページの中で Prime/Netflix 用スクリプトが
         * チャットを出してホストに自動で合わせる。時刻は付けない（合わせるのはスクリプトの仕事）。
         * ログインしていないと Netflix は別のページへ回し、そのとき ?wp= は消える。# の後ろは回されても残るので両方に付ける。
         */
        netflixWeb(v, room, name, android, script) {
            if (v.service !== 'netflix') return null;
            // PC のブラウザで見る形（2026-09-14）。iPhone の Safari は Netflix が再生できないので、PC だけで使う
            const q = `wp=${enc(room)}&wpn=${enc(name)}${scriptQuery(script)}`;
            const path = `www.netflix.com/watch/${enc(v.contentId)}?${q}#${q}`;
            return android ? urls.firefox(`https://${path}`) : `https://${path}`;
        },

        /**
         * Android で、決まったアドレスを Firefox で開く形（intent://）。
         * href は https:// で始まる、このファイルで組み立てた決まったアドレスだけを渡すこと。
         */
        firefox(href) {
            if (!/^https:\/\//.test(href)) return null;
            return `intent://${href.slice('https://'.length)}#Intent;scheme=https;package=org.mozilla.firefox;` +
                `S.browser_fallback_url=${enc(FIREFOX_PLAY_URL)};end`;
        },

        /**
         * iPhone の Netflix で使う、アプリ専用の形（時刻付き）。
         * https://www.netflix.com/watch/ID?t=秒 は、Netflix のタスクが残っているとアプリが時刻を使わず、
         * アプリ内の今の位置のまま出した。この形はタスクを切らずにホストの場面へ移った（2026-09-14 実機で確認）。
         */
        netflixScheme(v, t) {
            if (v.service !== 'netflix') return null;
            const sec = Math.max(0, Math.min(MAX_SEC, Math.round(t) || 0));
            return `nflx://www.netflix.com/watch/${enc(v.contentId)}?t=${sec}`;
        },

        /** 時刻を付けずに開く形 */
        plain(v) {
            if (v.service === 'netflix') return `https://www.netflix.com/watch/${enc(v.contentId)}`;
            if (v.service === 'youtube') return `https://www.youtube.com/watch?v=${enc(v.contentId)}`;
            if (v.service === 'prime') {
                return GTI_RE.test(v.contentId) ? `https://app.primevideo.com/detail?gti=${enc(v.contentId)}`
                    : `https://app.primevideo.com/detail?asin=${enc(v.contentId)}`;
            }
            return null;
        }
    };

    function safeColor(c) {
        return typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#cfd3ff';
    }

    /** 絵文字だけの発言は大きく出す（拡張機能側と同じ扱い） */
    function isReaction(s) {
        return typeof s === 'string' && s.length <= 8 &&
            /^\p{Extended_Pictographic}[\p{Extended_Pictographic}‍️]*$/u.test(s);
    }

    /** 同じ発言か見分けるための鍵（入る前の発言を受け取り直したとき、二重に出さないため）。システムの知らせは null */
    function messageKey(m) {
        return m && m.type === 'user' ? [m.timestamp, m.username, m.content].map(String).join('') : null;
    }

    /** チャットの1件を、文字だけで組み立てる */
    function messageRow(m, me) {
        const row = document.createElement('div');
        const content = typeof m.content === 'string' ? m.content.slice(0, 500) : '';
        if (m.type === 'system') {
            row.className = 'msg system';
            row.textContent = content;
            return row;
        }
        row.className = 'msg' + (m.senderId === me ? ' me' : '') + (isReaction(content) ? ' big' : '');
        const who = document.createElement('span');
        who.className = 'name';
        // ホストの発言（サーバーの判定）だけ 👑。名前に入った王冠の記号は消す（チャットでホストになりすませないように。2026-09-14）
        const plain = (typeof m.username === 'string' ? m.username : '').replace(/[👑♔♕♚♛🪅]/gu, '').slice(0, 20) || '？';
        who.textContent = m.isHost === true ? '👑 ' + plain : plain;
        who.style.color = safeColor(m.color);
        const body = document.createElement('span');
        body.className = 'body';
        body.textContent = content;
        row.append(who, body);
        return row;
    }

    /** 入退出などのお知らせは、チャットの流れに混ぜず、この1行を上書きして出す（2026-09-14 ユーザー要望）。文字は textContent でしか入れない */
    function showNotice(el, content) {
        if (!el) return;
        el.textContent = typeof content === 'string' ? content.slice(0, 200) : '';
        el.title = el.textContent;
        el.hidden = !el.textContent;
        el.classList.remove('fresh');
        void el.offsetWidth;   // 同じ知らせが続いても、もう一度光らせる
        el.classList.add('fresh');
    }

    /** サーバーへつなぐ（socket.io はこのスクリプトの中に入れてある） */
    function connect() {
        return __WP_IO__(SERVER, { transports: ['websocket', 'polling'], reconnection: true });
    }

    return { SERVER, cleanVideo, cleanPlan, cleanSec, cleanRoom, hhmmss, urls, olderVersion, dateLabel, VERSION_RE, DATE_RE, HUB_ID_RE, hubUrl, safeColor, isReaction, messageRow, messageKey, showNotice, connect, FIREFOX_PLAY_URL, VIOLENTMONKEY_URL };
})();


    // amazon.co.jp と、Prime Video だけ契約の人の primevideo.com
    // Netflix は試験（2026-09-14）。@name は変えないこと（Userscripts が別のスクリプトとして二重に入れてしまう）。
    // テスト環境（WP_ENV=stg）だけは**わざと別の @name** にしてある。本番の版と並べて入れておけるようにするため
    if (!['www.amazon.co.jp', 'www.primevideo.com', 'www.netflix.com'].includes(location.hostname)) return;

    // ---- userscript/shim.js ----
/**
 * スマホのブラウザ（iPhone の Safari ＋ Userscripts）で Prime をホストに自動で合わせる、つなぎの部分。
 * 見ながら打てるように、チャットもこのページに重ねて出す。
 *
 * 同期そのものは PC の拡張機能と**同じファイル**（adapters/prime.js と content/bridge.js）がやる。
 * PC では bridge.js の相手を ui.js と background が務めているので、ここがその代わりをする:
 *
 *   サーバー（socket.io） ── このファイル ── window.postMessage ── bridge.js ── prime.js ── <video>
 *
 * どのルームに入るかは、友達の画面（hub.js）の「🌐 ブラウザで見る」が付ける ?wp=ルーム&wpn=なまえ で知る。
 * Prime は再生を始めるとアドレスを書き換えるので、最初に読んだ値はタブの間 sessionStorage に覚えておく。
 * どちらも無ければ何もしない（ふだんの Amazon の閲覧には一切手を出さない）。
 *
 * サーバーから届くものは common.js の決まりどおり「ただのデータ」として扱う
 * （数と種類を検査してから bridge.js へ渡す。文字は textContent でしか出さない）。
 */
const WP_SHIM = (() => {
    const SRC_BRIDGE = 'wp-bridge';   // bridge.js と同じ値
    const SRC_UI = 'wp-ui';
    const KEY = 'wp:userscript';
    const PLAY_BLOCKED_MS = 3000;
    const IS_ANDROID = /Android/i.test(navigator.userAgent);
    // PC（Windows / Mac）。iPad は Mac を名乗るので、指で触れる画面かで除く（2026-09-14 PC のゲスト用）
    const IS_DESKTOP = !IS_ANDROID && !/iPhone|iPad|iPod/i.test(navigator.userAgent) &&
        !(/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    // 作品ページのアドレス。amazon.co.jp の /gp/video/detail/ID と、primevideo.com の /detail/ID（GTI は - を含む）
    const AMAZON_DETAIL = /\/(?:gp\/video\/)?detail\/([A-Za-z0-9.-]{10,80})(?=[/?#]|$)/;
    const SYNC_TYPES = new Set(['play', 'pause', 'seek', 'tick']);

    // このページのサービス。Netflix（試験・2026-09-14）と Prime（amazon.co.jp / primevideo.com）
    const PAGE_SERVICE = location.hostname === 'www.netflix.com' ? 'netflix' : 'prime';
    const NETFLIX_WATCH = /\/watch\/(\d{4,12})(?=[/?#]|$)/;

    /** このタブが見るルーム。無ければ null（何もしない） */
    function readRoom() {
        // ?wp= が無ければ # の後ろも見る（Netflix はログイン画面などへ回すと ?wp= を消すが、# の後ろは残る）
        let q = new URLSearchParams(location.search);
        if (!q.get('wp') && location.hash.length > 1) q = new URLSearchParams(location.hash.slice(1));
        const room = WP_US.cleanRoom(q.get('wp'));
        if (room) {
            const id = (PAGE_SERVICE === 'netflix' ? NETFLIX_WATCH : AMAZON_DETAIL).exec(location.pathname);
            const v = {
                room,
                name: (q.get('wpn') || '').slice(0, 20) || 'スマホ',
                contentId: id ? id[1] : null,
                // 友達の画面に入っている最新のスクリプトの版と公開日（古ければ「更新されました」を出す）
                latest: WP_US.VERSION_RE.test(q.get('wpv') || '') ? q.get('wpv') : null,
                latestDate: WP_US.DATE_RE.test(q.get('wpd') || '') ? q.get('wpd') : null,
                hub: WP_US.HUB_ID_RE.test(q.get('wph') || '') ? q.get('wph') : null
            };
            try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch { /* 使えない設定 */ }
            return v;
        }
        try {
            const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
            if (saved && WP_US.cleanRoom(saved.room)) {
                return {
                    room: WP_US.cleanRoom(saved.room),
                    name: String(saved.name || 'スマホ').slice(0, 20),
                    contentId: typeof saved.contentId === 'string' ? saved.contentId : null,
                    latest: WP_US.VERSION_RE.test(saved.latest || '') ? saved.latest : null,
                    latestDate: WP_US.DATE_RE.test(saved.latestDate || '') ? saved.latestDate : null,
                    hub: WP_US.HUB_ID_RE.test(saved.hub || '') ? saved.hub : null
                };
            }
        } catch { /* 壊れていたら無視 */ }
        return null;
    }

    function start(target) {
        const U = WP_US;
        const toBridge = (type, payload) =>
            window.postMessage({ source: SRC_UI, type, payload }, location.origin);

        let hostPlaying = false;
        let selfAd = false;
        let hostAd = false;
        let connected = false;
        let me = null;
        /** ルームにホストがいるか（2026-09-14）。ホストの接続が切れたら、合わせるのをやめて今のまま再生を続ける。戻れば元どおり */
        let hasHost = true;
        /** ホストが別の作品に変えたときの、その作品（cleanVideo 済み）。同じ作品なら null */
        let otherVideo = null;
        /** ホストの作品が変わって、まだ送られていない（2026-09-14）。送られるまで合わせない */
        let hostHold = false;
        /** 動画（プレイヤー）を掴めたか。掴めるまでは「自動で合わせています」と出さない（Netflix のエラー画面でも出ていた） */
        let playerReady = false;
        const openedAt = Date.now();
        // 記録用: 広告の入る位置の換算のまとめ（bridge.js の STATUS）と、本編の時間（PLAYER_EVENT）
        let planInfo = null;
        let playDiag = null;
        /*
         * ずれの見張り（2026-09-14 ユーザー要望: 実際に使うとき、ずれや止まったままに気づけない。ゲストが困って離脱する）。
         *   hostRef … ホストの本編の位置と、それを受け取った時刻（再生中なら時間の分だけ進めて比べる）
         *   mine    … bridge.js が5秒ごとに知らせる、自分の本編の位置と止まっているか
         * ずれが大きい・止まったままが続いたら、真ん中に「立て直す」を大きく出す。ホストの参加者一覧にも出る（sync-report）
         */
        let hostRef = null;
        /** ホストの操作のお知らせ（「ホストがスキップしました」など）。数秒だけ状態の表示に出す（2026-09-15 ユーザー要望） */
        let hostEvent = null;
        const HOST_EVENT_MS = 6000;
        function noteHostEvent(text) {
            hostEvent = { text, until: Date.now() + HOST_EVENT_MS };
            U.showNotice(q('.notice'), text);
            setTimeout(render, HOST_EVENT_MS + 50);
        }
        let hostVideo = null;       // ホストのいまの作品（立て直すときに開き直す）
        let people = 0;             // いま部屋にいる人数（待機画面に出す）
        let mine = null;
        let nfDiag = null;
        let troubleSince = 0;
        let trouble = null;         // 'drift' | 'stalled' | null
        let fixDismissedAt = 0;
        let lastSyncReportAt = 0;
        /*
         * 立て直しを出すまでの時間。立て直しを押して開き直した直後（2分以内）なら短くする
         * （2026-09-15 PC の Chrome: 何回か押すと直った。2回目以降を早く出す）
         */
        const FIX_KEY = 'wp:lastFix';
        const recentFix = (() => { try { return Date.now() - Number(sessionStorage.getItem(FIX_KEY) || 0) < 120000; } catch { return false; } })();
        const TROUBLE_SHOW_MS = recentFix ? 10000 : 20000;
        const DRIFT_SHOW_SEC = 8;
        let contentT = null;
        let contentTAt = 0;
        /** 秒を「1分12秒」の形にする（広告で遅れているぶんの表示に使う） */
        const fmtLag = (s) => {
            const n = Math.max(0, Math.round(s));
            return n >= 60 ? `${Math.floor(n / 60)}分${n % 60}秒` : `${n}秒`;
        };

        /** ホストの作品（cleanVideo 済み）がこのページの作品と同じか */
        function sameTitle(v) {
            if (v.service !== PAGE_SERVICE) return false;
            if (!target.contentId) return true;   // このページの作品が分からないときは止めない
            // primevideo.com では GTI（Amazon 内部の作品 ID）で開くので、ホストの GTI とも比べる
            return v.contentId === target.contentId || (Boolean(v.appId) && v.appId === target.contentId);
        }

        // --- サーバー ---------------------------------------------------------
        const socket = U.connect();

        socket.on('connect', () => {
            connected = true;
            me = socket.id;
            // player … 友達の画面とは別の、再生タブとしての接続。参加者一覧には出ない
            // scriptVersion … このスクリプトの版。同じなまえの友達の画面が、古ければ「更新されました」を出す
            socket.emit('join-room', { roomId: target.room, username: target.name, viewer: true, player: true,
                scriptVersion: typeof __WP_VERSION__ === 'string' ? __WP_VERSION__ : '' });
            toBridge('ROLE', { isHost: false });
            render();
        });
        socket.on('disconnect', () => { connected = false; render(); });
        socket.on('update-participants', (list) => {
            if (!Array.isArray(list)) return;
            people = list.length;
            const now = list.some(u => u && u.isHost === true);
            if (!now) { hostPlaying = false; hostAd = false; }
            // ホストが戻ってきたら、ホストの今の位置を取り直す
            if (now && !hasHost && connected) socket.emit('request-sync');
            hasHost = now;
            render();
        });

        /*
         * ホストが読んだ Prime の広告の入る位置（数だけ）を、同じ作品のときだけ bridge.js へ渡す（2026-09-14）。
         * これで、まだ流れていない広告のぶんも換算してホストに合わせられる（adapters/prime.js の setAdPlan）
         */
        function sendPlan(m) {
            if (PAGE_SERVICE !== 'prime' || !m.contentId) return;
            const plan = U.cleanPlan(m.plan);
            const v = U.cleanVideo(m.contentId && m.service ? m : { service: 'prime', contentId: m.contentId, appId: m.appId });
            if (plan && v && sameTitle(v)) toBridge('PLAN', plan);
        }

        /** ホストの作品がこのページと違うか確かめる。違えば合わせるのを止めて案内を出す */
        function checkTitle(raw) {
            if (!raw || typeof raw !== 'object' || !raw.contentId) return;
            const v = U.cleanVideo(raw);
            // 形の読めない作品に変わったときも、この作品を勝手に動かさない（開く案内は出さない）
            otherVideo = !v ? { service: 'unknown' } : sameTitle(v) ? null : v;
            render();
        }

        /*
         * Android の Firefox では、画面に一度も触っていない間はスクリプトから再生も位置合わせもしない（2026-09-14 実機）。
         * Firefox は人が触る前に音の出る動画を始めると一時停止させる。そこへスクリプトが再生し直しを繰り返すと、
         * Amazon のプレイヤーが「ビデオを視聴できません」で止まった（スクリプトを切るとエラーにはならず、少し動いて止まるだけ）。
         * 映像の真ん中の「▶ タップして再生」などで一度触ってもらってから、ホストの今の位置を取り直して合わせる
         */
        let touched = false;
        function waitingGesture() {
            if (!IS_ANDROID || touched) return false;
            const ua = navigator.userActivation;
            if (ua && ua.hasBeenActive) { touched = true; return false; }
            return true;
        }
        for (const type of ['pointerdown', 'touchend', 'click', 'keydown']) {
            window.addEventListener(type, () => {
                if (!IS_ANDROID || touched) return;
                touched = true;
                // 触った直後にホストの今を取り直す（再生の許可が出てから合わせる）
                setTimeout(() => { if (connected) socket.emit('request-sync'); render(); }, 300);
            }, true);
        }

        // ホストの操作と定期通知。検査してから bridge.js へ渡す（PC の background と同じ形）
        socket.on('sync-video', (p) => {
            if (!p || typeof p !== 'object' || !SYNC_TYPES.has(p.type)) return;
            const sec = U.cleanSec(p.currentTime);
            if (sec === null) return;
            const wasPlaying = hostPlaying;
            if (p.type === 'play') hostPlaying = true;
            else if (p.type === 'pause') hostPlaying = false;
            else if (p.type === 'tick') { hostPlaying = !p.paused && !p.ad; hostAd = Boolean(p.ad); }
            // ホストの操作を知らせる。移動は、直前に分かっていたホストの位置からの差で「スキップ」「巻き戻し」を分ける
            if (hostRef && !p.ad) {
                const expected = hostRef.t + (wasPlaying ? (Date.now() - hostRef.at) / 1000 : 0);
                const jump = sec - expected;
                if (p.type === 'seek' || (p.type === 'tick' && Math.abs(jump) > 8)) {
                    if (jump > 3) noteHostEvent('⏩ ホストがスキップしました');
                    else if (jump < -3) noteHostEvent('⏪ ホストが巻き戻しました');
                }
            }
            // 入った直後（ホストの位置をまだ知らない）の知らせでは出さない（入っただけで「ホストが再生しました」と出ていた）
            if (hostRef && wasPlaying && !hostPlaying && !hostAd && p.type !== 'seek') noteHostEvent('⏸ ホストが一時停止しました');
            else if (hostRef && !wasPlaying && hostPlaying && p.type === 'play') noteHostEvent('▶ ホストが再生しました');
            hostRef = { t: sec, at: Number.isFinite(p.timestamp) && Math.abs(p.timestamp - Date.now()) < 60000 ? p.timestamp : Date.now() };
            if (!otherVideo && !hostHold && !waitingGesture()) {
                toBridge('APPLY', {
                    type: p.type,
                    currentTime: sec,
                    timestamp: Number.isFinite(p.timestamp) ? p.timestamp : Date.now(),
                    paused: Boolean(p.paused),
                    ad: Boolean(p.ad)
                });
            }
            render();
        });

        // 入った直後・広告明けに取りに行った「ホストの今」
        socket.on('update-video-state', (s) => {
            if (!s || typeof s !== 'object') return;
            const sec = U.cleanSec(s.currentTime);
            if (sec === null) return;
            hostHold = s.hold === true;
            checkTitle(s);
            sendPlan(s);
            hostPlaying = Boolean(s.isPlaying);
            hostRef = { t: sec, at: Number.isFinite(s.lastUpdate) && Math.abs(s.lastUpdate - Date.now()) < 10 * 60000 ? s.lastUpdate : Date.now() };
            if (s.contentId) hostVideo = U.cleanVideo(s);
            if (!otherVideo && !hostHold && !waitingGesture()) {
                toBridge('APPLY', {
                    type: s.isPlaying ? 'play' : 'pause',
                    currentTime: sec,
                    timestamp: Number.isFinite(s.lastUpdate) ? s.lastUpdate : Date.now()
                });
            }
            render();
        });

        socket.on('change-video', (v) => {
            hostHold = false;
            if (v && typeof v === 'object') hostVideo = U.cleanVideo(v) || hostVideo;
            checkTitle(v);
            // 同じ作品が送り直された（Prime の次の話で、アドレスが変わらないとき）→ ホストの今の位置を取り直す
            if (!otherVideo && connected) socket.emit('request-sync');
        });
        socket.on('host-hold', () => { hostHold = true; render(); });
        // ホストの GTI はあとから届く。このページが GTI で開かれていて一致したら、同じ作品として合わせ直す
        socket.on('video-meta', (m) => {
            if (!m || typeof m !== 'object') return;
            sendPlan(m);
            if (!otherVideo || otherVideo.service !== 'prime') return;
            if (m.contentId === otherVideo.contentId && typeof m.appId === 'string' && m.appId === target.contentId) {
                otherVideo = null;
                socket.emit('request-sync');
                render();
            }
        });
        socket.on('receive-message', (m) => { if (m && typeof m === 'object') addMessage(m); });
        // 入る前の発言（2026-09-14 ユーザー要望）。同じ発言は二重に出さない
        socket.on('chat-history', (list) => {
            if (!Array.isArray(list)) return;
            for (const m of list.slice(-50)) if (m && typeof m === 'object' && m.type === 'user') addMessage(m, true);
        });

        // --- bridge.js から ---------------------------------------------------
        window.addEventListener('message', (ev) => {
            if (ev.source !== window) return;
            const d = ev.data;
            if (!d || d.source !== SRC_BRIDGE) return;
            if (d.type === 'READY') {
                playerReady = true;
                if (connected) socket.emit('request-sync');
                render();
            } else if (d.type === 'STATUS') {
                selfAd = Boolean(d.payload && d.payload.selfAd);
                hostAd = Boolean(d.payload && d.payload.hostAd);
                planInfo = d.payload && d.payload.plan && typeof d.payload.plan === 'object' ? d.payload.plan : null;
                playDiag = d.payload && d.payload.diag && typeof d.payload.diag === 'object' ? d.payload.diag : null;
                nfDiag = d.payload && d.payload.nf && typeof d.payload.nf === 'object' ? d.payload.nf : null;
                if (d.payload && typeof d.payload.t === 'number') mine = { t: d.payload.t, paused: d.payload.paused === true, at: Date.now() };
                watchSync();
                render();
            } else if (d.type === 'PLAYER_EVENT' && d.payload && typeof d.payload.currentTime === 'number') {
                contentT = d.payload.currentTime;   // 記録用（広告を除いた本編の時間）。サーバーへは送らない
                contentTAt = Date.now();            // 古い値で「遅れている」と誤って出さないため、受け取った時刻も持つ
            }
            // INFO / PLAYER_EVENT / DIAG / META は送らない（見ている側なので）
        });

        // --- 画面 -------------------------------------------------------------
        // 骨組みは決まった文だけ。サーバーから来た文字は textContent で入れる
        const host = document.createElement('div');
        host.id = 'wp-userscript';
        host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
        const root = host.attachShadow({ mode: 'open' });
        root.innerHTML = `
            <style>
                :host { all: initial; }
                * { box-sizing: border-box; font-family: -apple-system, system-ui, "Hiragino Sans", sans-serif; }
                /*
                 * 状態の表示（「ホストに自動で合わせています」）は画面の左下に置き、チャット欄の後ろに隠れる（z-index が低い）。
                 * 上にあると映像にかぶった（2026-09-14 ユーザー要望）。チャット欄を開いている間は見出しに同じ内容を出す。
                 * 「タップして再開」「ホストの作品を開く」は押す必要があるので、チャット欄より手前に下から積む。
                 */
                .status { position: fixed; left: 8px; right: 84px; bottom: calc(14px + env(safe-area-inset-bottom, 0px));
                          pointer-events: none; display: flex; z-index: 1; }
                .top { position: fixed; left: 8px; right: 8px; bottom: calc(72px + env(safe-area-inset-bottom, 0px)); pointer-events: none;
                       display: flex; flex-direction: column-reverse; align-items: flex-start; gap: 8px; z-index: 5; }
                .hstate { color: #3ddc84; font-weight: 600; margin-left: 6px; }
                .pill { pointer-events: auto; font: 600 12px/1.4 -apple-system, system-ui, sans-serif; color: #fff;
                        background: rgba(20,20,24,.85); border: 1px solid rgba(255,255,255,.2);
                        border-radius: 999px; padding: 5px 10px; display: flex; gap: 6px; align-items: center; }
                .dot { width: 8px; height: 8px; border-radius: 50%; background: #888; }
                .dot.on { background: #3ddc84; }
                .tap, .other { pointer-events: auto; display: block; border: 0; cursor: pointer; text-decoration: none;
                       font: 700 16px/1.4 -apple-system, system-ui, sans-serif; color: #fff;
                       background: #3a6df0; border-radius: 10px; padding: 12px 16px; }
                /* 「ホストの作品を開く」は必ず押すボタンなので、真ん中に大きく出す（2026-09-14 ユーザー要望: 小さくて見逃された） */
                .other { position: fixed; left: 50%; top: 45%; transform: translate(-50%, -50%); z-index: 7; background: #1f8a5a;
                         font-size: 22px; padding: 18px 30px; border-radius: 16px; text-align: center; white-space: normal; width: max-content; max-width: 92vw;
                         box-shadow: 0 6px 24px rgba(0,0,0,.6); border: 3px solid #fff; animation: wppulse 1.6s ease-in-out infinite; }
                .other small { display: block; font-size: 14px; font-weight: 600; margin-top: 4px; opacity: .9; }
                @keyframes wppulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.05); } }
                /* 再生が止まったまま・大きくずれたままのときの立て直し（真ん中に大きく） */
                .fix { position: fixed; left: 50%; top: 45%; transform: translate(-50%, -50%); z-index: 7; pointer-events: auto;
                       background: rgba(20,20,26,.92); border: 2px solid #ffcc33; border-radius: 16px; padding: 16px 20px; text-align: center;
                       color: #fff; font: 700 18px/1.5 -apple-system, system-ui, sans-serif; box-shadow: 0 6px 24px rgba(0,0,0,.6); max-width: min(92vw, 460px); }
                .fix button { display: block; width: 100%; margin-top: 10px; border: 0; border-radius: 12px; cursor: pointer;
                              font: 700 20px/1.3 -apple-system, system-ui, sans-serif; padding: 14px 18px; color: #fff; background: #3a6df0; }
                .fix .later { background: transparent; font-size: 14px; padding: 6px; margin-top: 4px; color: #c8c8d0; }
                .refix { border: 0; border-radius: 8px; background: rgba(58,58,70,.6); color: #fff; min-width: 44px; min-height: 40px; font-size: 16px; cursor: pointer; }
                .tap { position: fixed; left: 50%; top: 40%; transform: translate(-50%, -50%); z-index: 6;
                       font-size: 20px; padding: 16px 28px; border-radius: 999px; box-shadow: 0 4px 18px rgba(0,0,0,.5); white-space: nowrap; }
                /* 広告の時間を確かめるための「1回タップ」の知らせ。見逃されたので真ん中に大きく出す（2026-09-14）。
                   押す場所ではなく知らせなので、触ったらそのまま Amazon のプレイヤーに届く（pointer-events: none）。触ったら消す */
                .clock { position: fixed; left: 50%; top: 40%; transform: translate(-50%, -50%); z-index: 6; pointer-events: none;
                         font: 700 20px/1.5 -apple-system, system-ui, sans-serif; color: #fff; text-align: center;
                         background: rgba(20,20,26,.88); border: 2px solid #ffcc33; border-radius: 16px; padding: 16px 22px;
                         box-shadow: 0 4px 18px rgba(0,0,0,.5); max-width: min(90vw, 460px); }
                .clock small { display: block; font-size: 14px; font-weight: 600; color: #d8d8e0; margin-top: 4px; }
                .update { pointer-events: auto; border: 0; text-align: left; max-width: 100%;
                          font: 600 14px/1.5 -apple-system, system-ui, sans-serif; color: #1a1300;
                          background: #ffcc33; border-radius: 10px; padding: 10px 12px; }
                .fab { position: fixed; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px));
                       pointer-events: auto; border: 0; border-radius: 999px; min-width: 56px; min-height: 48px;
                       padding: 10px 16px; font: 700 16px/1 -apple-system, system-ui, sans-serif;
                       color: #fff; background: rgba(58,109,240,.95); box-shadow: 0 2px 10px rgba(0,0,0,.4); z-index: 2; }
                .badge { display: inline-block; min-width: 20px; padding: 2px 6px; margin-left: 6px; border-radius: 10px;
                         background: #e5484d; font-size: 12px; }
                /*
                 * **音量のボタンは置かない**（2026-09-23 ユーザー判断）。
                 * 「▶ 再生をはじめる」で消音を解いて 100% にすれば、あとは**端末の物理ボタン**で調整できる。
                 * 一度は自前の 🔊 を出したが、画面に常駐するボタンが増えるだけなので取り止めた。
                 */
                .panel { position: fixed; z-index: 4; right: 8px; left: 8px; bottom: calc(8px + env(safe-area-inset-bottom, 0px));
                         max-width: 420px; margin-left: auto; height: min(52vh, 420px);
                         pointer-events: auto; display: flex; flex-direction: column; gap: 6px; padding: 8px;
                         background: rgba(15,15,19,.94); color: #f2f2f4; border: 1px solid #2c2c36; border-radius: 12px; }
                /*
                 * PC の右側に置くときだけ、ほぼ透明にして映像を見やすくする（2026-09-14 ユーザー要望）。
                 * 字は影を付けて、明るい場面でも読めるようにする。スマホは今までどおり（映像にかぶらないため、透明にしないでと要望）。
                 */
                .panel[data-place="side"] {
                         background: rgba(0,0,0,.18); border-color: rgba(255,255,255,.12);
                         text-shadow: 0 0 3px #000, 0 1px 2px #000, 0 0 6px rgba(0,0,0,.8); }
                .panel[data-place="side"] .phead { color: #e0e0e6; font-size: 15px; }
                /* PC の大きな画面では字が小さく見えたので大きめに（2026-09-14 ユーザー要望） */
                .panel[data-place="side"] .msgs { font-size: 17px; }
                .panel[data-place="side"] .msg.system { font-size: 14px; }
                .panel[data-place="side"] .notice { font-size: 14px; }
                .panel[data-place="side"] .msg.big .body { font-size: 30px; }
                .pop { border: 0; border-radius: 8px; background: rgba(58,58,70,.6); color: #fff; min-width: 44px; min-height: 40px; font-size: 16px; cursor: pointer; }
                .panel[data-place="side"] input { background: rgba(20,20,26,.55); border-color: rgba(255,255,255,.2); }
                .panel[data-place="side"] .close { background: rgba(58,58,70,.6); }
                /* iPhone で打っている間の狭いチャット欄: 入力欄と直近の発言だけ */
                .panel[data-tight="1"] .phead, .panel[data-tight="1"] .notice { display: none; }
                .panel[data-tight="1"] { gap: 4px; padding: 6px; }
                .phead { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9a9aa6; }
                .phead span { flex: 1; }
                .close { border: 0; border-radius: 8px; background: #3a3a46; color: #fff; min-width: 44px; min-height: 40px; font-size: 16px; }
                .msgs { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
                        font-size: 14px; line-height: 1.5; overscroll-behavior: contain; }
                /* 新しい発言を一番下に出す。少ないうちも下から積み上げる（LINE と同じ） */
                .msgs > :first-child { margin-top: auto; }
                /* スマホ（上が最新）: 入力欄を上に、発言は上から下へ新しい順に並べる（2026-09-16 ユーザー要望） */
                .panel[data-newest="top"] form { order: -1; }
                .panel[data-newest="top"] .notice { order: -2; }
                .panel[data-newest="top"] .msgs > :first-child { margin-top: 0; }
                .msg { word-break: break-word; flex: none; }
                .msg .name { font-weight: 700; margin-right: 6px; }
                .msg.me .body { background: rgba(58,109,240,.35); border-radius: 6px; padding: 1px 5px; }
                .msg.system { color: #9a9aa6; font-size: 12px; text-align: center; }
                /* 入退出などのお知らせは、チャットの流れに混ぜず、この1行を上書きして出す（2026-09-14 ユーザー要望） */
                .notice { flex: none; font-size: 12px; line-height: 1.5; color: #ffd98a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                          padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,.08); }
                .notice.fresh { animation: wpfresh 1.2s ease-out; }
                @keyframes wpfresh { from { background: rgba(255,204,51,.45); } to { background: rgba(255,255,255,.08); } }
                .msg.big .body { font-size: 24px; line-height: 1.2; }
                form { display: flex; gap: 6px; }
                input { flex: 1; min-width: 0; font-size: 16px; padding: 10px; border-radius: 8px;
                        border: 1px solid #2c2c36; background: #1a1a21; color: #f2f2f4; }
                .send { border: 0; border-radius: 8px; background: #3a6df0; color: #fff; font-size: 16px; font-weight: 700; padding: 0 14px; min-height: 44px; }
                /*
                 * **入ったらまず出す待機画面**（2026-09-23 ユーザー要望）。Amazon のメニューの上を丸ごと覆う。
                 *   ・メニューで待たされる不安をなくす（ゲストからは「待合室」に見える）
                 *   ・Amazon のボタンを隠すので、間違って別のものを押せない
                 *   ・**「▶ 再生をはじめる」を押してもらうのが本命**。ブラウザは「人が触るまで音の出る再生を許さない」ので、
                 *     この1回のタップで「再生が始まらない」と「音が消えている」の両方が直る
                 */
                .gate { position: fixed; inset: 0; z-index: 8; pointer-events: auto; background: #0d0d12;
                        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
                        padding: 24px 20px calc(24px + env(safe-area-inset-bottom, 0px)); text-align: center; color: #f2f2f4; }
                .gate .gtitle { font: 700 22px/1.4 -apple-system, system-ui, sans-serif; }
                .gate .gsub { font: 600 15px/1.6 -apple-system, system-ui, sans-serif; color: #9a9aa6; max-width: 340px; }
                .gate .gwhat { font: 600 14px/1.5 -apple-system, system-ui, sans-serif; color: #d8d8e0;
                               background: rgba(255,255,255,.07); border-radius: 10px; padding: 8px 14px; max-width: 340px; }
                .gate .ggo { border: 0; border-radius: 16px; cursor: pointer; color: #fff; background: #3a6df0;
                             font: 700 22px/1.3 -apple-system, system-ui, sans-serif; padding: 18px 34px; min-width: 240px;
                             box-shadow: 0 6px 24px rgba(0,0,0,.6); animation: wppulse2 1.6s ease-in-out infinite; }
                .gate .gnote { font: 600 13px/1.5 -apple-system, system-ui, sans-serif; color: #7a7a86; max-width: 340px; }
                @keyframes wppulse2 { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
                /* 上の安全領域（iPhone の時刻の帯など）の高さを測るためだけの見えない箱 */
                .safe { position: fixed; top: 0; left: 0; width: 0; height: env(safe-area-inset-top, 0px); pointer-events: none; }
                [hidden] { display: none !important; }
            </style>
            <div class="safe" aria-hidden="true"></div>
            <div class="gate" hidden>
                <div class="gtitle">KINUGAWA Party Theater</div>
                <div class="gwhat gtitlename" hidden></div>
                <div class="gsub gmsg">つないでいます…</div>
                <button class="ggo" type="button" hidden>▶ 再生をはじめる</button>
                <div class="gnote gnotetext" hidden></div>
            </div>
            <div class="status">
                <div class="pill"><span class="dot"></span><span class="text">KINUGAWA Party Theater</span></div>
            </div>
            <!-- 映像の真ん中に大きく出す（2026-09-14 Android エミュレーター: Amazon のスマホ向けプレイヤーは人が触るまで再生しない。左下の小さいボタンでは気づきにくかった） -->
            <button class="tap" hidden>▶ タップして再生</button>
            <div class="clock" hidden></div>
            <div class="clock adwait" hidden>⏸ ホストが広告を見ています<small>終わると自動で再開します（止まっているのは故障ではありません）</small></div>
            <div class="fix" hidden><div class="fmsg"></div><button class="go" type="button">🔄 再生を立て直す</button><button class="later" type="button">このまま見る</button></div>
            <div class="top">
                <button class="update" hidden></button>
            </div>
            <a class="other" hidden></a>
            <button class="fab">💬<span class="badge" hidden></span></button>
            <div class="panel" hidden>
                <div class="phead"><span>チャット <small class="ver"></small><span class="hstate"></span></span><button class="refix" title="再生がおかしいときに立て直す" aria-label="再生を立て直す">🔄</button><button class="pop" title="チャットを別の窓で開く" aria-label="チャットを別の窓で開く" hidden>⧉</button><button class="close" aria-label="閉じる">✕</button></div>
                <div class="notice" hidden></div>
                <div class="msgs"></div>
                <form><input maxlength="500" placeholder="メッセージ" autocomplete="off"><button class="send" type="submit">送信</button></form>
            </div>`;
        (document.body || document.documentElement).appendChild(host);
        // Amazon のページの操作（タップで再生・キーで早送りなど）に取られないようにする
        for (const t of ['click', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'keydown', 'keyup', 'keypress']) {
            host.addEventListener(t, (e) => e.stopPropagation());
        }
        const q = (s) => root.querySelector(s);
        q('.ver').textContent = typeof __WP_VERSION__ === 'string' ? 'v' + __WP_VERSION__ : '';

        /*
         * 「スクリプトが更新されました」（2026-09-14 ユーザー要望）。友達の画面が付けた最新の版（&wpv=）より
         * このスクリプトが古ければ出す。スクリプトは自動で更新されない（@updateURL を使わない）ので、入れ直してもらう。
         * インストール先のリンクはここには出さない（アドレスの指定は誰でも作れるので、リンクは友達の画面のものだけを使う）。
         * 押すと閉じる。
         */
        if (target.latest && U.olderVersion(typeof __WP_VERSION__ === 'string' ? __WP_VERSION__ : '0.0.0', target.latest)) {
            const day = U.dateLabel(target.latestDate);
            q('.update').textContent = `🔄 スクリプトが更新されました${day ? `（${day}）` : ''}。` +
                '招待のページに戻り「スクリプトをインストールし直す」を押してください（押すと閉じます）';
            q('.update').hidden = false;
            q('.update').addEventListener('click', () => { q('.update').hidden = true; });
        }

        // --- チャット -----------------------------------------------------------
        let open = false;
        let unread = 0;

        /*
         * 発言の欄は、人がさかのぼって読んでいるとき以外は、いつも一番下（最新）を見せる
         * （2026-09-16 Android 実機: 送ってキーボードが閉じると欄の大きさが変わり、上の古い発言に戻って最新が見えなくなった）。
         * 一番下にいるかは、人が指やホイールで動かしたときだけ覚え直す（大きさが変わって勝手に動いたときは覚え直さない）
         */
        /*
         * スマホは**上が最新**にする（2026-09-16 ユーザー要望）。入力欄も上に置く。
         * こうすると、打つときにキーボードが下を隠しても、最新の発言と入力欄が見えたままになり、
         * チャット欄そのものを動かす必要がなくなる（動かすと映像の置き場所まで動いて崩れていた）
         */
        const NEWEST_TOP = !IS_DESKTOP;
        if (NEWEST_TOP) q('.panel').dataset.newest = 'top';
        let stickLatest = true;
        let msgsTouchedAt = 0;
        function keepLatest() {
            const box = q('.msgs');
            if (!stickLatest || !box) return;
            // スマホは上が最新（上へ）、PC は下が最新（下へ）
            box.scrollTop = NEWEST_TOP ? 0 : box.scrollHeight;
        }
        {
            const box = q('.msgs');
            for (const type of ['touchstart', 'touchmove', 'wheel', 'pointerdown']) {
                box.addEventListener(type, () => { msgsTouchedAt = Date.now(); }, { passive: true });
            }
            box.addEventListener('scroll', () => {
                if (Date.now() - msgsTouchedAt > 1500) return;
                stickLatest = NEWEST_TOP ? box.scrollTop < 40 : box.scrollHeight - box.scrollTop - box.clientHeight < 40;
            }, { passive: true });
            if (globalThis.ResizeObserver) new ResizeObserver(() => keepLatest()).observe(box);
            // 打ち始め・打ち終わり（キーボードの出し入れ）でも置き直して、最新を見せる
            const input = q('input');
            for (const type of ['focus', 'blur']) {
                input.addEventListener(type, () => {
                    /*
                     * キーボードがせり上がる／下りる間、画面の更新に合わせて置き直す（ちらつきを減らす）。
                     * 保険の置き直しは**チャット欄だけ**にする（映像に触るのは、動き終わったあとの1回だけ。followKeyboard がやる）
                     */
                    followKeyboard();
                    for (const ms of [400, 900]) setTimeout(() => { placePanel(true); keepLatest(); }, ms);
                });
            }
        }

        function setOpen(v) {
            open = v;
            q('.panel').hidden = !open;
            // チャット欄を開いている間は、左下の状態の表示を出さない（見出しに同じ文言がある。後ろに透けて二重に見えた。2026-09-14）
            q('.status').hidden = open;
            q('.fab').hidden = open;
            if (open) {
                unread = 0;
                placePanel();
                stickLatest = true;
                keepLatest();
            }
            renderBadge();
        }

        /*
         * チャット欄を動画に重ならない所に置く（2026-09-14 Android 実機：動画が画面の真ん中にあり、
         * 下に重ねたチャット欄が動画を隠して使いにくかった）。
         *   - 動画の下に十分な空きがある（縦持ち）→ 動画のすぐ下から画面の下までをチャット欄にする
         *   - 空きが足りない（横持ち・全画面など）→ 下に重ねるが、高さを抑える
         * キーボードが出ると見えている高さ（visualViewport）が縮むので、そのたびに置き直す。
         */
        const MIN_PANEL_PX = 170;
        // 画面の一番上にあるプレイヤーの操作ボタン（字幕・全画面・戻る）のぶん。ここにはチャット欄を置かない
        const TOP_BAR_PX = 56;
        /** 見えている範囲の上端（visualViewport のずれ＋上の安全領域） */
        function visibleTop() {
            // スマホはキーボードのずれ（visualViewport.offsetTop）を数えない（数えると打ち終わりに映像まで動いた。2026-09-16 実機）
            const vv = IS_DESKTOP ? globalThis.visualViewport : null;
            return (vv ? vv.offsetTop : 0) + (q('.safe') ? q('.safe').getBoundingClientRect().height : 0);
        }

        /*
         * キーボードが出たときの画面のずれ（2026-09-16 実機・iPhone）。
         * iPhone は入力欄を出すと画面全体を上へずらす。ページの中身（映像）はそのずれで一緒に動くが、
         * こちらのチャット欄は画面に貼り付けてある（position: fixed）ので動かず、**見た目だけが上へ飛ぶ**。
         * ずれた分だけチャット欄を下げて、見た目を変えない
         */
        function keyboardShift() {
            const vv = globalThis.visualViewport;
            return !IS_DESKTOP && vv ? Math.round(vv.offsetTop) : 0;
        }


        /*
         * 2026-09-14 ユーザー要望: チャットを見ながら観る前提なので、縦持ちの映像はチャット欄の開け閉めに関係なく
         * いつも見えている範囲の一番上に置く。チャット欄は、再生画面が出たら最初から開く
         * （作品ページの段階では開かない。「続きを観る」などのボタンを隠してしまうため）。自分で閉じたら勝手に開かない。
         */
        let userClosed = false;
        let lastLayoutSig = '';
        function layoutTick() {
            const video = layoutVideo();
            const portrait = window.innerHeight > window.innerWidth;
            const playerShown = Boolean(video) && video.getBoundingClientRect().width >= 200 && video.videoHeight > 0;
            /*
             * プレイヤーの箱を映像の大きさに縮めて、画面の一番上へ（操作ボタンと字幕を映像の中に収める）。
             * キーボードが動いている間（following）は触らない。動いている最中に映像を書き換えると、
             * プレイヤーが描き直し・読み込み直しをして再生が乱れる（2026-09-16 ユーザー指摘）
             */
            if (video && !following) fitPlayerToVideo(video, playerShown && portrait, visibleTop());
            // 一度でも再生が始まったか（ゲストに要らないボタンを隠すのは、始まってから）
            if (playerShown && video.currentTime > 0.5 && !video.paused) startedOnce = true;
            hideGuestControls(playerShown ? video : null);
            sizeCaptions(playerShown && portrait ? video : null);
            if (playerShown && !open && !userClosed) setOpen(true);
            /*
             * 2026-09-16 実機（Android）: プレイヤーの箱を縮めたことで、その下のページ（「続きを観る」など）が見えて押せてしまった。
             * これまで Android では触らない方針だったが、箱を縮める今の作りでは隠す必要があるので、Android でも隠す
             */
            if (!IS_DESKTOP) tidyAround(playerShown && portrait ? video : null);
            if (IS_ANDROID && playerShown && portrait) scrollVideoToTop(video);
            /*
             * 置き場所の計算し直しは、画面の大きさや映像の位置が変わったときだけ（2026-09-14）。
             * チャット欄を開いたまま毎秒計算し直すと、本物の Prime でゲストが 3〜4 秒遅れた（止めると 0.7 秒）
             */
            /*
             * 2026-09-16 実機（iPhone）: キーボードの出し入れで置き場所を計算し直すと、打ち終わったあとに位置が変わってしまった。
             * スマホでは**キーボードの出し入れ（visualViewport）では計算し直さない**。上が最新・入力欄も上なので、
             * 下がキーボードで隠れても困らない。画面の向きや映像の大きさが変わったときだけ置き直す
             */
            const vv = (IS_DESKTOP || IS_ANDROID) ? globalThis.visualViewport : null;
            const r = video ? video.getBoundingClientRect() : null;
            /*
             * 打っているかどうかも見る（2026-09-20）。Android は打っている間だけチャット欄の置き場所を変えるので、
             * これが変わったら置き直す。**入力欄に別のイベントを足すと、そこで例外が出たときスクリプト全体が止まる**
             * （2026-09-20 に実際に止めた）ので、毎秒のこの点検に混ぜるだけにしてある
             */
            const composingNow = !IS_DESKTOP && root.activeElement === q('input');
            const baseSig = [window.innerWidth, window.innerHeight, vv ? Math.round(vv.height) : 0, vv ? Math.round(vv.offsetTop) : 0,
                keyboardShift(),   // キーボードで画面がずれたら置き直す（見た目を変えないため）
                r ? Math.round(r.top) : -1, r ? Math.round(r.height) : -1, video ? video.videoHeight : 0, open].join('|');
            const sig = `${baseSig}|${composingNow}`;
            if (sig !== lastLayoutSig) {
                /*
                 * **打っているかだけが変わったときは、映像に触らない**（panelOnly）。
                 * 触るとプレイヤーが描き直し・読み込み直しをして再生が乱れる
                 * （2026-09-20 実機: iPhone が1分遅れた。2026-09-14 にも3〜4秒の遅れを実測している）
                 *
                 * **キーボードが動いている間（following）も映像に触らない**（2026-09-23 修正）。
                 * 上の fitPlayerToVideo は `!following` で守ってあったが、こちらの placePanel は素通りで、
                 * 中で同じ fitPlayerToVideo を呼んでいた。キーボードが動くと毎回 keyboardShift() が変わって
                 * ここに入るので、動いている最中にプレイヤーを書き換えていた。
                 * 映像の合わせ直しは followKeyboard が動き終わりに1回だけやる。
                 */
                const onlyComposing = lastLayoutSig.startsWith(`${baseSig}|`);
                lastLayoutSig = sig;
                placePanel(onlyComposing || following);
            }
        }

        /*
         * iPhone の再生画面で、映像をずらしたあとに見えてしまう Amazon の部品（ウォッチリスト・好きでない・次のエピソード・関連コンテンツなど）を隠す
         * （2026-09-15 ユーザー報告: 映っていて押せてしまう）。プレイヤーの外枠の外にある、ページの他の部分を見えなく・押せなくする。
         * 外枠の中でも、映像に重ならない所にある同じ名前のボタンは隠す。再生画面でなくなったら元に戻す。
         * Android は映像や外枠に触ると再生できなくなったので、ここも触らない
         */
        const tidied = new Set();
        let tidyGoneSince = 0;
        const TIDY_LABEL = /ウォッチリスト|好きでない|好き|次のエピソード|関連|エピソード|詳細|シェア|ダウンロード|評価/;
        function hideEl(el) {
            if (tidied.has(el)) return;
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
            tidied.add(el);
        }
        /*
         * iPhone の再生画面では、ページそのものをスクロールさせない（2026-09-16 実機: 打とうとすると下へスクロールでき、
         * プレイヤーの下のページが見えて押せた）。再生画面でなくなったら戻す
         */
        let scrollLocked = false;
        function lockScroll(on) {
            if (on === scrollLocked) return;
            scrollLocked = on;
            for (const el of [document.documentElement, document.body]) {
                if (!el) continue;
                if (on) {
                    el.style.setProperty('overflow', 'hidden', 'important');
                    el.style.setProperty('overscroll-behavior', 'none', 'important');
                } else {
                    el.style.removeProperty('overflow');
                    el.style.removeProperty('overscroll-behavior');
                }
            }
        }
        /*
         * 字幕には手を出さない（2026-09-16 ユーザー判断）。
         * 一度は「映像の中の一番下へ移す」「映像の真ん中に固定する」を試したが、Amazon 側の描き直しとぶつかって
         * **字幕がすぐ消える**ようになった。位置も含めて Amazon の標準のままにする。
         * （スマホの縦持ちでは、字幕がチャット欄の裏に入ることがある。読みたいときは ✕ でチャット欄を閉じる）
         */

        /*
         * ゲストが押す必要のないプレイヤーのボタンを隠す（2026-09-16 ユーザー要望）。
         * 再生・一時停止・早送り・巻き戻し・次の話は、押してもこちらがホストに合わせ直すので意味がなく、かえってずれる。
         * 字幕・音声・音量・全画面は押してもらう必要があるので残す。
         * 最初の再生だけは人が触らないと始まらない端末があるので、**一度再生が始まってから**隠す
         */
        const GUEST_HIDE = /再生|一時停止|停止|早送り|巻き戻し|\d+\s*秒(進|戻)|次の(エピソード|話)|前の(エピソード|話)|スキップ|Play\b|Pause|Forward|Rewind|Next\s*(episode|up)|Skip/i;
        const GUEST_KEEP = /字幕|音声|吹き替え|音量|ミュート|全画面|フルスクリーン|設定|Subtitle|Caption|Audio|Volume|Mute|Fullscreen|Settings/i;
        const guestHidden = new Set();
        // シークバー（動かせなくするだけ。隠さない）。Prime は progress/seek、Netflix は scrubber/timeline の名前を使う
        const GUEST_LOCK_SEL = 'input[type="range"], [role="slider"], [class*="seek" i], [class*="scrub" i], ' +
            '[class*="progress" i], [class*="timeline" i], [data-uia*="timeline" i], [data-uia*="scrubber" i]';
        const guestLocked = new Set();
        let startedOnce = false;
        function hideGuestControls(video) {
            if (IS_DESKTOP) return;
            if (!video || !startedOnce) {
                if (!video) {
                    for (const el of guestHidden) { el.style.removeProperty('visibility'); el.style.removeProperty('pointer-events'); }
                    guestHidden.clear();
                    for (const el of guestLocked) el.style.removeProperty('pointer-events');
                    guestLocked.clear();
                }
                return;
            }
            const frame = playerFrame(video);
            for (const el of frame.querySelectorAll('button, [role="button"]')) {
                if (guestHidden.has(el)) continue;
                const name = `${el.textContent || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''}`;
                if (!GUEST_HIDE.test(name) || GUEST_KEEP.test(name)) continue;
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
                guestHidden.add(el);
            }
            /*
             * シークバー（再生位置のバー）は、見えるけれど**動かせない**ようにする（2026-09-16 ユーザー要望）。
             * ゲストが動かしても、こちらがホストの位置へ戻すだけで意味がなく、そのたびにずれて読み込み直しになる。
             * 今どこを再生しているかは見えたほうがよいので、隠さずに触れなくする
             */
            for (const el of frame.querySelectorAll(GUEST_LOCK_SEL)) {
                if (guestLocked.has(el)) continue;
                el.style.setProperty('pointer-events', 'none', 'important');
                guestLocked.add(el);
            }
        }

        /*
         * 字幕の**文字の大きさだけ**を映像の幅に合わせる（2026-09-16 実機: Android は大きすぎ、iPhone は小さすぎた）。
         * 位置は動かさない（動かすと Amazon の描き直しとぶつかって、字幕がすぐ消えた）
         */
        /*
         * 2026-09-16 実機: 1秒ごとに字幕の要素へ書き込む形だと、字幕が出るたびに**大きいものが一瞬出てから縮む**（Android でちらついた）。
         * ページに決まり（スタイル）を1枚入れて、**出た瞬間から**その大きさで描かせる。
         * iPhone は字幕をブラウザ自身が描くことがある（video::cue）ので、そちらにも同じ大きさを指定する（要素が無く、書き込めないため）。
         * 位置には触らない（触ると Amazon の描き直しとぶつかって字幕が消えた）
         */
        let captionStyleEl = null;
        function sizeCaptions(video) {
            if (IS_DESKTOP) return;
            if (!video) {
                if (captionStyleEl) { captionStyleEl.remove(); captionStyleEl = null; }
                return;
            }
            const cr = contentRect(video);
            if (!(cr.width > 0)) return;
            /*
             * 文字の大きさは映像の幅から決める。Android は同じ計算でも大きく見える（実機の指摘）ので、少し控えめにする。
             * iPhone はブラウザが描く字幕（::cue）で、ここの指定がそのまま効く
             */
            const font = Math.max(12, Math.min(20, Math.round(cr.width * (IS_ANDROID ? 0.036 : 0.045))));
            if (captionStyleEl && captionStyleEl.isConnected && captionStyleEl.dataset.wpFont === String(font)) return;
            if (!captionStyleEl) {
                captionStyleEl = document.createElement('style');
                captionStyleEl.id = 'wp-caption-size';
            }
            // 字幕のボタン（オン・オフ）は対象にしない
            const notBtn = ':not(button):not([role="button"]):not([class*="button" i])';
            const sel = ['caption', 'subtitle', 'timedtext']
                .flatMap(k => [`[class*="${k}" i]${notBtn}`, `[class*="${k}" i]${notBtn} *`]).join(',\n');
            captionStyleEl.textContent =
                `${sel} { font-size: ${font}px !important; line-height: 1.35 !important; }\n` +
                `video::cue { font-size: ${font}px !important; }`;
            captionStyleEl.dataset.wpFont = String(font);
            if (!captionStyleEl.isConnected) document.documentElement.appendChild(captionStyleEl);
        }

        function tidyAround(video) {
            if (!video) {
                // 打ち始めなどで一瞬だけ映像が測れないことがある。5秒続いたら（再生画面を閉じたら）元に戻す
                if (!tidyGoneSince) tidyGoneSince = Date.now();
                if (Date.now() - tidyGoneSince < 5000) return;
                for (const el of tidied) { el.style.removeProperty('visibility'); el.style.removeProperty('pointer-events'); }
                tidied.clear();
                lockScroll(false);
                return;
            }
            tidyGoneSince = 0;
            lockScroll(true);
            const frame = playerFrame(video);
            /*
             * 外枠は上へずらしてある（translate）。ページの他の部品はずれないので、ずらす前の位置で比べる
             * （2026-09-15 iPhone 実機: 打とうとすると外枠が見えている範囲に合わせて動き、下の「関連コンテンツ」などに重なったと
             * みなして隠さず、スクロールすると見えてしまった）。一度隠さないと決めた部品も、あとから出てきた部品も、この基準で見る
             */
            const shift = Number(video.dataset.wpShift || 0);
            const fb = frame.getBoundingClientRect();
            /*
             * 大きさは**縮める前の箱**で比べる（2026-09-16）。プレイヤーの箱を映像の大きさに縮めたので、
             * 縮めたあとの大きさで比べると、プレイヤーの操作ボタンの層まで「外枠より大きい」とみなして隠してしまう
             */
            const originalH = Number(video.dataset.wpFitFrom || 0) || fb.height;
            const fr = { left: fb.left, right: fb.right, top: fb.top + shift, bottom: fb.top + shift + originalH,
                width: fb.width, height: originalH };
            const cr = contentRect(video);
            const overlaps = (a, b) => a.width > 0 && a.height > 0 && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
            /*
             * 外枠からページの一番上までの、それぞれの兄弟を隠す。残すのは、外枠に重なっていて外枠と同じくらいの大きさの層
             * （映像に重なる操作ボタンの層など）だけ。
             * 2026-09-16 iPhone 実機: 重なっているものは全部残していたが、プレイヤーの下に敷かれたページ全体（下の方に関連作品）も
             * 外枠に重なっていて残り、打とうとしてスクロールすると見えた。外枠より大きく広がるものは隠す
             */
            for (let node = frame; node && node.parentElement && node !== document.body; node = node.parentElement) {
                for (const sib of node.parentElement.children) {
                    if (sib === node || sib === host || sib.contains(host) || /^(SCRIPT|STYLE|LINK)$/.test(sib.tagName)) continue;
                    const r = sib.getBoundingClientRect();
                    /*
                     * いま大きさがゼロのものは触らない（2026-09-16 iPhone 実機: 全画面・字幕のボタンが消え、字幕をオンにしても出なくなった）。
                     * プレイヤーの操作ボタンや字幕の層は、出ていない間は大きさがゼロ。それを「外枠に重ならない部品」とみなして
                     * 隠してしまい、あとから出てきても隠れたままになっていた。この見回しは毎秒動くので、
                     * 出てきて大きさを持った時点で、あらためて隠すかどうかを決める
                     */
                    if (r.width === 0 || r.height === 0) continue;
                    const layer = overlaps(r, fr) && r.height <= fr.height * 1.25 + 8 && r.width <= fr.width * 1.25 + 8;
                    if (!layer) hideEl(sib);
                }
            }
            // 外枠の中の、映像に重ならない所のボタン（名前で見分ける）
            for (const el of frame.querySelectorAll('button, a, [role="button"], [role="tab"]')) {
                const name = `${el.textContent || ''} ${el.getAttribute('aria-label') || ''}`;
                if (!TIDY_LABEL.test(name)) continue;
                if (!overlaps(el.getBoundingClientRect(), { left: cr.left, right: cr.left + cr.width, top: cr.top, bottom: cr.bottom })) hideEl(el);
            }
        }

        /*
         * Android: 打とうとするとページが下へ動き、映像が上・チャット欄が下のちょうどよい位置になる（2026-09-15 ユーザー報告）。
         * それを打たなくても自動でやる。映像やプレイヤーの外枠には触らず（触ると再生できなくなった）、ページのスクロールだけ動かす。
         * スクロールできないページなら何もしない。打っている間と、人がスクロールした直後は動かさない
         */
        let lastAutoScroll = 0;
        let userScrolledAt = 0;
        window.addEventListener('touchmove', () => { userScrolledAt = Date.now(); }, { passive: true, capture: true });
        function scrollVideoToTop(video) {
            if (root.activeElement === q('input') || Date.now() - userScrolledAt < 4000 || Date.now() - lastAutoScroll < 1500) return;
            const r = contentRect(video);
            if (Math.abs(r.top) <= 4) return;
            const se = document.scrollingElement || document.documentElement;
            const want = Math.max(0, Math.round(window.scrollY + r.top));
            if (se.scrollHeight - window.innerHeight < Math.min(want, 40)) return;   // ほとんどスクロールできない
            lastAutoScroll = Date.now();
            window.scrollTo(0, want);
            setTimeout(placePanel, 300);
        }

        /**
         * チャット欄（と、必要ならプレイヤー）の置き場所を決める。
         * @param {boolean} panelOnly 映像には触らず、こちらのチャット欄だけ置き直す。
         *   キーボードが動いている間に使う（2026-09-16）。映像の見た目を毎フレーム書き換えると、
         *   プレイヤーが描き直し・読み込み直しをして再生が乱れる（毎秒の書き換えでゲストが3〜4秒遅れた実測がある）。
         *   チャット欄だけなら軽いので、頻繁に打っても問題ない
         */
        function placePanel(panelOnly = false) {
            if (!open) return;
            const panel = q('.panel');
            /*
             * スマホは**キーボードが出ても置き場所を変えない**（2026-09-16 実機: 打ち終わったあとに位置が変わってしまった）。
             * 見えている範囲（visualViewport）ではなく、画面そのもの（window）で置く。
             * 上が最新・入力欄も上なので、下がキーボードで隠れても困らない
             */
            /*
             * **Firefox Android はキーボードが出ても visualViewport が縮まない**（2026-09-20 実機:
             * ih=767 に対し vvh=801 と、むしろ増えた）。高さから逆算できないので、ここでは使わず、
             * 打っている間だけ下の「compose」で別に置く。
             */
            const vv = IS_DESKTOP ? globalThis.visualViewport : null;
            const viewH = vv ? vv.height : window.innerHeight;
            const viewTop = vv ? vv.offsetTop : 0;
            // スマホ: キーボードで画面がずれた分。その分だけ下げて、見た目の位置を変えない
            const kb = keyboardShift();
            const video = layoutVideo();
            const portrait = window.innerHeight > window.innerWidth;
            /*
             * 2026-09-16 ユーザー要望: スマホは上が最新・入力欄も上にしたので、**打っている間もチャット欄と映像を動かさない**。
             * キーボードで下が隠れても、入力欄と最新の発言は見えたままになる。
             * 動かしていた頃は、映像の置き場所まで一緒に動いて崩れていた
             */
            const composing = !IS_DESKTOP && root.activeElement === q('input');
            if (video && !panelOnly) fitPlayerToVideo(video, portrait && Boolean(video.videoHeight), visibleTop());
            const r = video ? contentRect(video) : null;
            const below = r ? Math.max(0, Math.round(r.bottom - viewTop)) : 0;
            const room = viewH - below - 16;
            if (IS_DESKTOP && window.innerWidth >= 700) {
                /*
                 * PC の横長の画面では、チャット欄を右側に縦長で置く（2026-09-14）。下に重ねると映像と操作ボタンを隠すため。
                 * 上はプレイヤーの戻るボタン、下は再生バーと重ならないよう、少し空ける
                 */
                panel.style.top = '72px';
                panel.style.bottom = '96px';
                panel.style.height = 'auto';
                panel.style.left = 'auto';
                panel.style.width = '360px';
                panel.dataset.place = 'side';
            } else if (r && r.height > 0 && room >= MIN_PANEL_PX) {
                panel.style.top = `${kb + viewTop + below + 8}px`;
                panel.style.bottom = 'auto';
                panel.style.height = `${room}px`;
                panel.dataset.place = 'below-video';
                panel.dataset.tight = '';
                panel.style.left = ''; panel.style.width = '';
            } else {
                panel.style.top = 'auto';
                panel.style.bottom = `${Math.max(8, window.innerHeight - viewTop - viewH + 8 - kb)}px`;
                // 横持ちなど、映像の下に置けないときは下に重ねる（画面の半分より低く抑える）
                const h = Math.round(Math.min(viewH * 0.45, 420));
                panel.style.height = `${h}px`;
                panel.dataset.tight = composing && h < 140 ? '1' : '';
                panel.dataset.place = 'overlay';
                panel.style.left = ''; panel.style.width = '';
            }
            keepLatest();
            reportLayout(video, r, panel);
        }

        /*
         * 映像の置かれ方をサーバーのログに送る（数と CSS の決まった値だけ。個人情報は含まない）。
         * Android 実機で「映像が上に行かない」が起きたが、PC の本物のプレイヤーでは再現しなかったため（2026-09-14）。
         * 置き場所が変わったときと、開いてから最初の1回だけ送る。
         */
        let lastReport = '';
        function reportLayout(video, r, panel) {
            if (!connected) return;
            const box = (b) => (b ? { x: b.left ?? b.x, y: b.top ?? b.y, w: b.width, h: b.height } : null);
            const key = `${panel.dataset.place}|${Math.round(r ? r.top : -1)}|${window.innerWidth}x${window.innerHeight}`;
            if (key === lastReport) return;
            lastReport = key;
            const parents = [];
            for (let el = video && video.parentElement; el && parents.length < 4; el = el.parentElement) {
                parents.push(box(el.getBoundingClientRect()));
            }
            const cs = video ? getComputedStyle(video) : null;
            socket.emit('layout-report', {
                version: typeof __WP_VERSION__ === 'string' ? __WP_VERSION__ : '',
                view: { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight },
                video: video ? box(video.getBoundingClientRect()) : null,
                vw: video ? video.videoWidth : null, vh: video ? video.videoHeight : null,
                top: Math.round(visibleTop()), ih: window.innerHeight, vvh: globalThis.visualViewport ? Math.round(visualViewport.height) : null,
                fit: cs ? cs.objectFit : '', pos: cs ? cs.objectPosition : '',
                shift: video ? Number(video.dataset.wpShift || 0) : null,
                place: panel.dataset.place, panel: box(panel.getBoundingClientRect()),
                parents, count: document.querySelectorAll('video').length,
                ua: navigator.userAgent
            });
        }
        /*
         * 広告の表示の記録（2026-09-14）。iPhone の Safari で、ゲストの広告の時間まで本編の時間に数えてずれた。
         * PC で確かめた「広告 1:04」の見分け方がスマホ用の画面で効いていないとみて、実際の表示を集める。
         * 送るのは「広告」「Ad」「スキップ」「スポンサー」を含む短い文字（プレイヤーの表示）と、再生位置の数だけ。
         * 表示が変わったときと開いてから5分は15秒ごと、1ページ50回まで。
         */
        /*
         * ページの中で起きたエラー（2026-09-14）。Android の Firefox だけ、このスクリプトを入れると Amazon の再生が始まらない
         * （iPhone は同じスクリプトで再生できる）。Amazon のプレイヤーと、このスクリプトのどちらで何が失敗したかを見るため、
         * エラーの文（先頭120字）と出た場所（ファイル名の末尾と行）だけを、動画が始まらないときの記録に添える。
         */
        const pageErrors = [];
        const keepError = (msg, where) => {
            if (pageErrors.length >= 8) return;
            const s = `${String(msg || '').slice(0, 120)} @${String(where || '').split('/').pop().slice(0, 60)}`;
            if (!pageErrors.includes(s)) pageErrors.push(s);
        };
        window.addEventListener('error', (e) => keepError(e.message, `${e.filename || ''}:${e.lineno || 0}`), true);
        window.addEventListener('unhandledrejection', (e) => {
            const r = e.reason;
            keepError(r && (r.name ? `${r.name}: ${r.message}` : r.message) || String(r), 'promise');
        });
        let adReports = 0;
        let lastAdKey = '';
        let lastAdAt = 0;
        function reportAds() {
            if (!connected || PAGE_SERVICE !== 'prime' || adReports >= 300) return;
            const vids = Array.from(document.querySelectorAll('video')).filter(v => Number.isFinite(v.duration) && v.duration >= 300);
            if (!vids.length) {
                /*
                 * 動画が始まらないときの記録（2026-09-14 実機: 作品を開いても動画を掴めない回が続いた）。
                 * 画面に見えているボタンの短い文字（「今すぐ観る」「最初から再生」など）を15秒ごとに、5分まで送る。
                 */
                if (Date.now() - openedAt < 8000 || Date.now() - openedAt > 5 * 60 * 1000 || Date.now() - lastAdAt < 15000) return;
                lastAdAt = Date.now();
                adReports++;
                // 画面上部のメニューではなく、再生・許可・エラーに関係する文言を拾う（2026-09-14 Android で原因が分からなかった）
                const KEY = /観る|再生|続き|最初|許可|サポート|対応|エラー|ブラウザ|保護|DRM|有効|問題|できません|Play|Error/i;
                const texts = [];
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                while (walker.nextNode() && texts.length < 6) {
                    const s = walker.currentNode.textContent.replace(/\s+/g, ' ').trim();
                    if (!s || s.length > 40 || !KEY.test(s) || texts.some(t => t.s === s)) continue;
                    const el = walker.currentNode.parentElement;
                    if (!el || el.getBoundingClientRect().width === 0) continue;
                    texts.push({ s, around: '' });
                }
                // 動画の部品の読み込み状態（長さ・readyState・networkState・エラー番号）
                const vs = Array.from(document.querySelectorAll('video')).slice(0, 3).map(x => ({
                    s: `d=${Number.isFinite(x.duration) ? Math.round(x.duration) : 'NaN'} rs=${x.readyState} ns=${x.networkState} err=${x.error ? x.error.code : 0} w=${Math.round(x.getBoundingClientRect().width)}`,
                    around: ''
                }));
                socket.emit('ad-report', {
                    version: typeof __WP_VERSION__ === 'string' ? __WP_VERSION__ : '',
                    novideo: true, videos: document.querySelectorAll('video').length, errors: pageErrors.slice(),
                    texts: [...vs, ...texts].slice(0, 6)
                });
                return;
            }
            const v = vids.reduce((a, b) => (b.duration > a.duration ? b : a));
            const texts = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            while (walker.nextNode() && texts.length < 6) {
                const s = walker.currentNode.textContent.trim();
                // 「広告」の文字が無く、残り時間（0:15）だけのこともあり得るので、時刻だけの文字も拾う
                if (!s || s.length > 40 || !/広告|スキップ|スポンサー|^Ads?\b|^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) continue;
                const el = walker.currentNode.parentElement;
                if (!el) continue;
                // 映像に重なっている表示だけ（ページ下の「広告掲載」などは関係ない）
                const er = el.getBoundingClientRect(), vr = v.getBoundingClientRect();
                if (er.width === 0 || er.right < vr.left || er.left > vr.right || er.bottom < vr.top || er.top > vr.bottom) continue;
                // 残り時間が隣の要素にあることがあるので、少し上の要素の文字も添える
                let up = el;
                for (let i = 0; i < 3 && up.parentElement && up.parentElement.textContent.length <= 60; i++) up = up.parentElement;
                texts.push({ s, around: up.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) });
            }
            const key = JSON.stringify(texts) + selfAd;
            // 表示が変わったとき。加えて開いてから5分は15秒ごとにも送る（広告の間に時間がどう進んだかを見るため）
            // ホストが再生中なのにこちらが止まっている間も送る（止まったまま動かない件の調査。2026-09-14）
            const stalled = hostPlaying && v.paused && !selfAd;
            const periodic = (Date.now() - openedAt < 5 * 60 * 1000 || stalled) && Date.now() - lastAdAt >= 15000;
            if (key === lastAdKey && !periodic) return;
            lastAdAt = Date.now();
            lastAdKey = key;
            adReports++;
            socket.emit('ad-report', {
                version: typeof __WP_VERSION__ === 'string' ? __WP_VERSION__ : '',
                selfAd, texts, t: v.currentTime, d: v.duration, paused: v.paused,
                ct: contentT, plan: planInfo, diag: playDiag, hostPlaying, gates: { otherVideo: Boolean(otherVideo), hostHold, hasHost }
            });
        }
        if (PAGE_SERVICE === 'prime') setInterval(reportAds, 1000);
        /*
         * キーボードが出入りしている間だけ、画面の更新に合わせて（毎フレーム）置き直す（2026-09-16 ユーザー要望）。
         * iPhone のキーボードは 0.3 秒ほどかけてせり上がり、その間ずっと画面がずれ続けるので、
         * 知らせが来たときだけ直していると、追いつくまでの一瞬ちらつく。
         * **ずっと毎フレーム動かすと重く、本物の Prime でゲストが数秒遅れた**ので、動き終わるまで（最大 0.8 秒）に限る
         */
        let followUntil = 0;
        let following = false;
        let lastShift = -1;
        let steadySince = 0;
        function followKeyboard() {
            followUntil = Date.now() + 1200;
            if (following) return;
            following = true;
            lastShift = keyboardShift();
            steadySince = 0;
            const step = () => {
                const shift = keyboardShift();
                if (shift !== lastShift) {
                    lastShift = shift;
                    steadySince = 0;
                    placePanel(true);          // 動いている間は**チャット欄だけ**（映像には触らない）
                } else if (!steadySince) {
                    steadySince = Date.now();
                } else if (Date.now() - steadySince > 250) {
                    // 動き終わったので、ここで1回だけ映像も合わせ直して終わり
                    placePanel();
                    following = false;
                    return;
                }
                if (Date.now() < followUntil) requestAnimationFrame(step);
                else { placePanel(); following = false; }
            };
            requestAnimationFrame(step);
        }
        globalThis.visualViewport?.addEventListener('resize', followKeyboard);
        globalThis.visualViewport?.addEventListener('scroll', followKeyboard);
        window.addEventListener('resize', placePanel);
        window.addEventListener('orientationchange', () => setTimeout(placePanel, 300));
        // プレイヤーの大きさはページの作りで後から変わるので、開いている間はときどき測り直す
        setInterval(layoutTick, 1000);
        function renderBadge() {
            q('.badge').hidden = unread === 0;
            q('.badge').textContent = unread > 99 ? '99+' : String(unread);
        }
        const shownMsgs = new Set();
        /** quiet … 入る前の発言（chat-history）。未読の数には数えない */
        function addMessage(m, quiet = false) {
            if (m.type === 'system') { U.showNotice(q('.notice'), m.content); return; }
            const key = U.messageKey(m);
            if (key) { if (shownMsgs.has(key)) return; shownMsgs.add(key); }
            const box = q('.msgs');
            const row = U.messageRow(m, me);
            if (NEWEST_TOP) {
                // スマホは**上が最新**（打つときにキーボードで下が隠れてもよいように。2026-09-16 ユーザー要望）
                box.prepend(row);
                while (box.children.length > 100) box.lastChild.remove();
            } else {
                box.appendChild(row);
                while (box.children.length > 100) box.firstChild.remove();
            }
            if (m.senderId === me) stickLatest = true;
            if (stickLatest) keepLatest();
            if (!quiet && !open && m.type === 'user' && m.senderId !== me) {
                unread++;
                renderBadge();
            }
        }
        /*
         * チャット欄の上にマウスがある間も、プレイヤーに「マウスが動いている」と伝える（2026-09-16 ユーザー報告）。
         * Prime / Netflix は、しばらくマウスが動かないと操作バー（字幕・全画面など）を隠す。
         * 右上のボタンへ動かす途中でチャット欄の上に入ると動きが届かず、押す直前に消えて押せなかった。
         * 知らせるのは「動いた」ことだけ（押す操作は送らない）。触る画面（スマホ）では要らない
         */
        if (IS_DESKTOP) {
            let lastMove = 0;
            const keepControlsAlive = () => {
                const now = Date.now();
                if (now - lastMove < 300) return;
                lastMove = now;
                const v = mainVideo() || layoutVideo();
                const r = v && v.getBoundingClientRect();
                if (!r || r.width < 50 || r.height < 50) return;
                const x = Math.round(r.left + r.width / 2);
                const y = Math.round(r.top + r.height / 2);
                for (const type of ['mousemove', 'pointermove']) {
                    v.dispatchEvent(new MouseEvent(type, { bubbles: true, composed: true, clientX: x, clientY: y }));
                }
            };
            for (const type of ['mousemove', 'pointermove']) {
                root.addEventListener(type, keepControlsAlive, { passive: true });
            }
        }

        q('.fab').addEventListener('click', () => setOpen(true));
        q('.close').addEventListener('click', () => { userClosed = true; setOpen(false); });
        q('.refix').addEventListener('click', fixPlayback);
        q('.fix .go').addEventListener('click', fixPlayback);
        q('.fix .later').addEventListener('click', () => { fixDismissedAt = Date.now(); render(); });
        /*
         * チャットを別の窓で開く（PC のゲスト。2026-09-14 ユーザー要望）。招待ページのチャットを小さな窓で開き、
         * この画面のチャット欄は閉じて映像を全部見せる（💬 でいつでも戻せる）。
         * 開く先は、招待ページが付けた版（&wph=）から作る自分たちのアドレスだけ
         */
        const popUrl = IS_DESKTOP ? U.hubUrl(target.hub) : null;
        q('.pop').hidden = !popUrl;
        q('.pop').addEventListener('click', () => {
            if (!popUrl) return;
            const w = window.open(`${popUrl}#wp=${target.room}&chat=1`, 'wp-chat', 'popup,width=420,height=760');
            if (w) { try { w.opener = null; } catch { /* 無視 */ } }
            userClosed = true;
            setOpen(false);
        });
        /*
         * 打ち始め・打ち終わりで、チャット欄の大きさを測り直す。
         *
         * **ここで映像に触ってはいけない**（2026-09-23 修正）。キーボードが動き始めるのと同時なので、
         * 「動いている間はチャット欄だけ・動き終わってから1回だけ映像」（followKeyboard）の決めごとが破れる。
         * プレイヤーの CSS を書き換えるたびに読み込み直しが起きるため、本物の Prime でゲストが3〜4秒遅れた。
         *
         * そこで、すぐやるのは**チャット欄だけ**（placePanel(true)）にして、映像の合わせ直しは
         * followKeyboard に任せる。**キーボードでビューポートが縮まない端末（Firefox Android）でも大丈夫**:
         * ずれが最初から変わらないので「落ち着いた」と判定され、250ms 後に1回だけ映像を合わせ直して終わる。
         */
        for (const ev of ['focus', 'blur']) {
            q('input').addEventListener(ev, () => { placePanel(true); followKeyboard(); });
        }
        q('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = q('input');
            const text = input.value.trim();
            if (!text || !connected) return;
            socket.emit('send-message', { message: text });
            input.value = '';
            stickLatest = true;
            /*
             * **打っている間は、入力フォームだけをキーボードの上へ浮かせる**（2026-09-20 ユーザー要望・実機）。
             * チャット欄そのものは下のままでよく、隠れても困らない。**映像は隠してはいけない。**
             * Firefox Android はキーボードが出てもビューポートが縮まない（ih=767 に対し vvh=801）ので
             * 高さを測れない。実機の写真で測るとキーボードは画面の3割半ほどだったので、4割の位置に置いて余裕を見る。
             */
            const form = q('form');
            if (form) {
                if (IS_ANDROID && composing) {
                    form.style.position = 'fixed';
                    form.style.left = '8px';
                    form.style.right = '8px';
                    form.style.bottom = `${Math.round(window.innerHeight * 0.4)}px`;
                    form.style.zIndex = '10';
                } else {
                    form.style.position = '';
                    form.style.left = ''; form.style.right = '';
                    form.style.bottom = ''; form.style.zIndex = '';
                }
            }
            keepLatest();
        }

);

        /*
         * --- 待機画面と音量（2026-09-23 ユーザー要望）--------------------------------
         *
         * ユーザーの困りごとは2つで、**原因は同じ**:
         *   ・ゲストが入ると Prime のプレイヤーが消音になっている
         *   ・Amazon のメニューで待たされる／再生が始まらないことがある
         *
         * ブラウザは「その画面で人が一度も触っていないうちは、音の出る再生をさせない」。
         * 招待ページの「🌐 ブラウザで見る」を押した"触った"は**別のページの出来事**なので、
         * Amazon 側には引き継がれない。そのため Amazon は消音で始める（始まらないこともある）。
         *
         * そこで、入ったらまず自分たちの待機画面で Amazon のメニューを覆い、
         * **「▶ 再生をはじめる」の1回のタップ**をもらう。そのタップで、
         *   ① Amazon の「続きを観る／今すぐ観る」を代わりに押す（再生が始まらない対策）
         *   ② 音量を最大にして消音を解く（消音対策）
         * をまとめて行う。ゲストから見ると「待合室 → ボタン1つ → 本編」になる。
         */
        const VOL_HOLD_MS = 30000;      // 押したあと、これだけの間は音量を最大に保つ（プレイヤーが読み込み直して戻すため）
        const GATE_ESCAPE_MS = 25000;   // これだけ待っても始まらなければ、Amazon の画面を見る逃げ道を出す
        const FULL_VOLUME = 1;          // 目指す音量。**ここから下げる手段は出さない**（端末の物理ボタンで調整する）
        let gatePassed = false;         // 「▶ 再生をはじめる」を押した
        let gateShownAt = Date.now();
        let volumeHoldUntil = 0;

        /** 音を出せる状態にする（人が触ったあとに呼ぶこと。触る前に呼んでも効かない） */
        function applyVolume(force = false) {
            let done = false;
            for (const v of document.querySelectorAll('video')) {
                if (!Number.isFinite(v.duration) || v.duration < 300) continue;   // 予告などの短い動画は触らない
                try {
                    if (force || v.muted) v.muted = false;
                    if (force || v.volume < FULL_VOLUME - 0.01) v.volume = FULL_VOLUME;
                    done = true;
                } catch { /* プレイヤーが受け付けないことがある */ }
            }
            return done;
        }

        /**
         * Amazon の再生ボタンを探す。**「続きを観る」を先に**（途中から見ている人の位置を保つため）。
         * 文字で探すのは、Amazon の作りが変わっても当たるようにするため（class 名はよく変わる）
         */
        function findPlayButton() {
            const ORDER = [/続きを観る/, /今すぐ観る/, /^再生$/, /最初から(再生|観る)/];
            const cands = Array.from(document.querySelectorAll('a, button, [role="button"]'))
                .filter((el) => {
                    const r = el.getBoundingClientRect();
                    if (r.width < 20 || r.height < 20) return false;
                    const s = (el.textContent || '').replace(/\s+/g, ' ').trim();
                    return s.length > 0 && s.length <= 20;
                });
            for (const re of ORDER) {
                const hit = cands.find((el) => re.test((el.textContent || '').replace(/\s+/g, ' ').trim()));
                if (hit) return hit;
            }
            return null;
        }

        /**
         * Amazon の再生ボタンを代わりに押す。**プレイヤーが出ているときは押さない**
         * （本編の上で押すと、最初から再生し直しになることがある）
         */
        function clickPlayOnce() {
            if (playerReady || mainVideo()) return false;
            const btn = findPlayButton();
            if (!btn) return false;
            try { btn.click(); return true; } catch { return false; }
        }

        /** 待機画面を閉じて、本編へ進む（人が押したときだけ呼ぶ） */
        function passGate() {
            gatePassed = true;
            touched = true;
            volumeHoldUntil = Date.now() + VOL_HOLD_MS;
            /*
             * まだプレイヤーが出ていなければ、Amazon のボタンを代わりに押す。
             * **出ているときは押さない**（本編の上で押すと、最初から再生し直しになることがある）
             */
            clickPlayOnce();
            /*
             * 押した直後はまだページが出来上がっていないことがあり、ボタンが見つからない。
             * **見つからなかったときだけ**、少しあとにもう2回だけ試す（プレイヤーが出たら何もしない）。
             * 「何度も play() を呼ぶ」のは Android で Amazon のプレイヤーを壊したので、やらない
             * （README「Android で再生できない＝Firefox の DRM が壊れていた」の前に踏んだ失敗）
             */
            setTimeout(clickPlayOnce, 3000);
            setTimeout(clickPlayOnce, 8000);
            applyVolume(true);
            const v = mainVideo();
            if (v && v.paused && hostPlaying) v.play().catch(() => {});
            if (connected) socket.emit('request-sync');
            q('.gate').hidden = true;
            render();
        }

        q('.ggo').addEventListener('click', passGate);
        q('.gnotetext').addEventListener('click', (e) => {
            // 「Amazon の画面を見る」（ログインやプロフィール選びが隠れているとき用）
            if (e.target && e.target.classList.contains('gescape')) { gatePassed = true; q('.gate').hidden = true; render(); }
        });

        // --- 再生が止められたとき ------------------------------------------------
        // iPhone は、人が触っていないと動画を再生できないことがある。
        // ホストは再生中なのにこちらが止まったままなら、タップしてもらう
        let blockedSince = 0;
        q('.tap').addEventListener('click', () => {
            const v = mainVideo();
            if (v) v.play().catch(() => {});
            socket.emit('request-sync');
            blockedSince = 0;
            render();
        });
        setInterval(() => {
            const v = mainVideo();
            const stuck = v && hostPlaying && !selfAd && !otherVideo && !hostHold && v.paused;
            // Android でまだ画面に触っていないなら、止まっていなくてもすぐ「タップして再生」を出す
            // （作品ページの段階では出さない。そこでは「続きを観る」を押すこと自体が、画面に触ったことになる）
            if (connected && !otherVideo && !hostHold && waitingGesture()) {
                const lv = layoutVideo();
                const shownPlayer = Boolean(lv) && lv.videoHeight > 0 && lv.getBoundingClientRect().width >= 200;
                blockedSince = shownPlayer ? (blockedSince || (Date.now() - PLAY_BLOCKED_MS - 1)) : 0;
                render();
                return;
            }
            blockedSince = stuck ? (blockedSince || Date.now()) : 0;
            render();
        }, 1000);

        /*
         * 「1回タップ」の知らせは、触ったら（PC はマウスを動かしたら）消す。そのまま Amazon の操作ボタンが出て、時間表示を読める。
         * 出してから少し待ってから数える（出た瞬間の動きで消えないように）
         */
        let clockShownAt = 0;
        let clockDismissed = false;
        for (const type of IS_DESKTOP ? ['mousemove', 'pointerdown', 'keydown'] : ['pointerdown', 'touchstart']) {
            window.addEventListener(type, () => {
                if (!clockShownAt || clockDismissed || Date.now() - clockShownAt < 800) return;
                clockDismissed = true;
                q('.clock:not(.adwait)').hidden = true;
            }, { capture: true, passive: true });
        }

        /** いまホストとのずれを比べてよい状態か（広告・作品の切り替え・準備中は比べない） */
        function comparable() {
            return connected && hasHost && hostPlaying && !hostAd && !selfAd && !otherVideo && !hostHold && playerReady &&
                !waitingGesture() && hostRef && Date.now() - hostRef.at < 20000 && mine && Date.now() - mine.at < 8000;
        }

        function watchSync() {
            let drift = null;
            let stalled = false;
            if (comparable()) {
                const expected = hostRef.t + (Date.now() - hostRef.at) / 1000;
                drift = Math.round((mine.t - expected) * 10) / 10;
                stalled = mine.paused;
            }
            const now = Date.now();
            const bad = drift !== null && (stalled || Math.abs(drift) > DRIFT_SHOW_SEC);
            if (!bad) { troubleSince = 0; trouble = null; }
            else {
                if (!troubleSince) troubleSince = now;
                trouble = stalled ? 'stalled' : 'drift';
            }
            // ホストの一覧と記録へ。ずれがあるときは15秒ごと、無いときは1分ごと
            const gap = bad || (drift !== null && Math.abs(drift) >= 3) ? 15000 : 60000;
            if (connected && now - lastSyncReportAt >= gap) {
                lastSyncReportAt = now;
                socket.emit('sync-report', { drift, stalled, t: mine ? mine.t : null, service: PAGE_SERVICE, nf: bad ? nfDiag : null });
            }
        }

        /** 立て直すときに開くアドレス（ホストのいまの作品を、今と同じサイトで開く） */
        function reopenUrl(v) {
            const script = { version: target.latest, date: target.latestDate, hub: target.hub };
            const open = PAGE_SERVICE === 'netflix' ? U.urls.netflixWeb
                : location.hostname === 'www.primevideo.com' ? U.urls.primeVideoWeb : U.urls.primeWeb;
            return v ? open(v, target.room, target.name, false, script) : null;
        }

        /*
         * 再生を立て直す（2026-09-14 ユーザー要望: ゲストの画面で再生されないことが時々あり、ゲストが困る）。
         * ホストのいまの作品を開き直す。自動の立て直し（一度止めて位置を取り直す）で直らなかったとき用。
         * 開き直すとプレイヤーが最初から読み込み直すので、読み込みが止まった状態からも抜けられる
         */
        function fixPlayback() {
            try { sessionStorage.setItem(FIX_KEY, String(Date.now())); } catch { /* 使えない設定 */ }
            socket.emit('sync-report', { drift: null, stalled: trouble === 'stalled', t: mine ? mine.t : null, service: PAGE_SERVICE, fix: true, nf: nfDiag });
            const url = hostVideo && hostVideo.service === PAGE_SERVICE ? reopenUrl(hostVideo) : null;
            setTimeout(() => { if (url) location.href = url; else location.reload(); }, 200);
        }

        /** 広告の入った動画なのに、画面の時間表示での答え合わせ（目印）がまだ無いか */
        function needsClock() {
            if (!planInfo || !Array.isArray(planInfo.lens) || !Array.isArray(planInfo.anchors)) return false;
            const ads = planInfo.lens.reduce((s, l) => s + (Number(l) || 0), 0);
            return ads > 1 && planInfo.anchors.length === 0;
        }

        function render() {
            q('.dot').className = 'dot' + (connected ? ' on' : '');
            /*
             * **広告のぶん遅れて見ている間は、それが分かるように出す**（2026-09-21 ユーザー要望）。
             * ゲストの広告が明けてもホストへは追いつかない（追いつくには広告のぶんを飛ばすことになり、
             * 映画だと話が分からなくなる）。合わせたい人は、シークバーを動かすか開き直してもらう。
             */
            const hostNow = hostRef ? hostRef.t + (hostPlaying ? (Date.now() - hostRef.at) / 1000 : 0) : null;
            /*
             * 自分の本編時間は、**届いたばかりのものだけ**を使う（2026-09-21）。
             * 古い値のままだと、ホストが先へ飛んだ直後に「20分遅れています」と誤って出た。
             */
            const myFresh = contentT !== null && Date.now() - contentTAt < 3000;
            /*
             * **出すのは「広告ぶんとして有り得る遅れ」だけ**（8秒〜5分）。
             * 本編の時間は広告の換算を通すので、ホストが大きく飛んだ直後などに古い値が残り、
             * 「20分遅れています」と誤って出た（2026-09-21 テスト）。広告は長くても数分なので、そこで切る。
             */
            const lag = (hostNow !== null && myFresh) ? hostNow - contentT : null;
            const adLagSec = (lag !== null && hostPlaying && playerReady
                && !selfAd && !hostAd && !otherVideo && !hostHold
                && lag >= DRIFT_SHOW_SEC && lag <= 300) ? lag : null;
            q('.text').textContent =
                !connected ? 'KINUGAWA Party Theater つないでいます…'
                : !hasHost ? 'ホストの接続が切れました（戻るまで、このまま再生します）'
                : hostHold ? 'ホストが次の作品を選んでいます'
                : otherVideo ? 'ホストが別の作品に変えました'
                : selfAd ? '広告のあと、ホストに合わせます'
                : hostAd ? 'ホストの広告が終わるのを待っています'
                : hostEvent && Date.now() < hostEvent.until ? hostEvent.text
                : hostRef && !hostPlaying && playerReady ? '⏸ ホストが一時停止しています'
                /*
                 * 2026-09-16 ユーザー要望: 「再生ボタンを押してください」より「入り直してください」のほうが確実。
                 * 動画を掴めないときは、その場で押しても直らないことが多く、招待ページから開き直すと直る
                 */
                : !playerReady ? (Date.now() - openedAt > 10000
                    ? '動画が始まらないときは、招待ページから開き直してください' : '動画が始まるのを待っています')
                // 広告の入った動画で、まだ画面の時間表示で答え合わせできていない（操作ボタンを出してもらうと読める。2026-09-14）
                : needsClock() ? (IS_DESKTOP ? '合わせています。マウスを画面の上で動かしてください（広告の時間を確かめます）'
                    : '合わせています。画面を1回タップしてください（広告の時間を確かめます）')
                : adLagSec !== null ? `⏱ 広告のぶん遅れて視聴中（${fmtLag(adLagSec)}）`
                : 'ホストに自動で合わせています';
            // チャット欄を開いている間は、左下の表示が後ろに隠れるので見出しにも出す
            q('.hstate').textContent = q('.text').textContent;
            q('.hstate').style.color = connected && hasHost && !otherVideo && !hostHold ? '#3ddc84' : '#ffb340';
            q('.tap').hidden = !(blockedSince && Date.now() - blockedSince > PLAY_BLOCKED_MS);
            /*
             * **動画をまだ掴めていない間は、真ん中に「そのまま待って」と出す**（2026-09-21 ユーザー要望）。
             * 左下に小さく「動画が始まるのを待っています」と出していたが、作品ページでは気づかず、
             * 「続きを観る」などのボタンを押してしまっていた。
             */
            const waitingPlayer = connected && hasHost && !otherVideo && !hostHold && !playerReady && q('.tap').hidden;
            const clock = connected && hasHost && !otherVideo && !hostHold && playerReady && needsClock() && !clockDismissed && q('.tap').hidden;
            const center = q('.clock:not(.adwait)');
            // 出す中身が切り替わったときだけ書き換える（毎秒書き換えると、字が一瞬消えてちらつく）
            const centerKind = waitingPlayer ? 'wait' : clock ? 'gesture' : '';
            if (centerKind && center.dataset.kind !== centerKind) {
                center.dataset.kind = centerKind;
                const note = document.createElement('small');
                if (centerKind === 'wait') {
                    center.textContent = '▶ 再生が始まるまで、何もせずにお待ちください';
                    note.textContent = '自動でプレイヤーが起動します。ボタンは押さなくて大丈夫です。'
                        + '開かない場合は、招待ページから開きなおしてください';
                } else {
                    center.textContent = IS_DESKTOP ? '🖱 マウスを画面の上で動かしてください' : '👆 画面を1回タップしてください';
                    note.textContent = IS_DESKTOP
                        ? '広告の時間を確かめて、ホストにぴったり合わせます（動かすと消えます）'
                        : '広告の時間を確かめて、ホストにぴったり合わせます（タップすると消えます）';
                    clockShownAt = Date.now();   // 「1回タップ」の方だけ、出してからの時間を数える
                }
                center.appendChild(note);
            }
            if (!centerKind) center.dataset.kind = '';
            center.hidden = !centerKind;
            if (centerKind) {
                const cv = layoutVideo();
                const cr = cv ? contentRect(cv) : null;
                center.style.top = cr && cr.height > 0 ? `${Math.round(cr.top + cr.height / 2)}px` : '40%';
            }
            if (!q('.tap').hidden) {
                // 見えている映像の真ん中へ（映像が見つからなければ画面の少し上）
                const v = layoutVideo();
                const r = v ? contentRect(v) : null;
                q('.tap').style.top = r && r.height > 0 ? `${Math.round(r.top + r.height / 2)}px` : '40%';
            }
            const other = q('.other');
            // 今と同じサイト（amazon.co.jp / primevideo.com）で開く
            const url = otherVideo ? reopenUrl(otherVideo) : null;
            if (url) {
                other.href = url;
                other.textContent = '▶ ホストの作品を開く';
                const sub = document.createElement('small');
                sub.textContent = 'ホストが別の作品（話）に変えました。押してください';
                other.appendChild(sub);
                other.hidden = false;
            } else {
                other.hidden = true;
            }
            // 止まったまま・大きくずれたままが続いたら、立て直しを真ん中に（「このまま見る」を押したら2分は出さない）
            // 「▶ タップして再生」が出ていても20秒直らなければ、こちらに替える（タップでは直らない止まり方）
            const fixShown = Boolean(trouble) && troubleSince && Date.now() - troubleSince > TROUBLE_SHOW_MS &&
                Date.now() - fixDismissedAt > 120000 && other.hidden;
            if (fixShown) q('.tap').hidden = true;
            if (fixShown) {
                q('.fix .fmsg').textContent = trouble === 'stalled'
                    ? '⚠ 再生が止まっています' : '⚠ ホストとずれています';
            }
            q('.fix').hidden = !fixShown;
            // ホストの広告の間はこちらを止めて待つ。止まった理由を真ん中に出す（2026-09-14 ユーザー報告: 再生されたと思ったらすぐ止まる）
            q('.adwait').hidden = !(connected && hasHost && hostAd && !selfAd && !otherVideo && !hostHold && playerReady && !fixShown && q('.clock:not(.adwait)').hidden);

            // --- 待機画面と音量（2026-09-23）------------------------------------
            renderGate();
        }

        /**
         * 待機画面（Amazon のメニューを覆う「待合室」）と、音量のボタンの出し入れ。
         * 押すまでは覆ったまま。押したら二度と出さない（gatePassed）
         */
        function renderGate() {
            const gate = q('.gate');
            /*
             * **すでに音が出て再生中なら、待機画面は出さない**。
             * 待機画面は「音の出る再生の許可をもらう」ためのものなので、もう出ているなら用がない。
             * 出したままだと映像を隠してしまう（PC や、開き直したあとがこれに当たる）
             */
            if (!gatePassed) {
                const playing = mainVideo();
                if (playing && !playing.paused && !playing.muted && playing.volume > 0.05) gatePassed = true;
            }
            if (!gatePassed) {
                gate.hidden = false;
                /*
                 * ボタンは**つながってから**出す。つながる前に押されると、ホストの位置を知らないまま
                 * 頭から再生が始まってしまう（押したあとに合わせ直されるが、ゲストには故障に見える）
                 */
                q('.ggo').hidden = !connected;
                const waited = Date.now() - gateShownAt;
                q('.gmsg').textContent = !connected
                    ? (waited > 10000 ? 'つながりません。電波の良いところで、招待ページから開き直してください' : 'つないでいます…')
                    : !hasHost ? 'ホストがまだ来ていません。先に入って待てます'
                    : hostPlaying ? 'ホストはもう見ています。押すと途中から合流します'
                    : 'ホストの再生を待っています。先に押して待てます';
                const who = q('.gtitlename');
                who.hidden = !connected;
                who.textContent = `ルーム ${target.room}${people > 1 ? `・${people}人が待っています` : ''}`;
                // 押すまで進まないので、待たせすぎたら Amazon の画面を見る逃げ道を出す（ログインやプロフィール選びが隠れている場合）
                const note = q('.gnotetext');
                const stuck = Date.now() - gateShownAt > GATE_ESCAPE_MS;
                note.hidden = !stuck;
                if (stuck && !note.dataset.on) {
                    note.dataset.on = '1';
                    note.textContent = 'ログインやプロフィールの選択が出ているかもしれません。';
                    const a = document.createElement('button');
                    a.type = 'button';
                    a.className = 'gescape';
                    a.textContent = 'Amazon の画面を見る';
                    a.style.cssText = 'margin-left:6px;border:0;background:transparent;color:#7aa2ff;font:inherit;text-decoration:underline;cursor:pointer;';
                    note.appendChild(a);
                }
                return;
            }
            gate.hidden = true;

            /*
             * 押したあとしばらくは音量を最大に保つ。Prime は読み込み直すたびに音量を戻すので、
             * 1回入れただけでは消音に戻ることがある。
             * **保つのは押してから 30 秒だけ**。ずっと張り付くと、見ている人が Prime 側で下げた音量を
             * こちらが戻し続けてしまう。そのあとの調整は**端末の物理ボタン**で行う（2026-09-23 ユーザー判断）
             */
            const v = mainVideo();
            // 押したときにプレイヤーがまだ無いこともある。**出てくるまで待つ**（出てから 30 秒を数える）
            if (!v) volumeHoldUntil = Math.max(volumeHoldUntil, Date.now() + VOL_HOLD_MS);
            if (Date.now() < volumeHoldUntil) applyVolume();
        }
        render();
    }

    /** 本編の <video>。拡張機能と同じ基準（5分以上で最長） */
    /*
     * 縦持ちでは、映像を画面の一番上へずらす（2026-09-14 ユーザー要望）。
     * 実際に映像が映っている位置（contentRect）を計算して、その上端が画面の上端に来るだけ要素ごと上へずらす。
     *   - Amazon … 画面の高さいっぱいの箱の真ん中に映像（Android 実機のスクリーンショット）
     *   - Netflix … 画面より縦に長い箱（1134px）を真ん中に置き、その真ん中に映像（本物の Netflix で確認）
     * 以前は「映像を箱の上端に寄せる（object-position）」にしていたが、Netflix では箱の上端が画面の外（-145px）で、
     * 映像の上が切れた。どちらの作りでも効くよう、映っている位置からの計算に揃えた。
     * どれだけずらしたかを覚えておき、測り直すたびに元の位置から計算し直す（ずらしが積み重ならないように）。
     */
    /*
     * 2026-09-14 ユーザー実機: 上へ寄せた映像の上が切れた（Android は大きく、iPhone も少し）。
     * 以前はページの上端（0）に合わせていたが、見えている範囲の上端はそこより下のことがある
     * （iPhone の時刻の帯＝安全領域、見えている範囲のずれ visualViewport.offsetTop）。見えている上端に合わせる。
     * 上にはみ出している映像は下へずらす（want が負）。
     */
    /*
     * プレイヤーの箱を映像の大きさに縮めて、画面の一番上に固定する（2026-09-16 ユーザー案）。
     *
     * これまでは「箱ごと上へずらす」「中の映像だけ上へ寄せる」を試したが、どちらも
     * プレイヤーの操作ボタン（字幕・全画面）や字幕が、画面の外やチャット欄の裏へ行ってしまった。
     * 箱は画面の高さいっぱいで、その中に映像が上下の黒帯つきで入っているのが原因。
     * **箱そのものを映像の高さに縮めれば**、箱の中に置かれている操作ボタンも字幕も、映像の中に収まる。
     * 縮めたうえで、箱の上端を見えている範囲の上端に合わせる（translate）。
     * 縦持ちのときだけ。横持ち・PC・再生画面でなくなったときは元に戻す
     */
    function fitPlayerToVideo(video, portrait, visibleTop = 0) {
        /*
         * 打っている間も合わせ直す（2026-09-16 実機）。iPhone はキーボードを出すと画面全体を上へずらすので、
         * 止めてしまうと映像が画面の外へ出てしまった。毎回合わせ直せば、見た目の位置は変わらない
         */
        const frame = playerFrame(video);
        const vw = video.videoWidth, vh = video.videoHeight;
        const box = video.getBoundingClientRect();
        /*
         * **Android でも箱を縮める**（2026-09-20 ユーザー提案で再挑戦）。
         * 2026-09-14 に「Android では映像やその外枠に触ると保護された動画が再生できなくなる」と結論して
         * v0.21.1 で除外したが、**当時の再生不能は DRM 側の問題と混ざっていた疑いが濃い**
         * （2026-09-20 に Firefox の入れ直し＋「ログインしたままにする」で再生できるようになった）。
         * Android は video 要素が画面いっぱい（実測 414×767）で、実際の映像はその上の 172px だけ。
         * 残りの黒い余白が場所を食い、チャット欄の入力フォームがキーボードの下に隠れていた。
         * **もし再生できなくなったら、この条件に IS_ANDROID を戻すこと。**
         */
        if (!portrait || IS_DESKTOP || !vw || !vh || !(box.width > 0)) { resetPlayerFit(video, frame); return; }

        /*
         * 映像の縦横比から、この幅での高さを出す（画面より高くはしない）。
         * **ここの高さを変えると映像が書き換わり、プレイヤーが読み込み直して同期が壊れる**
         * （2026-09-21: メニューが切れる対策で下限 360px を入れたら、テストでホストと 19.6 秒ずれた）。
         * 見た目の都合でこの値をいじらないこと。
         */
        const want = Math.min(Math.round(box.width * vh / vw), Math.round(window.innerHeight * 0.75));
        if (Math.abs(Math.round(box.height) - want) > 2) {
            // 縮める前の高さを覚えておく（プレイヤーの層かどうかの見分けに使う。tidyAround）
            if (!video.dataset.wpFitFrom) video.dataset.wpFitFrom = String(Math.round(box.height));
            frame.style.setProperty('height', `${want}px`, 'important');
            /*
             * 箱を縮めると、その中に描かれるプレイヤーのメニュー（字幕・音声の設定）が下で切れる
             * （2026-09-21 Android 実機）。はみ出しても描けるようにする
             */
            frame.style.setProperty('overflow', 'visible', 'important');
            if (frame !== video) video.style.setProperty('height', '100%', 'important');
            video.dataset.wpFit = String(want);
        }
        // 縮めた箱を、見えている範囲の上端へ
        const applied = Number(video.dataset.wpShift || 0);
        const top = frame.getBoundingClientRect().top + applied;
        const d = Math.round(top - visibleTop);
        if (Math.abs(d - applied) > 2) {
            if (d) frame.style.setProperty('translate', `0 ${-d}px`, 'important');
            else frame.style.removeProperty('translate');
            video.dataset.wpShift = String(d);
        }
    }

    function resetPlayerFit(video, frame = playerFrame(video)) {
        if (video.dataset.wpFit) {
            frame.style.removeProperty('height');
            frame.style.removeProperty('overflow');
            if (frame !== video) video.style.removeProperty('height');
            delete video.dataset.wpFit;
            delete video.dataset.wpFitFrom;
        }
        if (Number(video.dataset.wpShift || 0)) {
            frame.style.removeProperty('translate');
            delete video.dataset.wpShift;
        }
        video.style.removeProperty('object-position');
    }


    /**
     * 映像と同じ大きさで映像を包んでいる、いちばん外側の要素（プレイヤーの外枠）。操作ボタンの層もこの中にある。
     * body / html と、大きさの違う要素の手前で止める。見つからなければ映像そのもの。
     * 以前ずらした要素と変わったら、前の要素のずらしは戻す
     */
    let lastFrame = null;
    function playerFrame(video) {
        const vb = video.getBoundingClientRect();
        let frame = video;
        for (let el = video.parentElement; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
            const r = el.getBoundingClientRect();
            if (Math.abs(r.width - vb.width) > 2 || Math.abs(r.height - vb.height) > 2) break;
            frame = el;
        }
        if (lastFrame && lastFrame !== frame) lastFrame.style.removeProperty('translate');
        lastFrame = frame;
        return frame;
    }

    /**
     * 実際に映像が映っている範囲。映像は箱の中に縦横比を保って収まる（object-fit: contain）ので、
     * 箱の大きさと映像の縦横比から計算する。縦横比が分からないとき（読み込み前）は箱そのもの。
     */
    function contentRect(video) {
        const box = video.getBoundingClientRect();
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh || !box.width || !box.height) return box;
        const scale = Math.min(box.width / vw, box.height / vh);
        const h = vh * scale;
        // 箱の中での縦の位置（object-position の縦。ふつうは 50% ＝真ん中）
        const posY = String(getComputedStyle(video).objectPosition || '50% 50%').split(/\s+/)[1] || '50%';
        const ratio = /%$/.test(posY) ? parseFloat(posY) / 100 : posY === 'top' ? 0 : posY === 'bottom' ? 1 : 0.5;
        const top = box.top + (box.height - h) * (Number.isFinite(ratio) ? ratio : 0.5);
        return { top, bottom: top + h, height: h, width: vw * scale, left: box.left };
    }

    /** 画面に見えている一番大きな <video>（チャット欄の置き場所を決める用。長さが分からなくてもよい） */
    function layoutVideo() {
        // 本編（5分以上の動画）が画面に出ていればそれ。Amazon のページには予告などの別の <video> もある
        const main = mainVideo();
        if (main) {
            const r = main.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) return main;
        }
        let best = null;
        let area = 0;
        for (const v of document.querySelectorAll('video')) {
            const r = v.getBoundingClientRect();
            const a = Math.max(0, r.width) * Math.max(0, r.height);
            if (a > area) { area = a; best = v; }
        }
        return best;
    }

    function mainVideo() {
        const vids = Array.from(document.querySelectorAll('video'))
            .filter(v => Number.isFinite(v.duration) && v.duration >= 300);
        return vids.length ? vids.reduce((a, b) => (b.duration > a.duration ? b : a)) : null;
    }

    return { readRoom, start };
})();


    // 友達の画面の「🌐 ブラウザで見る」から開いたタブだけで動く。ふだんの Amazon には何もしない
    const target = WP_SHIM.readRoom();
    if (!target) return;
    // extension/content/prime-plan.js（ページの通信を見張る）は入れない。広告の入る位置はホストの PC から届く（2026-09-14）
    WP_SHIM.start(target);

    // ---- extension/adapters/base.js ----
// Watch Party adapters/base.js（2026-09-16 Defender の誤検知で消されたため、同じ中身で戻したもの）
/**
 * サービスアダプタの基底クラス。
 *
 * サービスごとの差異はすべてこのインターフェースの内側に閉じ込める。
 * ここさえ守れば、対応サービスの追加は adapters/ にファイルを1枚足すだけで済む。
 *
 * 実装が必要なもの:
 *   static match(url)  … このアダプタが担当する URL か
 *   ready()            … プレイヤーが操作可能になるまで待つ
 *   getCurrentTime()   … 秒
 *   getDuration()      … 秒
 *   isPaused()
 *   isInAd()           … 広告を再生中か（広告の無いサービスは false のまま）
 *   play() / pause()
 *   seek(seconds)
 *   onStateChange(cb)  … cb({ type: 'play'|'pause'|'seek', currentTime })
 *   getContentId(url)  … ルーム共有用の作品 ID
 *   buildUrl(contentId)… 参加者を飛ばす先の URL
 */
(() => {
    class ServiceAdapter {
        /** @returns {string} サービス識別子 */
        static get service() { return 'base'; }

        /** @param {string} _url */
        static match(_url) { return false; }

        constructor() {
            this._listeners = [];
            this._diagListeners = [];
        }

        async ready() { throw new Error('not implemented'); }
        getCurrentTime() { throw new Error('not implemented'); }
        getDuration() { return NaN; }
        isPaused() { throw new Error('not implemented'); }
        isInAd() { return false; }
        /** プレイヤーが画面に開いているか */
        isPlayerOpen() { return false; }
        /**
         * URL が変わっても作品の切り替えとみなさないか。
         * 既定はプレイヤーが開いている間（Prime は再生を始めると同じ作品の URL を書き換える）。
         * Netflix のように、URL の変化がそのまま別の話数を意味するサービスは false を返す。
         */
        ignoreUrlChange() { return this.isPlayerOpen(); }
        /** ホストになったとき、ゲストとして合わせていた状態の強制をやめる（人の操作を邪魔しない） */
        releaseControl() {}
        /** 広告の見分けがうまくいっているかを確かめるための、ページの様子の記録 */
        describeForDiag() { return {}; }
        /**
         * サービス側の確認ダイアログ（Netflix の「まだ見ていますか？」など）を進める。
         * ホストのときだけ呼ばれる。押したら true。
         */
        dismissInterruption() { return false; }
        play() { throw new Error('not implemented'); }
        pause() { throw new Error('not implemented'); }
        seek(_seconds) { throw new Error('not implemented'); }
        getContentId(_url) { return null; }
        buildUrl(_contentId) { return null; }
        /**
         * スマホのアプリを開くときに使う、サービス内部の作品 ID（無ければ null）。
         * Prime は ASIN ではアプリが作品ページで止まるので、アプリ本来の形（GTI）を渡してみる。
         */
        getAppId() { return null; }

        onStateChange(cb) {
            this._listeners.push(cb);
            return () => {
                this._listeners = this._listeners.filter(f => f !== cb);
            };
        }

        /**
         * 記録に残したい出来事（広告らしきものの出入りなど）を受け取る。
         * 見分け方をまだ実機で確かめられていないサービスで、手がかりを集めるのに使う。
         */
        onDiag(cb) {
            this._diagListeners.push(cb);
            return () => {
                this._diagListeners = this._diagListeners.filter(f => f !== cb);
            };
        }

        /** @protected 派生クラスから記録を送る */
        _reportDiag(event, extra = {}) {
            let payload;
            try { payload = { event, ...this.describeForDiag(), ...extra }; }
            catch (e) { payload = { event, describeFailed: String(e && e.message) }; }
            for (const cb of this._diagListeners) {
                try { cb(payload); } catch (e) { console.error('[wp] diag listener error', e); }
            }
        }

        /** @protected 派生クラスから状態変化を通知する */
        _emit(type) {
            const payload = { type, currentTime: this.getCurrentTime() };
            for (const cb of this._listeners) {
                try { cb(payload); } catch (e) { console.error('[wp] listener error', e); }
            }
        }

        /**
         * 条件が満たされるまで待つ。プレイヤーの生成待ちに使う。
         * @param {() => any} probe 真値を返したら解決
         * timeoutMs に Infinity を渡すと期限なしで待つ。
         */
        static waitFor(probe, { intervalMs = 300, timeoutMs = 60_000 } = {}) {
            return new Promise((resolve, reject) => {
                const started = Date.now();
                const tick = () => {
                    let value;
                    try { value = probe(); } catch { value = null; }
                    if (value) return resolve(value);
                    if (Date.now() - started > timeoutMs) {
                        return reject(new Error('waitFor timed out'));
                    }
                    setTimeout(tick, intervalMs);
                };
                tick();
            });
        }
    }

    globalThis.WPAdapters = globalThis.WPAdapters || { list: [] };
    globalThis.WPAdapters.Base = ServiceAdapter;
})();

    // ---- extension/adapters/prime.js ----
/**
 * Prime Video アダプタ。
 *
 * Prime のプレイヤーは HTML5 <video> なので、要素を直接掴んで currentTime を読み書きできる
 * （Netflix はこれが効かないため内部 API が要る）。
 *
 * 面倒な点は3つ。
 *   1. 要素の特定。作品ページでは予告編が自動再生され、SPA 遷移で要素ごと差し替わり、
 *      本編の長さは読み込みが進んでから確定するので、定期的に選び直す。
 *   2. プレイヤーが <video> の外に自前の状態を持っていて、直接の操作と食い違う（下の ENFORCE）。
 *   3. 広告が本編と同じ <video> に差し込まれる（下の「広告と本編の時間」）。
 *
 * このアダプタが外に見せる時間（getCurrentTime / seek）は、広告を除いた「本編の時間」。
 */
(() => {
    const Base = globalThis.WPAdapters.Base;

    // amazon.co.jp の作品 ID。ASIN（B で始まる10桁）のほか、再生を始めると
    // 26桁前後の別形式（GTI）の URL に書き換えられる。途中で切らないよう区切りまで取る
    // GTI（amzn1.dv.gti.…）でも開ける。ドラマの話を指定して開くのに使う（2026-09-14）
    const AMAZON_ID = /\/(?:dp|gp\/video\/detail)\/([A-Z0-9]{10}|[A-Z0-9]{20,40}|amzn1\.dv\.gti\.[0-9a-f-]{36})(?=[/?#]|$)/;
    const PRIMEVIDEO_ID = /primevideo\.com\/(?:region\/[a-z]{2}\/)?detail\/([A-Za-z0-9.]+)/;

    // これより短い動画は予告編とみなして掴まない（秒）。
    // 予告編は長くても数分。これを掴むとホストの予告編の再生が参加者に配られてしまう。
    const MIN_MAIN_DURATION_SEC = 300;

    const RESCAN_MS = 1000;

    /*
     * 実機で確認した挙動:
     *   - シーク中は自分で一時停止し、終わると（seeked）自分の状態に従って再生を再開する。
     *     → 「シーク → 一時停止」は、この再開で一時停止が打ち消される
     *   - シーク中に play() されると、それを捨てて一時停止し、終わっても再開しない。
     *     → 「シーク → 再生」は止まったままになる
     * そこで play() / pause() は「こうなってほしい」という希望として持ち、シークが終わるのを
     * 待って実際の状態を合わせ直す。一定時間たったら希望は捨てる（人が操作したときに邪魔しない）。
     */
    const ENFORCE_MS = 5000;
    const ENFORCE_TICK_MS = 250;

    /*
     * 広告と本編の時間（実機の記録で確認）:
     *   広告は本編と同じ <video> で流れ、その間も currentTime は進む。
     *   例: 冒頭に64秒の広告 → currentTime 0〜64 が広告、64 から本編の 0:00 が始まる。
     *   広告の長さ・回数は人によって違うので、currentTime のままでは合わせられない。
     *
     *   画面の経過時間表示は操作ボタンが出ている間しか DOM に無いので使えない。
     *   代わりに「広告 1:04」のカウントダウンが出ている間に進んだ時間を自分で測って記録し、
     *   本編の時間 = currentTime − それまでの広告の合計 として扱う。
     *   ページを読み込み直すと <video> の時間は本編の時間から始め直しになる（広告の記録も捨てる）。
     */
    // 「広告 1:04」（PC）。間に「(1/2)」「・」などが挟まっても拾う。英語表示の「Ad 0:15」も。
    // 間に文字（「広告付きで視聴」など）が入るものは広告のカウントダウンとみなさない
    // 「広告の終了後に、引き続きビデオが再生されます」… 広告の位置を飛び越えてシークしたときに流れる広告の表示
    // （残り時間が文の前に付く。2026-09-14 PC の Chrome で、これを見落として広告中に位置合わせを繰り返し、読み込みが終わらなくなった）
    const AD_COUNTDOWN = /(?:広告|\bAds?\b)[\s・·:：|()（）]*(?:\d+\s*(?:\/|of)\s*\d+[\s・·:：|()（）]*)?\d{1,2}:\d{2}|広告の終了後に/;
    const AD_LABEL = /広告|^\s*Ads?\b/;
    const AD_TRACK_MS = 250;
    // 1回の計測でこれ以上進んだら、広告の再生ではなくシークによる移動とみなす（秒）
    const AD_JUMP_SEC = 1.5;
    // これより短い「広告」は誤検知として捨てる（秒）
    const AD_MIN_SEC = 1.0;

    class PrimeAdapter extends Base {
        static get service() { return 'prime'; }

        static match(url) {
            return /^https:\/\/(www\.amazon\.co\.jp|www\.primevideo\.com)\//.test(url);
        }

        constructor() {
            super();
            this._video = null;
            this._detach = null;
            this._rescanTimer = null;
            this._want = null;          // 'play' | 'pause' | null
            this._wantUntil = 0;
            this._enforceTimer = null;
            this._ads = [];             // 終わった広告 { elemStart, elemEnd, len, contentPos }
            this._adOpen = null;        // 流れている広告 { elemStart, len, contentPos, lastElem }
            this._adEl = null;          // 見つけたカウントダウン表示（毎回ページを探すと重いので覚える）
            this._adTimer = null;
            this._anchors = [];         // 画面の時間表示で確かめた { content: 本編の秒, offset: そこまでの広告の合計 }
            this._clock = null;
            this._clockTick = 0;
        }

        async ready() {
            const video = await Base.waitFor(() => this._pickVideo(), { timeoutMs: Infinity });
            this._bind(video);
            this._watchForReplacement();
            this._trackAds();
            return this;
        }

        /**
         * 本編の <video> を選ぶ。
         * 予告編を掴まないよう、一定以上の長さのうち最も長いものを採用する。
         */
        _pickVideo() {
            const usable = Array.from(document.querySelectorAll('video')).filter(v =>
                v.isConnected &&
                Number.isFinite(v.duration) &&
                v.duration >= MIN_MAIN_DURATION_SEC
            );
            if (usable.length === 0) return null;
            if (usable.length === 1) return usable[0];

            /*
             * 本編の長さの <video> が複数あるとき（2026-09-16 実機: ホストがただ流しているだけで、ゲストが何度も冒頭へ戻された）。
             * Amazon は見えない所に同じ作品の <video> を用意していることがあり、長さだけで選ぶと、1秒ごとの選び直しで
             * 見えない方（位置 0）に乗り換え、その 0 秒をゲストへ送っていた。
             * 画面に出ていて、読み込みが済んで再生中のものを選ぶ。今掴んでいるものがそうなら乗り換えない
             */
            const score = (v) => {
                const r = v.getBoundingClientRect();
                return (r.width >= 50 && r.height >= 50 ? 4 : 0) + (!v.paused ? 2 : 0) + (v.readyState >= 2 ? 1 : 0);
            };
            const cur = this._video && usable.includes(this._video) ? this._video : null;
            let best = cur;
            for (const v of usable) {
                if (!best || score(v) > score(best) || (score(v) === score(best) && v !== cur && v.duration > best.duration)) best = v;
            }
            return best;
        }

        _bind(video) {
            if (this._video === video) return;
            if (this._detach) this._detach();

            this._video = video;
            // 別の <video> になったら時間の数え方も始め直し（プランは作品ごとなので、ここでは消さない）
            this._ads = [];
            this._adOpen = null;

            const onPlay = () => {
                // 止めてほしいのに始まった＝プレイヤーのシーク後の自動再開。止め直す
                if (this._activeWant() === 'pause') return this._reconcile();
                this._emit('play');
            };
            const onPause = () => {
                // シーク中の一時停止はプレイヤーが勝手に行うもの。人の操作ではないので知らせない
                // （知らせるとホストがシークするたびに全員が一瞬止まる）
                if (video.seeking) return;
                if (this._activeWant() === 'play') return this._reconcile();
                this._emit('pause');
            };
            const onSeeked = () => {
                this._reconcile();
                this._emit('seek');
            };

            video.addEventListener('play', onPlay);
            video.addEventListener('pause', onPause);
            video.addEventListener('seeked', onSeeked);

            this._detach = () => {
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
                video.removeEventListener('seeked', onSeeked);
            };

            console.log('[wp] prime: bound to video', video.duration);
        }

        /**
         * SPA 遷移で <video> が差し替わったら繋ぎ直す。
         * 要素の追加だけでなく長さの確定でも選び直す必要があり、DOM の変化では
         * 拾えないので定期的に見る（Amazon のページは DOM 変化が多く、
         * MutationObserver だと毎回全 video を走査することになり重い）。
         */
        _watchForReplacement() {
            if (this._rescanTimer) return;
            this._rescanTimer = setInterval(() => {
                const next = this._pickVideo();
                if (next && next !== this._video) this._bind(next);
            }, RESCAN_MS);
        }

        // --- 広告 -------------------------------------------------------------

        /** 広告のカウントダウン表示（「広告 1:04」）を探す。見つからなければ null */
        _adCountdown() {
            const visible = (el) => el.getBoundingClientRect().width > 0;
            const read = (el) => {
                const m = el.textContent.match(AD_COUNTDOWN);
                return m && visible(el) ? m[0].replace(/\s+/g, ' ') : null;
            };

            if (this._adEl && this._adEl.isConnected) {
                const hit = read(this._adEl);
                if (hit) return hit;
            }
            this._adEl = null;

            // 「広告」を含む短い文字を探し、そこから少し上がって残り時間と一緒になる要素を取る。
            // クラス名は難読化されていて変わるので使わない。
            // PC では「広告」だけの文字だったが、iPhone（スマホ用の画面）では見落としていた（2026-09-14）。
            // 「広告 · 0:15」「広告 (1/2)」のように一つにまとまっていても拾えるよう、含むかで見る
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const s = walker.currentNode.textContent;
                if (s.length > 30 || !AD_LABEL.test(s)) continue;
                let el = walker.currentNode.parentElement;
                for (let i = 0; i < 5 && el; i++, el = el.parentElement) {
                    if (el.textContent.length > 60) break;
                    const hit = read(el);
                    if (hit) { this._adEl = el; return hit; }
                }
            }
            return null;
        }

        isInAd() {
            const main = this._video;
            if (!main) return false;
            // プレイヤーが開いていないなら広告ではない
            if (!this.isPlayerOpen()) return false;
            return this._adCountdown() !== null;
        }

        isPlayerOpen() {
            return Boolean(this._video) && this._video.getBoundingClientRect().width >= 50;
        }

        /** 広告の始まりと終わりを見張り、広告に使われた時間を記録する */
        _trackAds() {
            if (this._adTimer) return;
            this._adTimer = setInterval(() => {
                const v = this._video;
                if (!v) return;
                const elem = v.currentTime;
                const inAd = this.isInAd();
                if (this._plan && ++this._clockTick % 4 === 0) this._readClock();   // 1秒ごと

                if (inAd && !this._adOpen) {
                    this._adOpen = { elemStart: elem, len: 0, contentPos: this._toContent(elem), lastElem: elem };
                } else if (inAd && this._adOpen) {
                    const step = elem - this._adOpen.lastElem;
                    // 普通に流れた分だけ数える。シークによる移動は広告の長さに入れない
                    if (step > 0 && step < AD_JUMP_SEC) this._adOpen.len += step;
                    this._adOpen.lastElem = elem;
                } else if (!inAd && this._adOpen) {
                    const ad = { ...this._adOpen, elemEnd: elem };
                    delete ad.lastElem;
                    this._adOpen = null;
                    // 同じ所の広告をもう一度通った（巻き戻して見直した等）なら二重に数えない
                    const dup = this._ads.some(a => Math.abs(a.elemStart - ad.elemStart) < 2);
                    if (ad.len >= AD_MIN_SEC && !dup) {
                        this._ads.push(ad);
                        this._ads.sort((a, b) => a.elemStart - b.elemStart);
                    }
                }
            }, AD_TRACK_MS);
        }

        /*
         * 広告の入る位置（content/prime-plan.js が再生情報から読んだもの。2026-09-14）。
         * Prime は広告を最初から <video> に差し込んでおくので、まだ流れていない広告も <video> の時間に入っている。
         * 位置が分かっていれば、広告の合計（<video> の長さ − 本編の長さ）を枠に割り振って換算できる。
         *   - 流れた広告は実際に測った長さを使う（_ads）
         *   - まだ流れていない枠には、残りを等分する（枠が1つなら正確）
         * own … このページ自身で読んだもの（ホストから届いたものより優先する）
         */
        setAdPlan(plan, own = false) {
            if (!plan || typeof plan !== 'object') return;
            const fullMs = Number(plan.fullMs);
            if (!Number.isFinite(fullMs) || fullMs < 300000 || !Array.isArray(plan.breaks)) return;
            if (this._plan && this._plan.own && !own && Math.abs(this._plan.fullSec - fullMs / 1000) < 1) return;
            const breaks = plan.breaks.map(Number).filter(ms => Number.isFinite(ms) && ms >= 0 && ms <= fullMs)
                .sort((a, b) => a - b).slice(0, 40).map(ms => ms / 1000);
            // 別の作品のプランになったら、画面の時間表示で確かめた目印も捨てる
            if (!this._plan || Math.abs(this._plan.fullSec - fullMs / 1000) >= 1) {
                this._anchors = [];
                this._clock = null;
                this._clockPrev = null;
            }
            this._plan = { fullSec: fullMs / 1000, breaks, own };
        }

        /*
         * 画面の時間表示で答え合わせする（2026-09-14 iPhone 実機）。
         * 等分だけでは外れた: 枠は冒頭・33分・103分、広告の合計 47 秒を 15.7 秒ずつ割り振ったが、
         * 実際は冒頭に広告が無く（動画の 18.8 秒で画面は「0:00:19」）、ゲストが 16 秒先へずれた。
         * 操作ボタンが出ている間は「経過 0:00:19」「残り 2:07:47」が見え、足すと本編の長さになる。
         * これで本物の本編の時間を読み、「その位置までの広告の合計 = <video> の時間 − 本編の時間」を目印（_anchors）に残す。
         */
        _readClock() {
            const plan = this._plan, v = this._video;
            if (!plan || !v || v.seeking || v.paused || this.isInAd()) return;
            const parse = (s) => {
                const m = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/.exec(s);
                return m ? (Number(m[1] || 0) * 3600 + Number(m[2]) * 60 + Number(m[3])) : null;
            };
            const visible = (n) => n.parentElement && n.parentElement.getBoundingClientRect().width > 0;
            let pair = null;
            // 前回見つけた表示がまだあればそれを読む（毎回ページ全体を探すと重い）
            if (this._clock && this._clock.every(n => n.isConnected && visible(n))) {
                pair = this._clock;
            } else {
                if (Date.now() - (this._clockScanAt || 0) < 3000) return;
                this._clockScanAt = Date.now();
                const found = [];
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                while (walker.nextNode() && found.length < 8) {
                    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(walker.currentNode.textContent.trim()) && visible(walker.currentNode)) {
                        found.push(walker.currentNode);
                    }
                }
                for (let i = 0; i + 1 < found.length && !pair; i++) {
                    const a = parse(found[i].textContent.trim()), b = parse(found[i + 1].textContent.trim());
                    if (a !== null && b !== null && Math.abs(a + b - plan.fullSec) <= 3) pair = [found[i], found[i + 1]];
                }
                this._clock = pair;
            }
            if (!pair) return;
            const content = parse(pair[0].textContent.trim());
            const rest = parse(pair[1].textContent.trim());
            if (content === null || rest === null || Math.abs(content + rest - plan.fullSec) > 3) return;
            // 表示が遅れて古いことがある（実機で 6 秒遅れの表示を見た）。続けて読んで、動画と同じだけ進んでいるときだけ使う
            const prev = this._clockPrev;
            this._clockPrev = { content, elem: v.currentTime, at: Date.now() };
            if (!prev || Date.now() - prev.at > 2500 || content === prev.content ||
                Math.abs((content - prev.content) - (v.currentTime - prev.elem)) > 1.2) return;
            // 表示は秒の切り捨てなので、半秒足した所を本編の時間とみなす
            const offset = v.currentTime - (content + 0.5);
            const total = v.duration - plan.fullSec;
            if (offset < -2 || offset > total + 2) return;
            this._anchors = (this._anchors || []).filter(a => Math.abs(a.content - content) > 30);
            this._anchors.push({ content, offset: Math.max(0, Math.min(total, offset)) });
            this._anchors.sort((a, b) => a.content - b.content);
            if (this._anchors.length > 20) this._anchors.shift();
        }

        /** 枠ごとの広告の長さ（秒）。使えないときは null */
        _planLens() {
            const plan = this._plan, v = this._video;
            if (!plan || !v || !Number.isFinite(v.duration)) return null;
            const total = v.duration - plan.fullSec;
            // 本編の長さと合わない（別の作品のプランなど）なら使わない
            if (total < -5 || total > 1800) return null;
            const n = plan.breaks.length;
            if (total < 1 || n === 0) return plan.breaks.map(() => 0);
            // 流れた広告は測った長さ
            const lens = plan.breaks.map(pos => {
                const ad = this._ads.find(a => Math.abs(a.contentPos - pos) < 5);
                return ad ? ad.len : null;
            });
            /*
             * 冒頭の枠は、実際に広告が流れたとき（上で測れたとき）以外は 0 秒とみなす（2026-09-14 iPhone 実機: 2回とも、
             * 枠はあるのに冒頭に広告は無く、広告の分は途中の枠に入っていた。冒頭に割り振ると最初からずれる）。
             * 画面の時間表示の目印があれば、下でそちらが優先される
             */
            const prerollDefault = plan.breaks[0] === 0 && !(this._adOpen && this._adOpen.contentPos < 5);
            /*
             * 目印ごとに、「その位置より前の枠の広告の合計」が分かっている。
             * 前の目印からこの目印までの間の、まだ長さの分からない枠に、足りない分を等分する
             */
            let done = 0;   // ここまでで決まった枠の数
            const sumTo = (k) => lens.slice(0, k).reduce((s, l) => s + (l || 0), 0);
            for (const a of this._anchors || []) {
                let k = done;
                while (k < n && plan.breaks[k] <= a.content) k++;
                if (k === done) continue;
                const unknown = [];
                for (let i = done; i < k; i++) if (lens[i] === null) unknown.push(i);
                const need = a.offset - sumTo(k);
                for (const i of unknown) lens[i] = Math.max(0, need / unknown.length);
                done = k;
            }
            if (prerollDefault && lens[0] === null) lens[0] = 0;
            // 残り（最後の目印より後）には、合計から決まった分を引いた残りを等分する
            const unknown = lens.map((l, i) => (l === null ? i : -1)).filter(i => i >= 0);
            const each = unknown.length ? Math.max(0, (total - sumTo(n)) / unknown.length) : 0;
            return lens.map(l => (l === null ? each : l));
        }

        /** <video> の時間 → 本編の時間 */
        _toContent(elem) {
            const lens = this._planLens();
            if (lens) {
                let off = 0;
                for (let i = 0; i < lens.length; i++) {
                    const start = this._plan.breaks[i] + off;
                    if (elem < start) return Math.max(0, elem - off);
                    if (elem < start + lens[i]) return this._plan.breaks[i];   // 広告の途中。本編は止まっている
                    off += lens[i];
                }
                return Math.max(0, elem - off);
            }
            let offset = 0;
            for (const ad of this._ads) {
                if (elem >= ad.elemEnd) offset += ad.len;
                else if (elem >= ad.elemStart) return ad.contentPos;   // 広告の途中。本編は止まっている
            }
            if (this._adOpen && elem >= this._adOpen.elemStart) return this._adOpen.contentPos;
            return Math.max(0, elem - offset);
        }

        /** 本編の時間 → <video> の時間（その位置より前の広告の分だけ後ろにずらす） */
        _toElem(content) {
            const lens = this._planLens();
            if (lens) {
                // その位置より前（同じ位置を含む）の枠の広告を足す。枠の位置ちょうどなら広告の後ろへ
                let off = 0;
                for (let i = 0; i < lens.length; i++) if (this._plan.breaks[i] <= content + 0.5) off += lens[i];
                return content + off;
            }
            let offset = 0;
            for (const ad of this._ads) {
                if (ad.contentPos <= content) offset += ad.len;
            }
            return content + offset;
        }

        /** 記録用の短いまとめ（本編の長さ・枠の位置・割り振った長さ） */
        planSummary() {
            if (!this._plan) return null;
            const lens = this._planLens();
            return {
                full: Math.round(this._plan.fullSec), own: this._plan.own,
                breaks: this._plan.breaks.map(s => Math.round(s)),
                anchors: (this._anchors || []).map(a => [Math.round(a.content), Math.round(a.offset * 10) / 10]),
                lens: lens ? lens.map(l => Math.round(l * 10) / 10) : null
            };
        }

        describeForDiag() {
            const main = this._video;
            return {
                countdown: this._adCountdown(),
                elemTime: main ? Math.round(main.currentTime * 10) / 10 : null,
                contentTime: main ? Math.round(this.getCurrentTime() * 10) / 10 : null,
                plan: this.planSummary(),
                ads: this._ads.map(a => ({
                    elemStart: Math.round(a.elemStart * 10) / 10,
                    len: Math.round(a.len * 10) / 10,
                    contentPos: Math.round(a.contentPos * 10) / 10
                })),
                videos: Array.from(document.querySelectorAll('video')).map(v => ({
                    main: v === main,
                    duration: Number.isFinite(v.duration) ? Math.round(v.duration) : String(v.duration),
                    t: Math.round(v.currentTime * 10) / 10,
                    paused: v.paused,
                    visible: v.getBoundingClientRect().width > 50
                }))
            };
        }

        // --- 再生の状態 -------------------------------------------------------

        getCurrentTime() {
            return this._video ? this._toContent(this._video.currentTime) : 0;
        }

        getDuration() {
            return this._video ? this._video.duration : NaN;
        }

        isPaused() {
            return this._video ? this._video.paused : true;
        }

        play() {
            if (!this._video) return;
            this._request('play');
            // シーク中でも一度は呼ぶ。止まったままのシークはこれをきっかけに進むため
            this._playNow();
        }

        pause() {
            if (!this._video) return;
            this._request('pause');
            this._video.pause();
        }

        _playNow() {
            // Prime は再生開始を Promise で返す。自動再生拒否は握り潰さず記録する。
            this._video?.play?.()?.catch(e => console.warn('[wp] play rejected', e));
        }

        releaseControl() {
            this._want = null;
            clearInterval(this._enforceTimer);
        }

        _activeWant() {
            if (this._want && Date.now() > this._wantUntil) this._want = null;
            return this._want;
        }

        _request(state) {
            this._want = state;
            this._wantUntil = Date.now() + ENFORCE_MS;
            // イベントだけに頼らず、しばらく定期的にも確かめる（再開しないまま黙ることがあるため）
            clearInterval(this._enforceTimer);
            this._enforceTimer = setInterval(() => {
                if (!this._activeWant()) return clearInterval(this._enforceTimer);
                this._reconcile();
            }, ENFORCE_TICK_MS);
        }

        /** 希望の状態と実際の状態が違えば合わせる。シーク中はプレイヤーが動かすので待つ */
        _reconcile() {
            const v = this._video;
            const want = this._activeWant();
            if (!v || !want || v.seeking) return;
            if (this.isInAd()) return;   // 広告中は触らない（止めると広告も止まる）
            if (want === 'play' && v.paused) this._playNow();
            else if (want === 'pause' && !v.paused) v.pause();
        }

        /** 本編の時間で指定する */
        seek(seconds) {
            if (!this._video) return;
            const duration = this._video.duration;
            let target = this._toElem(Math.max(0, seconds));
            if (Number.isFinite(duration) && duration > 0) {
                target = Math.min(target, duration);
            }
            this._video.currentTime = target;
        }

        // --- 作品 -------------------------------------------------------------

        getContentId(url = location.href) {
            const amazon = url.match(AMAZON_ID);
            if (amazon) return amazon[1];
            const pv = url.match(PRIMEVIDEO_ID);
            if (pv) return pv[1];
            return null;
        }

        /**
         * この作品本人の GTI（amzn1.dv.gti.<uuid>）。スマホの Prime Video アプリを開くのに使う。
         *
         * ASIN で開くとアプリは作品ページで止まり、時刻も無視された（2026-09-13 Android 実機）。
         * GTI はアプリが本来受け付ける作品 ID なので、こちらで開けば再生まで行くか試す。
         *
         * 作品ページには GTI が20個ほど埋め込まれている（おすすめ欄の他作品を含む）。
         * 本人のものは `"compactGTI":"…","gti":"amzn1.dv.gti.…"` のように **"gti" という名前**で入り、
         * おすすめ欄の他作品は **"titleID"** という名前で並ぶ（2026-09-13 実ページで確認）。
         * "gti" の名前のものだけを拾えば取り違えない。JSON が文字列の中にあるので \" の形も許す。
         */
        getAppId() {
            const re = /\\?"gti\\?"\s*:\s*\\?"(amzn1\.dv\.gti\.[0-9a-f-]{36})/;
            for (const s of document.scripts) {
                const text = s.textContent;
                if (!text || !text.includes('amzn1.dv.gti')) continue;
                const m = text.match(re);
                if (m) return m[1];
            }
            return null;
        }

        buildUrl(contentId) {
            if (!contentId) return null;
            // ASIN も GTI も amazon.co.jp の作品ページで開ける（GTI は実機の URL で確認）
            if (location.hostname === 'www.amazon.co.jp' || /^B[A-Z0-9]{9}$/.test(contentId)) {
                return `https://www.amazon.co.jp/gp/video/detail/${contentId}/?autoplay=1`;
            }
            return `https://www.primevideo.com/detail/${contentId}`;
        }
    }

    globalThis.WPAdapters.list.push(PrimeAdapter);
})();

    // ---- extension/adapters/netflix.js ----
// Watch Party adapters/netflix.js（2026-09-16 Defender の誤検知で消されたため、同じ中身で戻したもの）
/**
 * Netflix アダプタ。
 *
 * Prime と違い、<video> に currentTime を代入しても効かない。
 * Netflix は自前の再生状態を持っていて、代入した値をすぐ書き戻してしまう。
 * そのためページ内部の API を使う（MAIN world で動いているので触れる）:
 *
 *   netflix.appContext.state.playerApp.getAPI().videoPlayer
 *     .getAllPlayerSessionIds()            … 動いているプレイヤーの一覧
 *     .getVideoPlayerBySessionId(id)       … 個々のプレイヤー
 *
 * プレイヤーの時間は**ミリ秒**。このアダプタが外に見せる時間は秒なので、
 * 出入りのたびに直している（ここを間違えると1000倍ずれる）。
 *
 * 一覧には作品ページのプレビュー再生なども混ざる。本編は `watch-` で始まる
 * セッションなので、それだけを採る（Prime の「長さで選ぶ」に当たる部分）。
 */
(() => {
    const Base = globalThis.WPAdapters.Base;

    // /watch/81234567 と /title/81234567。ロケール付き（/jp-en/ など）もある
    const NETFLIX_ID = /netflix\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(?:watch|title)\/(\d{4,12})(?=[/?#]|$)/;

    // 本編のプレイヤーのセッション ID の目印。プレビュー再生と区別する
    const WATCH_SESSION = /^watch-/;

    const RESCAN_MS = 1000;

    /*
     * シークの検出。
     * Netflix のプレイヤーは API で動かすので、人がシークバーを動かしたときに
     * <video> の seeked が出ないことがある（MSE のバッファを差し替えるため）。
     * 時計の進みと再生位置の進みを 250ms ごとに比べ、食い違ったらシークとみなす。
     * 逆に、読み込み待ちで止まった場合は位置が「進まない」だけなので誤検出しない。
     */
    const WATCH_MS = 250;
    const JUMP_SEC = 2.0;
    // seeked と時間の飛びの両方で気づくことがある。近い時刻のものは1回にまとめる
    const SEEK_DEDUPE_MS = 1000;

    /*
     * 再生・停止の押し直し。
     * シークの直後など、プレイヤーが play() / pause() を取りこぼすことがある。
     * Prime ほど癖は強くないので、短い間だけ確かめ直す。
     */
    const ENFORCE_MS = 2000;
    const ENFORCE_TICK_MS = 250;

    /*
     * 「まだ見ていますか？」（interrupter）。
     * 一定時間操作が無いと Netflix は再生を止めて確認を出す。ホストが止まると全員が止まるので、
     * ホストのときだけ自動で「続けて見る」を押す（ユーザーの判断。ゲストは自分で押す）。
     *
     * ダイアログには「一覧へ戻る」も並んでいる。押し間違えると視聴会が終わってしまうので、
     * 「進む側」だと確信できるものだけを押す。
     */
    const INTERRUPT_SCOPE = '[data-uia*="interrupt" i], .interrupter, .interrupter-actions';
    // role="dialog" は他の用途でも使われるので、それだけでは信じない。文面で確かめる
    const STILL_WATCHING = /まだ見ていますか|まだ視聴していますか|still\s*watching/i;
    const INTERRUPT_GO = /continue|play|still.?watch/i;         // data-uia が進む側を名乗っている
    const INTERRUPT_BACK = /back|browse|exit|cancel|戻|一覧|終了/i;   // これは絶対に押さない
    const INTERRUPT_TEXT =
        /^(続けて(見る|再生|視聴)(する)?|はい[、,]?\s*まだ見ています|まだ見ています|continue\s*watching|continue|yes,?\s*i'?m\s*still\s*watching)$/i;
    // 押したあと、画面が変わるまでの間に何度も押さない
    const INTERRUPT_COOLDOWN_MS = 10_000;

    /*
     * 広告（広告つきプラン）。2026-09-12 に実機で確かめた:
     *   - player.getAdManager().getPresentingAdBreak() が、広告中だけ広告枠を返す
     *   - 広告中は canSeek() が false（シークを受け付けない）
     *   - getCurrentTime() は広告の時間も含んで進む（Prime と同じ）
     *   - 広告枠の locationMs は「広告を除いた本編の時間」での位置で、広告が流れても変わらない
     * 詳しくは _watchAds() の説明。
     */
    const AD_WATCH_MS = 250;

    // プレイヤーの入れ物。Netflix のクラス名は難読化されるが、この辺りは比較的長く使われている
    const PLAYER_SCOPE = '.watch-video, [data-uia="video-canvas"], .VideoContainer';
    const PLAYER_VIDEO = PLAYER_SCOPE.split(', ').map(s => `${s} video`).join(', ');

    class NetflixAdapter extends Base {
        static get service() { return 'netflix'; }

        static match(url) {
            return /^https:\/\/www\.netflix\.com\//.test(url);
        }

        constructor() {
            super();
            this._player = null;
            this._sessionId = null;
            this._video = null;
            this._detach = null;
            this._rescanTimer = null;
            this._watchTimer = null;
            this._enforceTimer = null;
            this._want = null;          // 'play' | 'pause' | null
            this._wantUntil = 0;
            this._lastSeekAt = 0;
            this._lastTime = null;      // 飛びの検出用（秒）
            this._lastWallMs = 0;
            this._lastPaused = null;    // 再生/停止の変化を1回だけ知らせるため
            this._lastDismissAt = 0;
            this._adOpen = null;        // いま流れている広告枠
            this._adTimer = null;
            // 生の位置と本編の時間の対応。広告が明けるたびに増える（_watchAds）
            this._anchors = [{ content: 0, raw: 0 }];
        }

        async ready() {
            await Base.waitFor(() => this._pickPlayer(), { timeoutMs: Infinity });
            this._watchForReplacement();
            this._watchJumps();
            this._watchAds();
            return this;
        }

        // --- プレイヤーの取得 ---------------------------------------------------

        /** ページ内部の videoPlayer。まだ読み込まれていなければ null */
        _videoPlayerApi() {
            const app = globalThis.netflix?.appContext?.state?.playerApp;
            const api = app?.getAPI?.();
            return api?.videoPlayer || null;
        }

        /**
         * 本編のプレイヤーを掴む。掴めていれば true。
         * エピソードが変わるとセッションごと作り直されるので、定期的に見直す。
         */
        _pickPlayer() {
            const vp = this._videoPlayerApi();
            if (!vp) return false;

            let ids = [];
            try { ids = vp.getAllPlayerSessionIds() || []; } catch { return false; }
            const id = ids.find(s => WATCH_SESSION.test(String(s)));
            if (!id) return false;

            if (id === this._sessionId && this._player) {
                this._bindVideo();
                return true;
            }

            let player;
            try { player = vp.getVideoPlayerBySessionId(id); } catch { return false; }
            // 長さが決まるまでは操作しても効かない
            if (!player || !(Number(player.getDuration?.()) > 0)) return false;

            this._sessionId = id;
            this._player = player;
            this._lastTime = null;
            this._lastPaused = null;
            // 別の話数になったら時間の数え方も始め直し
            this._adOpen = null;
            this._anchors = [{ content: 0, raw: 0 }];
            this._bindVideo();
            console.log('[wp] netflix: player', id, this.getDuration());
            return true;
        }

        /**
         * イベントを取るための <video>。
         * 再生の操作は API で行うが、人が押した再生・停止に気づくには要素のイベントが早い。
         */
        _pickVideo() {
            const inPlayer = document.querySelector(PLAYER_VIDEO);
            if (inPlayer) return inPlayer;
            const all = Array.from(document.querySelectorAll('video')).filter(v => v.isConnected);
            if (all.length === 0) return null;
            // 画面に出ている中で最も大きいもの（プレビューの小窓を避ける）
            return all.reduce((a, b) =>
                b.getBoundingClientRect().width > a.getBoundingClientRect().width ? b : a);
        }

        _bindVideo() {
            const video = this._pickVideo();
            if (!video || this._video === video) return;
            if (this._detach) this._detach();
            this._video = video;

            const onPlay = () => {
                if (this._activeWant() === 'pause') return this._reconcile();
                this._emitPlayback(false);
            };
            const onPause = () => {
                if (video.seeking) return;   // シークに伴う停止はプレイヤーの都合
                if (this._activeWant() === 'play') return this._reconcile();
                this._emitPlayback(true);
            };
            const onSeeked = () => this._emitSeek();

            video.addEventListener('play', onPlay);
            video.addEventListener('pause', onPause);
            video.addEventListener('seeked', onSeeked);
            this._detach = () => {
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
                video.removeEventListener('seeked', onSeeked);
            };
        }

        _watchForReplacement() {
            if (this._rescanTimer) return;
            this._rescanTimer = setInterval(() => this._pickPlayer(), RESCAN_MS);
        }

        // --- 状態の変化の検出 ----------------------------------------------------

        /**
         * 再生／停止が変わったことを1回だけ知らせる。
         * 要素のイベントからも、下の見張り（_watchJumps）からも呼ばれるので、
         * 同じ変化を二度送らないようここでまとめる。
         */
        _emitPlayback(paused) {
            if (this._lastPaused === paused) return;
            this._lastPaused = paused;
            this._emit(paused ? 'pause' : 'play');
        }

        _emitSeek() {
            const now = Date.now();
            if (now - this._lastSeekAt < SEEK_DEDUPE_MS) return;
            this._lastSeekAt = now;
            // 飛んだ先を次の基準にする（同じ飛びを二度数えない）
            this._lastTime = this.getCurrentTime();
            this._lastWallMs = now;
            this._emit('seek');
        }

        /**
         * 時計の進みと再生位置の進みを比べ、食い違ったらシークとみなす。
         * あわせて再生／停止も見張る。Netflix のクラス名は難読化されていて変わるので、
         * <video> を見失ってイベントが来なくなっても、ここだけで気づけるようにしておく。
         */
        _watchJumps() {
            if (this._watchTimer) return;
            this._watchTimer = setInterval(() => {
                if (!this._player) return;
                // 広告の間は本編が止まって見える（時計だけ進む）。ここで見ると必ず食い違うので見ない。
                // 広告の出入りは _watchAds が別に見ている
                if (this._adOpen) { this._lastTime = null; return; }

                // 自分で合わせ込んでいる最中の変化は人の操作ではないので数えない
                if (!this._activeWant()) {
                    const paused = this.isPaused();
                    if (this._lastPaused === null) this._lastPaused = paused;
                    else this._emitPlayback(paused);
                }

                const t = this.getCurrentTime();
                const wall = Date.now();
                if (this._lastTime === null) {
                    this._lastTime = t;
                    this._lastWallMs = wall;
                    return;
                }
                const moved = t - this._lastTime;
                const elapsed = (wall - this._lastWallMs) / 1000;
                this._lastTime = t;
                this._lastWallMs = wall;
                // 再生していれば moved ≒ elapsed、止まっていれば moved ≒ 0。
                // どちらからも大きく外れたら、位置が飛んだということ
                const expected = this.isPaused() ? 0 : elapsed;
                if (Math.abs(moved - expected) > JUMP_SEC) this._emitSeek();
            }, WATCH_MS);
        }

        // --- 再生の状態 ---------------------------------------------------------

        /** プレイヤーが持っている生の再生位置（秒）。広告の時間も含んでいる */
        _rawTime() {
            const ms = this._player?.getCurrentTime?.();
            if (Number.isFinite(ms)) return ms / 1000;
            return this._video ? this._video.currentTime : 0;
        }

        /**
         * プレイヤーが持っている本編だけの位置（秒）。無ければ null。
         * 本物の Netflix（広告つきプラン）で確認（2026-09-15）: 冒頭の広告 31 秒が流れたあと、
         * getCurrentTime は 56 秒、getSegmentTime は 25 秒だった。広告の無い人では両方同じ。
         */
        _segmentTime() {
            try {
                const ms = this._player?.getSegmentTime?.();
                if (!Number.isFinite(ms) || ms < 0) return null;
                const sec = ms / 1000;
                // 生の位置（広告込み）より先になることはない。おかしな値は使わない
                return sec <= this._rawTime() + 1 ? sec : null;
            } catch { return null; }
        }

        /** 外に見せるのは「広告を除いた本編の時間」 */
        getCurrentTime() {
            // 広告中は本編が進んでいない。その広告枠の位置で止まって見える
            if (this._adOpen && Number.isFinite(this._adOpen.contentMs)) return this._adOpen.contentMs / 1000;
            const seg = this._segmentTime();
            if (seg !== null) return seg;
            return this._toContent(this._rawTime());
        }

        getDuration() {
            const ms = this._player?.getDuration?.();
            return Number.isFinite(ms) ? ms / 1000 : NaN;
        }

        isPaused() {
            const p = this._player;
            if (p) {
                if (typeof p.isPaused === 'function') return Boolean(p.isPaused());
                if (typeof p.isPlaying === 'function') return !p.isPlaying();
            }
            return this._video ? this._video.paused : true;
        }

        isPlayerOpen() {
            return Boolean(this._player);
        }

        /**
         * Prime は再生を始めると同じ作品の URL を書き換えるので無視する必要があったが、
         * Netflix の URL が変わるのは別の話数へ進んだときで、これは本当の作品の切り替え。
         * ゲストにも移ってもらう必要があるので無視しない。
         */
        ignoreUrlChange() { return false; }

        play() {
            if (!this._player) return;
            this._request('play');
            this._playNow();
        }

        pause() {
            if (!this._player) return;
            this._request('pause');
            this._player.pause?.();
        }

        _playNow() {
            try { this._player?.play?.(); } catch (e) { console.warn('[wp] play failed', e); }
        }

        /** 本編の時間で指定する（広告の分は中で足し戻す） */
        seek(seconds) {
            if (!this._player) return;
            // 広告中はプレイヤーがシークを受け付けない（canSeek() が false）
            if (this.isInAd()) return;

            /*
             * 本編だけの位置が読めるなら、「いまの生の位置 ＋ 本編での差」へ動かす。
             * 間の広告の長さが分からなくても、動いた先で読み直した差を次の合わせで詰めるので、2回目で合う
             * （広告枠の長さの一覧は、自動操作では 0 のままで当てにならなかった）
             */
            const seg = this._segmentTime();
            let raw = seg !== null
                ? Math.max(0, this._rawTime() + (Math.max(0, seconds) - seg))
                : this._toRaw(Math.max(0, seconds));
            const duration = this.getDuration();   // 生の長さ（広告込み）
            if (Number.isFinite(duration) && duration > 0) raw = Math.min(raw, duration);

            // 自分で動かした分は「人が飛ばした」と数えない。動かす前に印をつける
            // （プレイヤーによっては seek() の中で同期的に seeked が飛んでくる）
            this._lastSeekAt = Date.now();
            this._lastTime = Math.max(0, seconds);
            this._lastWallMs = this._lastSeekAt;
            // プレイヤーはミリ秒で受け取る
            this._player.seek?.(Math.round(raw * 1000));
        }

        releaseControl() {
            this._want = null;
            clearInterval(this._enforceTimer);
        }

        _activeWant() {
            if (this._want && Date.now() > this._wantUntil) this._want = null;
            return this._want;
        }

        _request(state) {
            this._want = state;
            this._wantUntil = Date.now() + ENFORCE_MS;
            clearInterval(this._enforceTimer);
            this._enforceTimer = setInterval(() => {
                if (!this._activeWant()) return clearInterval(this._enforceTimer);
                this._reconcile();
            }, ENFORCE_TICK_MS);
        }

        _reconcile() {
            const want = this._activeWant();
            if (!this._player || !want) return;
            if (this._video?.seeking) return;
            if (this.isInAd()) return;   // 広告中は触らない（止めると広告も止まる）
            if (want === 'play' && this.isPaused()) this._playNow();
            else if (want === 'pause' && !this.isPaused()) this._player.pause?.();
        }

        // --- 「まだ見ていますか？」 ------------------------------------------------

        /**
         * 「まだ見ていますか？」のダイアログを探す。
         * 見当違いの所を押さないよう、Netflix がそれと名乗っているものか、
         * 文面がそう読めるものだけを対象にする。
         */
        _interruptScope() {
            const named = document.querySelector(INTERRUPT_SCOPE);
            if (named) return named;
            for (const el of document.querySelectorAll('[role="dialog"]')) {
                if (STILL_WATCHING.test(el.textContent)) return el;
            }
            return null;
        }

        dismissInterruption() {
            if (Date.now() - this._lastDismissAt < INTERRUPT_COOLDOWN_MS) return false;
            const scope = this._interruptScope();
            if (!scope) return false;

            const buttons = Array.from(scope.querySelectorAll('button, [role="button"], a'))
                .filter(el => {
                    const r = el.getBoundingClientRect();
                    if (r.width < 10 || r.height < 10) return false;
                    const name = `${el.getAttribute('data-uia') || ''} ${el.getAttribute('aria-label') || ''}`;
                    return !INTERRUPT_BACK.test(name) && !INTERRUPT_BACK.test(el.textContent);
                });

            const btn = buttons.find(el => INTERRUPT_GO.test(el.getAttribute('data-uia') || ''))
                || buttons.find(el => INTERRUPT_TEXT.test(el.textContent.trim()));
            if (!btn) return false;

            this._lastDismissAt = Date.now();
            btn.click();
            this._reportDiag('interrupt-dismissed', {
                button: btn.getAttribute('data-uia') || btn.textContent.trim().slice(0, 30)
            });
            return true;
        }

        // --- 広告 ---------------------------------------------------------------

        _adManager() {
            try { return this._player?.getAdManager?.() || null; } catch { return null; }
        }

        /** いま流れている広告枠。広告中でなければ null */
        _presentingBreak() {
            const am = this._adManager();
            if (!am) return null;
            try { return am.getPresentingAdBreak() || null; } catch { return null; }
        }

        /**
         * 広告中か。
         * プレイヤー自身が「いまこの広告枠を出している」と教えてくれるので、
         * 画面の文字を読んで当てにいく必要がない（Prime はそれが無くて苦労した）。
         */
        isInAd() { return this._presentingBreak() !== null; }

        /**
         * 広告枠の本編上の位置（ミリ秒）。
         * 流れている枠そのものに locationMs があればそれを、無ければ番号（viewableAdBreakIndex / index）で一覧から引く。
         * 以前は index だけで引いていて、名前が違うと目印が足されず、生の位置（広告込み）をそのまま本編の時間として
         * 送っていた疑いがある（2026-09-14 ユーザー報告: Netflix でゲストが数分先へずれた）
         */
        _breakContentMs(brk) {
            if (brk && Number.isFinite(brk.locationMs)) return brk.locationMs;
            const am = this._adManager();
            if (!am || !brk) return null;
            const index = Number.isFinite(brk.viewableAdBreakIndex) ? brk.viewableAdBreakIndex : brk.index;
            try {
                const hit = (am.getAds() || []).find(a => a.viewableAdBreakIndex === index);
                return hit && Number.isFinite(hit.locationMs) ? hit.locationMs : null;
            } catch { return null; }
        }

        /**
         * 流し終わった広告枠の { 本編上の位置（秒）, 長さ（秒） }。
         * 枠の duration（{ ticks, timescale }）に、実際に流れた広告の長さが入る（本物の Netflix で形を確認。
         * 自動操作の Edge では広告が流れず 0 だったので、長さが入っているものだけ使う）
         */
        _playedBreaks() {
            const am = this._adManager();
            if (!am) return [];
            let list = [];
            try { list = am.getAds() || []; } catch { return []; }
            const sec = (d) => (d && Number.isFinite(d.ticks) && Number.isFinite(d.timescale) && d.timescale > 0 ? d.ticks / d.timescale : 0);
            return list
                .filter(b => b && (b.hasCompletedPlayback || b.hasPlayed) && Number.isFinite(b.locationMs))
                .map(b => ({ at: b.locationMs / 1000, len: sec(b.duration) || sec(b.normalizedAdsDuration) }))
                .filter(b => b.len > 0.5 && b.len < 600)
                .sort((a, b) => a.at - b.at);
        }

        /**
         * 広告の出入りを見張り、明けるたびに「生の位置」と「本編の位置」の対応（目印）を足す。
         *
         * 実機で確かめたこと（2026-09-12）:
         *   - getCurrentTime() は広告の時間も含んで進む（Prime と同じ）
         *   - 広告枠の locationMs は**本編の時間**での位置で、広告が流れても変わらない
         *     （実測: 広告枠 1273605ms + 広告 19922ms ≒ 広告明けの 1294100ms）
         * つまり広告が明けた瞬間の本編の位置は locationMs そのもの。そこを目印にすれば、
         * Prime のように広告の長さを測って足し込む必要がなく、誤差も積み重ならない。
         */
        _watchAds() {
            if (this._adTimer) return;
            this._adTimer = setInterval(() => {
                if (!this._player) return;
                const brk = this._presentingBreak();

                // 広告の出入りの記録は bridge.js が別に書いている（ここで書くと二重になる）
                if (brk && !this._adOpen) {
                    this._adOpen = {
                        index: Number.isFinite(brk.viewableAdBreakIndex) ? brk.viewableAdBreakIndex : brk.index,
                        contentMs: this._breakContentMs(brk),
                        rawStart: this._rawTime()
                    };
                } else if (!brk && this._adOpen) {
                    const raw = this._rawTime();
                    const open = this._adOpen;
                    this._adOpen = null;
                    if (Number.isFinite(open.contentMs)) {
                        this._addAnchor(open.contentMs / 1000, raw);
                    }
                }
            }, AD_WATCH_MS);
        }

        /**
         * 目印（生の位置 ↔ 本編の位置）を1つ足す。
         * 同じ広告枠をもう一度通ったら、新しいほうで置き換える。
         */
        _addAnchor(contentSec, rawSec) {
            this._anchors = this._anchors.filter(a => Math.abs(a.content - contentSec) > 0.5);
            this._anchors.push({ content: contentSec, raw: rawSec });
            this._anchors.sort((a, b) => a.content - b.content);
        }

        /** 生の位置 → 本編の時間 */
        _toContent(raw) {
            // 広告中は本編が進んでいない。その広告枠の位置で止まって見える
            if (this._adOpen && Number.isFinite(this._adOpen.contentMs)) {
                return this._adOpen.contentMs / 1000;
            }
            // 流し終わった枠の長さが分かれば、それを引く（目印が足されなかったときも正しく出せる）
            const played = this._playedBreaks();
            if (played.length) {
                let offset = 0;
                for (const b of played) { if (b.at <= raw - offset - b.len + 0.5) offset += b.len; }
                return Math.max(0, raw - offset);
            }
            let best = this._anchors[0];
            for (const a of this._anchors) { if (a.raw <= raw + 0.001) best = a; }
            return Math.max(0, best.content + (raw - best.raw));
        }

        /** 本編の時間 → 生の位置 */
        _toRaw(content) {
            const played = this._playedBreaks();
            if (played.length) {
                return Math.max(0, content + played.filter(b => b.at <= content + 0.001).reduce((sum, b) => sum + b.len, 0));
            }
            let best = this._anchors[0];
            for (const a of this._anchors) { if (a.content <= content + 0.001) best = a; }
            return Math.max(0, best.raw + (content - best.content));
        }

        describeForDiag() {
            const am = this._adManager();
            let ads = null, hasAds = null, canSeek = null;
            if (am) {
                try { hasAds = am.hasAds(); } catch { /* 取れない */ }
                try { canSeek = am.canSeek(); } catch { /* 取れない */ }
                try {
                    /*
                     * 広告枠に入っている数と真偽を全部出す（2026-09-14）。ホストもゲストも数分ずれた報告があり、
                     * 生の位置にまだ流れていない広告も含まれている（Prime と同じ）のではと疑っている。
                     * 枠の長さがどの名前で入っているか、自動操作の Edge では広告が出ないので実際の記録で確かめる
                     */
                    ads = (am.getAds() || []).slice(0, 20).map(a => {
                        const o = { i: a.viewableAdBreakIndex, atSec: Math.round(a.locationMs / 100) / 10, played: Boolean(a.hasCompletedPlayback) };
                        for (const k of Object.keys(a || {}).slice(0, 30)) {
                            const v = a[k];
                            if (typeof v === 'number' && Number.isFinite(v)) o[k] = Math.round(v);
                            else if (typeof v === 'boolean') o[k] = v;
                            else if (v && typeof v === 'object' && Number.isFinite(v.ticks)) o[k] = Math.round(v.ticks / (v.timescale || 1) * 10) / 10;
                            else if (Array.isArray(v)) o[k + '#'] = v.length;
                        }
                        return o;
                    });
                } catch { /* 取れない */ }
            }
            let sessions = [];
            try { sessions = (this._videoPlayerApi()?.getAllPlayerSessionIds() || []).map(String); } catch { /* 未読み込み */ }
            const raw = this._rawTime();
            const v = this._video;
            let segmentTime = null;
            try { const ms = this._player?.getSegmentTime?.(); segmentTime = Number.isFinite(ms) ? Math.round(ms / 100) / 10 : null; } catch { /* 無い */ }
            let presenting = null;
            try {
                const b = this._presentingBreak();
                if (b) {
                    presenting = {};
                    for (const k of Object.keys(b).slice(0, 30)) {
                        const x = b[k];
                        if (typeof x === 'number' || typeof x === 'boolean') presenting[k] = x;
                        else if (x && typeof x === 'object' && Number.isFinite(x.ticks)) presenting[k] = Math.round(x.ticks / (x.timescale || 1) * 10) / 10;
                    }
                }
            } catch { /* 取れない */ }
            return {
                // 調査用: getSegmentTime（本編だけの位置かもしれない）、流れている枠の中身、流し終わった枠の長さ
                segmentTime, presenting, played: this._playedBreaks(),
                videoTime: v ? Math.round(v.currentTime * 10) / 10 : null,
                videoDuration: v && Number.isFinite(v.duration) ? Math.round(v.duration) : null,
                sessionId: this._sessionId,
                sessions,
                rawTime: Math.round(raw * 10) / 10,
                contentTime: Math.round(this._toContent(raw) * 10) / 10,
                duration: Math.round(this.getDuration()),
                paused: this.isPaused(),
                inAd: this.isInAd(),
                hasAds,
                canSeek,
                ads,
                anchors: this._anchors.map(a => ({
                    content: Math.round(a.content * 10) / 10,
                    raw: Math.round(a.raw * 10) / 10
                }))
            };
        }

        // --- 作品 ---------------------------------------------------------------

        getContentId(url = location.href) {
            const m = url.match(NETFLIX_ID);
            return m ? m[1] : null;
        }

        buildUrl(contentId) {
            if (!contentId) return null;
            // /watch/ を開くと、ログイン済みならそのまま再生が始まる。
            // 未ログインならログイン画面を経由し、済ませるとこの URL へ戻る
            return `https://www.netflix.com/watch/${contentId}`;
        }
    }

    globalThis.WPAdapters.list.push(NetflixAdapter);
})();

    // ---- extension/adapters/registry.js ----
/**
 * 現在の URL を担当するアダプタを選ぶ。
 * adapters/*.js が globalThis.WPAdapters.list へ自己登録した順に評価する。
 */
(() => {
    globalThis.WPAdapters.resolve = function resolve(url = location.href) {
        const Adapter = globalThis.WPAdapters.list.find(A => A.match(url));
        return Adapter ? new Adapter() : null;
    };
})();

    // ---- extension/content/bridge.js ----
/**
 * MAIN world 側のスクリプト。
 *
 * ページと同じ実行文脈で動くため、サービスのプレイヤーへ直接触れる。
 * 拡張機能 API は使えないので、ISOLATED world の ui.js とは
 * window.postMessage 経由でやり取りする。
 *
 * 役割は2つあり、準備できる時期が違うので分けて扱う。
 *   1. 作品の特定（URL から分かる。ページを開いた瞬間に送る）
 *   2. プレイヤーの操作（<video> が現れるまで待つ。再生ボタンを押すまで現れないこともある）
 */
(() => {
    // protocol.js はここでは読み込めない（理由は protocol.js の冒頭）ので、必要な定数を自前で持つ。
    const WP = Object.freeze({
        // window.postMessage の識別子。protocol.js と同じ値でなければならない
        SRC_BRIDGE: 'wp-bridge',
        SRC_UI: 'wp-ui',

        // リモート適用中に自分のイベントを送り返さないための保護時間
        ECHO_GUARD_MS: 700,

        // これ以上ズレていたらシークして合わせる（秒）
        SEEK_THRESHOLD_SEC: 1.0,

        // ホストが再生中に現在位置を送る間隔。途中参加やズレの補正に使う
        HEARTBEAT_MS: 5000,

        // 定期補正でシークするズレの下限（秒）。小さいとシークのたびに読み込みが挟まる
        DRIFT_THRESHOLD_SEC: 2.0,

        // 一時停止時、この秒数以内の遅れなら再生を続けて追いつく。それ以上はシークで合わせる
        FOLLOW_MAX_GAP_SEC: 3.0,

        // 追いつき待ちの期限。遅れは最大 FOLLOW_MAX_GAP_SEC 秒なので、本来は数秒で終わる。
        // これを過ぎても届かないなら、再生が止まっている（読み込み・サービス側の制限など）。
        // 待ち続けると定期補正が捨てられ続け、ゲストがずれたまま固まる（2026-09-12 の不具合）
        FOLLOW_TIMEOUT_MS: 5000,

        // プレイヤーが開いた直後は「止まって待つ」を後回しにする。冒頭の広告は開いた直後に
        // 始まるが、広告の表示が出るまで少しかかる。その間に止めると広告ごと止まってしまう。
        // 自分の動画がこれだけ進むか、広告が見つかるか、最長時間が過ぎるまで待つ
        STARTUP_PLAY_MS: 3000,
        STARTUP_MAX_MS: 15000,

        // サービス側の確認ダイアログ（Netflix の「まだ見ていますか？」）を見に行く間隔
        INTERRUPT_CHECK_MS: 2000
    });
    const isTop = window.top === window;

    let adapter = null;
    let bound = false;           // プレイヤーを掴めたか
    let applying = false;        // リモート適用中フラグ（自分のイベントを送り返さないため）
    let applyTimer = null;
    let targetPauseTime = null;  // 追従停止の目標位置
    let followTimer = null;
    let selfAd = false;          // 自分が広告を見ているか
    let hostAd = false;          // ホストが広告を見ているか（ホストの定期通知で知る）
    let hostPaused = false;      // ホストが止まっているか（表示用）
    let startup = false;         // プレイヤーが開いた直後か（STARTUP_*）
    let deferredStop = false;    // 開いた直後に「止まって待つ」を後回しにしたか
    let isHost = false;          // ui.js から教わる（このスクリプトは拡張機能の状態を直接見られない）
    let lastTickDropReport = 0;  // 調査用（follow から抜けられない件）。記録の間引きに使う
    /*
     * ゲストの動画が止まったまま動かないときの立て直し（2026-09-14 PC の Chrome）。
     * ホストは再生中なのに、ゲストの動画が読み込み中のくるくるのまま1分以上動かなかった。
     * ホストが一時停止→再生すると直った（ゲストが「止める→位置を合わせて再生」をやり直したため）。
     * 同じことを自動でやる: 一定時間（20秒。読み込みを待つ間は数えない）動かなければ、いったん止めてホストの今の位置を取り直す
     */
    const STUCK_MS = 20000;
    const KICK_GAP_MS = 20000;
    let lastApplyAt = 0;
    let lastTickTime = 0;
    let zeroTickOnce = false;
    let stuck = { lastT: null, movedAt: 0, kickAt: 0, kicks: 0, failed: 0 };
    /*
     * 続けて立て直せなかったら、それ以上は自動でやらない（2026-09-15 実機の記録）。
     * 立て直し（止める→位置を取り直して再生）は読み込みを最初からやり直させるので、繰り返すと余計に落ち着かなかった
     */
    const KICK_MAX_FAILED = 2;
    /*
     * ホストの再生中に追いつくとき（2026-09-15 ユーザー報告: PC の Chrome で、ホストが再生中だとゲストがくるくる回ったまま。
     * ホストが止まっていれば再生が始まって合う）。
     * 動いているホストの位置へ飛ぶと、読み込んでいる間にホストが先へ進み、次の知らせでまた飛ぶ…を繰り返して読み込みが終わらなかった。
     * そこで、読み込みにかかる時間ぶん先へ飛び、動き出すまで（最長 SETTLE_MS）は飛び直さずに待つ。
     * 先へ飛ぶ量は、実際に動き出すまでにかかった時間から覚え直す（はじめは 3 秒）
     */
    const SETTLE_MS = 20000;
    let settle = null;          // { at: 飛んだ時刻, started: 動き出したか }
    let loadLeadSec = 3;
    let rawLast = null;         // 生の再生位置の見張り（本編の時間の換算に左右されない）
    let rawMovedAt = 0;

    /**
     * 飛んだ先で読み込み中か。20 秒たっても、まだ読み込み中（seeking・データが足りない）なら最長 60 秒まで待つ
     * （途中で飛び直すと、読み込みが最初からになる）
     */
    function settlePending(now) {
        if (!settle || settle.started) return false;
        if (now - settle.at < SETTLE_MS) return true;
        const v = adapter._video;
        return Boolean(v) && !mediaLoaded(v) && now - settle.at < 60000;
    }

    /** 読み込みが済んでいるか（シーク中でなく、データがある）。中身を持たない <video>（テストの偽物）は済んでいる扱い */
    function mediaLoaded(v) {
        if (!v) return true;
        const hasMedia = Boolean(v.currentSrc || v.srcObject);
        return !v.seeking && (v.readyState >= 3 || !hasMedia);
    }

    /** ホストの位置（本編の時間）へ追いつく。ホストが再生中のときだけ使う */
    function catchUp(target, threshold) {
        const now = Date.now();
        if (settlePending(now)) {
            // 飛んだ先で読み込み中。飛び直さず、再生の指示だけ出して待つ
            if (adapter.isPaused()) adapter.play();
            return;
        }
        const diff = target - adapter.getCurrentTime();
        /*
         * 先へ飛んで動き出したあと、ホストより少し先にいる分（読み込みが見込みより早かった分）は、その秒数だけ止まって待つ。
         * しきい値（2秒）より小さい先行は飛び直しでは直らず、残っていた（2026-09-16 テスト: ホストの広告で止まる場面が 1.8 秒ずれた）
         */
        if (settle && settle.started && settle.lead > 0 && !settle.trimmed && diff < -0.4 && diff > -(settle.lead + 2)) {
            settle.trimmed = true;
            adapter.pause();
            const waitMs = Math.round(-diff * 1000);
            setTimeout(() => { if (!hostPaused && !hostAd) withEchoGuard(() => adapter.play()); }, waitMs);
            return;
        }
        if (Math.abs(diff) > threshold) {
            // 大きく離れている・まだ流れていないときは読み込みが要るので、その分だけ先へ
            const smooth = !adapter.isPaused() && now - rawMovedAt < 2000;
            const lead = Math.abs(diff) > 8 || !smooth ? loadLeadSec : 0;
            adapter.seek(target + lead);
            settle = { at: now, started: false, lead, target };
            post('DIAG', { event: 'catch-up', url: location.href, target: Math.round(target), lead, diff: Math.round(diff) });
        }
        if (adapter.isPaused()) adapter.play();
    }

    function post(type, payload) {
        window.postMessage({ source: WP.SRC_BRIDGE, type, payload }, location.origin);
    }

    /** リモート操作を適用する間だけイベント送出を止める */
    function withEchoGuard(fn) {
        applying = true;
        clearTimeout(applyTimer);
        try { fn(); } finally {
            applyTimer = setTimeout(() => { applying = false; }, WP.ECHO_GUARD_MS);
        }
    }

    function stopFollowing() {
        targetPauseTime = null;
        clearInterval(followTimer);
    }

    /**
     * ホストが止めた位置まで自分は再生を続けてから止まる。
     * 通信遅延で自分のほうが手前にいる場合、その場で止めると位置がズレるため。
     *
     * **必ず期限を設けること**（2026-09-12 の不具合）。追いつく前にゲストの再生が止まると
     * 目標に永遠に届かず、その間 `tick`（定期補正）が全部捨てられてゲストがずれたまま固まる。
     * 再生が止まる場面は珍しくない（読み込み、Netflix の同時視聴の制限など。
     * 実機テストで「ホスト再生中にゲストが30秒間に3回止まる」を観測している）。
     * 再現は `tools/repro-follow-stuck.js`。
     *
     * 様子は diag.log に残している（follow-start / follow-wait / follow-done / follow-timeout）。
     */
    function followUntil(time) {
        targetPauseTime = time;
        clearInterval(followTimer);

        const startedAt = Date.now();
        const startT = adapter.getCurrentTime();
        let deadline = startedAt + WP.FOLLOW_TIMEOUT_MS;
        let lastReport = 0;
        post('DIAG', {
            event: 'follow-start', url: location.href,
            target: time, now: startT, gap: time - startT,
            paused: adapter.isPaused(), inAd: adapter.isInAd()
        });

        followTimer = setInterval(() => {
            if (targetPauseTime === null) return clearInterval(followTimer);
            const elapsed = Date.now() - startedAt;
            const t = adapter.getCurrentTime();

            // 追いつけていない間の様子を1秒ごとに残す（再生位置が進んでいるかが要点）
            if (elapsed - lastReport >= 1000) {
                lastReport = elapsed;
                post('DIAG', {
                    event: 'follow-wait', url: location.href,
                    target: targetPauseTime, now: t, startT, elapsedMs: elapsed,
                    advanced: t - startT, paused: adapter.isPaused(), inAd: adapter.isInAd()
                });
            }

            // 広告中は本編が進まない。止めると広告ごと止まるので、待つ時間にも数えない
            if (adapter.isInAd()) {
                deadline = Date.now() + WP.FOLLOW_TIMEOUT_MS;
                return;
            }

            if (t >= targetPauseTime) {
                withEchoGuard(() => adapter.pause());
                post('DIAG', {
                    event: 'follow-done', url: location.href,
                    target: targetPauseTime, now: t, elapsedMs: elapsed
                });
                stopFollowing();
                return;
            }

            // 期限切れ。再生が止まっていて追いつけない。
            // ここで諦めないと、以降の定期補正が捨てられ続けてずれたまま固まる
            if (Date.now() > deadline) {
                const target = targetPauseTime;
                post('DIAG', {
                    event: 'follow-timeout', url: location.href,
                    target, now: t, startT, elapsedMs: elapsed,
                    advanced: t - startT, paused: adapter.isPaused()
                });
                stopFollowing();
                withEchoGuard(() => {
                    adapter.seek(target);
                    adapter.pause();
                });
            }
        }, 100);
    }

    function apply({ type, currentTime, timestamp, paused, ad } = {}) {
        if (!bound) return;
        if (typeof currentTime !== 'number' || !Number.isFinite(currentTime)) return;
        // 直前の定期通知の位置（0 秒の知らせを1回だけ見送るため）
        if (type !== 'tick' || currentTime >= 5) { lastTickTime = currentTime; zeroTickOnce = false; }
        lastApplyAt = Date.now();

        // ホストが広告中かは定期通知で分かる。広告中のホストは操作を送らないので、
        // 操作が届いたなら広告は終わっている
        setHostState({
            hostAd: type === 'tick' ? Boolean(ad) : false,
            hostPaused: type === 'pause' || (type === 'tick' ? Boolean(paused) : hostPaused && type !== 'play')
        });

        // 自分が広告中なら何もしない。本編を動かすと広告が止まってしまう。
        // 広告が終わった時点でホストの位置を取り直す（watchAds）
        if (adapter.isInAd()) return;

        // 開いた直後は「止まって待つ」を後回しにする（冒頭の広告を止めないため）
        const stops = type === 'pause' || (type === 'tick' && (paused || ad));
        if (startup) {
            if (stops) { deferredStop = true; return; }
            endStartup();   // ホストが再生中と分かったので、待つ理由がない
        }

        // 送信からの経過時間を足して、いま居るべき位置を求める
        const lag = timestamp ? Math.max(0, (Date.now() - timestamp) / 1000) : 0;

        if (type === 'play') {
            stopFollowing();
            const target = currentTime + lag;
            withEchoGuard(() => catchUp(target, WP.SEEK_THRESHOLD_SEC));
        } else if (type === 'pause') {
            const gap = currentTime - adapter.getCurrentTime();
            if (gap > 0.2 && gap <= WP.FOLLOW_MAX_GAP_SEC && !adapter.isPaused()) {
                followUntil(currentTime);   // 少し手前 → 追いついてから止める
            } else {
                stopFollowing();
                withEchoGuard(() => {
                    adapter.seek(currentTime);
                    adapter.pause();
                });
            }
        } else if (type === 'seek') {
            stopFollowing();
            withEchoGuard(() => {
                // サービスによってはシーク後に勝手に再生を再開する（Prime がそう）。止まっていたなら止め直す
                const wasPaused = adapter.isPaused();
                adapter.seek(currentTime);
                // ホストが再生中のときだけ、読み込みを待つ（止まっているホストに合わせるときは追いかけにならない）
                if (!hostPaused) settle = { at: Date.now(), started: false, lead: 0 };
                if (wasPaused) adapter.pause();
            });
        } else if (type === 'tick' && currentTime < 5 && lastTickTime >= 30 && !zeroTickOnce) {
            zeroTickOnce = true;
            return;
        } else if (type === 'tick') {
            // ホストの状態の定期通知。大きくズレていれば合わせる。
            if (targetPauseTime !== null) {
                // 追いつき待ちの間は補正しない。ここを通り続けているなら、
                // 追いつき待ちから抜けられていない（調査中・2026-09-12）
                if (Date.now() - lastTickDropReport >= 3000) {
                    lastTickDropReport = Date.now();
                    post('DIAG', {
                        event: 'tick-dropped', url: location.href,
                        target: targetPauseTime, now: adapter.getCurrentTime(),
                        hostTime: currentTime, hostPaused: Boolean(paused), hostAd: Boolean(ad),
                        paused: adapter.isPaused(), inAd: adapter.isInAd()
                    });
                }
                return;
            }
            if (paused || ad) {
                // ホストは止まっている、または広告中（本編は進まない）→ 同じ位置で止まって待つ
                withEchoGuard(() => {
                    // 止まって待つときは細かく合わせる（飛んでも再生中の読み込みにならない。追いつくときに少し先へ飛んだ分が残らないように）
                    const drifted = Math.abs(adapter.getCurrentTime() - currentTime) > WP.SEEK_THRESHOLD_SEC;
                    if (drifted) adapter.seek(currentTime);
                    // シーク後の自動再開に備え、シークしたときは止まっていても止め直す
                    if (drifted || !adapter.isPaused()) adapter.pause();
                });
                return;
            }
            const target = currentTime + lag;
            withEchoGuard(() => catchUp(target, WP.DRIFT_THRESHOLD_SEC));
        }
    }

    window.addEventListener('message', (ev) => {
        if (ev.source !== window) return;
        const data = ev.data;
        if (!data || data.source !== WP.SRC_UI) return;

        if (data.type === 'APPLY') {
            apply(data.payload);
        } else if (data.type === 'ROLE') {
            const becameHost = !isHost && Boolean(data.payload && data.payload.isHost);
            isHost = Boolean(data.payload && data.payload.isHost);
            if (becameHost) usePlan();   // ホストになったら、読めていた広告の位置をゲストへ送る
            if (becameHost && adapter) {
                // ゲストとして止めた直後だと、ホストとして押した再生が「勝手な再開」とみなされ
                // 止め直されてしまう（テストで発生）。合わせ込みの途中の状態を全部やめる
                adapter.releaseControl();
                stopFollowing();
                startup = false;
                deferredStop = false;
            }
        } else if (data.type === 'REQUEST_INFO') {
            sendInfo();
        } else if (data.type === 'PLAN') {
            // ホストが読んだ広告の入る位置（同じ作品と確かめてから届く）。自分で読めたものがあればそちらを使う
            if (adapter && typeof adapter.setAdPlan === 'function') {
                adapter.setAdPlan(data.payload, false);
                postStatus();
            }
        }
    });

    /*
     * このページ自身で読んだ広告の入る位置（content/prime-plan.js）。ホストなら別便でゲストへも送る
     * （スマホのスクリプトは読み込みが遅く、自分では読み逃すことがあるため）。
     */
    let ownPlan = null;
    let ownPlanAt = 0;
    let ownPlanUrl = '';
    window.addEventListener('message', (ev) => {
        if (ev.source !== window || !ev.data || ev.data.source !== 'wp-plan') return;
        ownPlan = ev.data.plan;
        ownPlanAt = Date.now();
        ownPlanUrl = location.href;
        checkEpisode(ev.data.titleId);
        usePlan();
    });
    function usePlan() {
        if (!ownPlan || !adapter || typeof adapter.setAdPlan !== 'function') return;
        const pageId = adapter.getContentId(location.href);
        // 読んだあとに別の作品へ移っていたら使わない（Prime は再生を始めると同じ作品のまま URL を書き換えるので、少しの間は許す）
        if (pageId !== adapter.getContentId(ownPlanUrl) && Date.now() - ownPlanAt > 20000) return;
        adapter.setAdPlan(ownPlan, true);
        postStatus();
        const contentId = pageInfo().contentId;
        if (isTop && isHost && contentId) post('META', { contentId, plan: ownPlan });
    }

    /*
     * ドラマの話（2026-09-14 ユーザー報告: ドラマだとゲストが別の話を再生した）。
     * Prime のドラマはシーズンのページのまま中で話を再生するので、ページのアドレス（シーズン）を送ると、
     * ゲストは自分の「続きを観る」の話を再生してしまう。
     * プレイヤーが取りに行った再生情報の titleId（いま再生している話の GTI）が、ページ自身の GTI と違えば
     * 「このページの中の話」とみなし、その GTI を作品として送る（amazon.co.jp/gp/video/detail/GTI/?autoplay=1 で
     * その話が再生されることを本物の Prime で確認）。映画はページの GTI と同じなので今までどおりページの ID を送る。
     */
    const GTI_RE = /^amzn1\.dv\.gti\.[0-9a-f-]{36}$/;
    let episode = null;   // { gti, page: シーズンのページの ID }
    let episodeTimer = null;
    const EPISODE_PRELOAD_WAIT_MS = 6000;
    function checkEpisode(titleId) {
        if (!adapter || adapter.constructor.service !== 'prime' || !isTop) return;
        if (typeof titleId !== 'string' || !GTI_RE.test(titleId)) return;
        clearInterval(episodeTimer);
        /*
         * その話が入っているページ。再生を始めると Amazon はアドレスを別の ID（0J… など）に書き換えるので、
         * いまのアドレスではなく、最後に送ったページの作品 ID を使う（2026-09-15 本物の Prime: 映画を再生してからルームを作ると、
         * 書き換わった ID を「別のページ」とみなし、映画を「作品が変わりました」の保留にして、ゲストが合わせられなかった）
         */
        const page = lastPageContentId || adapter.getContentId(location.href);
        let tries = 0;
        /*
         * プレイヤーが画面に出てから決める。作品ページを開いただけでも、Amazon は「続きを観る」の話を
         * 見えない所に用意して再生情報を取りに行く（本物の Prime で確認）。それを再生中の話と取り違えないため。
         * 用意されていた話は、プレイヤーが出てからしばらく新しい再生情報が来なかったとき（そのまま「続きを観る」を
         * 押したとき）だけ使う。別の話を押すと、プレイヤーが出たあとにその話の再生情報が届く（ここが呼び直される）
         */
        const openAtReceipt = Boolean(bound && adapter.isPlayerOpen());
        let openSince = openAtReceipt ? Date.now() - EPISODE_PRELOAD_WAIT_MS : 0;
        const decide = () => {
            if (!bound || !adapter.isPlayerOpen()) { openSince = 0; return; }
            if (!openSince) openSince = Date.now();
            if (Date.now() - openSince < EPISODE_PRELOAD_WAIT_MS) return;
            let pageGti = null;
            try { pageGti = adapter.getAppId(); } catch { /* ページの作りが変わった */ }
            // 再生を始めるとページの埋め込み情報が読めなくなることがある。先に読めていたページの GTI を使う
            pageGti = pageGti || pageAppId;
            if (!pageGti && ++tries < 10) return;
            clearInterval(episodeTimer);
            // ページの GTI が分からないままなら、話とはみなさない（映画を話と取り違えて保留にするより安全）
            const next = pageGti && titleId !== pageGti && titleId !== page ? { gti: titleId, page } : null;
            const changed = (next && next.gti) !== (episode && episode.gti);
            episode = next;
            if (changed) {
                post('DIAG', { event: 'episode', url: location.href, gti: titleId, pageGti, page });
                sendInfo();
            }
        };
        episodeTimer = setInterval(decide, 1000);
        decide();
    }

    /** いま再生している話（このページの中の話）。別の作品のページへ移っていたら null */
    function currentEpisode() {
        if (!episode || !adapter) return null;
        const page = adapter.getContentId(location.href);
        if (page === episode.page || page === episode.gti || (bound && adapter.isPlayerOpen())) return episode;
        episode = null;
        return null;
    }

    function pageInfo() {
        const ep = currentEpisode();
        if (ep) {
            return {
                service: adapter.constructor.service,
                contentId: ep.gti,
                url: adapter.buildUrl(ep.gti),
                // その話が入っているページ（シーズン）。そのページを送ってあれば、最初の話は確かめずに送る（background）
                pageContentId: ep.page
            };
        }
        const contentId = adapter.getContentId(location.href);
        return {
            service: adapter.constructor.service,
            contentId,
            // 参加者を飛ばす先。サービス側の余計なパラメータを除いた形にする
            url: (contentId && adapter.buildUrl(contentId)) || location.href
        };
    }

    /** 作品情報を送る。最上位フレームだけ（広告などの iframe が上書きしないように） */
    /** 最後に送ったページの作品 ID（話ではなくページそのもの）と、そのページの GTI */
    let lastPageContentId = null;
    let pageAppId = null;

    function sendInfo() {
        if (!adapter || !isTop) return;
        const info = pageInfo();
        if (!info.pageContentId && info.contentId && info.contentId !== lastPageContentId) {
            lastPageContentId = info.contentId;
            pageAppId = null;
        }
        post('INFO', info);
        lookForAppId(info.contentId);
    }

    /**
     * スマホのアプリを開くための内部 ID（Prime の GTI）を探して、見つかったら別便で送る。
     *
     * INFO（作品情報）に混ぜないのは、作品情報を送り直すとサーバー側の再生位置が 0 に戻るため
     * （同じ作品の change-video は位置を初期化する）。ページの埋め込み情報は読み込みの途中で
     * 入ることがあるので、しばらく探し続ける。
     */
    let appIdTimer = null;
    function lookForAppId(contentId) {
        clearInterval(appIdTimer);
        if (!contentId || typeof adapter.getAppId !== 'function') return;
        // スマホのスクリプトでは探さない（使うのはホストの PC だけ。ページの大きな埋め込みデータを毎秒読むので重い）
        if (typeof __WP_USERSCRIPT__ !== 'undefined') return;
        let tries = 0;
        const probe = () => {
            // 探している間に別の作品へ移っていたらやめる
            if (adapter.getContentId(location.href) !== contentId) return clearInterval(appIdTimer);
            let appId = null;
            try { appId = adapter.getAppId(); } catch { /* ページの作りが変わった */ }
            if (appId) {
                clearInterval(appIdTimer);
                if (contentId === lastPageContentId) pageAppId = appId;
                post('META', { contentId, appId });
            } else if (++tries >= 20) {
                clearInterval(appIdTimer);
            }
        };
        appIdTimer = setInterval(probe, 1000);
        probe();
    }

    /**
     * SPA 遷移では content script が再実行されないので、URL の変化を自前で見張る。
     * ただしサービスによっては、URL が変わっても作品は変わっていない。Prime は再生を始めると
     * 同じ作品の URL を別形式（ASIN → GTI）に書き換える。これを切り替えと取ると、
     * ゲストのページを開き直させてしまい、広告の入り方が変わって位置がずれる（実機で発生）。
     * どちらなのかはアダプタが決める（Netflix の URL 変化は本当に別の話数）。
     */
    function watchUrl() {
        let last = location.href;
        setInterval(() => {
            if (location.href === last) return;
            last = location.href;
            if (bound && adapter.ignoreUrlChange()) return;
            sendInfo();
        }, 500);
    }

    /**
     * ホストの再生位置と再生/停止を定期的に知らせる（ゲスト側で送っても background が捨てる）。
     * 停止中も送る。Amazon は作品ページを開いた時点で本編を「続きの位置で停止」の状態で
     * 用意しており、この初期状態ではイベントが一切出ないため、送らないとゲストが知る手段がない。
     */
    /*
     * 一瞬だけ 0 秒を読んだときは送らない（2026-09-16 iPhone 実機: ゲストが一瞬最初に戻る巻き戻しが頻発し、すぐ合った）。
     * Amazon は再生中に <video> を差し替えたり読み込み直したりし、その間は位置が 0 に読める。
     * それを送るとゲストが冒頭へ飛び、次の知らせ（5秒後）で戻っていた。
     * 20 秒以上先を見ていたのに急に 1.5 秒未満になったら、6 秒続くまで（本当に最初へ戻したのでなければ）送らない
     */
    let lastGoodT = 0;
    let zeroSince = 0;
    function bogusZero(t) {
        const now = Date.now();
        if (!Number.isFinite(t) || t >= 1.5) { if (Number.isFinite(t)) lastGoodT = t; zeroSince = 0; return false; }
        if (lastGoodT < 20) return false;
        if (!zeroSince) {
            zeroSince = now;
            // 記録: 何が 0 に読めたのか（2026-09-16 実機: ホストがただ流しているだけで、約1分ごとにゲストが冒頭へ戻された）
            const v = adapter._video;
            post('DIAG', {
                event: 'zero-read', t, lastGoodT, raw: v ? Math.round(v.currentTime * 10) / 10 : null,
                rs: v ? v.readyState : null, dur: v ? Math.round(v.duration) : null, paused: v ? v.paused : null,
                seeking: v ? v.seeking : null, videos: document.querySelectorAll('video').length,
                plan: typeof adapter.planSummary === 'function' ? adapter.planSummary() : null
            });
        }
        if (now - zeroSince < 6000) return true;
        lastGoodT = t;
        zeroSince = 0;
        return false;
    }

    function beat() {
        if (!bound || applying) return;
        const t = adapter.getCurrentTime();
        if (bogusZero(t)) return;
        post('PLAYER_EVENT', {
            type: 'tick',
            currentTime: t,
            paused: adapter.isPaused(),
            // 広告中は本編が止まっているので、ゲストは止まって待つことになる。表示用に伝える
            ad: adapter.isInAd(),
            timestamp: Date.now()
        });
        // 広告の入る位置の換算（画面の時間表示で確かめた目印）は黙って変わるので、定期的にも知らせる（記録用）
        if (typeof adapter.planSummary === 'function' && adapter.planSummary()) postStatus();
    }

    function startHeartbeat() {
        beat();   // プレイヤーを掴んだ時点の状態をすぐ知らせる
        setInterval(beat, WP.HEARTBEAT_MS);
    }

    function postStatus() {
        const v = adapter && adapter._video;
        let t = null;
        try { t = adapter ? adapter.getCurrentTime() : null; } catch { /* 未準備 */ }
        post('STATUS', {
            selfAd, hostAd, hostPaused,
            // ずれの見張り（2026-09-14）: 自分の本編の位置と止まっているか。友達の画面（スクリプト）がホストの位置と比べる
            t: Number.isFinite(t) ? Math.round(t * 10) / 10 : null,
            paused: adapter ? adapter.isPaused() : null,
            nf: adapter && adapter.constructor.service === 'netflix' && bound ? adapter.describeForDiag() : null,
            plan: adapter && typeof adapter.planSummary === 'function' ? adapter.planSummary() : null,
            // 記録用: 動画の読み込みの状態と、立て直しの回数（止まったまま動かない件の調査）
            diag: v ? {
                rs: v.readyState, seeking: v.seeking, ns: v.networkState, err: v.error ? v.error.code : 0,
                ahead: (() => {
                    try {
                        for (let i = 0; i < v.buffered.length; i++) {
                            if (v.buffered.start(i) <= v.currentTime && v.currentTime <= v.buffered.end(i)) return Math.round((v.buffered.end(i) - v.currentTime) * 10) / 10;
                        }
                    } catch { /* 無視 */ }
                    return 0;
                })(),
                startup, follow: targetPauseTime !== null, kicks: stuck.kicks, gaveUp: stuck.failed >= KICK_MAX_FAILED
            } : null
        });
    }

    function watchStuck() {
        setInterval(() => {
            if (!bound || isHost) return;
            const now = Date.now();
            const t = adapter.getCurrentTime();
            const v = adapter._video;
            const raw = v ? v.currentTime : t;
            /*
             * 動き出したか。飛んだこと自体でも位置は変わるので、それは数えない（2026-09-15 実機の記録: 飛んだ直後に
             * 「動き出した」とみなして待つのをやめ、読み込み中に5秒ごとに飛び直していた）。
             * 読み込み中でなく（seeking でない・データがある）、前回から普通の速さ（1秒に 0.3〜2 秒）で進んだときだけ
             */
            const step = rawLast === null ? 0 : raw - rawLast;
            const loaded = mediaLoaded(v);
            const advancing = rawLast !== null && loaded && !adapter.isPaused() && step > 0.3 && step < 2;
            if (advancing && settle && !settle.started) {
                settle.started = true;
                // 動き出した瞬間に、ホストより先にいる分（見込みより早く読めた分）だけ止まって待つ
                if (settle.lead > 0 && Number.isFinite(settle.target) && !hostPaused && !hostAd) {
                    const ahead = t - (settle.target + (now - settle.at) / 1000);
                    if (ahead > 0.3 && ahead < settle.lead + 2) {
                        settle.trimmed = true;
                        withEchoGuard(() => adapter.pause());
                        setTimeout(() => { if (!hostPaused && !hostAd) withEchoGuard(() => adapter.play()); }, Math.round(ahead * 1000));
                    }
                }
                // 飛んでから動き出すまでの時間 → 次に先へ飛ぶ量（1〜10秒。少しずつ覚え直す）
                const took = (now - settle.at) / 1000;
                loadLeadSec = Math.max(1, Math.min(10, loadLeadSec * 0.5 + (took + 0.5) * 0.5));
            }
            if (advancing) rawMovedAt = now;
            rawLast = raw;
            if (stuck.lastT === null || Math.abs(t - stuck.lastT) > 0.2) {
                // 立て直しのあと 10 秒以上ちゃんと進んだら、失敗の数を戻す
                if (stuck.failed && now - stuck.kickAt > 10000 && !adapter.isPaused()) stuck.failed = 0;
                stuck.lastT = t;
                stuck.movedAt = now;
            }
            // ホストが再生中（最近ホストの知らせが届いている）で、こちらは広告でも開いた直後でも追いつき待ちでもない
            const shouldPlay = now - lastApplyAt < 12000 && !hostPaused && !hostAd && !selfAd && !startup && targetPauseTime === null;
            if (!shouldPlay || adapter.isInAd()) { stuck.movedAt = now; return; }
            // 飛んだ先で読み込み中の間は待つ（立て直すと読み込みが最初からになる）
            if (settlePending(now)) return;
            if (now - Math.max(stuck.movedAt, rawMovedAt) < STUCK_MS || now - stuck.kickAt < KICK_GAP_MS) return;
            if (stuck.failed >= KICK_MAX_FAILED) return;
            stuck.kickAt = now;
            stuck.kicks++;
            stuck.failed++;
            post('DIAG', { event: 'stuck-kick', url: location.href, t, kicks: stuck.kicks });
            settle = null;
            withEchoGuard(() => adapter.pause());
            postStatus();
            // 少し待ってからホストの今の位置を取り直す（届いたら位置を合わせて再生する）
            setTimeout(() => post('READY', pageInfo()), 600);
        }, 1000);
        // ずれの見張りと記録のために、ときどき状態を送り直す
        setInterval(() => { if (bound && !isHost) postStatus(); }, 5000);
        // Netflix のホストの広告の様子を記録に残す（数分ずれた件の調査。2026-09-14）
        setInterval(() => {
            if (bound && isHost && adapter.constructor.service === 'netflix') post('DIAG', { event: 'nf-state', ...adapter.describeForDiag() });
        }, 30000);
    }

    function setHostState(next) {
        if (next.hostAd === hostAd && next.hostPaused === hostPaused) return;
        hostAd = next.hostAd;
        hostPaused = next.hostPaused;
        postStatus();
    }

    /** プレイヤーが開いた直後の猶予（STARTUP_*）を始める */
    function beginStartup() {
        startup = true;
        deferredStop = false;
        const began = Date.now();
        let played = 0;
        let last = began;
        const timer = setInterval(() => {
            if (!startup) return clearInterval(timer);
            const now = Date.now();
            if (!adapter.isPaused()) played += now - last;
            last = now;
            if (adapter.isInAd() || played >= WP.STARTUP_PLAY_MS || now - began >= WP.STARTUP_MAX_MS) {
                endStartup();
            }
        }, 250);
    }

    function endStartup() {
        if (!startup) return;
        startup = false;
        // 後回しにした「止まって待つ」をやり直す。広告中なら広告明けに watchAds がやる
        if (deferredStop && !adapter.isInAd()) post('READY', pageInfo());
        deferredStop = false;
    }

    /**
     * 自分の広告の始まりと終わりを見張る。
     * 終わったらホストの今の位置を取り直す（広告中はホストからの操作を無視しているため）。
     * 広告の見分け方はまだ実際の広告で確かめきれていないので、出入りのたびに様子を記録して送る。
     */
    /*
     * 同じページのまま作品が変わったらしいことに気づく（ホストのみ・2026-09-14）。
     * Prime はドラマの次の話へ自動で進んでもアドレスが変わらないことがあり、今までは気づけず、
     * ゲストが前の話のまま新しい話の時刻に合わせてしまった。次のどちらかで「変わった」とする:
     *   - 動画の長さが30秒以上変わった（別の話は長さが違う）
     *   - 最後の90秒あたりから、いきなり最初の30秒に戻った（長さがたまたま同じ話でも拾う）
     * Netflix / YouTube は次の話でアドレスが変わるので、ここでは Prime だけを見る（Netflix は広告で長さが揺れる）。
     * 気づいたら background が「保留」にし、ホストが「今の作品をゲストに送る」を押すまで再生位置を送らない。
     */
    function watchTitle() {
        let lastDur = NaN;
        let lastT = NaN;
        setInterval(() => {
            if (!bound || !isHost || adapter.constructor.service !== 'prime' || adapter.isInAd()) return;
            const dur = adapter.getDuration();
            const t = adapter.getCurrentTime();
            if (!Number.isFinite(dur) || dur <= 0 || !Number.isFinite(t)) return;
            /*
             * 長さの変化では判定しない（2026-09-14 実機）: Prime は広告の差し込みやページの移動で長さが変わり、
             * 作品を送った直後に「作品が変わった」と誤判定してゲストを待たせ続けた。
             * 次の話の自動再生は「終わり近くから冒頭へ戻った」で見る。別の作品のページへの移動はアドレスの変化で分かる
             */
            const restarted = Number.isFinite(lastT) && Number.isFinite(lastDur) && lastDur > 300 &&
                lastT > lastDur - 90 && t < 30;
            if (restarted) {
                post('DIAG', { event: 'title-changed', url: location.href, lastDur, dur, lastT, t });
                post('TITLE_CHANGED', pageInfo());
            }
            lastDur = dur;
            lastT = t;
        }, 2000);
    }

    function watchAds() {
        setInterval(() => {
            const now = adapter.isInAd();
            // ゲストの広告は最後まで流す。広告が始まる直前に「ホストに合わせて止まる」が
            // 当たると広告ごと止まり、広告中はこちらから手を出さないので止まったままになる（実機で発生）
            if (now && !isHost && adapter.isPaused()) adapter.play();
            if (now === selfAd) return;
            selfAd = now;
            postStatus();
            post('DIAG', { event: now ? 'ad-start' : 'ad-end', url: location.href, ...adapter.describeForDiag() });
            // ホストなら、広告の出入りをすぐ知らせる（ゲストが待ち始める／再生を再開する）。
            // 広告中も <video> は止まらないので、play/pause のイベントは出ない
            beat();
            if (!now) post('READY', pageInfo());   // ゲストなら、background がホストの位置を取りに行く
        }, 500);
    }

    /**
     * サービス側の確認ダイアログ（Netflix の「まだ見ていますか？」）を進める。
     * ホストが止まると全員が止まるので、ホストのときだけ。ゲストの画面は本人が押す
     * （ユーザーの判断。見ていない人の再生まで勝手に続けない）。
     */
    function watchInterruptions() {
        setInterval(() => {
            if (!bound || !isHost) return;
            try { adapter.dismissInterruption(); } catch (e) { console.warn('[wp] dismiss failed', e); }
        }, WP.INTERRUPT_CHECK_MS);
    }

    async function start() {
        adapter = globalThis.WPAdapters.resolve(location.href);
        if (!adapter) return;
        // 先に動いていた content/prime-plan.js が読めた分を取りに行く
        window.postMessage({ source: 'wp-plan-req' }, location.origin);

        // 作品の特定はプレイヤーを待たずに済ませる
        sendInfo();
        if (isTop) watchUrl();

        // 再生ボタンを押すまでプレイヤーが現れないことがあるので、期限なしで待つ
        await adapter.ready();
        bound = true;
        beginStartup();

        adapter.onStateChange((evt) => {
            if (applying) return;   // リモート適用によるイベントは送り返さない
            // 広告中の操作（シークバーを動かす等）は送らない。送るとゲストの広告が止まる。
            // 広告明けに本編が動き出したときの play で、ゲストはその位置に合わせられる
            if (adapter.isInAd()) return;
            if (bogusZero(evt.currentTime)) return;   // 読み込み直しの一瞬の 0 秒を「巻き戻し」として送らない
            post('PLAYER_EVENT', { ...evt, timestamp: Date.now() });
        });
        // アダプタが自分で見つけた「記録しておきたいこと」（Netflix の広告の手がかりなど）
        adapter.onDiag((payload) => post('DIAG', { url: location.href, ...payload }));

        startHeartbeat();
        watchAds();
        watchStuck();
        watchTitle();
        watchInterruptions();

        post('READY', pageInfo());
        console.log('[wp] bridge ready:', adapter.constructor.service);
    }

    start().catch(e => console.warn('[wp] bridge failed:', e));
})();

})();
