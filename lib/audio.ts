import { frequency } from './content';
let shared:AudioContext|null=null;
export async function audioContext(){
 if(!shared||shared.state==='closed')shared=new AudioContext({latencyHint:'interactive'});
 if(shared.state!=='running')await shared.resume();return shared;
}
export function tone(ctx:AudioContext,hz:number,at=ctx.currentTime,duration=0.8,volume=0.14,type:OscillatorType='triangle'){
 const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type=type;oscillator.frequency.value=hz;
 gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+0.006);gain.gain.exponentialRampToValueAtTime(0.0001,at+duration);
 oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(at);oscillator.stop(at+duration+0.02);
 oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};return oscillator;
}
export async function playNotes(notes:number[],a4=440){const c=await audioContext();notes.forEach((n,i)=>tone(c,frequency(n,a4),c.currentTime+i*0.035,1.2,0.11/Math.sqrt(notes.length)));}
export type TransportConfig={bpm:number;beats:number;denominator:number;subdivision:number;swing:number;volume:number;accents:number[];silentEvery:number};
export class Transport{
 ctx:AudioContext;config:TransportConfig;timer:ReturnType<typeof setInterval>|null=null;nodes:OscillatorNode[]=[];next=0;index=0;origin=0;onBeat?:(index:number,time:number)=>void;
 constructor(ctx:AudioContext,config:TransportConfig){this.ctx=ctx;this.config=config;}
 get step(){return 60/this.config.bpm*4/this.config.denominator/this.config.subdivision;}
 start(){this.stop();this.origin=this.ctx.currentTime+0.1;this.next=this.origin;this.index=0;this.schedule();this.timer=setInterval(()=>this.schedule(),25);}
 schedule(){
 const c=this.config;
 // Re-anchor after a stalled tab; never emit a burst of overdue clicks.
 if(this.next<this.ctx.currentTime-0.1){this.stop();return;}
 while(this.next<this.ctx.currentTime+0.12){
 const sub=this.index%c.subdivision,beat=Math.floor(this.index/c.subdivision)%c.beats,bar=Math.floor(this.index/(c.subdivision*c.beats));
 const silent=c.silentEvery>0&&(bar+1)%c.silentEvery===0;
 const accent=c.accents[beat]??1;
 if(!silent&&accent>0){const hz=sub?850:accent===2?1600:1100;
 const node=tone(this.ctx,hz,this.next,0.035,c.volume*(sub?0.12:accent===2?0.3:0.2),'sine');this.nodes.push(node);}
 this.nodes=this.nodes.slice(-100);
 this.onBeat?.(this.index,this.next);
 const step=this.step;this.next+=c.subdivision===2?step*(sub===0?2*c.swing:2*(1-c.swing)):step;this.index++;
 }
 }
 stop(){if(this.timer)clearInterval(this.timer);this.timer=null;for(const node of this.nodes){try{node.stop();}catch{}}this.nodes=[];}
}

