(()=>{var e={};e.id=865,e.ids=[865],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8719:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),!function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{isRequestAPICallableInsideAfter:function(){return c},throwForSearchParamsAccessInUseCache:function(){return n},throwWithStaticGenerationBailoutError:function(){return o},throwWithStaticGenerationBailoutErrorWithDynamicError:function(){return s}});let a=r(80023),i=r(3295);function o(e,t){throw Object.defineProperty(new a.StaticGenBailoutError(`Route ${e} couldn't be rendered statically because it used ${t}. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`),"__NEXT_ERROR_CODE",{value:"E576",enumerable:!1,configurable:!0})}function s(e,t){throw Object.defineProperty(new a.StaticGenBailoutError(`Route ${e} with \`dynamic = "error"\` couldn't be rendered statically because it used ${t}. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`),"__NEXT_ERROR_CODE",{value:"E543",enumerable:!1,configurable:!0})}function n(e){throw Object.defineProperty(Error(`Route ${e} used "searchParams" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "searchParams" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`),"__NEXT_ERROR_CODE",{value:"E634",enumerable:!1,configurable:!0})}function c(){let e=i.afterTaskAsyncStorage.getStore();return(null==e?void 0:e.rootTaskSpawnPhase)==="action"}},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},28086:(e,t,r)=>{"use strict";r.d(t,{U:()=>o});var a=r(34386),i=r(44999);async function o(){let e=await (0,i.UL)();return(0,a.createServerClient)("https://wzxwbwharybtbkfhlnsg.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eHdid2hhcnlidGJrZmhsbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzc3NjUsImV4cCI6MjA4NzkxMzc2NX0.wTjpgvNvyKY_NpGFPRlrFQubZteQTW9JD7vRVGz10fQ",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:r,options:a})=>{e.set(t,r,a)})}catch(e){console.warn("Failed to set cookies in server component:",e)}}}})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},43763:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"ReflectAdapter",{enumerable:!0,get:function(){return r}});class r{static get(e,t,r){let a=Reflect.get(e,t,r);return"function"==typeof a?a.bind(e):a}static set(e,t,r,a){return Reflect.set(e,t,r,a)}static has(e,t){return Reflect.has(e,t)}static deleteProperty(e,t){return Reflect.deleteProperty(e,t)}}},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},76926:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"createDedupedByCallsiteServerErrorLoggerDev",{enumerable:!0,get:function(){return c}});let a=function(e,t){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=i(t);if(r&&r.has(e))return r.get(e);var a={__proto__:null},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var s in e)if("default"!==s&&Object.prototype.hasOwnProperty.call(e,s)){var n=o?Object.getOwnPropertyDescriptor(e,s):null;n&&(n.get||n.set)?Object.defineProperty(a,s,n):a[s]=e[s]}return a.default=e,r&&r.set(e,a),a}(r(61120));function i(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return(i=function(e){return e?r:t})(e)}let o={current:null},s="function"==typeof a.cache?a.cache:e=>e,n=console.warn;function c(e){return function(...t){n(e(...t))}}s(e=>{try{n(o.current)}finally{o.current=null}})},78335:()=>{},78714:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>y,routeModule:()=>x,serverHooks:()=>b,workAsyncStorage:()=>h,workUnitAsyncStorage:()=>v});var a={};r.r(a),r.d(a,{POST:()=>g,maxDuration:()=>l});var i=r(96559),o=r(48088),s=r(37719),n=r(75413),c=r(91675),u=r(28086),d=r(10209);let l=60,p=(0,c.c)({apiKey:process.env.GROQ_API_KEY||""}),m=d.Ik({number:d.ai(),title:d.Yj(),type:d.k5(["equipment","goal","action"]),description:d.Yj(),tip:d.Yj(),estimated_cost:d.ai(),expected_result:d.Yj()}),f=d.Ik({levels:d.YO(m)});async function g(e){try{let{investment_amount:t,business:r,month_number:a,current_followers:i}=await e.json(),o=await (0,u.U)(),{data:{user:s}}=await o.auth.getUser();if(!s)return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:{"Content-Type":"application/json"}});let c=`Voc\xea \xe9 um consultor de marketing digital especializado em growth marketing.
Com base nos dados abaixo, crie uma jornada de crescimento personalizada com n\xedveis desbloque\xe1veis para este m\xeas.

DADOS DO NEG\xd3CIO:
- Neg\xf3cio: ${r.business_name}
- Nicho: ${r.niche}
- Objetivo principal: ${r.main_goal}
- P\xfablico-alvo: ${r.target_audience}
- Estilo de comunica\xe7\xe3o: ${r.communication_style}
- Velocidade de crescimento: ${r.growth_speed||"moderado"}
- Seguidores atuais: ${i||"n\xe3o informado"}
- Instagram: ${r.instagram_handle||"n\xe3o informado"}

INVESTIMENTO DISPON\xcdVEL: R$ ${t}
M\xcaS DA JORNADA: ${a} ${1===a?"(primeiro m\xeas)":2===a?"(segundo m\xeas)":"(m\xeas avan\xe7ado)"}

REGRAS IMPORTANTES:
1. Gere entre 3 e 6 n\xedveis, baseado no valor do investimento (mais investimento = mais n\xedveis)
2. Distribua os custos de forma que a soma total N\xc3O ULTRAPASSE R$ ${t}
3. Misture diferentes tipos de n\xedveis:
   - equipment: equipamentos f\xedsicos (c\xe2mera, luz, microfone, trip\xe9)
   - goal: metas de crescimento (atingir X seguidores, Y views)
   - action: a\xe7\xf5es de marketing (an\xfancio, parceria, conte\xfado especial)
4. Seja EXTREMAMENTE ESPEC\xcdFICO para o nicho ${r.niche}
5. Ordene do mais barato/f\xe1cil para o mais caro/dif\xedcil
6. As dicas (tip) devem ser personalizadas para este neg\xf3cio espec\xedfico
7. Os resultados esperados devem ser realistas

EXEMPLOS DE N\xcdVEIS BEM ESTRUTURADOS:

Para nicho de moda:
{
  "number": 1,
  "title": "Kit de Ilumina\xe7\xe3o para Fotos de Produto",
  "type": "equipment",
  "description": "Adquirir um softbox ou anel de luz para melhorar a qualidade das fotos de roupas e acess\xf3rios.",
  "tip": "Para sua loja de moda plus size, foque em ilumina\xe7\xe3o que valorize as texturas dos tecidos e o caimento das pe\xe7as. Posicione a luz em 45 graus para evitar sombras duras.",
  "estimated_cost": 200,
  "expected_result": "Fotos com aspecto profissional aumentando convers\xe3o em 20%"
}

Para nicho de gastronomia:
{
  "number": 2,
  "title": "Microfone Lapela para Receitas",
  "type": "equipment",
  "description": "Adquirir um microfone sem fio para capturar \xe1udio de qualidade nos v\xeddeos de receitas.",
  "tip": "No seu restaurante, use o microfone para narrar o preparo dos pratos enquanto mostra os ingredientes. O som ambiente da cozinha (panelas, fritura) cria imers\xe3o.",
  "estimated_cost": 150,
  "expected_result": "V\xeddeos com \xe1udio profissional aumentando tempo de visualiza\xe7\xe3o"
}

Para nicho de fitness:
{
  "number": 3,
  "title": "Parceria com Influenciador Local",
  "type": "action",
  "description": "Investir em parceria com micro-influenciador da sua cidade para divulgar seus treinos.",
  "tip": "Procure influenciadores que j\xe1 tenham p\xfablico alinhado com sua academia (pessoas que buscam emagrecimento ou ganho de massa). Ofere\xe7a 3 meses gr\xe1tis em troca de posts.",
  "estimated_cost": 300,
  "expected_result": "+200 seguidores qualificados e 10 novos alunos"

Responda APENAS em JSON com a estrutura especificada.`,d=(await (0,n.pY)({model:p("llama-3.3-70b-versatile"),schema:f,prompt:c,temperature:.7})).object.levels,l=new Date,m=l.getMonth()+1,g=l.getFullYear(),x=d.map((e,t)=>({user_id:s.id,business_id:r.id,month:m,year:g,level_number:e.number,title:e.title,type:e.type,description:e.description,tip:e.tip,estimated_cost:e.estimated_cost,expected_result:e.expected_result,status:0===t?"available":"locked"})),{data:h,error:v}=await o.from("evolution_levels").insert(x).select();if(v)throw v;return new Response(JSON.stringify({levels:h}),{headers:{"Content-Type":"application/json"}})}catch(e){return console.error("Erro ao gerar n\xedveis:",e),new Response(JSON.stringify({error:e.message||"Erro ao gerar n\xedveis"}),{status:500,headers:{"Content-Type":"application/json"}})}}let x=new i.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/generate-levels/route",pathname:"/api/generate-levels",filename:"route",bundlePath:"app/api/generate-levels/route"},resolvedPagePath:"C:\\Users\\peddroka\\OneDrive\\Sistemas\\cresci.ai\\cresci-ai\\app\\api\\generate-levels\\route.ts",nextConfigOutput:"",userland:a}),{workAsyncStorage:h,workUnitAsyncStorage:v,serverHooks:b}=x;function y(){return(0,s.patchFetch)({workAsyncStorage:h,workUnitAsyncStorage:v})}},96487:()=>{}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[719,730,410,945],()=>r(78714));module.exports=a})();