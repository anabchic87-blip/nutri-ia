const SYSTEM = `Eres un asistente educativo de nutrición en español. Ayudas a comprender un menú mediterráneo de unas 1875 kcal orientativas, 4 comidas (desayuno, media mañana fruta+skyr, comida y cena), solo salmón como pescado. Miércoles fuerza 15:30 y comida después; viernes HIIT. Creatina y omega-3, batido whey 20g de polvo con agua cuando entrena. No diagnostiques ni prescribas, no inventes valores nutricionales. Cuando pidan sustituir comida, propone alternativa y explica que las cantidades y macros deben verificarse con etiquetas/base de datos; nunca afirmes haber guardado cambios en el menú. Evita restricciones extremas. Responde breve y claro.`;
export default {async fetch(request, env) {
  const origin=request.headers.get('Origin')||'';
  const allowed=env.ALLOWED_ORIGIN||'';
  const cors={'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST'||new URL(request.url).pathname!=='/chat')return new Response('Not found',{status:404});
  if(!allowed||origin!==allowed)return new Response('Origen no autorizado',{status:403});
  if(!env.OPENAI_API_KEY)return new Response('Falta configurar API',{status:503,headers:cors});
  // IMPORTANT: deploy behind an authenticated access policy and rate limits; CORS is not authentication.
  try {
    const body=await request.json();
    const msg=typeof body.message==='string'?body.message.trim():'';
    if(!msg||msg.length>1200)return Response.json({error:'Mensaje vacío o demasiado largo'},{status:400,headers:cors});
    const history=Array.isArray(body.history)?body.history.slice(-6).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,1200)})):[];
    const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-5-mini',instructions:SYSTEM,input:[...history,{role:'user',content:msg}],max_output_tokens:450,store:false})});
    const data=await res.json();
    if(!res.ok)return Response.json({error:'No se pudo completar la consulta. Revisa la configuración y los límites.'},{status:502,headers:cors});
    const answer=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();
    return Response.json({answer:answer||'No se recibió una respuesta. Prueba otra vez.'},{headers:cors});
  } catch {return Response.json({error:'Error al procesar la solicitud'},{status:400,headers:cors});}
}};
