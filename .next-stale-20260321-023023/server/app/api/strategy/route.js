(()=>{var e={};e.id=657,e.ids=[657],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8719:(e,a,o)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),!function(e,a){for(var o in a)Object.defineProperty(e,o,{enumerable:!0,get:a[o]})}(a,{isRequestAPICallableInsideAfter:function(){return c},throwForSearchParamsAccessInUseCache:function(){return n},throwWithStaticGenerationBailoutError:function(){return s},throwWithStaticGenerationBailoutErrorWithDynamicError:function(){return i}});let t=o(80023),r=o(3295);function s(e,a){throw Object.defineProperty(new t.StaticGenBailoutError(`Route ${e} couldn't be rendered statically because it used ${a}. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`),"__NEXT_ERROR_CODE",{value:"E576",enumerable:!1,configurable:!0})}function i(e,a){throw Object.defineProperty(new t.StaticGenBailoutError(`Route ${e} with \`dynamic = "error"\` couldn't be rendered statically because it used ${a}. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`),"__NEXT_ERROR_CODE",{value:"E543",enumerable:!1,configurable:!0})}function n(e){throw Object.defineProperty(Error(`Route ${e} used "searchParams" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "searchParams" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`),"__NEXT_ERROR_CODE",{value:"E634",enumerable:!1,configurable:!0})}function c(){let e=r.afterTaskAsyncStorage.getStore();return(null==e?void 0:e.rootTaskSpawnPhase)==="action"}},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},28086:(e,a,o)=>{"use strict";o.d(a,{U:()=>s});var t=o(34386),r=o(44999);async function s(){let e=await (0,r.UL)();return(0,t.createServerClient)("https://wzxwbwharybtbkfhlnsg.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eHdid2hhcnlidGJrZmhsbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzc3NjUsImV4cCI6MjA4NzkxMzc2NX0.wTjpgvNvyKY_NpGFPRlrFQubZteQTW9JD7vRVGz10fQ",{cookies:{getAll:()=>e.getAll(),setAll(a){try{a.forEach(({name:a,value:o,options:t})=>{e.set(a,o,t)})}catch(e){console.warn("Failed to set cookies in server component:",e)}}}})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},43763:(e,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"ReflectAdapter",{enumerable:!0,get:function(){return o}});class o{static get(e,a,o){let t=Reflect.get(e,a,o);return"function"==typeof t?t.bind(e):t}static set(e,a,o,t){return Reflect.set(e,a,o,t)}static has(e,a){return Reflect.has(e,a)}static deleteProperty(e,a){return Reflect.deleteProperty(e,a)}}},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},76926:(e,a,o)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"createDedupedByCallsiteServerErrorLoggerDev",{enumerable:!0,get:function(){return c}});let t=function(e,a){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var o=r(a);if(o&&o.has(e))return o.get(e);var t={__proto__:null},s=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in e)if("default"!==i&&Object.prototype.hasOwnProperty.call(e,i)){var n=s?Object.getOwnPropertyDescriptor(e,i):null;n&&(n.get||n.set)?Object.defineProperty(t,i,n):t[i]=e[i]}return t.default=e,o&&o.set(e,t),t}(o(61120));function r(e){if("function"!=typeof WeakMap)return null;var a=new WeakMap,o=new WeakMap;return(r=function(e){return e?o:a})(e)}let s={current:null},i="function"==typeof t.cache?t.cache:e=>e,n=console.warn;function c(e){return function(...a){n(e(...a))}}i(e=>{try{n(s.current)}finally{s.current=null}})},78335:()=>{},89531:(e,a,o)=>{"use strict";o.r(a),o.d(a,{patchFetch:()=>D,routeModule:()=>A,serverHooks:()=>_,workAsyncStorage:()=>I,workUnitAsyncStorage:()=>P});var t={};o.r(t),o.d(t,{POST:()=>C,maxDuration:()=>p});var r=o(96559),s=o(48088),i=o(37719),n=o(75413),c=o(91675),d=o(28086),u=o(10209);let p=60,l=(0,c.c)({apiKey:process.env.GROQ_API_KEY||""}),m=u.Ik({time:u.Yj(),content_type:u.Yj(),topic:u.Yj(),script:u.Yj(),hashtags:u.Yj(),completed:u.zM().default(!1)}),x=u.Ik({day_number:u.ai(),posts:u.YO(m)}),f=u.Ik({title:u.Yj(),summary:u.Yj(),days:u.YO(x)}),h=new Date().getMonth(),g=new Date().getFullYear();function O(e,a,o,t){let r={1:"autoridade e apresenta\xe7\xe3o",2:"educa\xe7\xe3o e dicas pr\xe1ticas",3:"bastidores e humaniza\xe7\xe3o",4:"convers\xe3o e depoimentos"},s=r[Math.ceil(o/7)]||r[1],i={"autoridade e apresenta\xe7\xe3o":[`Por que escolher ${e} de qualidade faz diferen\xe7a`,`Nossa hist\xf3ria: como come\xe7amos e onde chegamos`,`O que nos diferencia dos concorrentes em ${e}`,"Apresentando nosso produto mais especial"],"educa\xe7\xe3o e dicas pr\xe1ticas":[`3 dicas que todo cliente de ${e} deveria saber`,`Erros comuns que as pessoas cometem ao escolher ${e}`,"Guia completo para aproveitar melhor nosso produto",`Voc\xea sabia? Curiosidade sobre ${e}`],"bastidores e humaniza\xe7\xe3o":["Um dia na nossa rotina de trabalho",`Conhe\xe7a a equipe por tr\xe1s de ${e}`,"Como preparamos cada produto com cuidado",`Os bastidores que voc\xea nunca viu`],"convers\xe3o e depoimentos":[`Cliente do m\xeas: resultado real com ${e}`,"Depoimento: como nosso produto mudou a rotina do cliente",`Oferta especial de fim de m\xeas — aproveite!`,`Resultados que nossos clientes alcan\xe7aram`]},n=i[s]||i["autoridade e apresenta\xe7\xe3o"];return o>=14&&o<=16?`🔥 ESPECIAL: Parceria estrat\xe9gica para impulsionar ${e} — proposta de influenciador`:n[(o+t)%n.length]}function v(e,a){let o=[`Voc\xea est\xe1 perdendo dinheiro por n\xe3o saber isso sobre ${a}...`,`Por que 90% dos donos de ${a} erram nesse ponto?`,`Isso mudou tudo para o nosso neg\xf3cio. Olha s\xf3:`,`A verdade sobre ${e} que ningu\xe9m conta:`,"Fiz isso por 30 dias e o resultado me surpreendeu:"];return o[Math.floor(Math.random()*o.length)]}function b(e,a){return`✅ Ponto 1: O que voc\xea precisa saber sobre "${e}"
→ [Explique o benef\xedcio principal para o cliente]

✅ Ponto 2: Por que isso importa para ${a}
→ [Contextualize com a realidade do seu cliente]

✅ Ponto 3: Como aplicar isso hoje mesmo
→ [A\xe7\xe3o pr\xe1tica e simples que o cliente pode tomar]`}function y(e){let a=e.toLowerCase().replace(/[^\w]/g,"");return[`#${a}`,`#${a}brasil`,`#negocio${a}`,"#marketingdigital","#instagram","#empreendedorismo","#pequenosnegocios","#dicas"].slice(0,8).join(" ")}function S(e,a,o,t){if(t>=14&&t<=16)return`🎯 CONTE\xdaDO ESTRAT\xc9GICO DO MEIO DO M\xcaS

OBJETIVO: Aumentar alcance e conquistar novos seguidores na reta final do m\xeas.

IDEIA: Entre em contato com um micro-influenciador local (5k-50k seguidores) que tenha p\xfablico alinhado com ${a}.

ROTEIRO:
1. Abertura (5s): "Tenho uma novidade especial para voc\xeas hoje..."
2. Apresenta\xe7\xe3o da parceria: Mostre o influenciador/produto/servi\xe7o
3. Valor para o seguidor: O que eles ganham com isso?
4. Chamada para a\xe7\xe3o: "Marca um amigo que precisa saber disso!"

COMO EXECUTAR:
- Filme um v\xeddeo conjunto ou repost com permiss\xe3o
- Use a caixinha de perguntas nos Stories para engajar
- Crie um c\xf3digo de desconto exclusivo para seguidores do parceiro

POR QUE AGORA: O meio do m\xeas \xe9 quando o engajamento costuma cair. Conte\xfados de parceria e colabora\xe7\xe3o reativam o algoritmo e trazem novos seguidores qualificados.`;let r={Reels:`ROTEIRO PARA REELS — "${o}"

⏱️ DURA\xc7\xc3O: 15-30 segundos

🎬 ABERTURA (3s): [GANCHO FORTE]
"${v(o,a)}"
→ Mostre isso visualmente nos primeiros 2 segundos

🎬 DESENVOLVIMENTO (15-20s):
${b(o,a)}

🎬 FECHAMENTO (5s):
"Salva esse v\xeddeo e compartilha com quem precisa ver isso!"
→ Logo ou produto em destaque

✂️ DICAS DE EDI\xc7\xc3O:
- Cortes a cada 2-3 segundos
- Legenda em fonte grande (30% dos usu\xe1rios assistem sem som)
- M\xfasica em alta no in\xedcio para capturar aten\xe7\xe3o
- Thumbnail personalizada (n\xe3o autom\xe1tica)

📊 M\xc9TRICA DE SUCESSO: Taxa de reten\xe7\xe3o acima de 70%`,Carrossel:`ESTRUTURA DO CARROSSEL — "${o}"

📌 SLIDE 1 (CAPA): "${o.toUpperCase()}"
→ Subt\xedtulo: "Salva para n\xe3o esquecer"
→ Visual: imagem de alta qualidade + logo discreta

📌 SLIDE 2 - INTRODU\xc7\xc3O:
${b(o,a).split("\n")[0]}

📌 SLIDES 3-5 - CONTE\xdaDO PRINCIPAL:
→ 1 ideia por slide, m\xe1ximo 3 linhas de texto
→ Sempre com imagem ou \xedcone visual

📌 SLIDE FINAL - CTA:
"Curtiu? Compartilha com um amigo!"
→ @${a.toLowerCase().replace(/\s/g,"")} | Link na bio

✏️ DICA: Carross\xe9is t\xeam 3x mais alcance que posts est\xe1ticos. Capriche na capa!`,Stories:`SEQU\xcaNCIA DE STORIES — "${o}"

📸 STORY 1: Pergunta ou enquete
→ "Voc\xea j\xe1 [situa\xe7\xe3o relacionada ao t\xf3pico]? (enquete: Sim / N\xe3o)"

📸 STORY 2: Conte\xfado principal
→ ${b(o,a).split("\n")[0]}
→ Use sticker de "Saiba mais" ou link

📸 STORY 3: Bastidores ou prova
→ Foto/v\xeddeo mostrando na pr\xe1tica

📸 STORY 4: CTA final
→ "Responde aqui: qual d\xfavida voc\xea tem sobre ${a}?"
→ Caixinha de perguntas

⏰ MELHOR HOR\xc1RIO: 8h-9h ou 19h-21h (maior visualiza\xe7\xe3o)`,"Post Est\xe1tico":`POST EST\xc1TICO — "${o}"

🖼️ VISUAL:
→ Imagem principal com boa ilumina\xe7\xe3o e foco no produto/servi\xe7o
→ Texto sobreposto: m\xe1ximo 20% da imagem (regra do Instagram)
→ Paleta de cores consistente com a marca

📝 LEGENDA:
"${v(o,a)}

${b(o,a)}

💬 Me conta nos coment\xe1rios: [pergunta relacionada ao tema]!
📲 Link na bio para saber mais.

${y(a)}"`,Live:`PAUTA PARA LIVE — "${o}"

⏰ DURA\xc7\xc3O: 20-30 minutos | HOR\xc1RIO SUGERIDO: 20h

📋 ROTEIRO:
1. Abertura (3min): Boas-vindas + apresenta\xe7\xe3o do tema de hoje
2. Conte\xfado principal (10min): ${o}
   → Prepare 3 t\xf3picos principais e 5 fatos/dicas
3. Demonstra\xe7\xe3o ao vivo (5min): Mostre o produto/processo em tempo real
4. Q&A (7min): Responda coment\xe1rios ao vivo
5. Encerramento (2min): Agradecimentos + pr\xf3xima live

📣 PROMO\xc7\xc3O ANTES:
→ Anuncie a live com 24h de anteced\xeancia nos Stories
→ Marque no Instagram Stories (sticker de Contagem Regressiva)
→ Envie mensagem para clientes no WhatsApp`};for(let[a,o]of Object.entries(r))if(e.toLowerCase().includes(a.toLowerCase()))return o;return r.Reels}function E(e,a){let o=["Reels","Carrossel","Stories","Post Est\xe1tico","Reels","Carrossel","Stories","Live"];return o[(e+a)%o.length]}function R(e,a,o){let t=e.toLowerCase();return t.includes("aliment")||t.includes("pizza")||t.includes("hamburg")?0===o?"11:00":"20:00":t.includes("cl\xednica")||t.includes("clinica")||t.includes("servi")?0===o?"09:00":"18:00":"Stories"===a?0===o?"08:30":"19:30":0===o?"12:00":"19:00"}async function C(e){console.log("\uD83D\uDE80 API de estrat\xe9gia iniciada");try{let a=await (0,d.U)(),{data:{user:o}}=await a.auth.getUser();if(!o)return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:{"Content-Type":"application/json"}});let{month:t,year:r}=await e.json();h=t-1,g=r;let{data:s}=await a.from("businesses").select("*").eq("user_id",o.id).single();if(!s)return new Response(JSON.stringify({error:"Business not found"}),{status:404,headers:{"Content-Type":"application/json"}});let i=new Date(r,t,0).getDate(),c=`Voc\xea \xe9 um especialista em marketing digital para pequenos e m\xe9dios empreendedores brasileiros.
Crie uma estrat\xe9gia de conte\xfado para Instagram para o m\xeas de ${t}/${r}.

DADOS DO NEG\xd3CIO:
- Nome: ${s.business_name}
- Nicho: ${s.niche}
- Objetivo principal: ${s.main_goal}
- P\xfablico-alvo: ${s.target_audience}
- Ritmo de postagem: ${s.growth_speed}
- Plataformas: ${s.platforms}
- Descri\xe7\xe3o da marca: ${s.brand_description||"n\xe3o informado"}
- Valor \xfanico: ${s.unique_value||"n\xe3o informado"}
- Instagram: ${s.instagram_handle||"n\xe3o informado"}

REGRAS CR\xcdTICAS:
1. N\xdaMERO DE POSTS POR DIA deve variar conforme o ritmo:
   - "rapido" (posto todo dia): 1 a 2 posts por dia, todos os dias do m\xeas
   - "moderado" (dias alternados): 1 post a cada 2 dias aproximadamente
   - "leve" (2-3x por semana): 1 post, 2-3 vezes por semana
   NUNCA crie exatamente 2 posts em TODOS os dias — varie o n\xfamero naturalmente.

2. VARIEDADE DE CONTE\xdaDO:
   - Distribua: Reels (40%), Carrossel (25%), Stories (20%), Post Est\xe1tico (10%), Live (5%)
   - Nunca repita o mesmo tipo de conte\xfado em dias consecutivos
   - Cada semana deve ter pelo menos 1 Reels e 1 Carrossel

3. HOR\xc1RIOS ESTRAT\xc9GICOS:
   - Adapte os hor\xe1rios ao p\xfablico: varejo (12h, 19h), servi\xe7os (9h, 18h), alimenta\xe7\xe3o (11h, 20h)
   - Varie os hor\xe1rios ao longo do m\xeas (n\xe3o repita o mesmo hor\xe1rio todos os dias)

4. T\xd3PICOS ESPEC\xcdFICOS:
   - Semana 1: apresenta\xe7\xe3o/autoridade
   - Semana 2: conte\xfado educativo/dicas
   - Semana 3: bastidores/humaniza\xe7\xe3o da marca
   - Semana 4: convers\xe3o/oferta/depoimentos
   - Intercale 1 post surpresa por semana (tend\xeancia, parceria, desafio)

5. MEIO DO M\xcaS (dia 14-16): inclua obrigatoriamente 1 post estrat\xe9gico diferenciado:
   - Pode ser: parceria com influenciador local, promo\xe7\xe3o rel\xe2mpago, desafio de engajamento, live especial
   - O script deve explicar detalhadamente POR QUE fazer isso neste momento do m\xeas

6. HASHTAGS: 5 a 10 hashtags espec\xedficas por post. Inclua hashtags de nicho (ex: #pizzariasp), de localiza\xe7\xe3o (se aplic\xe1vel), e de tend\xeancia.

7. SCRIPTS DETALHADOS: cada post deve ter um roteiro completo com:
   - Abertura (gancho)
   - Desenvolvimento
   - Chamada para a\xe7\xe3o espec\xedfica
   - Dica de edi\xe7\xe3o/execu\xe7\xe3o quando relevante

8. CONSIST\xcaNCIA MENSAL: se este n\xe3o for o primeiro m\xeas, varie os temas em rela\xe7\xe3o ao m\xeas anterior. Introduza pelo menos 2 novos tipos de conte\xfado ou abordagens.

Responda no formato JSON especificado, com dados reais e personalizados para este neg\xf3cio espec\xedfico.`,u=(await (0,n.pY)({model:l("llama-3.3-70b-versatile"),schema:f,prompt:c,temperature:.8})).object,p=function(e,a){let o=[];if("rapido"===e)for(let e=1;e<=a;e++)o.push(e);else if("moderado"===e)for(let e=1;e<=a;e++)e%2!=0&&o.push(e);else for(let e=1;e<=a;e++)[1,3,5].includes(new Date(g,h,e).getDay())&&o.push(e);return o}(s.growth_speed,i),m=new Map(u.days.map(e=>[e.day_number,e])),x=p.map(e=>{var a;let o=(a=s.growth_speed,"rapido"===a&&[1,8,15,22].includes(e)?2:1),r=m.get(e),i=(r?.posts||[]).slice(0,o),n=Array.from({length:o},(a,o)=>{let r=i[o];if(r){let a=r.topic||O(s.niche,r.content_type,e,t);return{time:r.time||R(s.niche,r.content_type,o),content_type:r.content_type||E(e,o),topic:a,script:r.script||S(r.content_type||E(e,o),s.niche,a,e),hashtags:r.hashtags||y(s.niche),completed:!1}}return function(e,a,o,t){let r=E(a,t),s=O(e,r,a,o);return{time:R(e,r,t),content_type:r,topic:s,script:S(r,e,s,a),hashtags:y(e),completed:!1}}(s.niche,e,t,o)});return{day_number:e,posts:n}}),{data:v,error:b}=await a.from("strategies").insert({business_id:s.id,user_id:o.id,title:u.title,summary:u.summary,month:t,year:r}).select().single();if(b)throw b;let C=x.map(e=>{let a=e.posts.map(e=>({time:e.time,content_type:e.content_type,topic:e.topic,script:e.script,hashtags:e.hashtags,completed:!1}));return{strategy_id:v.id,user_id:o.id,day_number:e.day_number,content_type:a[0].content_type,topic:a[0].topic,caption_idea:a[0].script,best_time:a[0].time,hashtags:a[0].hashtags,completed:!1,posts:a}}),{error:A}=await a.from("strategy_days").insert(C).select();if(A)throw A;return new Response(JSON.stringify({success:!0,strategy:v,daysCount:C.length,growthSpeed:s.growth_speed,expectedDays:p.length}),{status:200,headers:{"Content-Type":"application/json"}})}catch(e){return console.error("❌ Erro ao gerar estrat\xe9gia:",e),new Response(JSON.stringify({error:e.message||"Erro ao gerar estrat\xe9gia"}),{status:500,headers:{"Content-Type":"application/json"}})}}let A=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/strategy/route",pathname:"/api/strategy",filename:"route",bundlePath:"app/api/strategy/route"},resolvedPagePath:"C:\\Users\\peddroka\\OneDrive\\Sistemas\\cresci.ai\\cresci-ai\\app\\api\\strategy\\route.ts",nextConfigOutput:"",userland:t}),{workAsyncStorage:I,workUnitAsyncStorage:P,serverHooks:_}=A;function D(){return(0,i.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:P})}},96487:()=>{}};var a=require("../../../webpack-runtime.js");a.C(e);var o=e=>a(a.s=e),t=a.X(0,[719,730,410,945],()=>o(89531));module.exports=t})();