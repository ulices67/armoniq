export const instruments=[
 {id:'guitar',name:'Guitarra',description:'Seis cuerdas, infinitas historias.',icon:'guitar'},
 {id:'piano',name:'Piano',description:'Un universo en tus manos.',icon:'piano'},
 {id:'bass',name:'Bajo',description:'El corazón de cada canción.',icon:'guitar'},
 {id:'ukulele',name:'Ukulele',description:'Pequeño, alegre y cercano.',icon:'guitar'},
 {id:'violin',name:'Violín',description:'Expresión en cada nota.',icon:'music'},
 {id:'drums',name:'Batería',description:'Encuentra tu propio pulso.',icon:'drum'},
 {id:'voice',name:'Voz',description:'Tu instrumento más personal.',icon:'mic'}
];
export type Profile={name:string;instrument:string;level:string;goal:string;minutes:number;settings:Record<string,unknown>};
export type Session={id:string;instrument:string;kind:string;started_at:number;finished_at:number|null;seconds:number;score:number|null;observations:string};
export type AppState={profile:Profile|null;completions:{instrument:string;lesson_id:string;completed_at:number}[];sessions:Session[];favorites:string[]};
export const chords:Record<string,{name:string;notes:string;formula:string;frets:number[];fingers:number[];midi:number[]}>={
 C:{name:'C Mayor',notes:'C · E · G',formula:'1 · 3 · 5',frets:[-1,3,2,0,1,0],fingers:[0,3,2,0,1,0],midi:[48,52,55,60,64]},
 G:{name:'G Mayor',notes:'G · B · D',formula:'1 · 3 · 5',frets:[3,2,0,0,0,3],fingers:[2,1,0,0,0,3],midi:[43,47,50,55,59,67]},
 D:{name:'D Mayor',notes:'D · F♯ · A',formula:'1 · 3 · 5',frets:[-1,-1,0,2,3,2],fingers:[0,0,0,1,3,2],midi:[50,57,62,66]},
 Em:{name:'E menor',notes:'E · G · B',formula:'1 · ♭3 · 5',frets:[0,2,2,0,0,0],fingers:[0,2,3,0,0,0],midi:[40,47,52,55,59,64]},
 Am:{name:'A menor',notes:'A · C · E',formula:'1 · ♭3 · 5',frets:[-1,0,2,2,1,0],fingers:[0,0,2,3,1,0],midi:[45,52,57,60,64]},
 F:{name:'F Mayor',notes:'F · A · C',formula:'1 · 3 · 5',frets:[1,3,3,2,1,1],fingers:[1,3,4,2,1,1],midi:[41,48,53,57,60,65]},
 Cmaj7:{name:'Cmaj7',notes:'C · E · G · B',formula:'1 · 3 · 5 · 7',frets:[-1,3,2,0,0,0],fingers:[0,3,2,0,0,0],midi:[48,52,55,59,64]},
 G7:{name:'G7',notes:'G · B · D · F',formula:'1 · 3 · 5 · ♭7',frets:[3,2,0,0,0,1],fingers:[3,2,0,0,0,1],midi:[43,47,50,55,59,65]}
};
export const tunings:Record<string,{name:string;notes:number[]}[]>={
 guitar:[{name:'Standard',notes:[40,45,50,55,59,64]},{name:'Drop D',notes:[38,45,50,55,59,64]},{name:'Half Step Down',notes:[39,44,49,54,58,63]},{name:'Open D',notes:[38,45,50,54,57,62]},{name:'Open G',notes:[38,43,50,55,59,62]},{name:'DADGAD',notes:[38,45,50,55,57,62]}],
 bass:[{name:'Standard',notes:[28,33,38,43]},{name:'5 cuerdas',notes:[23,28,33,38,43]},{name:'Drop D',notes:[26,33,38,43]}],
 ukulele:[{name:'Standard',notes:[67,60,64,69]},{name:'Low G',notes:[55,60,64,69]}],violin:[{name:'Standard',notes:[55,62,69,76]}]
};
export const noteNames=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
export const noteName=(m:number)=>noteNames[((m%12)+12)%12]+(Math.floor(m/12)-1);
export const frequency=(m:number,a4=440)=>a4*2**((m-69)/12);
export const lessons=[
 {id:'postura',title:'Tu primer encuentro',category:'Fundamentos',minutes:4,subtitle:'Conoce tu instrumento y encuentra una postura cómoda.',steps:['Prepara un lugar tranquilo y una silla estable. Apoya los pies y libera los hombros.','Acerca el instrumento a ti. Mantén las muñecas relajadas y evita forzar una posición.','Dedica un minuto a explorar su sonido, sin buscar velocidad. Descansa si aparece dolor.'],task:'Explora el instrumento durante un minuto sin tensión.'},
 {id:'afinacion',title:'Encuentra tu sonido',category:'Fundamentos',minutes:5,subtitle:'Escucha, compara y afina antes de tocar.',steps:['En instrumentos de cuerda, toca una sola cuerda al aire. Apaga las demás para escucharla con claridad.','Abre el afinador. Una lectura negativa indica un sonido grave; una positiva, agudo. Ajusta poco a poco.','Comprueba todas las cuerdas otra vez. En piano usa el tono de referencia para escuchar; la afinación mecánica requiere un profesional.'],task:'Abre el afinador y compara una nota con la referencia.'},
 {id:'pulso',title:'Siente el pulso',category:'Ritmo',minutes:4,subtitle:'El primer paso para tocar con confianza.',steps:['Escucha el metrónomo a 60 BPM. Cada clic marca un pulso.','Cuenta 1, 2, 3, 4. El primer pulso suena más fuerte para marcar el inicio del compás.','Da una palmada por clic durante cuatro compases. Después prueba el entrenador de ritmo.'],task:'Practica cuatro compases a 60 BPM.'},
 {id:'em',title:'Tu primer acorde: Em',category:'Acordes',minutes:6,subtitle:'Dos dedos. Un nuevo mundo de canciones.',steps:['En guitarra: coloca el dedo medio en la quinta cuerda, traste 2; el anular en la cuarta cuerda, traste 2.','Toca las seis cuerdas despacio. Mantén las puntas curvas y presiona justo detrás del traste.','Escucha cada cuerda por separado. Si alguna no suena, reajusta la posición sin aumentar la tensión.'],task:'Toca Em cuerda por cuerda, luego con un rasgueo.',chord:'Em'},
 {id:'g',title:'Acorde G Mayor',category:'Acordes',minutes:7,subtitle:'Aprende su posición, escucha y practica.',steps:['Coloca el dedo medio en la sexta cuerda, traste 3. El índice va en la quinta cuerda, traste 2.','Coloca el anular en la primera cuerda, traste 3. Las cuerdas cuarta, tercera y segunda quedan abiertas.','Rasguea las seis cuerdas. Alterna cuatro pulsos de Em y cuatro de G a 50 BPM.'],task:'Repite el cambio Em → G cuatro veces.',chord:'G'},
 {id:'c',title:'Acorde C Mayor',category:'Acordes',minutes:7,subtitle:'Dale color a tus primeras progresiones.',steps:['Índice: segunda cuerda, traste 1. Medio: cuarta cuerda, traste 2. Anular: quinta cuerda, traste 3.','Toca desde la quinta cuerda. Evita la sexta. Tercera y primera quedan abiertas.','Practica C → G a 50 BPM. Prepara los dedos antes del cambio y conserva el pulso.'],task:'Toca C → G → Em lentamente.',chord:'C'},
 {id:'cancion',title:'Tu primera canción',category:'Canciones',minutes:8,subtitle:'Une lo que aprendiste en una pieza completa.',steps:['Abre “Un nuevo día”, un estudio original de Armoniq. Escucha la progresión antes de empezar.','Practica la introducción a la mitad de velocidad. Repite hasta poder seguir los cambios con comodidad.','Une introducción y verso. Termina una vuelta completa y guarda tu sesión.'],task:'Interpreta el estudio Un nuevo día.'}
];
export const songs=[
 {id:'nuevo-dia',title:'Un nuevo día',style:'Pop acústico',bpm:72,chords:['Em','G','C','G'],description:'Una melodía empieza con un pequeño paso.',sections:['Introducción','Verso','Coro'],difficulty:'Inicial',color:'forest'},
 {id:'luz-tarde',title:'Luz de tarde',style:'Balada',bpm:80,chords:['C','Am','F','G'],description:'Acordes cálidos para tocar sin prisa.',sections:['Introducción','Verso','Final'],difficulty:'Intermedio',color:'orange'},
 {id:'camino',title:'El camino',style:'Folk',bpm:96,chords:['G','D','Em','C'],description:'Encuentra movimiento entre cuatro acordes.',sections:['Verso','Coro','Final'],difficulty:'Intermedio',color:'sage'}
];
export function curriculum(instrument:string){return instrument==='guitar'?lessons:lessons.filter(l=>!l.chord&&l.id!=='cancion');}

