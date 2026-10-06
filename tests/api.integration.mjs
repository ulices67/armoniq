import assert from 'node:assert/strict';
const base=process.env.ARMONIQ_TEST_URL||'http://127.0.0.1:5195';
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base))throw new Error('Integration tests only run against local built Worker.');
const uid='qa-'+crypto.randomUUID(),other='qa-'+crypto.randomUUID();
const headers={'Connection':'close','Origin':base,'Content-Type':'application/json','oai-authenticated-user-id':uid,'oai-authenticated-user-email':'qa@example.test'};
async function request(method,body,extra={}){
 const r=await fetch(base+'/api/state',{method,headers:{...headers,...extra},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json()};
}
let checks=0;
function check(condition,label){assert.ok(condition,label);checks++;console.log('PASS '+label);}
try{
 let r=await fetch(base+'/api/state');await r.text();check(r.status===401,'Anonymous state rejected');
 let x=await request('POST',{action:'profile',profile:{name:'QA',instrument:'guitar',level:'Principiante',goal:'Pruebas locales',minutes:20,settings:{}}},{Origin:'https://invalid.example'});check(x.status===403,'Cross-origin mutation rejected');
 x=await request('POST',{action:'profile',profile:{name:'',instrument:'invalid',minutes:999}});check(x.status===400,'Invalid profile rejected');
 x=await request('POST',{action:'profile',profile:{name:'QA',instrument:'guitar',level:'Principiante',goal:'Pruebas locales',minutes:20,settings:{}}});check(x.status===200,'Profile saved');
 x=await request('GET');check(x.body.profile.name==='QA','Profile persists');
 x=await request('GET',null,{'oai-authenticated-user-id':other});check(x.body.profile===null,'User data isolated');
 await request('POST',{action:'complete',lessonId:'g',instrument:'guitar'});
 await request('POST',{action:'complete',lessonId:'g',instrument:'guitar'});
 x=await request('GET');check(x.body.completions.length===1,'Lesson completion idempotent');
 x=await request('POST',{action:'complete',lessonId:'g',instrument:'violin'});check(x.status===400,'Instrument curriculum validated');
 await request('POST',{action:'favorite',itemId:'chord:G',enabled:true});
 x=await request('GET');check(x.body.favorites.includes('chord:G'),'Favorite persists');
 x=await request('POST',{action:'start',kind:'estudio',instrument:'guitar'});const id=x.body.id;check(typeof id==='string','Session starts server-side');
 x=await request('POST',{action:'profile',profile:{name:'QA2',instrument:'piano',level:'Principiante',goal:'Pruebas locales',minutes:10,settings:{}}},{'oai-authenticated-user-id':other});check(x.status===200,'Second test profile saved');
 x=await request('POST',{action:'finish',id,seconds:99,score:99,observations:{}},{'oai-authenticated-user-id':other});check(x.status===404,'Cross-user session write rejected');
 x=await request('POST',{action:'finish',id,seconds:14400,score:99,observations:{note:'local QA'}});check(x.status===200,'Session finished');
 await request('POST',{action:'finish',id,seconds:10,score:50,observations:{}});
 x=await request('GET');check(x.body.sessions.length===1,'Finish idempotent');check(x.body.sessions[0].seconds<10,'Duration bounded by server elapsed time');check(x.body.sessions[0].score===null,'Free practice never invents a score');
 for(const path of ['/','/bienvenida','/acceso','/perfil-musical','/inicio','/aprender','/leccion/g','/practica','/afinador','/afinaciones','/metronomo','/acordes','/notas','/canciones','/cancion/nuevo-dia','/estudio','/oido','/ritmo','/profesor','/perfil','/privacidad']){
  const response=await fetch(base+path,{headers});await response.text();check(response.status===200,'Route '+path);
 }
 const missing=await fetch(base+'/not-a-route');check(missing.status===404,'Unknown route returns 404');
 console.log('Integration checks passed: '+checks);
}finally{
 await request('POST',{action:'delete'});
 await request('POST',{action:'delete'}, {'oai-authenticated-user-id':other});
}


