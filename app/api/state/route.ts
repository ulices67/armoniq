import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { z } from 'zod';
import { instruments,curriculum } from '@/lib/content';
export const dynamic='force-dynamic';
const instrument=z.string().refine(v=>instruments.some(i=>i.id===v));
const profile=z.object({name:z.string().trim().min(1).max(60),instrument,level:z.enum(['Principiante','Intermedio','Avanzado']),goal:z.string().trim().min(1).max(120),minutes:z.number().int().min(5).max(60),settings:z.record(z.unknown()).default({}).refine(v=>JSON.stringify(v).length<12000)});
const action=z.discriminatedUnion('action',[
 z.object({action:z.literal('profile'),profile}),
 z.object({action:z.literal('complete'),lessonId:z.string().max(50),instrument}),
 z.object({action:z.literal('favorite'),itemId:z.string().min(1).max(80),enabled:z.boolean()}),
 z.object({action:z.literal('start'),instrument,kind:z.enum(['practica','estudio','cancion','ritmo','oido'])}),
 z.object({action:z.literal('finish'),id:z.string().uuid(),seconds:z.number().int().min(1).max(14400),score:z.number().int().min(0).max(100).nullable(),observations:z.record(z.unknown()).refine(v=>JSON.stringify(v).length<6000)}),
 z.object({action:z.literal('delete')})
]);
function response(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
export async function GET(){
 try{
 const user=await getChatGPTUser();if(!user)return response({error:'Inicia sesión para ver tu progreso.'},401);if(!env.DB)return response({error:'El almacenamiento no está disponible.'},503);
 const db=env.DB;const p=await db.prepare('SELECT * FROM profiles WHERE user_id = ?').bind(user.userId).first<Record<string,unknown>>();
 if(!p)return response({profile:null,completions:[],sessions:[],favorites:[]});
 const [c,s,f]=await Promise.all([db.prepare('SELECT instrument,lesson_id,completed_at FROM completions WHERE user_id = ?').bind(user.userId).all(),db.prepare('SELECT id,instrument,kind,started_at,finished_at,seconds,score,observations FROM sessions WHERE user_id = ? AND finished_at IS NOT NULL ORDER BY started_at DESC LIMIT 500').bind(user.userId).all(),db.prepare('SELECT item_id FROM favorites WHERE user_id = ?').bind(user.userId).all<{item_id:string}>()]);
 return response({profile:{name:p.name,instrument:p.instrument,level:p.level,goal:p.goal,minutes:p.minutes,settings:JSON.parse(String(p.settings))},completions:c.results,sessions:s.results,favorites:f.results.map(x=>x.item_id)});
 }catch(e){console.error('state_read_failed',e);return response({error:'No pudimos cargar tu progreso. Intenta de nuevo.'},503);}
}
export async function POST(request:Request){
 try{
 const raw=await request.text();if(raw.length>20000)return response({error:'Solicitud demasiado grande.'},413);
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return response({error:'Origen no permitido.'},403);
 const user=await getChatGPTUser();if(!user)return response({error:'Tu sesión expiró. Vuelve a iniciar sesión.'},401);if(!env.DB)return response({error:'El almacenamiento no está disponible.'},503);
 if(Number(request.headers.get('content-length')||0)>20000)return response({error:'Solicitud demasiado grande.'},413);
 const parsed=action.safeParse(JSON.parse(raw));if(!parsed.success)return response({error:'Revisa los datos enviados.'},400);
 const a=parsed.data,db=env.DB,uid=user.userId,now=Date.now();
 if(a.action==='profile'){
 const p=a.profile;await db.prepare('INSERT INTO profiles (user_id,name,instrument,level,goal,minutes,settings,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,instrument=excluded.instrument,level=excluded.level,goal=excluded.goal,minutes=excluded.minutes,settings=excluded.settings,updated_at=excluded.updated_at').bind(uid,p.name,p.instrument,p.level,p.goal,p.minutes,JSON.stringify(p.settings),now,now).run();return response({ok:true});
 }
 if(!await db.prepare('SELECT user_id FROM profiles WHERE user_id=?').bind(uid).first())return response({error:'Completa tu perfil musical primero.'},409);
 if(a.action==='complete'){
 if(!curriculum(a.instrument).some(l=>l.id===a.lessonId))return response({error:'Lección no disponible para este instrumento.'},400);
 await db.prepare('INSERT OR IGNORE INTO completions (user_id,instrument,lesson_id,completed_at) VALUES (?,?,?,?)').bind(uid,a.instrument,a.lessonId,now).run();
 }else if(a.action==='favorite'){
 await db.prepare(a.enabled?'INSERT OR IGNORE INTO favorites (user_id,item_id) VALUES (?,?)':'DELETE FROM favorites WHERE user_id=? AND item_id=?').bind(uid,a.itemId).run();
 }else if(a.action==='start'){
 const id=crypto.randomUUID();await db.prepare('INSERT INTO sessions (id,user_id,instrument,kind,started_at) VALUES (?,?,?,?,?)').bind(id,uid,a.instrument,a.kind,now).run();return response({id});
 }else if(a.action==='finish'){
 const session=await db.prepare('SELECT started_at,finished_at,kind FROM sessions WHERE id=? AND user_id=?').bind(a.id,uid).first<{started_at:number;finished_at:number|null;kind:string}>();
 if(!session)return response({error:'Sesión no encontrada.'},404);
 if(session.finished_at)return response({ok:true});
 const seconds=Math.min(a.seconds,Math.max(1,Math.floor((now-session.started_at)/1000)));
 const score=['ritmo','oido'].includes(session.kind)?a.score:null;
 await db.prepare('UPDATE sessions SET finished_at=?,seconds=?,score=?,observations=? WHERE id=? AND user_id=? AND finished_at IS NULL').bind(now,seconds,score,JSON.stringify(a.observations),a.id,uid).run();
 }else if(a.action==='delete'){
 await db.batch([db.prepare('DELETE FROM sessions WHERE user_id=?').bind(uid),db.prepare('DELETE FROM completions WHERE user_id=?').bind(uid),db.prepare('DELETE FROM favorites WHERE user_id=?').bind(uid),db.prepare('DELETE FROM profiles WHERE user_id=?').bind(uid)]);
 }
 return response({ok:true});
 }catch(e){if(e instanceof SyntaxError)return response({error:'Solicitud inválida.'},400);console.error('state_write_failed',e);return response({error:'No se guardaron los cambios. Intenta de nuevo.'},503);}
}
