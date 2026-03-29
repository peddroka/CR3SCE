(()=>{var e={};e.id=276,e.ids=[276],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8719:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),!function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{isRequestAPICallableInsideAfter:function(){return c},throwForSearchParamsAccessInUseCache:function(){return i},throwWithStaticGenerationBailoutError:function(){return o},throwWithStaticGenerationBailoutErrorWithDynamicError:function(){return n}});let a=r(80023),s=r(3295);function o(e,t){throw Object.defineProperty(new a.StaticGenBailoutError(`Route ${e} couldn't be rendered statically because it used ${t}. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`),"__NEXT_ERROR_CODE",{value:"E576",enumerable:!1,configurable:!0})}function n(e,t){throw Object.defineProperty(new a.StaticGenBailoutError(`Route ${e} with \`dynamic = "error"\` couldn't be rendered statically because it used ${t}. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`),"__NEXT_ERROR_CODE",{value:"E543",enumerable:!1,configurable:!0})}function i(e){throw Object.defineProperty(Error(`Route ${e} used "searchParams" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "searchParams" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`),"__NEXT_ERROR_CODE",{value:"E634",enumerable:!1,configurable:!0})}function c(){let e=s.afterTaskAsyncStorage.getStore();return(null==e?void 0:e.rootTaskSpawnPhase)==="action"}},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},28086:(e,t,r)=>{"use strict";r.d(t,{U:()=>o});var a=r(34386),s=r(44999);async function o(){let e=await (0,s.UL)();return(0,a.createServerClient)("https://wzxwbwharybtbkfhlnsg.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eHdid2hhcnlidGJrZmhsbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzc3NjUsImV4cCI6MjA4NzkxMzc2NX0.wTjpgvNvyKY_NpGFPRlrFQubZteQTW9JD7vRVGz10fQ",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:r,options:a})=>{e.set(t,r,a)})}catch(e){console.warn("Failed to set cookies in server component:",e)}}}})}},28644:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>h,routeModule:()=>m,serverHooks:()=>x,workAsyncStorage:()=>f,workUnitAsyncStorage:()=>g});var a={};r.r(a),r.d(a,{POST:()=>p,maxDuration:()=>d});var s=r(96559),o=r(48088),n=r(37719),i=r(75413),c=r(91675),u=r(28086);let d=60,l=(0,c.c)({apiKey:process.env.GROQ_API_KEY||""});async function p(e){let t=await (0,u.U)(),{data:{user:r}}=await t.auth.getUser();if(!r)return new Response("Unauthorized",{status:401});let{messages:a}=await e.json(),{data:s}=await t.from("businesses").select("*").eq("user_id",r.id).single(),{data:o}=await t.from("evolution_data").select("*").eq("user_id",r.id).order("created_at",{ascending:!1}).limit(1).maybeSingle(),{data:n}=await t.from("evolution_levels").select("title, type").eq("user_id",r.id).eq("status","completed"),{data:c}=await t.from("strategies").select("*, strategy_days(*)").eq("business_id",s?.id).order("created_at",{ascending:!1}).limit(1),d=c?.[0],p=0,m="";if(d?.strategy_days){d.strategy_days.forEach(e=>{e.posts&&(p+=e.posts.filter(e=>e.completed).length)});let e=new Date().getDate(),t=d.strategy_days.filter(t=>t.day_number>=e).slice(0,5);t.length>0&&(m="\nPR\xd3XIMOS POSTS NO CALEND\xc1RIO:\n"+t.map(e=>(e.posts||[]).map(t=>`- Dia ${e.day_number}: ${t.content_type} \xe0s ${t.time} - "${t.topic}"`).join("\n")).join("\n"))}let f=`Voc\xea \xe9 o assistente CR3SCE, especialista em marketing digital para Instagram e crescimento de neg\xf3cios locais.
Voc\xea ajuda empreendedores brasileiros a crescerem seus neg\xf3cios nas redes sociais.
Sempre responda em portugu\xeas brasileiro. Seja pr\xe1tico, direto e amig\xe1vel.

REGRAS DE FORMATA\xc7\xc3O OBRIGAT\xd3RIAS:
- NUNCA use asteriscos (**texto**) para negrito
- NUNCA use hashtags (#, ##, ###) para t\xedtulos
- NUNCA use tra\xe7os ou h\xedfens como marcadores de lista (- item)
- Use NUMERA\xc7\xc3O para listas: "1.", "2.", "3."
- Deixe UMA LINHA EM BRANCO entre cada par\xe1grafo ou item numerado
- Use letras mai\xfasculas para destacar palavras importantes, n\xe3o asteriscos
- Escreva como se fosse uma pessoa real conversando, com par\xe1grafos naturais
- Quando der ideias ou passos, use n\xfameros seguidos de ponto e uma linha em branco entre cada um
- M\xe1ximo de 4 a 6 itens por lista — seja objetivo
- Termine sempre com uma pergunta ou convite para continuar a conversa

EXEMPLO DE FORMATO CORRETO:
"\xd3tima ideia para Reels hoje!

Aqui est\xe3o 3 \xe2ngulos que funcionam bem para o seu nicho:

1. Mostre o processo — grave os bastidores da prepara\xe7\xe3o do produto. C\xe2mera parada, luz natural, sem cortes bruscos.

2. Antes e depois — compare o estado do cliente antes e depois de usar seu produto ou servi\xe7o. Funciona muito bem para gerar identifica\xe7\xe3o.

3. Dica r\xe1pida de 15 segundos — escolha uma d\xfavida comum do seu p\xfablico e responda de forma direta e visual.

Qual desses tr\xeas voc\xea prefere tentar primeiro?"

${s?`CONTEXTO COMPLETO DO NEG\xd3CIO:
- Nome: ${s.business_name}
- Nicho: ${s.niche}
- P\xfablico-alvo: ${s.target_audience}
- Objetivo: ${s.main_goal}
- Plataformas: ${s.platforms}
- Estilo de comunica\xe7\xe3o: ${s.communication_style}
- Velocidade de crescimento: ${s.growth_speed||"moderado"}
- Descri\xe7\xe3o da marca: ${s.brand_description}
- Diferencial: ${s.unique_value||"n\xe3o informado"}
- Instagram: ${s.instagram_handle||"n\xe3o informado"}
- Respons\xe1vel: ${s.responsible_name||"n\xe3o informado"}

DADOS DE EVOLU\xc7\xc3O:
- Seguidores atuais: ${o?.current_followers||"n\xe3o informado"}
- Views m\xe9dias Stories: ${o?.current_stories_views||"n\xe3o informado"}
- Investimento mensal: R$ ${o?.monthly_investment||"n\xe3o informado"}
- N\xedveis conquistados: ${n?.map(e=>e.title).join(", ")||"nenhum ainda"}

ESTRAT\xc9GIA ATUAL:
${d?`- M\xeas: ${d.month}/${d.year}
- Miss\xf5es conclu\xeddas: ${p}
${m}`:"- Nenhuma estrat\xe9gia ativa ainda"}

Use TODO esse contexto para personalizar suas respostas e sugest\xf5es de marketing.`:"O usu\xe1rio ainda n\xe3o configurou seu neg\xf3cio."}`;return(await (0,i.gM)({model:l("llama-3.3-70b-versatile"),system:f,messages:a})).toDataStreamResponse()}let m=new s.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/chat/route",pathname:"/api/chat",filename:"route",bundlePath:"app/api/chat/route"},resolvedPagePath:"C:\\Users\\peddroka\\OneDrive\\Sistemas\\cresci.ai\\cresci-ai\\app\\api\\chat\\route.ts",nextConfigOutput:"",userland:a}),{workAsyncStorage:f,workUnitAsyncStorage:g,serverHooks:x}=m;function h(){return(0,n.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:g})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},43763:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"ReflectAdapter",{enumerable:!0,get:function(){return r}});class r{static get(e,t,r){let a=Reflect.get(e,t,r);return"function"==typeof a?a.bind(e):a}static set(e,t,r,a){return Reflect.set(e,t,r,a)}static has(e,t){return Reflect.has(e,t)}static deleteProperty(e,t){return Reflect.deleteProperty(e,t)}}},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},76926:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"createDedupedByCallsiteServerErrorLoggerDev",{enumerable:!0,get:function(){return c}});let a=function(e,t){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=s(t);if(r&&r.has(e))return r.get(e);var a={__proto__:null},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var n in e)if("default"!==n&&Object.prototype.hasOwnProperty.call(e,n)){var i=o?Object.getOwnPropertyDescriptor(e,n):null;i&&(i.get||i.set)?Object.defineProperty(a,n,i):a[n]=e[n]}return a.default=e,r&&r.set(e,a),a}(r(61120));function s(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return(s=function(e){return e?r:t})(e)}let o={current:null},n="function"==typeof a.cache?a.cache:e=>e,i=console.warn;function c(e){return function(...t){i(e(...t))}}n(e=>{try{i(o.current)}finally{o.current=null}})},78335:()=>{},96487:()=>{}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[719,730,410,945],()=>r(28644));module.exports=a})();