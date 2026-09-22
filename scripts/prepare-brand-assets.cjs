// Platform sizing only: preserve the client's original artwork and colors.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..');
const requireApp=createRequire(path.join(root,'apps/admin-web/package.json'));
const sharp=createRequire(requireApp.resolve('next/package.json'))('sharp');
const horizontal=path.join(root,'assets/brand/grupo-j-horizontal.png');
const profile=path.join(root,'assets/brand/grupo-j-profile.png');
const navy='#00091D',blue='#034EFE';
const mkdir=p=>fs.mkdirSync(path.dirname(p),{recursive:true});
function save(destination,buffer){mkdir(destination);fs.writeFileSync(destination+'.tmp',buffer);fs.renameSync(destination+'.tmp',destination);}
async function sized(source,destination,size,background){let image=sharp(source).resize(size,size,{fit:'contain',background:background??{r:0,g:0,b:0,alpha:0}});if(background)image=image.flatten({background});save(destination,await image.png().toBuffer());}
async function foreground(destination,size){
 // The central monogram already fits within the adaptive icon's safe zone.
 const artwork=await sharp(profile).resize(size,size).png().toBuffer();
 save(destination,await sharp({create:{width:size,height:size,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:artwork,gravity:'centre'}]).png().toBuffer());
}
async function splashBanner(destination,width,height){
 save(destination,await sharp(horizontal).resize(width,height,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer());
}
(async()=>{
 for(const app of ['admin-web','workshop-web']){
  const publicRoot=path.join(root,'apps',app,'public');
  for(const [name,source] of [['grupo-j-horizontal.png',horizontal],['grupo-j-profile.png',profile]]){const dest=path.join(publicRoot,'brand',name);mkdir(dest);fs.copyFileSync(source,dest);}
  for(const size of [192,512])await sized(profile,path.join(publicRoot,`icons/icon-${size}.png`),size,navy);
  const icon=await sharp(profile).resize(400,400).png().toBuffer();
  fs.writeFileSync(path.join(publicRoot,'icons/icon-maskable.png'),await sharp({create:{width:512,height:512,channels:4,background:blue}}).composite([{input:icon,gravity:'centre'}]).png().toBuffer());
 }
 const mobile=path.join(root,'apps/customer-mobile');
 fs.copyFileSync(horizontal,path.join(mobile,'assets/brand-horizontal.png'));
 fs.copyFileSync(profile,path.join(mobile,'assets/brand-profile.png'));
 await sized(profile,path.join(mobile,'assets/icon.png'),1024,blue);
 await foreground(path.join(mobile,'assets/adaptive-icon.png'),1024);
 await splashBanner(path.join(mobile,'assets/splash.png'),1024,512);
 for(const [density,scale] of Object.entries({mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4})){
  const res=path.join(mobile,'android/app/src/main/res');
  for(const name of ['ic_launcher','ic_launcher_round'])await sized(profile,path.join(res,`mipmap-${density}/${name}.png`),Math.round(48*scale),blue);
  await foreground(path.join(res,`mipmap-${density}/ic_launcher_foreground.png`),Math.round(108*scale));
  await splashBanner(path.join(res,`drawable-${density}/splashscreen_logo.png`),Math.round(288*scale),Math.round(80*scale));
 }
 console.log('Official brand assets prepared for portals, Expo and native Android.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
