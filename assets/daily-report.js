document.documentElement.classList.add('motion-ready');

const bar=document.querySelector('.progress');
if(bar){
  const updateProgress=()=>{const max=document.documentElement.scrollHeight-innerHeight;bar.style.width=(max>0?scrollY/max*100:0)+'%'};
  addEventListener('scroll',updateProgress,{passive:true});
  updateProgress();
}

const reveals=[...document.querySelectorAll('.reveal')];
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(items=>items.forEach(item=>{if(item.isIntersecting){item.target.classList.add('visible');observer.unobserve(item.target)}}),{threshold:.08});
  reveals.forEach(element=>observer.observe(element));
}else{
  reveals.forEach(element=>element.classList.add('visible'));
}
