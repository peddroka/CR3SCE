(()=>{var e={};e.id=290,e.ids=[290],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},85830:(e,a,r)=>{"use strict";r.r(a),r.d(a,{patchFetch:()=>h,routeModule:()=>x,serverHooks:()=>f,workAsyncStorage:()=>g,workUnitAsyncStorage:()=>v});var o={};r.r(o),r.d(o,{POST:()=>m,maxDuration:()=>p});var s=r(96559),i=r(48088),t=r(37719),n=r(75413),c=r(91675),d=r(10209);let p=30,u=(0,c.c)({apiKey:process.env.GROQ_API_KEY||""}),l=d.Ik({audience:d.Yj().describe("Descri\xe7\xe3o detalhada do p\xfablico-alvo em portugu\xeas")});async function m(e){try{let{business_name:a,niche:r}=await e.json();if(!a||!r)return new Response(JSON.stringify({error:"Nome do neg\xf3cio e nicho s\xe3o obrigat\xf3rios"}),{status:400,headers:{"Content-Type":"application/json"}});let o=`Voc\xea \xe9 um especialista em marketing digital e cria\xe7\xe3o de personas.
Com base no neg\xf3cio e nicho abaixo, crie uma descri\xe7\xe3o DETALHADA e ESPEC\xcdFICA do p\xfablico-alvo ideal.

Neg\xf3cio: ${a}
Nicho: ${r}

REGRAS:
1. A descri\xe7\xe3o deve ser COMPLETA e incluir:
   - Idade ou faixa et\xe1ria
   - G\xeanero (quando relevante)
   - Localiza\xe7\xe3o/regi\xe3o
   - Classe social ou poder aquisitivo
   - Interesses espec\xedficos relacionados ao nicho
   - Comportamentos de compra
   - Dores ou necessidades
   - Estilo de vida

2. Seja ESPEC\xcdFICO para o nicho ${r}
3. A descri\xe7\xe3o deve ter entre 100 e 200 palavras
4. Use linguagem profissional mas acess\xedvel
5. Responda APENAS com a descri\xe7\xe3o do p\xfablico-alvo, sem explica\xe7\xf5es adicionais

Exemplo de boa descri\xe7\xe3o para "moda plus size":
"Mulheres de 25 a 45 anos, classes B e C, residentes em grandes centros urbanos do Brasil. S\xe3o profissionais que trabalham em escrit\xf3rios ou home office, valorizam a autoestima e buscam roupas que aliem conforto, estilo e boa modelagem para corpos reais. Interessadas em moda sustent\xe1vel, seguem influenciadoras plus size no Instagram e TikTok, compram online com frequ\xeancia (2-3 vezes por m\xeas) e pesquisam avalia\xe7\xf5es antes de comprar. Dores principais: dificuldade em encontrar roupas modernas que vistam bem, tecidos que n\xe3o marcam e lojas com variedade de tamanhos (do 44 ao 60). Buscam marcas que as representem e celebrem a diversidade corporal."

Agora crie uma descri\xe7\xe3o similar para ${a} no nicho de ${r}.`,s=await (0,n.pY)({model:u("llama-3.3-70b-versatile"),schema:l,prompt:o,temperature:.7});return new Response(JSON.stringify({audience:s.object.audience}),{headers:{"Content-Type":"application/json"}})}catch(e){return console.error("Erro ao gerar p\xfablico-alvo:",e),new Response(JSON.stringify({error:e.message||"Erro ao gerar p\xfablico-alvo"}),{status:500,headers:{"Content-Type":"application/json"}})}}let x=new s.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/generate-audience/route",pathname:"/api/generate-audience",filename:"route",bundlePath:"app/api/generate-audience/route"},resolvedPagePath:"C:\\Users\\peddroka\\OneDrive\\Sistemas\\cresci.ai\\cresci-ai\\app\\api\\generate-audience\\route.ts",nextConfigOutput:"",userland:o}),{workAsyncStorage:g,workUnitAsyncStorage:v,serverHooks:f}=x;function h(){return(0,t.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:v})}},96487:()=>{}};var a=require("../../../webpack-runtime.js");a.C(e);var r=e=>a(a.s=e),o=a.X(0,[719,945],()=>r(85830));module.exports=o})();