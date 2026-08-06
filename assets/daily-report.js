const bar=document.querySelector('.progress');
const updateProgress=()=>{const max=document.documentElement.scrollHeight-innerHeight;bar.style.width=(max>0?scrollY/max*100:0)+'%'};
addEventListener('scroll',updateProgress,{passive:true});
updateProgress();
const observer=new IntersectionObserver(items=>items.forEach(item=>{if(item.isIntersecting){item.target.classList.add('visible');observer.unobserve(item.target)}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
