
const fs=require('fs'),path=require('path'),Module=require('module'),ts=require('typescript'),assert=require('assert/strict');
const resolve=Module._resolveFilename,load=Module._load;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.resolve('src',name.slice(2)):name,...args);};
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,p);
let authenticated=true,savedInput,failAI=false,failDB=false,calls=0;
const challenge={title:'Suma',description:'Prueba',content:'2+2',correctAnswer:'4',hints:['Suma'],explanation:'Dos más dos',xpBase:35,options:['1','2','3','4']};
Module._load=function(id,...rest){
 if(id==='@/lib/supabase/server')return {createClient:async()=>({auth:{getUser:async()=>({data:{user:authenticated?{id:'student'}:null}})}})};
 if(id==='@/services/ai/challengeGenerator')return {generateChallenge:async()=>challenge,ChallengeError:class extends Error{}};
 if(id==='@/services/ai/challengeEvaluator')return {evaluateChallenge:async()=>{calls++;if(failAI)throw Error('Test AI failure');return {score:20,correct:false,feedback:'Revisa la suma.'};}};
 if(id==='@/services/studentService')return {recordActivityAttempt:async(_,input)=>{savedInput=input;return failDB?null:{xp_earned:7};}};
 return load.call(this,id,...rest);
};
(async()=>{
const route=require(path.resolve('src/app/api/challenge/route.ts'));
const {NextRequest}=require('next/server');
const post=body=>route.POST(new NextRequest('http://localhost/api/challenge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
const get=()=>route.GET(new NextRequest('http://localhost/api/challenge?type=solve_it&subject=Mathematics'));
authenticated=false;assert.equal((await get()).status,401);assert.equal((await post({})).status,401);
authenticated=true;const question=await(await get()).json();assert(question.ticket);assert(!question.correctAnswer&&!question.explanation);
assert.equal((await post({ticket:question.ticket+'x',answer:'4'})).status,422);assert.equal(calls,0);
const valid={ticket:question.ticket,answer:'1',hints_used:0,score:100};
let result=await(await post(valid)).json();assert.equal(result.score,20);assert.equal(savedInput.score,20);assert.equal(result.correct,false);assert.equal(result.correctAnswer,'4');
failDB=true;result=await(await post(valid)).json();assert.equal(result.saved,false);assert.equal(result.score,20);
failAI=true;assert.equal((await post(valid)).status,503);
console.log('PASS route: autenticación, firma, solución oculta, nota del servidor, fallo de guardado y fallo de IA');
})().catch(e=>{console.error(e);process.exitCode=1;});
