/* ============================================================================
   GL — the 3D "relief" render view.
   A glossy white ceramic tile wall lit by one sun; the design is extruded,
   beveled relief on the wall. Reads global state from index.html:
   grid, unitMeta, instances, creations, COLS, ROWS, CW, CH, and the controls.
   ============================================================================ */
const GL = (function(){
  let renderer, scene, camera, sun, wallInst, groutMesh, designGroup, ready=false, needsRender=false, pendingBuild=false;
  let camBounds={left:0,right:1,top:1,bottom:0};
  let tileGeo=null, tileDepth=16, designDepth=18, gap=0;
  const cvs = ()=>document.getElementById('gl');

  const ceramic = hex => new THREE.MeshPhysicalMaterial({color:hex, roughness:0.16, metalness:0.0, clearcoat:1.0, clearcoatRoughness:0.05, envMapIntensity:1.15});
  let matTile, matGrout, matDesign;

  function mount(){
    if(ready) return;
    if(typeof THREE==='undefined'){ console.error('[GL] three.js not loaded'); return; }
    const c=cvs();
    renderer=new THREE.WebGLRenderer({canvas:c, antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputEncoding=THREE.sRGBEncoding;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.02;

    scene=new THREE.Scene();
    const pmrem=new THREE.PMREMGenerator(renderer);
    scene.environment=pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;

    camera=new THREE.OrthographicCamera(-1,1,1,-1,-100000,100000);
    camera.position.set(0,0,10000); camera.lookAt(0,0,0);

    sun=new THREE.DirectionalLight(0xfff6ec, 2.7);
    sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
    sun.shadow.bias=-0.0005; sun.shadow.normalBias=2.0;
    scene.add(sun); scene.add(sun.target);
    scene.add(new THREE.HemisphereLight(0xe7edf1, 0x5c6166, 0.5));

    matTile=ceramic(0xeef1f2); matTile.clearcoatRoughness=0.04;
    matGrout=new THREE.MeshStandardMaterial({color:0x8f9498, roughness:0.95, metalness:0});
    matDesign=ceramic(0xb026ff);

    designGroup=new THREE.Group(); scene.add(designGroup);
    ready=true;
    window.addEventListener('resize', ()=>{ if(active()) pendingBuild=true; });
    loop();
  }

  const active = ()=> typeof reliefOn!=='undefined' && reliefOn;

  /* ---- primitive → extruded, beveled geometry (uses shapeD from index.html) ---- */
  function primGeo(type,v,depth){
    const d=shapeD(type,v,0,0,CW,CH);
    const paths=new THREE.SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`).paths;
    const shapes=[]; paths.forEach(p=>THREE.SVGLoader.createShapes(p).forEach(s=>shapes.push(s)));
    const bev=Math.min(CW,CH)*0.10;
    const geo=new THREE.ExtrudeGeometry(shapes,{depth, bevelEnabled:true, bevelThickness:bev, bevelSize:bev, bevelSegments:3, steps:1, curveSegments:24});
    geo.scale(1,-1,1);                                  // SVG y-down -> world y-up
    reverseWinding(geo); geo.computeVertexNormals();    // mirror flips winding; restore so normals face out
    return geo;
  }
  function reverseWinding(geo){
    if(geo.index){ Array.prototype.reverse.call(geo.index.array); geo.index.needsUpdate=true; return; }
    const p=geo.attributes.position.array;
    for(let i=0;i+8<p.length;i+=9){ for(let k=0;k<3;k++){ const t=p[i+k]; p[i+k]=p[i+6+k]; p[i+6+k]=t; } }
    geo.attributes.position.needsUpdate=true;
  }
  function roundedRectShape(w,h,r){
    const s=new THREE.Shape();
    s.moveTo(r,0); s.lineTo(w-r,0); s.absarc(w-r,r,r,-Math.PI/2,0,false);
    s.lineTo(w,h-r); s.absarc(w-r,h-r,r,0,Math.PI/2,false);
    s.lineTo(r,h); s.absarc(r,h-r,r,Math.PI/2,Math.PI,false);
    s.lineTo(0,r); s.absarc(r,r,r,Math.PI,Math.PI*1.5,false);
    return s;
  }

  /* ---- camera + shadow framing to fill the canvas, grid centred ---- */
  function resize(){
    const c=cvs(), wrap=c.parentElement;
    const w=wrap.clientWidth||1200, h=wrap.clientHeight||800;
    renderer.setSize(w,h,false);
    const gridW=COLS*CW, gridH=ROWS*CH;
    const scale=Math.min(w*0.74/gridW, h*0.74/gridH);   // px per world unit
    const vw=w/scale, vh=h/scale;
    const cx=gridW/2, cy=-gridH/2;                       // grid centre (world y-up, rows go -y)
    camBounds={left:cx-vw/2, right:cx+vw/2, top:cy+vh/2, bottom:cy-vh/2, scale, cx, cy, vw, vh};
    camera.left=camBounds.left; camera.right=camBounds.right; camera.top=camBounds.top; camera.bottom=camBounds.bottom;
    camera.position.set(cx,cy,10000); camera.lookAt(cx,cy,0); camera.updateProjectionMatrix();
    // shadow frustum covers the visible wall
    const sc=sun.shadow.camera, m=Math.max(vw,vh)*0.62;
    sc.left=-m; sc.right=m; sc.top=m; sc.bottom=-m; sc.near=-4000; sc.far=8000; sc.updateProjectionMatrix();
    setSun();
  }

  function setSun(){
    if(!ready) return;
    const az=(+document.getElementById('angle').value)*Math.PI/180;
    const el=(+document.getElementById('elev').value)*Math.PI/180;
    const cx=camBounds.cx||0, cy=camBounds.cy||0, R=Math.max(camBounds.vw||1000,3000);
    sun.position.set(cx+Math.cos(el)*Math.cos(az)*R, cy+Math.cos(el)*Math.sin(az)*R, Math.sin(el)*R+800);
    sun.target.position.set(cx,cy,0); sun.target.updateMatrixWorld();
    needsRender=true;
  }
  function setColor(){ if(matDesign){ matDesign.color.set(document.getElementById('color').value); needsRender=true; } }

  /* ---- build the wall + design from current grid ---- */
  function clearGroup(g){ while(g.children.length){ const o=g.children.pop(); if(o.geometry)o.geometry.dispose(); } }

  function rebuild(){
    if(!ready || !active()) return;
    resizeCamOnly();
    const gridW=COLS*CW, gridH=ROWS*CH;
    gap=Math.max(3,Math.min(CW,CH)*0.055);
    const sp=+document.getElementById('spread').value;
    designDepth=Math.max(6, sp*0.35); tileDepth=Math.max(10, Math.min(CW,CH)*0.16);

    // ---- grout backing plane (behind tiles) ----
    if(groutMesh){ groutMesh.geometry.dispose(); scene.remove(groutMesh); }
    const gW=camBounds.vw*1.4, gH=camBounds.vh*1.4;
    groutMesh=new THREE.Mesh(new THREE.PlaneGeometry(gW,gH), matGrout);
    groutMesh.position.set(camBounds.cx, camBounds.cy, -2); groutMesh.receiveShadow=true;
    scene.add(groutMesh);

    // ---- wall of glossy tiles (instanced), covering the frustum + margin ----
    const rx=Math.min(CW,CH)*0.09;
    const tShape=roundedRectShape(CW-2*gap, CH-2*gap, rx);
    const bev=Math.min(CW,CH)*0.06;
    if(tileGeo) tileGeo.dispose();
    tileGeo=new THREE.ExtrudeGeometry(tShape,{depth:tileDepth, bevelEnabled:true, bevelThickness:bev, bevelSize:bev, bevelSegments:3, steps:1, curveSegments:16});
    const c0=Math.floor(camBounds.left/CW)-1, c1=Math.ceil(camBounds.right/CW)+1;
    const r0=Math.floor(-camBounds.top/CH)-1, r1=Math.ceil(-camBounds.bottom/CH)+1;
    const cnt=(c1-c0+1)*(r1-r0+1);
    if(wallInst){ scene.remove(wallInst); wallInst.dispose&&wallInst.dispose(); }
    wallInst=new THREE.InstancedMesh(tileGeo, matTile, cnt);
    wallInst.castShadow=true; wallInst.receiveShadow=true;
    const dummy=new THREE.Object3D(); let i=0;
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
      dummy.position.set(c*CW+gap, -(r*CH)-CH+gap, 0);   // tile local origin at bottom-left, cell top at -(r*CH)
      dummy.rotation.set(0,0,0); dummy.updateMatrix();
      wallInst.setMatrixAt(i++, dummy.matrix);
    }
    wallInst.instanceMatrix.needsUpdate=true;
    scene.add(wallInst);

    // ---- design: extruded relief on top of the tiles ----
    clearGroup(designGroup);
    const addCell=(r,c,type,v)=>{
      const geo=primGeo(type,v,designDepth);
      const m=new THREE.Mesh(geo, matDesign);
      m.position.set(c*CW, -(r*CH), tileDepth+bev);      // sit on tile tops
      m.castShadow=true; m.receiveShadow=true;
      designGroup.add(m);
    };
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ const cell=grid[r]&&grid[r][c]; if(cell) addCell(r,c,cell.type,cell.v); }
    for(const inst of instances){ const cr=creations[inst.name]; if(!cr) continue;
      for(const x of cr.cells) addCell(x.r+inst.r, x.c+inst.c, x.type, x.v); }

    setColor(); setSun(); needsRender=true;
  }
  function resizeCamOnly(){
    const c=cvs(), wrap=c.parentElement;
    const w=wrap.clientWidth||1200, h=wrap.clientHeight||800;
    renderer.setSize(w,h,false);
    const gridW=COLS*CW, gridH=ROWS*CH;
    const scale=Math.min(w*0.74/gridW, h*0.74/gridH);
    const vw=w/scale, vh=h/scale, cx=gridW/2, cy=-gridH/2;
    // frustum is camera-relative (centred on 0); position provides the world offset
    camera.left=-vw/2; camera.right=vw/2; camera.top=vh/2; camera.bottom=-vh/2;
    camera.position.set(cx,cy,10000); camera.lookAt(cx,cy,0); camera.updateProjectionMatrix();
    camBounds={left:cx-vw/2, right:cx+vw/2, top:cy+vh/2, bottom:cy-vh/2, scale, cx, cy, vw, vh};   // world bounds for click mapping
    const sc=sun.shadow.camera, m=Math.max(vw,vh)*0.62;
    sc.left=-m; sc.right=m; sc.top=m; sc.bottom=-m; sc.near=-4000; sc.far=8000; sc.updateProjectionMatrix();
  }

  /* ---- click → grid cell (ortho mapping) ---- */
  function cellFromClient(clientX,clientY){
    const b=cvs().getBoundingClientRect();
    const wx=camBounds.left + (clientX-b.left)/b.width*(camBounds.right-camBounds.left);
    const wy=camBounds.top   - (clientY-b.top)/b.height*(camBounds.top-camBounds.bottom);
    const c=Math.floor(wx/CW), r=Math.floor(-wy/CH);
    if(c<0||c>=COLS||r<0||r>=ROWS) return null; return {r,c};
  }

  function show(){ mount(); cvs().style.display='block'; pendingBuild=true; needsRender=true; }
  function hide(){ if(cvs()) cvs().style.display='none'; }
  function loop(){ requestAnimationFrame(loop);
    if(!ready||!active()) return;
    if(pendingBuild){ pendingBuild=false; rebuild(); }
    if(needsRender){ needsRender=false; renderer.render(scene,camera); } }

  return { mount, show, hide, rebuild:()=>{pendingBuild=true;}, setSun, setColor, cellFromClient, active,
           mark(){ needsRender=true; } };
})();
