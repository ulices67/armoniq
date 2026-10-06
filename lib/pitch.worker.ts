import {detectPitch} from './pitch';
self.onmessage=(e:MessageEvent<{samples:Float32Array;sampleRate:number}>)=>{
 const result=detectPitch(e.data.samples,e.data.sampleRate);
 self.postMessage(result);
};
