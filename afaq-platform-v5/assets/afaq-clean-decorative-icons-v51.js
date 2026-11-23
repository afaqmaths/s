/* AFAQMATHS • remove decorative AI-like sparkle marks site-wide without touching
   educational icons, math symbols, interactive controls or user input values. */
(function(){
 'use strict';
 if(typeof document==='undefined')return;
 const symbols=/[✦✧✨🪄]/gu;
 const reTest=/[✦✧✨🪄]/u;
 const skipTags=new Set(['SCRIPT','STYLE','TEXTAREA','CODE','PRE','KBD','SAMP','SVG','MATH','NOSCRIPT']);
 function clearDecorativeMarks(root){
  if(!root||!document.createTreeWalker||typeof NodeFilter==='undefined')return;
  const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const edits=[];
  while(walk.nextNode()){
   const node=walk.currentNode, text=node.nodeValue||'';
   if(!reTest.test(text))continue;
   const parent=node.parentElement;
   if(!parent||skipTags.has(parent.tagName)||parent.closest('[contenteditable="true"],script,style,textarea,code,pre,svg,math'))continue;
   edits.push({node,cleaned:text.replace(symbols,'').replace(/ {2,}/g,' ')});
  }
  edits.forEach(({node,cleaned})=>{if(node.nodeValue!==cleaned)node.nodeValue=cleaned;});
  root.querySelectorAll?.('.afaq-gilded-star,.v9-news-divider,.v13-headline-separator,.ae-separator')
   .forEach(el=>{
    if(!el.textContent.trim()&&!el.querySelector('img,svg'))el.setAttribute('hidden','');
   });
 }
 const decorate=()=>{
  clearDecorativeMarks(document.getElementById('app'));
  clearDecorativeMarks(document.querySelector('.afaq-portal-modal-backdrop'));
 };
 if(typeof render==='function'){
  const prior=render;
  render=function(...args){const value=prior.apply(this,args);decorate();return value;};
 }
 if(typeof attach==='function'){
  const prior=attach;
  attach=function(...args){const value=prior.apply(this,args);decorate();return value;};
 }
 const app=document.getElementById('app');
 if(app&&typeof MutationObserver!=='undefined'){
  new MutationObserver(records=>{
   if(records.some(r=>r.addedNodes.length))clearDecorativeMarks(app);
  }).observe(app,{childList:true,subtree:true});
 }
 decorate();
})();