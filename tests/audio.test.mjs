import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../lib/pitch.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {detectPitch,centsFrom,pitchToMidi,scoreTiming}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
function wave(hz,rate=24000,harmonic=false){return Float32Array.from({length:4096},(_,i)=>.3*Math.sin(2*Math.PI*hz*i/rate)+(harmonic?.12*Math.sin(4*Math.PI*hz*i/rate):0));}
for(const hz of [30.8677,41.2034,82.4069,110,196,261.6256,440,659.255,880]){
 test('YIN fundamental '+hz+' Hz',()=>{const result=detectPitch(wave(hz,24000,true),24000);assert.ok(result);assert.ok(Math.abs(centsFrom(result.frequency,hz))<2,JSON.stringify(result));});
}
test('YIN rejects silence',()=>assert.equal(detectPitch(new Float32Array(4096),24000),null));
test('YIN rejects very low signal',()=>assert.equal(detectPitch(wave(440).map(x=>x*.001),24000),null));
test('Reference A4 and octave mapping',()=>{assert.equal(pitchToMidi(440),69);assert.equal(pitchToMidi(442,442),69);assert.equal(centsFrom(880,440),1200);assert.equal(centsFrom(220,440),-1200);});
test('Timing penalizes missing beats and ignores sign for precision',()=>{assert.equal(scoreTiming([0,0],4),50);assert.equal(scoreTiming([-100,100],2),50);assert.equal(scoreTiming([0,0],2),100);assert.equal(scoreTiming([],0),null);});
test('YIN accepts detuning',()=>{const hz=440*2**(17/1200),r=detectPitch(wave(hz),24000);assert.ok(r);assert.ok(Math.abs(centsFrom(r.frequency,440)-17)<1);});

