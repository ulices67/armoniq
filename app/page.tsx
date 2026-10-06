import { getChatGPTUser } from './chatgpt-auth';
import Armoniq from '@/components/armoniq';
export const dynamic = 'force-dynamic';
export default async function Page() {
 const user = await getChatGPTUser();
 return <Armoniq route="inicio" user={user ? {name:user.fullName || '',email:user.email} : null}/>;
}
