// YIN: normalized difference with parabolic interpolation. Monophonic only.
export function detectPitch(samples:Float32Array,sampleRate:number,minHz=27,maxHz=1400):{frequency:number;confidence:number;rms:number}|null{
 let power=0,mean=0;for(const x of samples){power+=x*x;mean+=x;}const rms=Math.sqrt(power/samples.length);if(rms<0.008)return null;
 mean/=samples.length;
 const maxTau=Math.min(Math.floor(sampleRate/minHz),Math.floor(samples.length/2)-1),minTau=Math.max(2,Math.floor(sampleRate/maxHz)),size=Math.floor(samples.length/2);
 const d=new Float32Array(maxTau+1);let running=0;d[0]=1;
 for(let tau=1;tau<=maxTau;tau++){
 let sum=0;for(let j=0;j<size;j++){const delta=(samples[j]-mean)-(samples[j+tau]-mean);sum+=delta*delta;}
 running+=sum;d[tau]=running>0?sum*tau/running:1;
 }
 let tau=-1;for(let t=minTau;t<maxTau;t++){if(d[t]<0.14){while(t+1<maxTau&&d[t+1]<d[t])t++;tau=t;break;}}
 if(tau<0)return null;
 const a=d[tau-1],b=d[tau],c=d[tau+1],den=2*(2*b-c-a);
 const shift=den?Math.max(-1,Math.min(1,(c-a)/den)):0;
 return {frequency:sampleRate/(tau+shift),confidence:1-b,rms};
}
export function pitchToMidi(hz:number,a4=440){return 69+12*Math.log2(hz/a4);}
export function centsFrom(hz:number,target:number){return 1200*Math.log2(hz/target);}
export function scoreTiming(errors:number[],expectedCount:number){
 if(!expectedCount)return null;
 return Math.round(errors.reduce((sum,x)=>sum+Math.max(0,1-Math.abs(x)/200),0)/expectedCount*100);
}
