const fs=require('fs'),path=require('path'),webpack=require('next/dist/compiled/webpack/webpack').webpack;
webpack({mode:'development',devtool:false,entry:path.resolve('.tmp/challenge-review.tsx'),output:{path:path.resolve('.tmp/visual-review'),filename:'challenge.js'},resolve:{extensions:['.tsx','.ts','.js'],alias:{'@':path.resolve('src')}},module:{rules:[{test:/\.tsx?$/,exclude:/node_modules/,use:path.resolve('.tmp/review-loader.cjs')}]},optimization:{minimize:false}},async(err,stats)=>{
if(err||stats.hasErrors()){console.error(err||stats.toString({all:false,errors:true}));process.exitCode=1;return;}
const html=await(await fetch('http://localhost:3000')).text();
const links=[...html.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(m=>'<link rel="stylesheet" href="http://localhost:3000'+m[1]+'">').join('');
fs.writeFileSync('.tmp/visual-review/challenge.html','<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+links+'<body><div id="root"></div><script src="/challenge.js"></script></body></html>');
console.log('Challenge browser fixture built');
});
