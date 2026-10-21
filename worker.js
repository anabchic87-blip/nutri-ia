const SYSTEM = `Eres Nutri IA, asistente educativo en español. Menú mediterráneo orientativo de 1875 kcal, cuatro comidas al día. Solo salmón como pescado. Miércoles fuerza a las 15:30, comida después; viernes HIIT. Creatina, omega-3 y whey 20 g de polvo con agua cuando entrena. Da sugerencias de comidas y horarios, sin diagnosticar ni prescribir. NO calcules equivalencias numéricas ni inventes macros: indica que se use la calculadora de sustituciones de la aplicación, con pesos en seco o crudo y etiquetas comprobadas. Nunca digas que has guardado cambios. Sé breve y cercano.`;
const ALLOWED_ORIGIN = 'https://anabchic87-blip.github.io';
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin')||'';
  const cors={'Access-Control-Allow-Origin':ALLOWED_ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Cache-Control':'no-store'};
  if(origin!==ALLOWED_ORIGIN)return Response.json({error:'Origen no autorizado'},{status:403});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST'||new URL(request.url).pathname!=='/chat')return Response.json({error:'Ruta no encontrada'},{status:404,headers:cors});
  if(!env.AI)return Response.json({error:'Falta el enlace AI'},{status:503,headers:cors});
  // Obligatorio: configurar el enlace Rate Limiting llamado RATE_LIMITER en Cloudflare.
  if(!env.RATE_LIMITER)return Response.json({error:'Configura el limitador RATE_LIMITER antes de activar el chat'},{status:503,headers:cors});
  const ip=request.headers.get('CF-Connecting-IP');
  if(!ip)return Response.json({error:'No se puede verificar el límite de uso'},{status:503,headers:cors});
  try{
   const limit=await env.RATE_LIMITER.limit({key:ip});
   if(!limit.success)return Response.json({error:'Has alcanzado el límite temporal de consultas. Inténtalo más tarde.'},{status:429,headers:cors});
   const body=await request.json();
   const message=typeof body.message==='string'?body.message.trim():'';
   if(!message||message.length>1200)return Response.json({error:'Escribe una pregunta de hasta 1200 caracteres'},{status:400,headers:cors});
   const history=Array.isArray(body.history)?body.history.slice(-4).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,700)})):[];
   const result=await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8',{messages:[{role:'system',content:SYSTEM},...history,{role:'user',content:message}],max_tokens:300});
   return Response.json({answer:typeof result.response==='string'?result.response:'No he podido responder. Prueba otra vez.'},{headers:cors});
  }catch(e){console.error('Nutri IA:',e);return Response.json({error:'Error temporal al consultar la IA'},{status:500,headers:cors});}
 }
};
