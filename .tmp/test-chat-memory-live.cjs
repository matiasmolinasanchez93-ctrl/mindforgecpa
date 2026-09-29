
const fs=require('fs'),path=require('path'),Module=require('module'),ts=require('typescript'),assert=require('assert/strict');
require('@next/env').loadEnvConfig(process.cwd());
const resolve=Module._resolveFilename;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.resolve('src',name.slice(2)):name,...args);};
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,p);
(async()=>{
const {createClient}=require('@supabase/supabase-js');
const c=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
for(const [table,fields] of [['profiles','id,role,name'],['ai_sessions','id,student_id,title,subject,topic,difficulty,updated_at'],['ai_session_messages','id,session_id,role,content,created_at'],['coach_messages','id,user_id,business_id,role,content,created_at']]){
const {error}=await c.from(table).select(fields,{head:true});assert(!error,error?.message);console.log('PASS Supabase esquema '+table);
}
const src=fs.readFileSync('src/app/api/tutor/route.ts','utf8');
const system=JSON.parse(src.match(/^const TUTOR_SYSTEM_PROMPT = (.*);$/m)[1])+'\nPreferencias iniciales: Biology, fotosíntesis.';
const {callMakeWebhook}=require(path.resolve('src/services/ai/transportMake.ts'));
const provider={label:'Make',webhookUrl:process.env.MAKE_AI_WEBHOOK_URL};
const history=[{role:'user',content:'Me llamo Lucía. Estoy preparando una exposición de fotosíntesis.'},{role:'assistant',content:'La fotosíntesis permite a las plantas usar la luz para producir su alimento.'}];
const user='Ahora cambiemos de tema: ¿qué es la inflación en economía?';
const reply=await callMakeWebhook(provider,{system,user,history,context:{feature:'tutor',subject:'Biology'},conversationId:'memory-test'});
assert(/preci|dinero|compr|econ/i.test(reply),reply);console.log('PASS Gemini cambia de biología a economía:',reply);
history.push({role:'user',content:user},{role:'assistant',content:reply});
const memory=await callMakeWebhook(provider,{system,user:'¿Cómo me llamo y cuál era el tema de mi exposición inicial?',history,context:{feature:'tutor',subject:'Biology'},conversationId:'memory-test'});
assert(/luc[ií]a/i.test(memory)&&/fotos[ií]ntesis/i.test(memory),memory);
console.log('PASS Gemini recuerda nombre y tema inicial:',memory);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
