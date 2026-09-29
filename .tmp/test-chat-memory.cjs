
const fs=require('fs'),path=require('path'),Module=require('module'),ts=require('typescript'),assert=require('assert/strict');
const resolve=Module._resolveFilename,original=Module._load;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.resolve('src',name.slice(2)):name,...args);};
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,p);
let authenticated=true,owned=true,dbFail=false,insertFail=false,captured,inserted,filters=[];
const sessionId='123e4567-e89b-42d3-a456-426614174000';
const history=[{role:'user',content:'Me llamo Lucía y estudio fotosíntesis.'},{role:'assistant',content:'Hola Lucía, las plantas aprovechan la luz.'}];
const db={auth:{getUser:async()=>({data:{user:authenticated?{id:'student'}:null}})},from(table){
let op='select';const q={
select(){return q;},eq(k,v){filters.push([table,k,v]);return q;},order(){return q;},limit(){return q;},
insert(data){op='insert';inserted=data;return q;},
maybeSingle:async()=>({data:owned?{id:sessionId}:null,error:dbFail?{message:'offline'}:null}),
single:async()=>({data:dbFail?null:{id:sessionId},error:dbFail?{message:'offline'}:null}),
then(resolve,reject){return Promise.resolve(op==='insert'?{error:insertFail?{message:'offline'}:null}:{data:[...history].reverse(),error:null}).then(resolve,reject);}
};return q;}};
Module._load=function(id,...args){
if(id==='@/lib/supabase/server')return {createClient:async()=>db};
if(id==='@/services/ai/provider')return {generateText:async(request)=>{captured=request;return {text:'La inflación es el aumento general de precios.',usedFallback:false};}};
if(id==='@supabase/ssr')return {createServerClient:(_u,_k,{cookies})=>({auth:{getUser:async()=>{cookies.setAll([{name:'test-session',value:'renewed',options:{httpOnly:true,path:'/'}}]);return {data:{user:authenticated?{id:'student'}:null}};}}})};
return original.call(this,id,...args);
};
(async()=>{
const {safeNextPath}=require(path.resolve('src/lib/auth-redirect.ts'));
for(const bad of ['https://evil.test','//evil.test','/\\evil.test','javascript:alert(1)','/login','/auth/callback','/%2fhost','/%5chost',null,['/tutor']])assert.equal(safeNextPath(bad),'/dashboard');
assert.equal(safeNextPath('/tutor?session=abc'),'/tutor?session=abc');
const {boundHistory,unsavedHistory}=require(path.resolve('src/lib/tutor-memory.ts'));
assert.equal(boundHistory(Array.from({length:25},(_,i)=>({role:'user',content:String(i)}))).length,20);
assert(boundHistory(Array.from({length:20},()=>({role:'user',content:'x'.repeat(6000)}))).length<=4);
assert.deepEqual(unsavedHistory([...history,{role:'user',content:'Economía'}],history),[{role:'user',content:'Economía'}]);
const {NextRequest}=require('next/server');
const route=require(path.resolve('src/app/api/tutor/route.ts'));
const post=body=>route.POST(new NextRequest('http://localhost:3000/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
const input={sessionId,subject:'Biology',message:'Ahora explica la inflación.'};
authenticated=false;assert.equal((await post(input)).status,401);
authenticated=true;assert.equal((await post({...input,message:7})).status,422);
owned=false;assert.equal((await post(input)).status,404);
owned=true;filters=[];let result=await(await post(input)).json();
assert(result.saved);assert.deepEqual(captured.history,history);assert(captured.system.includes('aunque cambie de biología a economía'));assert(filters.some(f=>f[0]==='ai_sessions'&&f[1]==='student_id'&&f[2]==='student'));
assert.equal(inserted.length,2);assert(inserted[0].created_at<inserted[1].created_at);
dbFail=true;result=await(await post({...input,history})).json();assert(!result.saved);assert.deepEqual(captured.history,history);
dbFail=false;insertFail=true;result=await(await post({...input,history})).json();assert(!result.saved);
insertFail=false;result=await(await post({message:'Recuerda mi nombre',history})).json();assert.equal(inserted.length,4);assert(result.saved);
console.log('PASS tutor: auth, validación, propietario, memoria guardada, fallo de DB, recuperación y orden');
const {updateSession}=require(path.resolve('src/lib/supabase/middleware.ts'));
authenticated=false;let response=await updateSession(new NextRequest('http://localhost:3000/tutor?session=abc'));
let url=new URL(response.headers.get('location'));assert.equal(url.pathname,'/login');assert.equal(url.searchParams.get('next'),'/tutor?session=abc');assert(response.headers.get('set-cookie').includes('test-session=renewed'));
authenticated=true;response=await updateSession(new NextRequest('http://localhost:3000/login?next=%2Ftutor%3Fsession%3Dabc'));
assert.equal(new URL(response.headers.get('location')).pathname,'/tutor');assert(response.headers.get('set-cookie').includes('test-session=renewed'));
console.log('PASS auth: destinos seguros, query de retorno y cookies renovadas en redirecciones');
})().catch(e=>{console.error(e);process.exitCode=1;});
