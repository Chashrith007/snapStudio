import {FilesetResolver, FaceDetector} from './vendor/vision_bundle.mjs';
const $ = id => document.getElementById(id);
const canvas=$('canvas'), ctx=canvas.getContext('2d'), video=$('video');
const source=document.createElement('canvas');
const state={hasPhoto:false, faces:[], accessory:'glasses',frame:'polaroid',stream:null,version:0,cameraVersion:0,capturing:false,detector:null};
const status = message => {$('status').textContent=message;};
const detectorReady=(async()=>{
  try {
    const vision=await FilesetResolver.forVisionTasks('./vendor/wasm');
    state.detector=await FaceDetector.createFromOptions(vision,{baseOptions:{modelAssetPath:'./models/blaze_face_short_range.tflite',delegate:'CPU'},runningMode:'IMAGE',minDetectionConfidence:.5});
    $('modelStatus').textContent='Face detector ready'; return state.detector;
  } catch(error) {
    console.error(error); $('modelStatus').textContent='Detector unavailable · filters still work'; return null;
  }
})();
function stopCamera(){
  state.cameraVersion++;
  if(state.stream) state.stream.getTracks().forEach(track=>track.stop());
  state.stream=null; video.srcObject=null; video.hidden=true; $('captureBar').hidden=true;
  $('countdown').hidden=true;state.capturing=false;$('capture').disabled=false;$('camera').disabled=false;
  canvas.hidden=!state.hasPhoto;$('empty').hidden=state.hasPhoto;
}
function invalidate(){state.version++;stopCamera();return state.version;}
async function useImage(image,version){
  if(version!==state.version)return;
  const width=image.naturalWidth||image.videoWidth||image.width, height=image.naturalHeight||image.videoHeight||image.height;
  if(!width||!height)throw Error('This image has no readable dimensions.');
  const scale=Math.min(1,1200/Math.max(width,height));
  source.width=Math.max(1,Math.round(width*scale));source.height=Math.max(1,Math.round(height*scale));
  source.getContext('2d').drawImage(image,0,0,source.width,source.height);
  state.hasPhoto=true; state.faces=[]; $('compare').checked=false;$('compare').disabled=true;$('download').disabled=true;
  canvas.hidden=false;$('empty').hidden=true;draw();status('Finding your face…');
  const detector=await detectorReady;
  if(version!==state.version)return;
  if(detector){
    try {state.faces=detector.detect(source).detections;}
    catch(error){console.error(error);status('Face detection failed. Filters and frames are still available.');}
  }
  draw();$('compare').disabled=false;$('download').disabled=false;
  if(!detector)status('Filters and frames are ready. Reload to retry the face detector.');
  else status(state.faces.length ? `${state.faces.length} face${state.faces.length===1?'':'s'} found. Make it yours.` : 'No faces found. Try a brighter, front-facing photo. Filters still work.');
}
async function loadFile(file){
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){status('Choose a JPG, PNG, or WebP image.');return;}
  if(file.size>15*1024*1024){status('Choose an image smaller than 15 MB.');return;}
  const version=invalidate(),url=URL.createObjectURL(file);status('Opening your photo…');
  try {const img=new Image();img.src=url;await img.decode();await useImage(img,version);}
  catch(error){if(version===state.version)status('That image could not be opened. Try another JPG or PNG.');}
  finally{URL.revokeObjectURL(url);$('file').value='';}
}
async function loadSample(){
  const version=invalidate();status('Opening the sample…');
  try{const img=new Image();img.src='./assets/sample.png';await img.decode();await useImage(img,version);}
  catch(error){if(version===state.version)status('The sample could not load. Please upload a photo instead.');}
}
function rounded(x,y,w,h,r,fill,stroke,line=2){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}
}
function polygon(points,fill,stroke,line=2){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}}
function accessory(face){
  const b=face.boundingBox, w=b.width, h=b.height;
  const size=Number($('size').value)/100, shift=Number($('offset').value)*h/100;
  const sw=w*size, line=Math.max(2,w*.025), cx=b.originX+w/2;
  let eyeX=cx, eyeY=b.originY+h*.40, angle=0;
  const eyes=face.keypoints?.slice(0,2).sort((a,b)=>a.x-b.x);
  if(eyes?.length===2){eyeX=(eyes[0].x+eyes[1].x)*source.width/2;eyeY=(eyes[0].y+eyes[1].y)*source.height/2;angle=Math.atan2((eyes[1].y-eyes[0].y)*source.height,(eyes[1].x-eyes[0].x)*source.width);}
  ctx.save();ctx.translate(eyeX,eyeY+shift);ctx.rotate(angle);
  if(['glasses','combo'].includes(state.accessory)){
    for(const side of [-1,1]){const x=side*sw*.23;rounded(x-sw*.20,-sw*.10,sw*.40,sw*.23,sw*.055,'#24243c','#f4c65f',line);ctx.strokeStyle='#a1d4e2';ctx.lineWidth=line;ctx.beginPath();ctx.moveTo(x-sw*.12,-sw*.04);ctx.lineTo(x+sw*.03,-sw*.04);ctx.stroke();}
    ctx.strokeStyle='#f4c65f';ctx.lineWidth=line;ctx.beginPath();ctx.moveTo(-sw*.04,0);ctx.lineTo(sw*.04,0);ctx.stroke();
  }
  const base=-h*.34;
  if(['hat','combo'].includes(state.accessory)){
    polygon([[-sw*.38,base],[0,base-sw*.72],[sw*.38,base]],'#9b6cde','#f5d98c',line);
    for(const t of [.25,.5,.75]){ctx.beginPath();ctx.arc(0,base-sw*.72*t,sw*.035,0,Math.PI*2);ctx.fillStyle='#ffe3a6';ctx.fill();}
  }
  if(state.accessory==='cat')for(const side of [-1,1]){const x=side*sw*.32;polygon([[x-sw*.17,base],[x,base-sw*.38],[x+sw*.17,base]],'#343044','#e99cbf',line*2);}
  ctx.restore();
}
function applyMood(){
  const mood=$('mood').value;if(mood==='original')return;
  const pixels=ctx.getImageData(0,0,source.width,source.height),d=pixels.data;
  for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],gray=.299*r+.587*g+.114*b;
    if(mood==='mono'){d[i]=d[i+1]=d[i+2]=gray;}
    if(mood==='warm'){d[i]=r*1.06+10;d[i+1]=g*1.01+4;d[i+2]=b*.90;}
    if(mood==='vintage'){const t=gray/255;d[i]=53+(255-53)*t;d[i+1]=35+(226-35)*t;d[i+2]=59+(172-59)*t;}
  }ctx.putImageData(pixels,0,0);
}
function draw(){
  if(!state.hasPhoto)return;
  const original=$('compare').checked,framed=state.frame!=='none'&&!original;
  const border=framed?Math.max(12,Math.round(source.width/30)):0,footer=framed?Math.max(65,Math.round(source.width/9)):0;
  canvas.width=source.width+border*2;canvas.height=source.height+border+footer;
  ctx.drawImage(source,0,0);
  if(!original){applyMood();for(const face of state.faces) accessory(face);}
  if(framed){
    const photo=document.createElement('canvas');photo.width=source.width;photo.height=source.height;photo.getContext('2d').drawImage(canvas,0,0);
    ctx.fillStyle=state.frame==='midnight'?'#241d37':'#fffaf0';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(photo,border,border);
    ctx.fillStyle=state.frame==='midnight'?'#f7d78b':'#41334d';ctx.font=`${Math.max(16,Math.round(source.width/28))}px Georgia, serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    let caption=$('caption').value.slice(0,70);while(caption&&ctx.measureText(caption).width>source.width-20)caption=caption.slice(0,-1);
    ctx.fillText(caption,canvas.width/2,source.height+border+footer/2);
  }
}
function choose(group,key){
  $(group).addEventListener('click',event=>{const button=event.target.closest('button[data-value]');if(!button)return;state[key]=button.dataset.value;
    for(const item of $(group).querySelectorAll('button')){const active=item===button;item.classList.toggle('selected',active);item.setAttribute('aria-pressed',String(active));}
    $('compare').checked=false;draw();
  });
}
choose('accessories','accessory');choose('frames','frame');
for(const id of ['mood','caption','size','offset'])$(id).addEventListener('input',()=>{$('sizeValue').value=`${$('size').value}%`;$('offsetValue').value=$('offset').value;$('compare').checked=false;draw();});
$('compare').addEventListener('change',draw);
$('upload').onclick=()=>$('file').click();$('file').onchange=()=>loadFile($('file').files[0]);
$('sample').onclick=loadSample;$('sampleEmpty').onclick=loadSample;
$('camera').onclick=async()=>{
  if(!navigator.mediaDevices?.getUserMedia){status('Camera access requires HTTPS or localhost. You can still upload a photo.');return;}
  invalidate();const version=state.cameraVersion;$('camera').disabled=true;status('Allow camera access in your browser to begin.');
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});
    if(version!==state.cameraVersion){stream.getTracks().forEach(track=>track.stop());return;}
    state.stream=stream;video.srcObject=stream;video.hidden=false;canvas.hidden=true;$('empty').hidden=true;
    await video.play();if(version!==state.cameraVersion)return;$('captureBar').hidden=false;status('Find your light. Then take your photo.');
  }catch(error){if(version===state.cameraVersion){stopCamera();status(error.name==='NotAllowedError'?'Camera permission was denied. Allow access or use a photo upload.':'Camera unavailable. Close other camera apps or upload a photo.');}}
};
$('stop').onclick=()=>{stopCamera();status('Camera closed.');};
$('capture').onclick=async()=>{
  if(state.capturing||!state.stream||!video.videoWidth)return;
  state.capturing=true;$('capture').disabled=true;const cameraVersion=state.cameraVersion;
  if($('timer').checked)for(let count=3;count>0;count--){if(cameraVersion!==state.cameraVersion)return;$('countdown').hidden=false;$('countdown').textContent=count;await new Promise(resolve=>setTimeout(resolve,1000));}
  if(cameraVersion!==state.cameraVersion)return;
  const snap=document.createElement('canvas');snap.width=video.videoWidth;snap.height=video.videoHeight;
  const context=snap.getContext('2d');context.translate(snap.width,0);context.scale(-1,1);context.drawImage(video,0,0);
  const version=invalidate();await useImage(snap,version);
};
$('download').onclick=()=>{
  if(!state.hasPhoto)return;
  const wasOriginal=$('compare').checked;$('compare').checked=false;draw();
  canvas.toBlob(blob=>{if(!blob){status('Could not export the photo. Please try again.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`snapstudio-${Date.now()}.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Your PNG is ready. Check your downloads.');},'image/png');
  $('compare').checked=wasOriginal;draw();
};
$('reset').onclick=()=>{invalidate();state.hasPhoto=false;state.faces=[];source.width=source.height=1;canvas.width=canvas.height=1;canvas.hidden=true;$('empty').hidden=false;$('compare').checked=false;$('compare').disabled=true;$('download').disabled=true;$('file').value='';status('A fresh start. Your next photo is waiting.');};
window.addEventListener('pagehide',stopCamera);
for(const type of ['dragover','drop'])$('stage').addEventListener(type,event=>{event.preventDefault();if(type==='drop')loadFile(event.dataTransfer.files[0]);});
