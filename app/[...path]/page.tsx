import { getChatGPTUser } from '../chatgpt-auth';
import Armoniq from '@/components/armoniq';
import { notFound } from 'next/navigation';
export const dynamic='force-dynamic';
const routes=['bienvenida','acceso','perfil-musical','inicio','aprender','leccion','practica','afinador','afinaciones','metronomo','acordes','notas','canciones','cancion','estudio','oido','ritmo','profesor','perfil','privacidad'];
export default async function Page({params}:{params:Promise<{path:string[]}>}){
 const {path}=await params;if(path.length>2||!routes.includes(path[0]))notFound();
 const user=await getChatGPTUser();
 return <Armoniq route={path[0]} item={path[1]} user={user?{name:user.fullName||'',email:user.email}:null}/>;
}
