(()=>{
  const body=document.body;
  const form=document.querySelector('#unlock-form');
  const input=document.querySelector('#password');
  const button=document.querySelector('#submit');
  const error=document.querySelector('#error');
  const payloadUrl=body.dataset.payload;
  const cacheKey=body.dataset.cacheKey;
  const fromB64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const toB64=bytes=>{let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s)};
  let payloadPromise;
  const payload=()=>payloadPromise??=fetch(payloadUrl,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('payload');return r.json()});
  async function keyFromPassword(password,data){
    const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:fromB64(data.salt),iterations:data.iterations},base,{name:'AES-GCM',length:256},true,['decrypt']);
  }
  async function decryptWithKey(key,data){
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromB64(data.iv)},key,fromB64(data.ciphertext));
    return new TextDecoder().decode(plain);
  }
  function render(html){document.open();document.write(html);document.close()}
  async function unlock(password){
    const data=await payload();
    const key=await keyFromPassword(password,data);
    const html=await decryptWithKey(key,data);
    const raw=await crypto.subtle.exportKey('raw',key);
    sessionStorage.setItem(cacheKey,toB64(new Uint8Array(raw)));
    render(html);
  }
  async function unlockCached(){
    const saved=sessionStorage.getItem(cacheKey);if(!saved)return;
    try{const data=await payload();const key=await crypto.subtle.importKey('raw',fromB64(saved),{name:'AES-GCM'},false,['decrypt']);render(await decryptWithKey(key,data))}catch{sessionStorage.removeItem(cacheKey)}
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault();error.textContent='';button.disabled=true;button.textContent='확인 중…';
    try{await unlock(input.value)}catch{error.textContent='비밀번호가 일치하지 않습니다.';input.select();button.disabled=false;button.textContent='보고서 열기'}
  });
  unlockCached();
})();
