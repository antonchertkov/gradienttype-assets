/* ============================================================================
   CGL — WebGL renderer for the carve height field.
   Renders CARVE.wall (a Wx×Wy height grid) as a glossy white-ceramic relief
   lit by one sun at az=270 / el=35, with self-cast shadows and environment
   reflections. Orbitable. Reuses THREE + RoomEnvironment already loaded.
   ============================================================================ */
const CGL = (function(){
  let renderer, scene, camera, sun, mesh, geo, mat, backing, hemi, amb, ready=false, colorTex=null;
  let yaw=0.35, tilt=0.42, curWx=0, curWy=0, curAR=1, loB=0, zoomF=1, curAz=270, curEl=35;

  function mount(canvas){
    if(ready) return true;
    if(typeof THREE==='undefined'){ console.error('[CGL] three.js not loaded'); return false; }
    try{
      renderer=new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
    }catch(e){ console.error('[CGL] webgl init failed', e); return false; }
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    if('outputEncoding' in renderer) renderer.outputEncoding=THREE.sRGBEncoding;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;

    scene=new THREE.Scene();
    const pmrem=new THREE.PMREMGenerator(renderer);
    scene.environment=pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;

    camera=new THREE.PerspectiveCamera(36, 1, 0.01, 100);

    sun=new THREE.DirectionalLight(0xfff5ea, 3.0);
    sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
    sun.shadow.bias=-0.0004; sun.shadow.normalBias=0.02;
    scene.add(sun); scene.add(sun.target);
    hemi=new THREE.HemisphereLight(0xdfe7ee, 0x2a2f36, 0.18); scene.add(hemi);   // soft sky/ground fill
    amb=new THREE.AmbientLight(0xffffff, 0.04); scene.add(amb);                   // tiny floor so shadows aren't pure black

    mat=new THREE.MeshPhysicalMaterial({color:0xeceef0, roughness:0.5, metalness:0.0,
      clearcoat:0.5, clearcoatRoughness:0.15, envMapIntensity:0.45});
    backing=new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshStandardMaterial({color:0x23262b, roughness:1, metalness:0}));
    backing.receiveShadow=true; scene.add(backing);
    ready=true; setAmbient(0.35); setFinish(0.4); return true;
  }

  /* build / update the displaced grid from a height field (depth-independent bake) */
  function build(wall){
    if(!ready||!wall) return;
    const {Hgt,Wx,Wy,AR,PR}=wall;
    if(!mesh || curWx!==Wx || curWy!==Wy || curAR!==AR){
      if(mesh){ scene.remove(mesh); geo.dispose(); }
      geo=new THREE.PlaneGeometry(AR, 1, Wx-1, Wy-1);   // width AR, height 1; row 0 at +Y (top)
      mesh=new THREE.Mesh(geo, mat); mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
      curWx=Wx; curWy=Wy; curAR=AR;
    }
    const pos=geo.attributes.position;                   // plane verts are row-major, row 0 = top (+Y)
    let lo=1e9; for(let k=0;k<Wx*Wy;k++) if(Hgt[k]<lo) lo=Hgt[k];
    loB=lo/PR;
    for(let i=0;i<Wy;i++)for(let j=0;j<Wx;j++) pos.setZ(i*Wx+j, Hgt[i*Wx+j]/PR);  // depth applied via mesh.scale.z
    pos.needsUpdate=true; geo.computeVertexNormals(); geo.computeBoundingSphere();
    backing.scale.set(AR*1.5, 1.5, 1);
    frame(AR); setLight(curAz,curEl);
  }
  function setDepth(d){
    if(!ready||!mesh) return;
    mesh.scale.z=d;
    backing.position.set(0,0, loB*d - 0.02);
    render();
  }

  function frame(AR){
    const half=Math.max(AR,1)/2;
    const dist=half/Math.tan((camera.fov*Math.PI/180)/2)*1.3*zoomF;
    const cy=Math.cos(tilt), sy=Math.sin(tilt), cx=Math.cos(yaw), sx=Math.sin(yaw);
    camera.position.set(dist*cy*sx, dist*sy, dist*cy*cx);
    camera.up.set(0,1,0); camera.lookAt(0,0,0); camera.updateProjectionMatrix();
  }
  /* move the DISPLAY light only (does not change the baked carving) */
  function setLight(az,el){
    if(!ready) return; curAz=az; curEl=el;
    const a=az*Math.PI/180, e=el*Math.PI/180;
    const dir=new THREE.Vector3(Math.cos(e)*Math.cos(a), -Math.cos(e)*Math.sin(a), Math.sin(e)).normalize();
    sun.position.copy(dir.multiplyScalar(4)); sun.target.position.set(0,0,0); sun.target.updateMatrixWorld();
    const sc=sun.shadow.camera, m=Math.max(curAR,1)*0.9;
    sc.left=-m; sc.right=m; sc.top=m; sc.bottom=-m; sc.near=0.1; sc.far=14; sc.updateProjectionMatrix();
    render();
  }
  function zoom(factor){ zoomF=Math.max(0.35,Math.min(3.2, zoomF*factor)); frame(curAR); render(); }
  /* ambient fill (0..1): drives the environment + sky fill — the actual shadow brightness. Lower = darker, never black */
  function setAmbient(v){ if(!ready||!mat) return;
    mat.envMapIntensity=0.05+v*1.1;       // the RoomEnvironment is the main fill; this is the real lever
    hemi.intensity=v*0.35; amb.intensity=0.02+v*0.05; render(); }
  /* surface finish (0..1): 0 = matte (purest gradient), 1 = high-gloss ceramic (sharp sun highlight + reflections) */
  function setFinish(v){ if(!ready||!mat) return;
    mat.roughness=0.8-v*0.68; mat.clearcoat=v; mat.clearcoatRoughness=0.25-v*0.2;
    mat.needsUpdate=true; render(); }
  /* paint a color texture (the designed gradient) onto the ceramic, or null to clear */
  function setColorMap(canvas){
    if(!ready||!mat) return;
    if(canvas){
      if(colorTex) colorTex.dispose();
      colorTex=new THREE.CanvasTexture(canvas);
      if('colorSpace' in colorTex) colorTex.colorSpace=THREE.SRGBColorSpace; else colorTex.encoding=THREE.sRGBEncoding;
      colorTex.anisotropy=4; mat.map=colorTex; mat.color.set(0xffffff);
    } else {
      if(colorTex){ colorTex.dispose(); colorTex=null; } mat.map=null; mat.color.set(0xeceef0);
    }
    mat.needsUpdate=true; render();
  }

  function resize(w,h){ if(!ready) return; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  function orbit(dxpx,dypx){ yaw-=dxpx*0.006; tilt=Math.max(-1.35,Math.min(1.35, tilt+dypx*0.006)); frame(curAR); render(); }
  function render(){ if(ready) renderer.render(scene,camera); }

  return { mount, build, setDepth, setLight, zoom, setColorMap, setAmbient, setFinish, resize, orbit, render, ok:()=>ready };
})();
