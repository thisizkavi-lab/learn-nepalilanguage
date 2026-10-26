/* Learn Nepali graded story reader. Keep sidebar, hover glossary, TTS, roman toggle,
   translation reveal, completion and chapter tabs. */
(() => {
'use strict';
const LEVELS=window.READING_STORY_LEVELS||[];
const COMMON={
'र':['and','ra'],'म':['I','ma'],'उसले':['he/she (agent)','usle'],'उनी':['he/she','unī'],
'एक':['one','ek'],'एउटा':['one / a','euṭā'],'दुई':['two','duī'],'घर':['home','ghar'],
'गाउँ':['village','gāũ'],'गाउँमा':['in a village','gāũmā'],'थियो':['was','thiyo'],
'थिए':['were','thie'],'छ':['is','cha'],'छन्':['are','chan'],'तर':['but','tara'],
'त्यसपछि':['after that','tyaspachi'],'पछि':['after','pachi'],'धेरै':['very / many','dherai'],
'दिन':['day','din'],'एकदिन':['one day','ekdin'],'सानो':['small','sāno'],'ठूलो':['large','ṭhūlo'],
'सधैँ':['always','sadhaĩ'],'अब':['now','aba'],'राम्रो':['good','rāmro'],
'पानी':['water','pānī'],'साथी':['friend','sāthī'],'फेरि':['again','pheri'],
'भन्यो':['said','bhanyo'],'भनिन्':['said','bhanin'],'भने':['said','bhane'],
'आयो':['came','āyo'],'गयो':['went','gayo'],'खुसी':['happy','khusī'],
'कसरी':['how','kasarī'],'किन':['why','kina'],'के':['what','ke'],'पनि':['also','pani'],
'भयो':['happened','bhayo'],'आफ्नो':['own','āphno'],'सबै':['all','sabai']
};
let levelIndex=0,storyIndex=0;
let showRoman=localStorage.getItem('nepali-show-roman')!=='false';
let completed;try{completed=new Set(JSON.parse(localStorage.getItem('nepali-reading-completed-v1')||'[]'))}catch{completed=new Set()}
const byId=id=>document.getElementById(id);
function el(tag,cls,txt){
const node=document.createElement(tag);
if(cls)node.className=cls;
if(txt!==undefined)node.textContent=txt;
return node;
}
function updateVocab(word,info){
const bar=byId('vocab-display');
bar.replaceChildren(el('span','vocab-np',word));
if(info){
if(showRoman&&info[1])bar.appendChild(el('span','vocab-roman',info[1]));
bar.appendChild(el('span','vocab-en',info[0]));
}else bar.appendChild(el('span','vocab-en','Not yet in the glossary'));
}
function strip(word){return word.replace(/^[“"‘'(\[]+|[।,?!:;”"’')\]]+$/g,'');}
function lookup(story,word){let clean=strip(word);return story.glossary[clean]||COMMON[clean]||null;}
function speaker(text){
const btn=el('button','speak-btn','▶');
btn.type='button';btn.title='Browser voice: verify Nepali pronunciation';
btn.setAttribute('aria-label','Listen to Nepali paragraph');
btn.addEventListener('click',()=>{
if(!window.speechSynthesis)return;
speechSynthesis.cancel();
const utt=new SpeechSynthesisUtterance(text);utt.lang='ne-NP';utt.rate=.85;
const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('ne'));
if(voice)utt.voice=voice;
speechSynthesis.speak(utt);
btn.classList.add('speak-active');setTimeout(()=>btn.classList.remove('speak-active'),600);
});return btn;
}
function sidebar(){
const ul=byId('level-list');ul.replaceChildren();
LEVELS.forEach((level,i)=>{
const li=el('li','level-item'+(i===levelIndex?' active':''));
li.dataset.level=level.id;li.tabIndex=0;li.setAttribute('role','button');
const info=el('div','level-info');
info.append(el('span','level-label',level.english),el('span','level-sublabel','Level '+(i+1)+' · '+level.stories.length+' stories'));
li.append(el('span','level-icon',level.number),info);
const fn=()=>setReading(i,0);
li.addEventListener('click',fn);
li.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}});
ul.appendChild(li);
});
}
function progress(){
const stories=LEVELS[levelIndex].stories;
const count=stories.filter(s=>completed.has(s.id)).length;
byId('progress-bar-container').style.display='';
byId('progress-label').textContent=count+' / '+stories.length+' stories completed';
byId('progress-fill').style.width=(count/stories.length*100)+'%';
}
function parsedRoute(){
const route=decodeURIComponent(location.hash.slice(1)).split('/');
let li=LEVELS.findIndex(l=>l.id===route[0]);
if(li===-1){
const saved=(localStorage.getItem('nepali-reading-last')||'').split('/');
li=LEVELS.findIndex(l=>l.id===saved[0]);
if(li===-1)return[0,0];
route[1]=saved[1];
}
const si=LEVELS[li].stories.findIndex(s=>s.id===route[1]);
return[li,Math.max(0,si)];
}
function setReading(li,si,modifyUrl=true){
levelIndex=li;storyIndex=si;
const level=LEVELS[li];const story=level.stories[si];
localStorage.setItem('nepali-reading-last',level.id+'/'+story.id);
if(modifyUrl)history.replaceState(null,'','#'+level.id+'/'+story.id);
sidebar();render();byId('reading-sidebar').classList.remove('open');
if(modifyUrl)window.scrollTo({top:0,behavior:'instant'});
}
function addHoverable(parent,story,raw){
const info=lookup(story,raw);const w=el('span','hoverable-word',raw);
w.tabIndex=0;w.setAttribute('role','button');
const show=()=>{updateVocab(strip(raw),info);w.classList.add('word-active');};
w.addEventListener('mouseenter',show);
w.addEventListener('focus',show);
w.addEventListener('click',show);
w.addEventListener('mouseleave',()=>w.classList.remove('word-active'));
w.addEventListener('blur',()=>w.classList.remove('word-active'));
parent.append(w,document.createTextNode(' '));
}
function render(){
const lvl=LEVELS[levelIndex],story=lvl.stories[storyIndex];
const main=byId('reading-content');main.replaceChildren();
byId('vocab-display').replaceChildren(el('span','vocab-hint','Hover or tap any Nepali word to see its meaning'));
const header=el('header','content-header');
header.append(el('h2','','Level '+(levelIndex+1)+' — '+lvl.english),el('p','content-subtitle',lvl.description));
main.appendChild(header);
const tabs=el('nav','item-tabs');tabs.setAttribute('aria-label','Choose a story');
lvl.stories.forEach((s,i)=>{
const btn=el('button','item-tab'+(storyIndex===i?' active':''),(i+1)+'. '+s.title);
btn.type='button';btn.addEventListener('click',()=>setReading(levelIndex,i));tabs.appendChild(btn);
});
main.appendChild(tabs);
const block=el('article','reading-block story-reading');
block.append(el('h3','reading-title',story.title));
const metadata=el('div','story-meta');
metadata.append(el('span','story-tag',story.category),el('span','story-origin',story.origin));
block.appendChild(metadata);
if(story.illustration){
const figure=el('figure','story-illustration'),img=el('img');
img.src='assets/reading/'+story.illustration+'.png';
img.alt='Illustration for '+story.title;img.loading='lazy';img.decoding='async';
figure.append(img,el('figcaption','','Illustration · '+story.title));block.appendChild(figure);
}
const text=el('div','reading-text');
story.paragraphs.forEach(para=>{
const p=el('p','');para.trim().split(/\s+/).forEach(word=>addHoverable(p,story,word));
p.appendChild(speaker(para));text.appendChild(p);
});block.appendChild(text);
const toggle=el('button','translation-toggle','Show English Translation');
toggle.type='button';toggle.setAttribute('aria-expanded','false');
const translation=el('div','translation-text hidden',story.translation.join('\n\n'));
toggle.addEventListener('click',()=>{
const hidden=translation.classList.toggle('hidden');
toggle.textContent=hidden?'Show English Translation':'Hide English Translation';
toggle.setAttribute('aria-expanded',String(!hidden));
});block.append(toggle,translation);
block.appendChild(el('h4','story-subhead','Useful words'));
const glossary=el('div','story-glossary');
Object.entries(story.glossary).forEach(([np,info])=>{
const item=el('div','story-gloss-item');
item.appendChild(el('strong','',np));
const roman=el('span','roman-sub',info[1]);
if(!showRoman)roman.style.display='none';
item.append(roman,el('span','story-gloss-en',info[0]));
glossary.appendChild(item);
});block.appendChild(glossary);
block.appendChild(el('h4','story-subhead','Check your understanding'));
const questions=el('div','story-questions');
story.questions.forEach((item,i)=>{
const detail=el('details','story-question');
detail.append(el('summary','',(i+1)+'. '+item.q),el('p','story-answer',item.a));
questions.appendChild(detail);
});block.appendChild(questions);
if(story.source){
const credit=el('p','story-source','Story tradition / context: ');
const a=el('a','','Source');a.href=story.source;a.target='_blank';a.rel='noopener noreferrer';
credit.appendChild(a);block.appendChild(credit);
}
const actions=el('div','story-actions');
const mark=el('button','story-complete'+(completed.has(story.id)?' done':''),completed.has(story.id)?'✓ Completed':'✓ Mark as read');
mark.type='button';
mark.addEventListener('click',()=>{
if(completed.has(story.id))completed.delete(story.id);else completed.add(story.id);
localStorage.setItem('nepali-reading-completed-v1',JSON.stringify([...completed]));
mark.classList.toggle('done',completed.has(story.id));
mark.textContent=completed.has(story.id)?'✓ Completed':'✓ Mark as read';progress();
});actions.appendChild(mark);
if(storyIndex>0){const prev=el('button','story-nav','← Previous');prev.type='button';prev.addEventListener('click',()=>setReading(levelIndex,storyIndex-1));actions.appendChild(prev);}
if(storyIndex<lvl.stories.length-1){const next=el('button','story-nav','Next story →');next.type='button';next.addEventListener('click',()=>setReading(levelIndex,storyIndex+1));actions.appendChild(next);}
block.appendChild(actions);main.appendChild(block);progress();
}
document.addEventListener('DOMContentLoaded',()=>{
if(!LEVELS.length)return;
const toggle=byId('roman-toggle');
if(toggle){toggle.checked=showRoman;toggle.addEventListener('change',()=>{
showRoman=toggle.checked;
localStorage.setItem('nepali-show-roman',String(showRoman));
document.querySelectorAll('.roman-sub,.vocab-roman').forEach(el=>el.style.display=showRoman?'':'none');
});}
const theme=byId('theme-toggle');
if(theme)theme.addEventListener('click',()=>{
const next=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
document.documentElement.setAttribute('data-theme',next);
localStorage.setItem('nepali-theme',next);
});
const menu=byId('reading-menu-toggle');
if(menu)menu.addEventListener('click',()=>{
const nav=byId('reading-sidebar');nav.classList.toggle('open');
menu.setAttribute('aria-expanded',String(nav.classList.contains('open')));
});
window.addEventListener('hashchange',()=>{const [li,si]=parsedRoute();setReading(li,si,false);});
const [li,si]=parsedRoute();setReading(li,si,false);
});
})();
