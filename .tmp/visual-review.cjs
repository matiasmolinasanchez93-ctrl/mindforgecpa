const fs=require('fs'), path=require('path'), Module=require('module'), ts=require('typescript');
const React=require('react'), {renderToStaticMarkup}=require('react-dom/server');
const root=process.cwd(), out=path.join(root,'.tmp','visual-review');fs.mkdirSync(out,{recursive:true});
let pathname='/dashboard';
const original=Module._load;
Module._load=function(id,parent,main){
 if(id==='next/link')return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
 if(id==='next/navigation')return {usePathname:()=>pathname,useRouter:()=>({push(){},refresh(){}}),useSearchParams:()=>new URLSearchParams()};
 if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));
 return original.call(this,id,parent,main);
};
for(const ext of ['.tsx','.ts'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const load=(file,name)=>require(path.join(root,'src',file))[name||'default'];
const h=React.createElement;
const Shell=load('components/layout/app-shell.tsx','AppShell');
const profile={id:'demo',name:'Alex Rivera',xp:340,level:3,streak:4,role:'student'};
const skills=['ai_literacy','critical_thinking','problem_solving','research','verification','ai_independence'].map((skill_name,i)=>({id:String(i),skill_name,score:40+i*8,total_attempts:3}));
const cls={id:'demo',name:'Critical thinking lab',subject:'General',join_code:'A7K92P'};
const business={id:'demo',user_id:'demo',name:'Studio North',idea:'A focused design service for local businesses.',goal_monthly_revenue:1000,current_monthly_revenue:240,starting_budget:100,starting_budget_currency:'USD',remaining_budget:70,customers:2,hours_per_day:2,skills:[],preferences:[],experience:'Beginner',country:'Guatemala',city:'Guatemala City',problem_solved:'Clear communication for small teams.',target_customer:'Local businesses',offer:'Monthly design support',pricing:{monthly:120,currency:'USD'},startup_costs:[{item:'Design tools',estimatedCost:30}],revenue_model:'Monthly retainers',marketing_strategy:{channels:['Local outreach'],contentIdeas:['Share a before and after'],outreachStrategy:'Talk to five local businesses.'},risks:['Validate demand first.'],status:'active'};
const tasks=[{id:'1',day:1,title:'Define your first offer',description:'Write down the specific problem you can solve.',status:'done'},{id:'2',day:2,title:'Talk to potential customers',description:'Ask three people what they need.',status:'pending'}];
const cases=[
 ['home','/',load('app/page.tsx'),{}],
 ['login','/login',load('app/login/page.tsx'),{}],
 ['signup','/signup',load('components/auth/auth-layout.tsx','AuthLayout'),{children:h(load('components/auth/auth-form.tsx','AuthForm'),{mode:'signup'})}],
 ['dashboard','/dashboard',load('components/dashboard/dashboard-view.tsx','DashboardView'),{profile,skills,recentActivity:[{id:'1',activity_title:'Question the evidence',activity_type:'ai_detective',subject:'General',score:85,xp_earned:35}],classes:[{class:cls}],achievements:[]}],
 ['dashboard-empty','/dashboard',load('components/dashboard/dashboard-view.tsx','DashboardView'),{profile:{...profile,xp:0,level:1,streak:0},skills:[],recentActivity:[],classes:[],achievements:[]}],
 ['tutor','/tutor',load('components/tutor/tutor-view.tsx','TutorView'),{userName:'Alex'}],
 ['challenges','/challenges',load('components/challenges/challenges-view.tsx','ChallengesView'),{}],
 ['prompts','/prompt-builder',load('components/prompt-builder/prompt-builder-view.tsx','PromptBuilderView'),{}],
 ['fact-checker','/fact-checker',load('components/fact-checker/fact-checker-view.tsx','FactCheckerView'),{}],
 ['classes','/classes',load('components/classes/join-class-view.tsx','JoinClassView'),{}],
 ['teacher','/teacher',load('components/teacher/teacher-dashboard-view.tsx','TeacherDashboardView'),{profile,classes:[cls]}],
 ['teacher-empty','/teacher/classes',load('components/teacher/teacher-dashboard-view.tsx','TeacherDashboardView'),{profile,classes:[]}],
 ['class-detail','/teacher/classes/demo',load('components/teacher/class-detail-view.tsx','ClassDetailView'),{cls,members:[{student_id:'demo',student:{...profile,email:'alex@example.test'}}],skills:skills.map(s=>({...s,student_id:'demo'}))}],
 ['business','/business/demo',load('components/business/business-view.tsx','BusinessView'),{business,tasks}],
 ['coach','/coach',load('components/coach/coach-view.tsx','CoachView'),{business,initialMessages:[]}],
 ['onboarding','/onboarding',load('components/onboarding/onboarding-form.tsx','OnboardingForm'),{}],
 ['privacy','/privacy',load('app/privacy/page.tsx'),{}],
 ['terms','/terms',load('app/terms/page.tsx'),{}],
 ['chart','/business/demo',load('components/dashboard/revenue-chart.tsx','RevenueChart'),{currency:'USD',entries:[{month:'2026-07',revenue:50},{month:'2026-08',revenue:150},{month:'2026-09',revenue:240}]}],
];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let css=walk('.next/static').filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(f,'utf8')).join('\n');
const fonts=walk('.next/static').filter(f=>f.endsWith('.woff2'));
if(fonts.length)css+='@font-face{font-family:ReviewGeist;src:url(data:font/woff2;base64,'+fs.readFileSync(fonts[0]).toString('base64')+')}body{font-family:ReviewGeist,Arial,sans-serif}';
for(const [name,url,Component,props] of cases){
 pathname=url;let element=h(Component,props);
 if(!['home','login','signup','privacy','terms'].includes(name))element=h(Shell,{role:url.startsWith('/teacher')?'teacher':'student',businessId:url.startsWith('/business')?'demo':undefined},element);
 const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+name+'</title><style>'+css+'</style><body>'+renderToStaticMarkup(element)+'</body></html>';
 fs.writeFileSync(path.join(out,name+'.html'),html);
}
fs.writeFileSync(path.join(out,'cases.json'),JSON.stringify(cases.map(c=>c[0])));
console.log('Rendered '+cases.length+' isolated screens to '+out);
