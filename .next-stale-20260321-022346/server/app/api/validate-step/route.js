(()=>{var e={};e.id=519,e.ids=[519],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},12398:(e,a,s)=>{"use strict";s.r(a),s.d(a,{patchFetch:()=>f,routeModule:()=>x,serverHooks:()=>S,workAsyncStorage:()=>v,workUnitAsyncStorage:()=>g});var r={};s.r(r),s.d(r,{POST:()=>m,maxDuration:()=>c});var o=s(96559),t=s(48088),i=s(37719),n=s(75413),d=s(91675),u=s(10209);let c=30,p=(0,d.c)({apiKey:process.env.GROQ_API_KEY||""}),l=u.Ik({feedback:u.Yj().nullable().describe("null se as respostas est\xe3o boas. String com sugest\xe3o amig\xe1vel em portugu\xeas se puderem melhorar.")});async function m(e){try{let{step:a,data:s}=await e.json(),r=await (0,n.pY)({model:p("llama-3.3-70b-versatile"),schema:l,prompt:`Voc\xea \xe9 um consultor de marketing digital amig\xe1vel e motivador.
Analise as respostas do step ${a} do question\xe1rio abaixo e d\xea feedback.

DADOS DO QUESTION\xc1RIO:
${JSON.stringify(s,null,2)}

REGRAS:
1. Se as respostas est\xe3o BOAS e ESPEC\xcdFICAS, retorne null
2. Se alguma resposta estiver VAGA, GEN\xc9RICA ou INCOMPLETA, d\xea uma sugest\xe3o curta e amig\xe1vel
3. Seja gentil, nunca cr\xedtico. Use linguagem positiva e motivadora
4. Foque no campo p\xfablico-alvo (target_audience) se estiver muito vago
5. Sugest\xf5es devem ser pr\xe1ticas e acion\xe1veis

EXEMPLOS DE BOM FEEDBACK:
- "Que tal incluir a idade do seu p\xfablico? Isso ajuda a criar conte\xfado mais direcionado!"
- "Voc\xea pode especificar melhor os interesses do seu p\xfablico. Eles gostam de moda, tecnologia, bem-estar?"
- "Adicionar a localiza\xe7\xe3o (cidade/regi\xe3o) pode ajudar a criar conte\xfados mais relevantes!"

EXEMPLOS DE RESPOSTAS BOAS (retornar null):
- "Mulheres de 25-40 anos, classe m\xe9dia, de S\xe3o Paulo, interessadas em moda sustent\xe1vel e bem-estar"
- "Homens de 30-45 anos, empreendedores, que buscam conte\xfado sobre produtividade e neg\xf3cios"

Se as respostas forem boas, retorne null.
Se precisar de melhoria, retorne uma string com a sugest\xe3o.

Responda APENAS com o JSON especificado.`,temperature:.5});return Response.json({feedback:r.object.feedback})}catch(e){return console.error("Erro na valida\xe7\xe3o:",e),Response.json({feedback:null})}}let x=new o.AppRouteRouteModule({definition:{kind:t.RouteKind.APP_ROUTE,page:"/api/validate-step/route",pathname:"/api/validate-step",filename:"route",bundlePath:"app/api/validate-step/route"},resolvedPagePath:"C:\\Users\\peddroka\\OneDrive\\Sistemas\\cresci.ai\\cresci-ai\\app\\api\\validate-step\\route.ts",nextConfigOutput:"",userland:r}),{workAsyncStorage:v,workUnitAsyncStorage:g,serverHooks:S}=x;function f(){return(0,i.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:g})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96487:()=>{}};var a=require("../../../webpack-runtime.js");a.C(e);var s=e=>a(a.s=e),r=a.X(0,[719,945],()=>s(12398));module.exports=r})();