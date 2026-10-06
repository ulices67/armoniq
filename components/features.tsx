'use client';
import {Tuner,Metronome,Tunings} from './audio-tools';
import {Learn,Lesson,PracticeHub,Chords,Notes,SongLibrary,SongPlayer} from './learning';
import {Studio,EarTraining,RhythmTraining,Coach,ProfilePage} from './practice';
export default function FeatureRouter({route,item}:{route:string;item?:string}){
 switch(route){
 case 'aprender':return <Learn/>;case 'leccion':return <Lesson id={item}/>;
 case 'practica':return <PracticeHub/>;case 'afinador':return <Tuner/>;case 'afinaciones':return <Tunings/>;case 'metronomo':return <Metronome/>;
 case 'acordes':return <Chords/>;case 'notas':return <Notes/>;case 'canciones':return <SongLibrary/>;case 'cancion':return <SongPlayer id={item}/>;
 case 'estudio':return <Studio/>;case 'oido':return <EarTraining/>;case 'ritmo':return <RhythmTraining/>;case 'profesor':return <Coach/>;case 'perfil':return <ProfilePage/>;
 default:return <PracticeHub/>;
 }
}
