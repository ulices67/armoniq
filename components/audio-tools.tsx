'use client';
import {useState,useRef,useEffect,useCallback} from 'react';
import {toast} from 'sonner';
import {Heading,Icon,SelectField,useApp,Section} from './shared';
import {audioContext,Transport,TransportConfig,playNotes} from '@/lib/audio';
import {frequency,noteName,tunings,instruments} from '@/lib/content';
import {centsFrom,pitchToMidi} from '@/lib/pitch';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
export function usePitch(){
 const[running,setRunning]=useState(false),[reading,setReading]=useState<{frequency:number;confidence:number;rms:number}|null>(null),[error,setError]=useState('');
 const resources=useRef<{stream?:MediaStream;source?:MediaStreamAudioSourceNode;analyser?:AnalyserNode;worker?:Worker;timer?:ReturnType<typeof setInterval>}>({}),token=useRef(0);
 const stop=useCallback(()=>{token.current++;const r=resources.current;if(r.timer)clearInterval(r.timer);r.worker?.terminate();r.source?.disconnect();r.stream?.getTracks().forEach(t=>t.stop());resources.current={};setRunning(false);setReading(null);},[]);
 const start=async()=>{
  stop();setError('');const request=token.current;
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('El micrófono necesita un navegador compatible y una conexión segura.');
   const ctx=await audioContext();
   const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
   if(request!==token.current){stream.getTracks().forEach(t=>t.stop());return;}
   resources.current.stream=stream;
   const source=ctx.createMediaStreamSource(stream),analyser=ctx.createAnalyser();analyser.fftSize=8192;source.connect(analyser);
   resources.current.source=source;resources.current.analyser=analyser;
   const worker=new Worker(new URL('../lib/pitch.worker.ts',import.meta.url),{type:'module'});resources.current.worker=worker;
   let pending=false;worker.onmessage=e=>{pending=false;setReading(e.data);};worker.onerror=()=>{stop();setError('No se pudo iniciar el análisis de audio. Intenta de nuevo.');};
   const full=new Float32Array(analyser.fftSize);
   resources.current.timer=setInterval(()=>{if(pending)return;analyser.getFloatTimeDomainData(full);const samples=new Float32Array(4096);for(let i=0;i<4096;i++)samples[i]=(full[2*i]+full[2*i+1])/2;pending=true;worker.postMessage({samples,sampleRate:ctx.sampleRate/2},[samples.buffer]);},90);
   setRunning(true);
  }catch(e){stop();setError((e as Error).name==='NotAllowedError'?'El permiso del micrófono está desactivado. Permítelo en tu navegador y vuelve a intentar.':(e as Error).message);}
 };
 useEffect(()=>{const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);stop();};},[stop]);
 return {running,reading,error,start,stop};
}
export function Tuner(){
 const {profile,save,reload}=useApp();
 const[inst,setInst]=useState(profile.instrument),[tuning,setTuning]=useState(String(profile.settings.tuning||'Standard')),[a4,setA4]=useState(Number(profile.settings.a4)||440),[mode,setMode]=useState('auto'),[string,setString]=useState(0);
 const options=tunings[inst]||[],current=options.find(t=>t.name===tuning)||options[0],mic=usePitch();
 const[stable,setStable]=useState(false),[smooth,setSmooth]=useState<number|null>(null),buffer=useRef<number[]>([]),since=useRef(0),lastTarget=useRef(-1);
 const detected=mic.reading?Math.round(pitchToMidi(mic.reading.frequency,a4)):null;
 const target=detected===null?null:mode==='chromatic'||!current?detected:mode==='manual'?current.notes[Math.min(string,current.notes.length-1)]:current.notes.reduce((a,b)=>Math.abs(pitchToMidi(mic.reading!.frequency,a4)-a)<Math.abs(pitchToMidi(mic.reading!.frequency,a4)-b)?a:b);
 useEffect(()=>{
  if(!mic.reading||target===null){setSmooth(null);setStable(false);since.current=0;buffer.current=[];return;}
  if(lastTarget.current!==target){buffer.current=[];since.current=0;lastTarget.current=target;}
  const cents=centsFrom(mic.reading.frequency,frequency(target,a4));buffer.current=[...buffer.current.slice(-2),cents];const s=[...buffer.current].sort((a,b)=>a-b)[Math.floor(buffer.current.length/2)];setSmooth(s);
  if(Math.abs(cents)<=5){if(!since.current)since.current=performance.now();setStable(performance.now()-since.current>=300);}else{since.current=0;setStable(false);}
 },[mic.reading,target,a4]);
 const status=!mic.running?'Listo para escuchar':!mic.reading?'Toca una nota':stable?'En tono':smooth!==null&&smooth < -5?'Sube la afinación':smooth!==null&&smooth>5?'Baja la afinación':'Mantén la nota';
 return <><Heading eyebrow="ESCUCHA CADA DETALLE" title="Afinador inteligente" subtitle="Toca una cuerda, escucha y encuentra su lugar."/><div className="tool-layout"><div className="panel tool-main"><p className="eyebrow">{instruments.find(i=>i.id===inst)?.name} · {current?.name||'Cromático'}</p><div className="tuning-note">{detected===null?'—':noteName(detected)}</div><h3 aria-live="polite">{status}{stable&&' ✓'}</h3><div className="tuning-meter"><div className="tuning-needle" style={{left:((smooth===null?0:Math.max(-50,Math.min(50,smooth)))+50)+'%'}}/></div><div className="meter-labels"><span>♭ Grave · −50</span><span>0</span><span>+50 · Agudo ♯</span></div><div className="stats-row"><div><span className="stat-number">{mic.reading?mic.reading.frequency.toFixed(1):'—'}</span><p>Frecuencia · Hz</p></div><div><span className="stat-number">{smooth===null?'—':(smooth>0?'+':'')+smooth.toFixed(1)}</span><p>Desviación · cents</p></div><div><span className="stat-number">{target===null?'—':noteName(target)}</span><p>Nota objetivo</p></div></div><div className="signal" aria-hidden>{Array.from({length:45},(_,i)=><i key={i} style={{height:mic.reading?Math.max(3,Math.min(42,mic.reading.rms*350*(1+Math.sin(i*.9)))):3}}/>)}</div><button className="button" onClick={()=>mic.running?mic.stop():mic.start()}><Icon name={mic.running?'pause':'mic'}/>{mic.running?'Detener micrófono':'Escuchar mi instrumento'}</button>{mic.error&&<p role="alert" className="error-message">{mic.error}</p>}<p className="muted">El sonido se analiza en tu dispositivo. No se graba ni se sube.</p></div><aside className="panel tool-aside"><h2>Tu afinación</h2><div className="divider"/><SelectField label="Instrumento" value={inst} onChange={v=>{setInst(v);setTuning('Standard');setString(0);}} options={instruments.filter(i=>i.id!=='drums').map(i=>({value:i.id,label:i.name}))}/>{current&&<SelectField label="Afinación" value={current.name} onChange={setTuning} options={options.map(t=>({value:t.name,label:t.name}))}/>}<SelectField label="Detección" value={mode} onChange={setMode} options={[{value:'auto',label:'Automática'},{value:'manual',label:'Por cuerda'},{value:'chromatic',label:'Cromática'}]}/><SelectField label="Referencia A4" value={String(a4)} onChange={v=>setA4(Number(v))} options={[438,439,440,441,442].map(v=>({value:String(v),label:v+' Hz'}))}/>{current&&<><p className="muted">Selecciona una cuerda para escuchar su referencia. La escucha se detiene para evitar medir el altavoz.</p><div className="string-buttons">{current.notes.map((n,i)=><button key={i} className={string===i?'active':''} onClick={()=>{setString(i);mic.stop();playNotes([n],a4).catch(()=>toast.error('No se pudo reproducir la nota.'));}}>{noteName(n)}</button>)}</div></>}<button className="button secondary full" onClick={async()=>{try{await save({action:'profile',profile:{...profile,settings:{...profile.settings,a4,tuning:current?.name||'Standard'}}});await reload();toast.success('Preferencias guardadas');}catch(e){toast.error((e as Error).message);}}}>Guardar preferencias</button><a className="text-link" style={{display:'block'}} href="/afinaciones">Explorar perfiles de afinación</a></aside></div></>;
}
export function useMetronome(initial=80){
 const[bpm,setBpm]=useState(initial),[beats,setBeats]=useState(4),[denominator,setDenominator]=useState(4),[subdivision,setSubdivision]=useState(1),[swing,setSwing]=useState(.5),[volume,setVolume]=useState(.6),[silentEvery,setSilentEvery]=useState(0),[accents,setAccents]=useState([2,1,1,1]),[running,setRunning]=useState(false),[beat,setBeat]=useState(-1),[bar,setBar]=useState(0);
 const transport=useRef<Transport|null>(null),raf=useRef(0),starting=useRef(false);
 const config:TransportConfig={bpm,beats,denominator,subdivision,swing,volume,accents,silentEvery};
 const stop=useCallback(()=>{transport.current?.stop();cancelAnimationFrame(raf.current);setRunning(false);setBeat(-1);},[]);
 async function start(onBeat?:(index:number,time:number)=>void){
  if(starting.current)return;starting.current=true;
  try{const ctx=await audioContext();const t=new Transport(ctx,config);t.onBeat=onBeat;transport.current=t;t.start();setRunning(true);
  const update=()=>{if(!t.timer){stop();return;}const elapsed=ctx.currentTime-t.origin;const n=Math.floor(elapsed/(60/t.config.bpm*4/t.config.denominator));setBeat(n<0?-1:n%t.config.beats);setBar(Math.max(0,Math.floor(n/t.config.beats)));raf.current=requestAnimationFrame(update);};raf.current=requestAnimationFrame(update);
  }catch{toast.error('No se pudo iniciar el audio.');}finally{starting.current=false;}
 }
 useEffect(()=>{if(transport.current)transport.current.config=config;},[bpm,beats,denominator,subdivision,swing,volume,accents,silentEvery]);
 useEffect(()=>{if(running)stop();},[beats,denominator,subdivision,bpm,swing]);
 useEffect(()=>{const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);transport.current?.stop();cancelAnimationFrame(raf.current);};},[stop]);
 return {bpm,setBpm,beats,setBeats,denominator,setDenominator,subdivision,setSubdivision,swing,setSwing,volume,setVolume,silentEvery,setSilentEvery,accents,setAccents,running,beat,bar,start,stop,transport};
}
export function Metronome(){
 const {profile,save,reload}=useApp(),m=useMetronome(Number(profile.settings.bpm)||80),taps=useRef<number[]>([]);
 function tap(){const now=performance.now();taps.current=taps.current.filter(t=>now-t<4000).slice(-5);taps.current.push(now);if(taps.current.length>1){const intervals=taps.current.slice(1).map((t,i)=>t-taps.current[i]).sort((a,b)=>a-b);m.setBpm(Math.max(20,Math.min(300,Math.round(60000/intervals[Math.floor(intervals.length/2)]))));}}
 return <><Heading eyebrow="ENCUENTRA TU PULSO" title="Metrónomo" subtitle="Dale a cada nota su momento."/><div className="tool-layout"><div className="panel tool-main"><p className="eyebrow">TEMPO</p><div className="inline"><button className="circle-button" aria-label="Reducir tempo" onClick={()=>m.setBpm(Math.max(20,m.bpm-1))}><Icon name="minus"/></button><input className="bpm-input" aria-label="Tempo en BPM" type="number" min="20" max="300" value={m.bpm} onChange={e=>m.setBpm(Math.max(20,Math.min(300,Number(e.target.value)||20)))}/><button className="circle-button" aria-label="Aumentar tempo" onClick={()=>m.setBpm(Math.min(300,m.bpm+1))}><Icon name="plus"/></button></div><p>BPM · negra</p><div className="beats">{Array.from({length:m.beats},(_,i)=><button key={i} className={'beat '+(m.beat===i?'current':'')} aria-label={'Pulso '+(i+1)+', acento '+(m.accents[i]??1)} onClick={()=>m.setAccents(Array.from({length:m.beats},(_,j)=>i===j?((m.accents[j]??1)+1)%3:(m.accents[j]??1)))}>{(m.accents[i]??1)===0?'—':(m.accents[i]??1)===2?'●':i+1}</button>)}</div><p className="muted">Pulsa cada tiempo para cambiar su acento o silenciarlo.</p><div className="transport-controls"><button className="button secondary" onClick={tap}>Tap tempo</button><button className="play-button" aria-label={m.running?'Detener metrónomo':'Iniciar metrónomo'} onClick={()=>m.running?m.stop():m.start()}><Icon name={m.running?'pause':'play'} size={30}/></button></div><p>{m.running?'Compás '+(m.bar+1):'Listo cuando tú quieras.'}</p><div className="notice">Respira, escucha cuatro pulsos y empieza. No hace falta correr.</div></div><aside className="panel tool-aside"><h2>A tu medida</h2><div className="divider"/><SelectField label="Compás" value={m.beats+'/'+m.denominator} onChange={v=>{const[b,d]=v.split('/').map(Number);m.setBeats(b);m.setDenominator(d);m.setAccents(Array.from({length:b},(_,i)=>i===0?2:1));}} options={['2/4','3/4','4/4','6/8','7/8'].map(v=>({value:v,label:v}))}/><SelectField label="Subdivisión por tiempo" value={String(m.subdivision)} onChange={v=>m.setSubdivision(Number(v))} options={[{value:'1',label:'Sin subdivisión'},{value:'2',label:'Dos partes'},{value:'3',label:'Tresillos'},{value:'4',label:'Cuatro partes'}]}/><label className="field"><span>Swing · {Math.round((m.swing-.5)*300)}%</span><Slider aria-label="Swing" min={.5} max={.75} step={.01} value={[m.swing]} onValueChange={v=>m.setSwing(v[0])} disabled={m.subdivision!==2}/></label><label className="field"><span>Volumen · {Math.round(m.volume*100)}%</span><Slider aria-label="Volumen" min={0} max={1} step={.05} value={[m.volume]} onValueChange={v=>m.setVolume(v[0])}/></label><label className="row"><span>Silenciar cada 4º compás</span><Switch checked={m.silentEvery===4} onCheckedChange={v=>m.setSilentEvery(v?4:0)} aria-label="Silenciar cada cuarto compás"/></label><p className="muted">En 6/8 los BPM se expresan en negras: 60 BPM equivale a 120 corcheas por minuto. Los cambios de tempo detienen la reproducción para empezar con un pulso claro.</p><button className="button secondary full" onClick={async()=>{try{await save({action:'profile',profile:{...profile,settings:{...profile.settings,bpm:m.bpm}}});await reload();toast.success('Tempo preferido guardado');}catch(e){toast.error((e as Error).message);}}}>Guardar tempo</button></aside></div></>;
}
export function Tunings(){
 const {profile,save,reload}=useApp(),[inst,setInst]=useState(tunings[profile.instrument]?profile.instrument:'guitar');
 return <><Heading title="Motor de afinaciones" subtitle="Una nueva afinación, otra forma de explorar tu instrumento."/><SelectField label="Instrumento" value={inst} onChange={setInst} options={instruments.filter(i=>tunings[i.id]).map(i=>({value:i.id,label:i.name}))}/><div className="two-cols">{tunings[inst].map((t,i)=><div key={t.name} className="panel"><div className="row"><span className={'icon-bubble '+(i%2?'orange':'')}><Icon name="wave"/></span><h2>{t.name}</h2></div><p style={{margin:'24px 0',fontSize:21,fontFamily:'Georgia'}}>{t.notes.map(n=>noteName(n)).join(' · ')}</p><div className="row"><button className="button secondary" onClick={()=>playNotes(t.notes).catch(()=>toast.error('No se pudo iniciar el audio.'))}><Icon name="volume"/>Escuchar</button><button className="button" onClick={async()=>{try{await save({action:'profile',profile:{...profile,instrument:inst,settings:{...profile.settings,tuning:t.name}}});await reload();location.assign('/afinador');}catch(e){toast.error((e as Error).message);}}}>Usar afinación</button></div></div>)}</div></>;
}

