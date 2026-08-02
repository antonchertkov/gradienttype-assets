/* ============================================================================
   GradientType — self-contained engine  (v1)
   Portfolio embed build. Styles, markup, logic and 3D are wrapped in one
   private scope; all classes are prefixed `gt-` and styles are scoped under
   #gt-root, so nothing collides with the host Webflow page (or vice-versa).
   REQUIRES (load BEFORE this file): three.min.js, RoomEnvironment.js, SVGLoader.js
   MOUNTS INTO: an element with id="gt-root".
   ============================================================================ */
(function(){
  var ROOT = document.getElementById('gt-root');
  if(!ROOT){ console.error('[GradientType] No container found — add <div id="gt-root"></div> to the page.'); return; }
  if(ROOT.getAttribute('data-gt-mounted')){ return; }
  ROOT.setAttribute('data-gt-mounted','1');


  /* ---- styles (scoped under #gt-root, classes prefixed gt-) ---- */
  var GT_CSS = `
#gt-root{--bg:#0e0e11;--panel:#161619;--panel2:#1d1d22;--line:#2a2a31;--ink:#e9e9ee;--dim:#8b8b96;--accent:#a855f7;--accent2:#7c3aed;--radius:10px}
#gt-root *{box-sizing:border-box}
#gt-root{height:100vh;background:var(--bg);color:var(--ink);font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;-webkit-font-smoothing:antialiased}
#gt-root .gt-app{display:grid;grid-template-columns:1fr 300px;height:100%}
#gt-root .gt-stage{display:flex;flex-direction:column;min-width:0}
#gt-root .gt-topbar{display:flex;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid var(--line)}
#gt-root .gt-topbar h1{font-size:14px;font-weight:600;margin:0;letter-spacing:.02em}
#gt-root .gt-topbar .gt-sub{color:var(--dim);font-size:12px}
#gt-root .gt-toolrow{display:flex;gap:8px;align-items:center;margin-left:auto}
#gt-root .gt-modepill{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:5px 12px;border-radius:20px;border:1px solid var(--line)}
#gt-root .gt-modepill.gt-place{background:#1a2a1e;border-color:#2e6b3f;color:#7ee29a}
#gt-root .gt-modepill.gt-select{background:#1a2233;border-color:#3f6bce;color:#a6c6ff}
#gt-root .gt-modepill.gt-type{background:#2a2033;border-color:#c08bff;color:#e6ccff}
#gt-root .gt-modeseg{display:flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}
#gt-root .gt-modeseg button{background:var(--panel2);border:none;border-right:1px solid var(--line);color:var(--dim);padding:6px 13px;font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:.12s}
#gt-root .gt-modeseg button:last-child{border-right:none}
#gt-root .gt-modeseg button:hover{color:var(--ink)}
#gt-root .gt-modeseg button.gt-on[data-mode=place]{background:#1a2a1e;color:#7ee29a}
#gt-root .gt-modeseg button.gt-on[data-mode=select]{background:#1a2233;color:#a6c6ff}
#gt-root .gt-modeseg button.gt-on[data-mode=type]{background:#2a2033;color:#e6ccff}
#gt-root .gt-canvas-wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:36px;overflow:hidden;background:radial-gradient(circle at 50% 40%,#17171c 0%,#0e0e11 70%);position:relative}
#gt-root #board{border-radius:6px;box-shadow:0 24px 80px -20px rgba(0,0,0,.7);user-select:none;display:block}
#gt-root #gl{position:absolute;inset:0;width:100%;height:100%;display:none}
#gt-root .gt-canvas-wrap.gt-relief{padding:0;background:#0d0e10}
#gt-root .gt-canvas-wrap.gt-relief #board{display:none}
#gt-root .gt-canvas-wrap.gt-relief #gl{display:block}
#gt-root #board.gt-select-mode{cursor:crosshair}
#gt-root #board.gt-type-mode{cursor:text}
#gt-root .gt-side{background:var(--panel);border-left:1px solid var(--line);overflow-y:auto}
#gt-root .gt-sect{padding:16px 16px 18px;border-bottom:1px solid var(--line)}
#gt-root .gt-sect h2{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);margin:0 0 12px;font-weight:600;display:flex;justify-content:space-between}
#gt-root .gt-tools{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
#gt-root .gt-tool{aspect-ratio:1.4;background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.12s;padding:14px}
#gt-root .gt-tool:hover{border-color:#3a3a44;background:#232329}
#gt-root .gt-tool.gt-active{border-color:var(--accent);background:#241a33;box-shadow:0 0 0 1px var(--accent) inset}
#gt-root .gt-tool svg{height:100%;display:block}
#gt-root .gt-row{display:flex;align-items:center;gap:10px;margin:10px 0}
#gt-root .gt-row label{color:var(--dim);width:58px;flex:none;font-size:12px}
#gt-root .gt-row input[type=range]{flex:1;accent-color:var(--accent)}
#gt-root .gt-row .gt-val{width:38px;text-align:right;font-variant-numeric:tabular-nums;font-size:12px}
#gt-root input[type=color]{width:34px;height:26px;padding:0;border:1px solid var(--line);border-radius:6px;background:none;cursor:pointer}
#gt-root input[type=text],#gt-root input[type=number]{background:var(--panel2);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:8px 10px;font:inherit;width:100%}
#gt-root input[type=number]{width:60px}
#gt-root .gt-btn{background:var(--panel2);border:1px solid var(--line);color:var(--ink);padding:8px 12px;border-radius:8px;cursor:pointer;font:inherit;transition:.12s}
#gt-root .gt-btn:hover{border-color:#3a3a44;background:#232329}
#gt-root .gt-btn.gt-primary{background:var(--accent2);border-color:var(--accent);color:#fff}
#gt-root .gt-btn.gt-primary:hover{background:var(--accent)}
#gt-root .gt-btn:disabled{opacity:.4;cursor:default}
#gt-root .gt-btnrow{display:flex;gap:8px;margin-top:10px}
#gt-root .gt-btnrow .gt-btn{flex:1;text-align:center}
#gt-root .gt-hint{color:var(--dim);font-size:11px;margin-top:10px;line-height:1.6}
#gt-root kbd{background:var(--panel2);border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;padding:1px 5px;font:11px monospace;color:var(--ink)}
#gt-root .gt-sides{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px;align-items:center;justify-items:center}
#gt-root .gt-sidedot{grid-column:2;grid-row:2;color:var(--dim);font-size:14px}
#gt-root .gt-sidebtn{width:100%;background:var(--panel2);border:1px solid var(--line);color:var(--dim);padding:6px 4px;border-radius:7px;cursor:pointer;font:inherit;font-size:11px;transition:.12s}
#gt-root .gt-sidebtn:hover:not(:disabled){border-color:#3a3a44;color:var(--ink)}
#gt-root .gt-sidebtn.gt-on{background:#241a33;border-color:var(--accent);color:#d6a6ff}
#gt-root .gt-sidebtn:disabled{opacity:.35;cursor:default}
#gt-root .gt-lib{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
#gt-root .gt-chip{position:relative;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:6px 4px 4px;cursor:pointer;transition:.12s;text-align:center}
#gt-root .gt-chip:hover{border-color:var(--accent);background:#221a2b}
#gt-root .gt-chip svg{width:100%;height:34px;display:block}
#gt-root .gt-chip .gt-nm{font-size:10px;color:var(--dim);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#gt-root .gt-chip .gt-x{position:absolute;top:-6px;right:-6px;width:16px;height:16px;border-radius:50%;background:#2a2a31;border:1px solid var(--line);color:var(--dim);font-size:10px;line-height:14px;display:none}
#gt-root .gt-chip:hover .gt-x{display:block}
#gt-root .gt-chip .gt-x:hover{color:#ff6b6b;border-color:#ff6b6b}
#gt-root .gt-chip .gt-e{position:absolute;top:-6px;left:-6px;width:16px;height:16px;border-radius:50%;background:#2a2a31;border:1px solid var(--line);color:var(--dim);font-size:9px;line-height:15px;display:none}
#gt-root .gt-chip:hover .gt-e{display:block}
#gt-root .gt-chip .gt-e:hover{color:var(--accent);border-color:var(--accent)}
/* ---- carve view ---- */
#gt-root .gt-canvas-wrap.gt-carve{padding:0;background:#0b0c0f}
#gt-root .gt-canvas-wrap.gt-carve #board,#gt-root .gt-canvas-wrap.gt-carve #gl{display:none}
#gt-root #carveCv{display:none;position:absolute;inset:0;width:100%;height:100%;cursor:grab}
#gt-root .gt-canvas-wrap.gt-carve #carveCv{display:block}
#gt-root #carvePanel{display:none}
#gt-root .gt-canvas-wrap.gt-carve #carvePanel{display:flex}
#gt-root #carvePanel{position:absolute;top:14px;right:14px;width:220px;flex-direction:column;gap:9px;background:rgba(18,18,22,.93);border:1px solid var(--line);border-radius:12px;padding:12px;box-shadow:0 16px 50px -12px rgba(0,0,0,.6)}
#gt-root #carvePanel h3{margin:0;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);display:flex;justify-content:space-between;align-items:center}
#gt-root #carvePanel canvas.gt-thumb{width:100%;height:auto;border-radius:6px;background:#0a0b0e;display:block}
#gt-root #cCurveC{aspect-ratio:1}
#gt-root .gt-carveRow{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dim)}
#gt-root .gt-carveRow input[type=range]{flex:1;accent-color:var(--accent)}
#gt-root .gt-cverdict{font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px}
#gt-root .gt-cv-ok{background:#16311f;color:#6fbf8f}
#gt-root .gt-cv-bad{background:#341a1a;color:#d98a8a}
#gt-root.gt-carving .gt-gradonly{display:none!important}
#gt-root.gt-carving #gradTitle::after{content:" · sun (display only)"}
`;
  var __gtStyle=document.createElement('style');__gtStyle.setAttribute('data-gt-style','1');__gtStyle.textContent=GT_CSS;document.head.appendChild(__gtStyle);

  /* ---- markup ---- */
  var GT_HTML = `
<div class="gt-app">
  <div class="gt-stage">
    <div class="gt-topbar">
      <h1>Gradient Type</h1><span class="gt-sub">constructor</span>
      <div class="gt-toolrow">
        <div class="gt-modeseg" id="modeSeg">
          <button data-mode="place" title="Place (V)">Place</button>
          <button data-mode="select" title="Select (S)">Select</button>
          <button data-mode="type" title="Type (T)">Type</button>
        </div>
        <button class="gt-btn" id="undoBtn" title="Undo (⌘Z)">Undo</button>
      </div>
    </div>
    <div class="gt-canvas-wrap"><svg id="board"></svg><canvas id="gl"></canvas><canvas id="carveCv"></canvas>
      <div id="carvePanel">
        <h3>Carving <span style="color:#6b6b76;letter-spacing:0;text-transform:none">light 270°/35°</span></h3>
        <div class="gt-carveRow"><span>source gradient</span></div>
        <canvas id="cGradT" class="gt-thumb"></canvas>
        <div class="gt-carveRow"><span>brightness curve</span><button class="gt-btn" id="cCurveReset" style="margin-left:auto;padding:3px 8px;font-size:11px">reset</button></div>
        <canvas id="cCurveC" class="gt-thumb"></canvas>
        <div class="gt-carveRow"><span>re-lit</span><span class="gt-cverdict" id="cVerdict" style="margin-left:auto">–</span><span id="cDelta" style="font-variant-numeric:tabular-nums;color:var(--ink)">Δ –</span></div>
        <canvas id="cRelitT" class="gt-thumb"></canvas>
        <div class="gt-carveRow"><span style="width:40px">depth</span><input type="range" id="cDepth" min="10" max="180" value="100"><span id="cDepthV" style="width:28px;text-align:right;color:var(--ink)">1.0</span></div>
        <div class="gt-carveRow"><span style="width:40px">detail</span><input type="number" id="cDetail" value="30" min="6" max="48" style="width:50px"><span style="margin-left:auto">margin</span><input type="number" id="cPad" value="2" min="0" max="8" style="width:50px"></div>
        <div class="gt-carveRow"><span style="width:40px">edge</span><input type="range" id="cEdge" min="0" max="8" step="1" value="3"><span id="cEdgeV" style="width:20px;text-align:right">3</span><span style="color:#6b6b76;font-size:11px">bevel</span></div>
        <div class="gt-carveRow"><span style="width:40px">ambient</span><input type="range" id="cAmb" min="0" max="100" value="35"><span id="cAmbV" style="width:24px;text-align:right">35</span></div>
        <div class="gt-carveRow"><span style="width:40px">gloss</span><input type="range" id="cGloss" min="0" max="100" value="40"><span id="cGlossV" style="width:24px;text-align:right">40</span><span style="color:#6b6b76;font-size:11px">matte→ceramic</span></div>
        <div class="gt-btnrow"><button class="gt-btn" id="cColorBtn" style="flex:1">◐ Paint gradient on tiles</button></div>
        <div class="gt-btnrow"><button class="gt-btn" id="cExportObj">Export .obj</button><button class="gt-btn" id="cExportJson">Height</button></div>
        <div class="gt-hint" style="margin:0">Authored for a top light — set gradient <b>Angle ≈ 270°</b> for a faithful carve. Drag the view to orbit.</div>
      </div>
    </div>
  </div>

  <div class="gt-side">
    <div class="gt-sect">
      <h2>Kit</h2>
      <div class="gt-tools" id="tools"></div>
      <div class="gt-hint">
        <kbd>V</kbd> place · <kbd>S</kbd> select · <kbd>T</kbd> type<br>
        <kbd>A</kbd><kbd>D</kbd> switch primitive · <kbd>R</kbd> rotate hovered<br>
        <b>Right-click deletes</b> · <kbd>⌘Z</kbd>/<kbd>⇧⌘Z</kbd> undo/redo<br>
        Select: drag a box, then Merge
      </div>
    </div>

    <div class="gt-sect">
      <h2>Unit <span id="unitCount"></span></h2>
      <div class="gt-btnrow">
        <button class="gt-btn gt-primary" id="mergeBtn" disabled>Merge <kbd style="color:#fff;border-color:#fff6">M</kbd></button>
        <button class="gt-btn" id="releaseBtn" disabled>Release</button>
      </div>
      <div class="gt-hint">Select mode: click a primitive to select it, <b>Shift-click</b> to add/remove, or drag a box. Then <b>Merge</b>. Open a side to let light bleed off that edge.</div>
      <div class="gt-sides" id="sides">
        <button class="gt-sidebtn" data-side="t" style="grid-column:2;grid-row:1" disabled>top</button>
        <button class="gt-sidebtn" data-side="l" style="grid-column:1;grid-row:2" disabled>left</button>
        <span class="gt-sidedot">◻</span>
        <button class="gt-sidebtn" data-side="r" style="grid-column:3;grid-row:2" disabled>right</button>
        <button class="gt-sidebtn" data-side="b" style="grid-column:2;grid-row:3" disabled>bottom</button>
      </div>
      <label class="gt-chk" style="margin-top:14px;opacity:.4" id="uCustomLbl"><input type="checkbox" id="uCustomGrad" disabled>Custom gradient — light this unit its own way</label>
      <div id="uGradCtl" style="display:none;margin-top:8px">
        <div class="gt-row"><label>Angle</label><input type="range" id="uAngle" min="0" max="360" value="270"><span class="gt-val" id="uAngleVal">270°</span></div>
        <div class="gt-hint" style="margin:0">Colour &amp; spread follow the global gradient; only this angle is independent.</div>
      </div>
    </div>

    <div class="gt-sect">
      <h2><span id="gradTitle">Gradient</span> <span class="gt-gradonly" style="text-transform:none;letter-spacing:0;color:var(--dim)">inner light</span></h2>
      <div class="gt-row gt-gradonly"><label>Color</label><input type="color" id="color" value="#b026ff"><span class="gt-hint" style="margin:0">light that hugs the outline</span></div>
      <div class="gt-row"><label>Angle</label><input type="range" id="angle" min="0" max="360" value="125"><span class="gt-val" id="angleVal">125°</span></div>
      <div class="gt-row gt-gradonly"><label>Spread</label><input type="range" id="spread" min="4" max="160" value="64"><span class="gt-val" id="spreadVal">64</span></div>
      <div class="gt-row"><label>Sun ∠</label><input type="range" id="elev" min="5" max="90" value="42"><span class="gt-val" id="elevVal">42</span></div>
      <div class="gt-row"><label>Speed</label><input type="range" id="animSpeed" min="1" max="30" value="10"><span class="gt-val" id="animSpeedVal">10</span></div>
      <div class="gt-btnrow"><button class="gt-btn" id="reliefBtn">◭ Carve</button><button class="gt-btn" id="animBtn">▶ Animate</button></div>
      <div class="gt-btnrow"><button class="gt-btn gt-gradonly-inline" id="resetLightBtn" style="display:none;flex:1">↺ Reset sun to generating light</button></div>
    </div>

    <div class="gt-sect">
      <h2>Canvas</h2>
      <div class="gt-row">
        <label>Columns</label><input type="number" id="cols" value="12" min="2" max="40">
        <label style="width:auto">Rows</label><input type="number" id="rows" value="8" min="2" max="24">
      </div>
      <div class="gt-row"><label>Aspect</label><input type="range" id="aspect" min="0.4" max="2.5" step="0.05" value="1"><span class="gt-val" id="aspectVal">1.00</span></div>
      <div class="gt-row"><label>Back</label><input type="color" id="bg" value="#171018"></div>
      <div class="gt-btnrow">
        <button class="gt-btn" id="gridToggle">Grid: on</button>
        <button class="gt-btn" id="clearBtn">Clear</button>
        <button class="gt-btn" id="exportBtn">Export SVG</button>
      </div>
    </div>

    <div class="gt-sect">
      <h2>Creations</h2>
      <div class="gt-row" style="gap:6px">
        <input type="text" id="crName" placeholder="name / letter" autocomplete="off" maxlength="12">
        <button class="gt-btn gt-primary" id="saveCrBtn" disabled>Save</button>
      </div>
      <div class="gt-hint">Select cells, name them, Save. A single-character name becomes a typeable letter. Click a chip to drop it — ✎ to edit, × to delete.</div>
      <div id="editBar" style="display:none;margin-top:10px;padding:9px 11px;border:1px solid var(--accent);border-radius:8px;background:#241a33">
        <span style="font-size:12px;color:#d6a6ff">Editing “<b id="editName"></b>” — locked letter loaded onto canvas</span>
        <div class="gt-btnrow" style="margin-top:8px">
          <button class="gt-btn gt-primary" id="editSaveBtn">Save changes</button>
          <button class="gt-btn" id="editCancelBtn">Cancel</button>
        </div>
      </div>
      <div class="gt-lib" id="lib"></div>
    </div>

    <div class="gt-sect">
      <h2>Type <span style="text-transform:none;letter-spacing:0;color:var(--dim)">press T</span></h2>
      <div class="gt-hint" style="margin-top:0">Press <kbd>T</kbd>, click the grid for a cursor, then type. Letters land as locked units — drag to reposition. Or use the field:</div>
      <input type="text" id="typeIn" placeholder="quick type…" autocomplete="off">
      <div class="gt-row" style="margin-top:8px">
        <label>Track</label><input type="number" id="track" value="0" min="0" max="8" style="width:44px">
        <label style="width:auto">Lead</label><input type="number" id="lead" value="0" min="0" max="8" style="width:44px">
        <label style="width:auto">Space</label><input type="number" id="space" value="2" min="0" max="12" style="width:44px">
      </div>
      <div class="gt-btnrow"><button class="gt-btn gt-primary" id="typeBtn">Place field text</button></div>
    </div>

    <div class="gt-sect">
      <h2>File</h2>
      <div class="gt-btnrow">
        <button class="gt-btn" id="saveFileBtn">Export save</button>
        <button class="gt-btn" id="loadFileBtn">Import save</button>
      </div>
      <input type="file" id="fileIn" accept="application/json" style="display:none">
      <div class="gt-hint">Saves the whole project — grid, units, letters, colors and library — as a <code>.json</code> you can re-import.</div>
    </div>
  </div>
</div>
`;
  ROOT.innerHTML = GT_HTML;

  /* ---- fit height to the space actually available below whatever sits above
     the embed (Webflow nav, section padding, etc.) instead of forcing 100vh,
     which overflows the viewport by the height of the nav. Recomputes on
     resize / load / orientation change. ---- */
  function gtFit(){
    var top = ROOT.getBoundingClientRect().top + (window.pageYOffset || window.scrollY || 0);
    var vh  = window.innerHeight || document.documentElement.clientHeight;
    var h   = vh - top;
    if(h < 360) h = 360;                 // sane floor for tiny/edge cases
    ROOT.style.height = h + 'px';
  }
  gtFit();
  // On user resize the app's own resize listener re-renders the canvas; gtFit
  // just adjusts the height first (added here, so it runs before that listener).
  window.addEventListener('resize', gtFit);
  // load/orientation can change the space above us (fonts, mobile browser chrome);
  // recompute, then fire one resize so the app re-renders. gtFit never dispatches,
  // so this can't loop.
  function gtRefit(){ gtFit(); window.dispatchEvent(new Event('resize')); }
  window.addEventListener('orientationchange', gtRefit);
  window.addEventListener('load', gtRefit);

  /* ============================ gl.js ============================ */
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

  /* ============================ carvegl.js ============================ */
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

  /* ============================ app ============================ */
let COLS=12, ROWS=8;
let CW=100, CH=100;   // cell width/height (aspect adjustable; shapes fill any ratio)
let grid=[];
let tool='quarter', mode='place', showGrid=true, exporting=false;
let painting=false, deleting=false;
let selection=new Set(), selecting=false, selStart=null, selMoved=false;
let nextUnit=1, unitMeta={};
let creations={};
let instances=[], instSeq=1;          // placed letters (protected layer)
let cursor=null, typedSession=[], selInst=null, dragInst=null, dragOff=null, dragMoved=false;
let hoverCell=null, fieldInst=[];
let editing=null, editReturn=null, editHistLen=0;
let animOn=false, animRAF=null, animT0=null;
let reliefOn=false;   // (legacy gl.js relief — superseded by carveOn)
let carveOn=false;    // SfS carving view: reads the live gradient, integrates a height field
let view={vbW:0,vbH:0,gx:0,gy:0,scale:1};   // viewport maps the whole wrap; grid sits at (gx,gy)
let history=[], future=[];

const VARIANTS={square:1, quarter:4, triangle:4, half:4};
const TOOLS=['quarter','half','square','triangle'];
/* ---- split tiles: a cell may hold a primary primitive + a complementary triangle (mate) ---- */
const TRI_COMP={0:2,2:0,1:3,3:1};                 // opposite triangle that fills the other half
const TRI_HYP={0:['b','r'],1:['b','l'],2:['t','l'],3:['t','r']};   // the two sides a triangle's hypotenuse faces between
const TRI_LEGS={0:['t','l'],1:['t','r'],2:['b','r'],3:['b','l']};  // the two real (axis-aligned) edges a triangle has
const TRI_RC={0:'tl',1:'tr',2:'br',3:'bl'};                        // the right-angle corner between those legs
// a solid quad extending a triangle's hypotenuse outward by M (contiguous — bleeds the diagonal edge, no comb)
function hypStrip(v,x,y,w,h,M){
  const e=(v===0||v===2)?[[x+w,y],[x,y+h]]:[[x,y],[x+w,y+h]];
  const n=v===0?[0.71,0.71]:v===2?[-0.71,-0.71]:v===1?[-0.71,0.71]:[0.71,-0.71];
  const dx=n[0]*M, dy=n[1]*M;
  return `M${e[0][0]} ${e[0][1]} L${e[1][0]} ${e[1][1]} L${(e[1][0]+dx).toFixed(1)} ${(e[1][1]+dy).toFixed(1)} L${(e[0][0]+dx).toFixed(1)} ${(e[0][1]+dy).toFixed(1)} Z`;
}
function cellHalves(cell){ if(!cell)return []; const o=[{prim:cell,half:'a'}]; if(cell.mate)o.push({prim:cell.mate,half:'b'}); return o; }
function primOfHalf(cell,half){ return (half==='b')?(cell&&cell.mate):cell; }
/* ---- primitive-level selection: keys are "r,c,half" ---- */
function parseKey(k){const [r,c,half]=k.split(',');return {r:+r,c:+c,half};}
function selPrims(){const out=[];selection.forEach(k=>{const s=parseKey(k);const cell=grid[s.r]&&grid[s.r][s.c];const prim=primOfHalf(cell,s.half);if(prim)out.push({...s,cell,prim});});return out;}
function triSide(v,fx,fy){return v===0?(fx+fy<1):v===2?(fx+fy>1):v===1?(fy<fx):(fy>fx);}   // is (fx,fy) inside triangle rotation v
// which primitive (if any) sits under a click point in a cell
function hitPrim(r,c,fx,fy){const cell=grid[r]&&grid[r][c];if(!cell)return null;
  if(cell.mate)return `${r},${c},${whichHalf(cell,fx,fy)}`;
  if(cell.type==='triangle')return triSide(cell.v,fx,fy)?`${r},${c},a`:null;   // single triangle: only its half is live
  return `${r},${c},a`;}
function boxPrims(a,b){const keys=[];const r0=Math.min(a.r,b.r),r1=Math.max(a.r,b.r),c0=Math.min(a.c,b.c),c1=Math.max(a.c,b.c);
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)for(const h of cellHalves(grid[r]&&grid[r][c]))keys.push(`${r},${c},${h.half}`);
  return keys;}

/* ---------- geometry: every shape FILLS the x,y,w,h cell ---------- */
// cell filled with ONE corner rounded by a TRUE circular arc (radius min(w,h)); straight elsewhere.
// reduces to the old elliptical pie exactly when the cell is square.
function quarterD(x,y,w,h,v){const r=Math.min(w,h);switch(v){
  case 0:return `M${x} ${y} L${x+w} ${y} L${x+w} ${y+h-r} A${r} ${r} 0 0 1 ${x+w-r} ${y+h} L${x} ${y+h} Z`;   // round BR
  case 1:return `M${x} ${y} L${x+w} ${y} L${x+w} ${y+h} L${x+r} ${y+h} A${r} ${r} 0 0 1 ${x} ${y+h-r} Z`;       // round BL
  case 2:return `M${x+r} ${y} L${x+w} ${y} L${x+w} ${y+h} L${x} ${y+h} L${x} ${y+r} A${r} ${r} 0 0 1 ${x+r} ${y} Z`; // round TL
  case 3:return `M${x} ${y} L${x+w-r} ${y} A${r} ${r} 0 0 1 ${x+w} ${y+r} L${x+w} ${y+h} L${x} ${y+h} Z`;}}       // round TR
function triangleD(x,y,w,h,v){const P={0:[[x,y],[x+w,y],[x,y+h]],1:[[x+w,y],[x,y],[x+w,y+h]],2:[[x+w,y+h],[x+w,y],[x,y+h]],3:[[x,y+h],[x,y],[x+w,y+h]]}[v];
  return `M${P[0][0]} ${P[0][1]} L${P[1][0]} ${P[1][1]} L${P[2][0]} ${P[2][1]} Z`;}
function halfD(x,y,w,h,v){
  if(v===0){const c=Math.min(w/2,h);return `M${x} ${y+h} L${x} ${y+c} A${w/2} ${c} 0 0 1 ${x+w} ${y+c} L${x+w} ${y+h} Z`;}
  if(v===2){const c=Math.min(w/2,h);return `M${x} ${y} L${x} ${y+h-c} A${w/2} ${c} 0 0 0 ${x+w} ${y+h-c} L${x+w} ${y} Z`;}
  if(v===1){const c=Math.min(h/2,w);return `M${x} ${y} L${x+w-c} ${y} A${c} ${h/2} 0 0 1 ${x+w-c} ${y+h} L${x} ${y+h} Z`;}
  if(v===3){const c=Math.min(h/2,w);return `M${x+w} ${y} L${x+c} ${y} A${c} ${h/2} 0 0 0 ${x+c} ${y+h} L${x+w} ${y+h} Z`;}}
function shapeD(type,v,x,y,w,h){
  if(type==='square')return `M${x} ${y} L${x+w} ${y} L${x+w} ${y+h} L${x} ${y+h} Z`;
  if(type==='quarter')return quarterD(x,y,w,h,v);
  if(type==='triangle')return triangleD(x,y,w,h,v);
  if(type==='half')return halfD(x,y,w,h,v);}

/* ---------- inner-light filter (bright hugs outline, fades inward to transparent) ---------- */
// ov (optional): per-unit override {angle,spread,color}; falls back to the global preset
// ov (optional): per-unit override; only ANGLE differs from global — colour & spread always follow the global preset
function shadowFilter(id,sp,ov){
  ov=ov||{};
  const ang=(ov.angle!=null?+ov.angle:+angle.value), spr=sp, col=color.value;
  const ua=(ov.angle!=null?` data-ua="${(+ov.angle).toFixed(1)}"`:'');   // tag per-unit filters so animation can sweep them
  const a=ang*Math.PI/180, dx=(-Math.cos(a)*spr).toFixed(1), dy=(-Math.sin(a)*spr).toFixed(1), blur=(spr*0.8).toFixed(1);
  return `<filter id="${id}"${ua} x="-70%" y="-70%" width="240%" height="240%" color-interpolation-filters="sRGB">
    <feOffset in="SourceAlpha" dx="${dx}" dy="${dy}" result="o"/>
    <feGaussianBlur in="o" stdDeviation="${blur}" result="b"/>
    <feComposite in="SourceAlpha" in2="b" operator="out" result="rim"/>
    <feFlood flood-color="${col}" result="c"/>
    <feComposite in="c" in2="rim" operator="in"/></filter>`;
}
/* relief: treat each tile's alpha as a carved height-field (blur = bevel), lit by a distant sun.
   the "gradient" then IS the diffuse shading of that 3D form. azimuth=angle, elevation=sun height. */
function reliefFilter(id){
  const az=+angle.value, el=+document.getElementById('elev').value, sp=+spread.value;
  const blur=(sp*0.55).toFixed(1), scale=(sp*0.5).toFixed(1);
  return `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="hm"/>
    <feDiffuseLighting in="hm" surfaceScale="${scale}" diffuseConstant="1.05" lighting-color="${color.value}" result="diff">
      <feDistantLight azimuth="${az}" elevation="${el}"/></feDiffuseLighting>
    <feSpecularLighting in="hm" surfaceScale="${scale}" specularConstant="0.95" specularExponent="20" lighting-color="#ffffff" result="spec">
      <feDistantLight azimuth="${az}" elevation="${el}"/></feSpecularLighting>
    <feComposite in="diff" in2="SourceAlpha" operator="in" result="dc"/>
    <feComposite in="spec" in2="SourceAlpha" operator="in" result="sc"/>
    <feMerge><feMergeNode in="dc"/><feMergeNode in="sc"/></feMerge></filter>`;
}
/* live animation: patch the #ig filter + every per-unit filter each frame (angle sweeps, spread breathes) */
function patchOne(f,ang,s){const off=f.querySelector('feOffset'),gb=f.querySelector('feGaussianBlur');const rad=ang*Math.PI/180;
  if(off){off.setAttribute('dx',(-Math.cos(rad)*s).toFixed(1));off.setAttribute('dy',(-Math.sin(rad)*s).toFixed(1));}
  if(gb)gb.setAttribute('stdDeviation',(s*0.8).toFixed(1));}
function patchFilter(a,s,sweep){
  const f=document.getElementById('ig');
  if(f){const sun=f.querySelector('feDistantLight'); if(sun){sun.setAttribute('azimuth',a.toFixed(1));} else patchOne(f,a,s);}
  // per-unit custom-gradient filters (board only): shared spread breathe, angle swept by the SAME amount (keeps their relative offset)
  const board=document.getElementById('board'); if(board)board.querySelectorAll('filter[data-ua]').forEach(uf=>patchOne(uf,+uf.getAttribute('data-ua')+(sweep||0),s));
}
function animLoop(ts){
  if(!animOn)return;
  if(animT0==null)animT0=ts;
  const t=(ts-animT0)/1000, speed=+document.getElementById('animSpeed').value, sweep=t*speed;
  const baseA=+angle.value, baseS=+spread.value;
  patchFilter((baseA+sweep)%360, baseS*(1+0.45*Math.sin(t*2*Math.PI/5)), sweep);  // sweep + breathe (±45%, ~5s)
  animRAF=requestAnimationFrame(animLoop);
}
function carveAnimLoop(ts){
  if(!animOn||!carveOn)return;
  if(animT0==null)animT0=ts;
  const t=(ts-animT0)/1000, speed=+document.getElementById('animSpeed').value;
  const az=(270+t*speed*6)%360;                                  // sweep the display sun around the wall
  angle.value=Math.round(az); angleVal.textContent=Math.round(az)+'°';
  if(typeof CGL!=='undefined'&&CGL.ok())CGL.setLight(az,+document.getElementById('elev').value);
  animRAF=requestAnimationFrame(carveAnimLoop);
}
function toggleAnim(){animOn=!animOn;const b=document.getElementById('animBtn');
  b.textContent=animOn?'❚❚ Animating…':'▶ Animate light'; b.classList.toggle('gt-primary',animOn);
  if(carveOn){ if(animOn){animT0=null;animRAF=requestAnimationFrame(carveAnimLoop);}else{cancelAnimationFrame(animRAF);} return; }
  if(animOn){animT0=null;animRAF=requestAnimationFrame(animLoop);}else{cancelAnimationFrame(animRAF);render();}
}
/* ---------- shared ink builder: loose tiles + units (open-side bleed + clip) ----------
   cells: [{r,c,type,v,unit}] · sw/sh: cell width/height (any aspect) · sp: filter spread · returns {defs,ink} */
function inkFor(cells, meta, sw, sh, pfx, filterId, sp){
  const units={}; let loose='';
  for(const cell of cells){
    const d=shapeD(cell.type,cell.v,cell.c*sw,cell.r*sh,sw,sh);
    if(cell.unit!=null){(units[cell.unit]||(units[cell.unit]={cells:[],minC:1e9,maxC:-1e9,minR:1e9,maxR:-1e9}));
      const u=units[cell.unit]; u.cells.push({d,type:cell.type,v:cell.v,c:cell.c,r:cell.r});
      u.minC=Math.min(u.minC,cell.c);u.maxC=Math.max(u.maxC,cell.c);u.minR=Math.min(u.minR,cell.r);u.maxR=Math.max(u.maxR,cell.r);}
    else loose+=`<path d="${d}" fill="${color.value}" filter="url(#${filterId})"/>`;
  }
  let defs='',ink=''; const M=sp*4;
  for(const id in units){
    const u=units[id], bx=u.minC*sw,by=u.minR*sh,bw=(u.maxC-u.minC+1)*sw,bh=(u.maxR-u.minR+1)*sh;
    const md=meta[id]||{}, open=md.open||{}, g=md.grad;
    const uc=color.value;                                         // colour always follows the global preset
    let fid=filterId;                                              // per-unit filter when the unit has its own angle
    if(g){ fid=pfx+'uf'+id; defs+=shadowFilter(fid,sp,{angle:g.angle}); }   // spread follows global (sp); only angle differs
    const paths=u.cells.map(o=>`<path d="${o.d}" fill="${uc}"/>`).join('');
    // bleed a side per-CELL, following the real edges (a triangle only has its two legs + hypotenuse) — no floating rims
    let ext='';
    const rr=(X,Y,W,H)=>`<rect x="${X.toFixed(1)}" y="${Y.toFixed(1)}" width="${W.toFixed(1)}" height="${H.toFixed(1)}" fill="${uc}"/>`;
    const edge={t:(x,y)=>rr(x,y-M,sw,M+2), b:(x,y)=>rr(x,y+sh-2,sw,M+2), l:(x,y)=>rr(x-M,y,M+2,sh), r:(x,y)=>rr(x+sw-2,y,M+2,sh)};
    const corn={tl:(x,y)=>rr(x-M,y-M,M+2,M+2), tr:(x,y)=>rr(x+sw-2,y-M,M+2,M+2), bl:(x,y)=>rr(x-M,y+sh-2,M+2,M+2), br:(x,y)=>rr(x+sw-2,y+sh-2,M+2,M+2)};
    for(const o of u.cells){ const x=o.c*sw, y=o.r*sh;
      if(o.type==='triangle'){
        const legs=TRI_LEGS[o.v]; for(const s of legs)if(open[s])ext+=edge[s](x,y);
        if(open[legs[0]]&&open[legs[1]])ext+=corn[TRI_RC[o.v]](x,y);                                  // right-angle corner
        const hc=TRI_HYP[o.v]; if(open[hc[0]]&&open[hc[1]])ext+=`<path d="${hypStrip(o.v,x,y,sw,sh,M)}" fill="${uc}"/>`;   // hypotenuse
      } else {
        for(const s of ['t','b','l','r'])if(open[s])ext+=edge[s](x,y);
        if(open.t&&open.l)ext+=corn.tl(x,y); if(open.t&&open.r)ext+=corn.tr(x,y);
        if(open.b&&open.l)ext+=corn.bl(x,y); if(open.b&&open.r)ext+=corn.br(x,y);
      }
    }
    const cid=pfx+'c'+id;
    defs+=`<clipPath id="${cid}">${u.cells.map(o=>`<path d="${o.d}"/>`).join('')}</clipPath>`;   // clip to the unit's real shape, not its bbox
    ink+=`<g clip-path="url(#${cid})"><g filter="url(#${fid})">${paths}${ext}</g></g>`;
  }
  return {defs, ink:loose+ink};   // loose primitives were being dropped — now included
}

/* ---------- palette ---------- */
function toolIcon(t){return `<svg viewBox="0 0 76 60"><path d="${shapeD(t,0,8,6,60,48)}" fill="#e9e9ee"/></svg>`;}
function buildTools(){tools.innerHTML='';
  TOOLS.forEach((t,i)=>{const d=document.createElement('div');
    d.className='gt-tool'+(t===tool&&mode==='place'?' gt-active':'');
    d.innerHTML=toolIcon(t); d.title=t+'  ('+(i+1)+')';
    d.onclick=()=>{tool=t;setMode('place');buildTools();};
    tools.appendChild(d);});}
function cyclePrimitive(dir){tool=TOOLS[(TOOLS.indexOf(tool)+dir+4)%4];setMode('place');buildTools();}

/* ---------- state / history ---------- */
function blankGrid(){grid=Array.from({length:ROWS},()=>Array(COLS).fill(null));}
function snapshot(){return JSON.stringify({grid,meta:unitMeta,inst:instances,seq:instSeq});}
function restore(s){const o=JSON.parse(s);grid=o.grid;unitMeta=o.meta||{};instances=o.inst||[];instSeq=o.seq||1;syncNextUnit();}
function pushHistory(){history.push(snapshot());if(history.length>120)history.shift();future=[];}
function undo(){if(!history.length)return;future.push(snapshot());restore(history.pop());render();}
function redo(){if(!future.length)return;history.push(snapshot());restore(future.pop());render();}
function syncNextUnit(){let m=0;for(const row of grid)for(const c of row)for(const h of cellHalves(c))if(h.prim.unit)m=Math.max(m,h.prim.unit);nextUnit=m+1;}
function pruneMeta(){const live=new Set();for(const row of grid)for(const c of row)for(const h of cellHalves(c))if(h.prim.unit)live.add(h.prim.unit);for(const id in unitMeta)if(!live.has(+id))delete unitMeta[id];}
function typeLineH(){let h=4;for(const n in creations)h=Math.max(h,creations[n].h);return h;}
const trackN=()=>+document.getElementById('track').value||0;
const leadN=()=>+document.getElementById('lead').value||0;
const spaceN=()=>+document.getElementById('space').value||0;

/* ---------- render ---------- */
function render(){
  updateUnitUI(); persist();
  if(carveOn){ ROOT.querySelector('.gt-canvas-wrap').classList.add('gt-carve'); return; }  // carve view owns its canvas; recompute is explicit
  ROOT.querySelector('.gt-canvas-wrap').classList.remove('gt-carve');
  if(reliefOn){ ROOT.querySelector('.gt-canvas-wrap').classList.add('gt-relief'); GL.show(); return; }  // 3D view owns its canvas
  ROOT.querySelector('.gt-canvas-wrap').classList.remove('gt-relief'); if(typeof GL!=='undefined')GL.hide();
  const W=COLS*CW,H=ROWS*CH,board=document.getElementById('board');
  board.setAttribute('viewBox',`0 0 ${W} ${H}`);
  board.classList.toggle('gt-select-mode',mode==='select');
  board.classList.toggle('gt-type-mode',mode==='type');
  let defs=shadowFilter('ig',+spread.value);
  const gcells=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const cell=grid[r]&&grid[r][c];for(const h of cellHalves(cell))gcells.push({r,c,type:h.prim.type,v:h.prim.v,unit:h.prim.unit});}
  const gi=inkFor(gcells,unitMeta,CW,CH,'g','ig',+spread.value); defs+=gi.defs; let ink=gi.ink;
  let instHi='';
  for(const inst of instances){const cr=creations[inst.name];if(!cr)continue;
    const cells=cr.cells.map(x=>({r:x.r+inst.r,c:x.c+inst.c,type:x.type,v:x.v,unit:x.unit}));
    const ii=inkFor(cells,cr.units,CW,CH,'i'+inst.id,'ig',+spread.value); defs+=ii.defs; ink+=ii.ink;
    if(inst.id===selInst&&!exporting)instHi=`<rect x="${inst.c*CW}" y="${inst.r*CH}" width="${cr.w*CW}" height="${cr.h*CH}" fill="none" stroke="#a855f7" stroke-width="3" stroke-dasharray="12 9"/>`;
  }
  let lines='';
  if(showGrid&&!exporting){for(let c=0;c<=COLS;c++)lines+=`<line x1="${c*CW}" y1="0" x2="${c*CW}" y2="${H}"/>`;
    for(let r=0;r<=ROWS;r++)lines+=`<line x1="0" y1="${r*CH}" x2="${W}" y2="${r*CH}"/>`;}
  let sel='';
  if(!exporting)for(const s of selPrims()){
    sel+=`<path d="${shapeD(s.prim.type,s.prim.v,s.c*CW,s.r*CH,CW,CH)}" fill="rgba(168,85,247,.18)" stroke="#a855f7" stroke-width="3" stroke-linejoin="round"/>`;}
  let caret='';
  if(mode==='type'&&cursor&&!exporting)caret=`<rect x="${cursor.c*CW-6}" y="${cursor.r*CH}" width="12" height="${(cursor.lineH||typeLineH())*CH}" fill="#a855f7"><animate attributeName="opacity" values="1;.15;1" dur="1s" repeatCount="indefinite"/></rect>`;
  board.innerHTML=`<defs>${defs}</defs>
    <rect x="0" y="0" width="${W}" height="${H}" fill="${bg.value}"/>
    <g>${ink}</g>
    <g stroke="rgba(255,255,255,.07)" stroke-width="1">${lines}</g>
    <g>${sel}${instHi}${caret}</g>`;
  fitBoard();
}
function fitBoard(){const board=document.getElementById('board'),wrap=board.parentElement;
  const s=Math.min((wrap.clientWidth-72)/(COLS*CW),(wrap.clientHeight-72)/(ROWS*CH));
  board.style.width=(COLS*CW*s)+'px'; board.style.height=(ROWS*CH*s)+'px';}
window.addEventListener('resize',()=>{ if(reliefOn){/* GL self-resizes */} else render(); });

function updateUnitUI(){
  const all=new Set();for(const row of grid)for(const c of row)for(const h of cellHalves(c))if(h.prim.unit)all.add(h.prim.unit);
  unitCount.textContent=all.size?all.size+' unit'+(all.size>1?'s':''):'';
  const selHas=selPrims().length>0;
  mergeBtn.disabled=!selHas;
  const scb=document.getElementById('saveCrBtn'); if(scb)scb.disabled=!selHas;
  const ids=targetUnits();
  releaseBtn.disabled=!ids.length;
  ROOT.querySelectorAll('.gt-sidebtn').forEach(b=>{const s=b.dataset.side;b.disabled=!ids.length;
    b.classList.toggle('gt-on',ids.length>0&&ids.every(id=>unitMeta[id]&&unitMeta[id].open[s]));});
  // custom-gradient reflection
  const cg=document.getElementById('uCustomGrad'),lbl=document.getElementById('uCustomLbl'),ctl=document.getElementById('uGradCtl');
  if(cg){cg.disabled=!ids.length; lbl.style.opacity=ids.length?1:.4;
    const uids=[...new Set(ids)], allGrad=uids.length&&uids.every(id=>unitMeta[id]&&unitMeta[id].grad);
    cg.checked=!!allGrad; ctl.style.display=allGrad?'block':'none';
    if(allGrad){const g=unitMeta[uids[0]].grad;
      const ua=document.getElementById('uAngle');ua.value=g.angle!=null?g.angle:+angle.value;document.getElementById('uAngleVal').textContent=ua.value+'°';}
  }
}

/* ---------- mode ---------- */
function setMode(m){mode=m;
  ROOT.querySelectorAll('#modeSeg button').forEach(b=>b.classList.toggle('gt-on',b.dataset.mode===m));
  if(m!=='select')selection.clear();
  if(m!=='type'){cursor=null;selInst=null;}
  render();buildTools();}

/* ---------- interaction ---------- */
function cellFromEvent(e){
  if(reliefOn) return (typeof GL!=='undefined')?GL.cellFromClient(e.clientX,e.clientY):null;
  const b=document.getElementById('board').getBoundingClientRect();
  const c=Math.floor((e.clientX-b.left)/b.width*COLS), r=Math.floor((e.clientY-b.top)/b.height*ROWS);
  if(c<0||c>=COLS||r<0||r>=ROWS)return null; return {r,c};}
function cellLocal(e){const b=document.getElementById('board').getBoundingClientRect();
  const gx=(e.clientX-b.left)/b.width*COLS, gy=(e.clientY-b.top)/b.height*ROWS;const c=Math.floor(gx),r=Math.floor(gy);
  if(c<0||c>=COLS||r<0||r>=ROWS)return null; return {r,c,fx:gx-c,fy:gy-r};}
function whichHalf(cell,fx,fy){ if(!cell.mate)return 'a';   // primary side of the split diagonal
  const v=cell.v, pside = v===0?(fx+fy<1) : v===2?(fx+fy>1) : v===1?(fy<fx) : (fy>fx);
  return pside?'a':'b'; }
// click: build up a split (triangle → +complement → rotate diagonal); other tools replace
function placeClick(pos){if(!pos)return;const cell=grid[pos.r][pos.c];
  if(tool==='triangle'){
    if(!cell)grid[pos.r][pos.c]={type:'triangle',v:0,unit:null};
    else if(cell.type==='triangle'&&!cell.mate)cell.mate={type:'triangle',v:TRI_COMP[cell.v],unit:null};
    else if(cell.type==='triangle'&&cell.mate){const nv=(cell.v%2===0)?1:0;cell.v=nv;cell.mate.v=TRI_COMP[nv];}
    else grid[pos.r][pos.c]={type:'triangle',v:0,unit:null};
  } else grid[pos.r][pos.c]={type:tool,v:0,unit:null};
  render();}
function placePaint(pos){if(!pos||grid[pos.r][pos.c])return;grid[pos.r][pos.c]={type:tool,v:0,unit:null};render();}   // drag fills empty cells only
function del(pos,e){if(!pos)return;const cell=grid[pos.r][pos.c];if(!cell)return;
  if(cell.mate&&e){const loc=cellLocal(e), half=loc?whichHalf(cell,loc.fx,loc.fy):'a';
    if(half==='b')delete cell.mate; else {grid[pos.r][pos.c]=cell.mate;delete grid[pos.r][pos.c].mate;}}
  else grid[pos.r][pos.c]=null;
  render();}
let selBase=null;   // selection snapshot at drag start (for additive box drags)
function instanceAt(pos){for(let i=instances.length-1;i>=0;i--){const inst=instances[i],cr=creations[inst.name];if(!cr)continue;
  if(pos.r>=inst.r&&pos.r<inst.r+cr.h&&pos.c>=inst.c&&pos.c<inst.c+cr.w)return inst;}return null;}

const board=ROOT.querySelector('.gt-canvas-wrap');   // listen on the wrap so both the 2D board and the GL canvas feed clicks
board.addEventListener('mousedown',e=>{if(carveOn)return;e.preventDefault();const pos=cellFromEvent(e);if(!pos)return;
  if(e.button===2){                                   // right-click delete
    if(mode==='type'){const inst=instanceAt(pos);if(inst){pushHistory();instances=instances.filter(i=>i!==inst);render();}return;}
    pushHistory();deleting=true;del(pos,e);return;}
  if(mode==='type'){
    const inst=instanceAt(pos);
    if(inst){const cr=creations[inst.name];                       // click a letter: cursor to its right edge + select; drag on move
      dragInst=inst;dragOff={dr:pos.r-inst.r,dc:pos.c-inst.c};dragMoved=false;selInst=inst.id;
      cursor={r:inst.r,c:inst.c+cr.w,margin:inst.c,lineH:cr.h};render();return;}
    cursor={r:pos.r,c:pos.c,margin:pos.c,lineH:0};typedSession=[];selInst=null;render();return;}
  if(mode==='select'){selecting=true;selStart=pos;selMoved=false;
    const loc=cellLocal(e), hit=loc?hitPrim(pos.r,pos.c,loc.fx,loc.fy):null;
    if(e.shiftKey){ if(hit){selection.has(hit)?selection.delete(hit):selection.add(hit);} selBase=new Set(selection); }
    else { selection=new Set(hit?[hit]:[]); selBase=new Set(); }
    render();return;}
  pushHistory();painting=true;placeClick(pos);});
board.addEventListener('mousemove',e=>{if(carveOn)return;const pos=cellFromEvent(e);hoverCell=pos;if(!pos)return;
  if(deleting)del(pos);
  else if(painting)placePaint(pos);
  else if(selecting){ if(pos.r!==selStart.r||pos.c!==selStart.c)selMoved=true;
    if(selMoved){ selection=new Set(selBase); boxPrims(selStart,pos).forEach(k=>selection.add(k)); render(); } }
  else if(dragInst){const nr=pos.r-dragOff.dr,nc=pos.c-dragOff.dc;
    if(nr!==dragInst.r||nc!==dragInst.c){if(!dragMoved){pushHistory();dragMoved=true;}dragInst.r=nr;dragInst.c=nc;render();}}});
board.addEventListener('mouseleave',()=>{hoverCell=null;});
board.addEventListener('dblclick',e=>{const pos=cellFromEvent(e);if(!pos)return;const inst=instanceAt(pos);if(inst)startEdit(inst.name);});
window.addEventListener('mouseup',()=>{painting=false;selecting=false;deleting=false;dragInst=null;});
board.addEventListener('contextmenu',e=>e.preventDefault());

function rotateHover(){if(!hoverCell)return;const cell=grid[hoverCell.r]&&grid[hoverCell.r][hoverCell.c];if(!cell)return;
  pushHistory();
  if(cell.mate){const nv=(cell.v%2===0)?1:0;cell.v=nv;cell.mate.v=TRI_COMP[nv];}   // rotate the split's diagonal
  else cell.v=(cell.v+1)%VARIANTS[cell.type];
  render();}

/* ---------- merge / release / sides ---------- */
function merge(){const prims=selPrims().map(s=>s.prim);
  if(!prims.length)return;pushHistory();const id=nextUnit++;prims.forEach(p=>p.unit=id);
  unitMeta[id]={open:{t:false,r:false,b:false,l:false}};render();}
function release(){const prims=selPrims().map(s=>s.prim).filter(p=>p.unit);
  if(!prims.length)return;pushHistory();prims.forEach(p=>p.unit=null);pruneMeta();render();}
mergeBtn.onclick=merge; releaseBtn.onclick=release;
function targetUnits(){const ids=new Set();for(const s of selPrims())if(s.prim.unit)ids.add(s.prim.unit);return[...ids];}
ROOT.querySelectorAll('.gt-sidebtn').forEach(b=>b.onclick=()=>{const ids=targetUnits();if(!ids.length)return;pushHistory();
  const side=b.dataset.side,anyClosed=ids.some(id=>!unitMeta[id].open[side]);
  ids.forEach(id=>unitMeta[id].open[side]=anyClosed);render();});
// per-unit custom gradient
document.getElementById('uCustomGrad').addEventListener('change',e=>{const ids=targetUnits();if(!ids.length)return;pushHistory();
  ids.forEach(id=>{if(!unitMeta[id])unitMeta[id]={open:{t:false,r:false,b:false,l:false}};
    if(e.target.checked)unitMeta[id].grad={angle:+angle.value};   // only angle is independent; starts at the global angle
    else delete unitMeta[id].grad;});
  render();});
document.getElementById('uAngle').addEventListener('input',()=>{
  const ids=targetUnits();if(!ids.length)return;
  document.getElementById('uAngleVal').textContent=document.getElementById('uAngle').value+'°';
  const ang=+document.getElementById('uAngle').value;
  ids.forEach(uid=>{if(unitMeta[uid]&&unitMeta[uid].grad)unitMeta[uid].grad={angle:ang};});
  render();});

/* ---------- creations ---------- */
function saveCreation(name){if(!name)return;
  // region = selected primitives (keeps padding) or, if none, every filled cell (tight bbox)
  const useSel=selection.size>0, sel=useSel?new Set(selection):null;
  let region=[];
  if(useSel){for(const s of selPrims())region.push([s.r,s.c]);}
  else for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(grid[r][c])region.push([r,c]);
  if(!region.length)return;
  const minR=Math.min(...region.map(a=>a[0])),maxR=Math.max(...region.map(a=>a[0])),minC=Math.min(...region.map(a=>a[1])),maxC=Math.max(...region.map(a=>a[1]));
  const cells=[],units={},idMap={};let nl=1;
  for(let r=minR;r<=maxR;r++)for(let c=minC;c<=maxC;c++){
    const cell=grid[r][c];if(!cell)continue;
    for(const h of cellHalves(cell)){if(useSel&&!sel.has(`${r},${c},${h.half}`))continue; const prim=h.prim; let lu=null;
      if(prim.unit){if(!(prim.unit in idMap)){idMap[prim.unit]=nl++;const sm=unitMeta[prim.unit]||{};units[idMap[prim.unit]]={open:{...(sm.open||{})}};if(sm.grad)units[idMap[prim.unit]].grad={...sm.grad};}lu=idMap[prim.unit];}
      cells.push({r:r-minR,c:c-minC,type:prim.type,v:prim.v,unit:lu});}}
  if(!cells.length)return;
  creations[name]={name,w:maxC-minC+1,h:maxR-minR+1,cells,units};persist();renderLib();}

/* ---------- edit an existing (locked) letter ---------- */
function startEdit(name){const cr=creations[name];if(!cr)return;
  if(!confirm(`“${name}” is a locked letter. Load it onto the canvas to edit?\nYour current canvas is restored when you finish.`))return;
  editReturn=snapshot();editHistLen=history.length;
  blankGrid();unitMeta={};instances=[];fieldInst=[];cursor=null;selection.clear();
  const idMap={};
  for(const cell of cr.cells){let unit=null;
    if(cell.unit!=null){if(!(cell.unit in idMap)){const id=nextUnit++;idMap[cell.unit]=id;const cu=cr.units[cell.unit]||{};unitMeta[id]={open:{...(cu.open||{t:false,r:false,b:false,l:false})}};if(cu.grad)unitMeta[id].grad={...cu.grad};}unit=idMap[cell.unit];}
    if(grid[cell.r]&&cell.c<COLS){const prim={type:cell.type,v:cell.v,unit};const ex=grid[cell.r][cell.c];
      if(ex&&ex.type==='triangle'&&prim.type==='triangle'&&!ex.mate)ex.mate=prim; else grid[cell.r][cell.c]=prim;}}
  editing=name;setMode('place');updateEditBar();render();}
function finishEdit(){if(editReturn)restore(editReturn);editing=null;editReturn=null;history.length=editHistLen;future=[];selection.clear();updateEditBar();render();}
function saveEdit(){if(!editing)return;selection.clear();saveCreation(editing);finishEdit();}
function cancelEdit(){if(!editing)return;finishEdit();}
function updateEditBar(){const bar=document.getElementById('editBar');
  if(editing){bar.style.display='block';document.getElementById('editName').textContent=editing;}else bar.style.display='none';}
document.getElementById('editSaveBtn').onclick=saveEdit;
document.getElementById('editCancelBtn').onclick=cancelEdit;
function delCreation(name){delete creations[name];persist();renderLib();}
function findCr(ch){for(const key of [ch,ch.toUpperCase(),ch.toLowerCase()])if(creations[key])return{cr:creations[key],name:key};return null;}
function creationSVG(cr,s,uid){const sp=(+spread.value)*(s/CW);
  const filt=shadowFilter('igp'+uid,sp);const {defs,ink}=inkFor(cr.cells,cr.units,s,s,'p'+uid,'igp'+uid,sp);
  return `<svg viewBox="0 0 ${cr.w*s} ${cr.h*s}" preserveAspectRatio="xMidYMid meet"><defs>${filt}${defs}</defs>${ink}</svg>`;}
function renderLib(){const names=Object.keys(creations);
  lib.innerHTML=names.map((n,i)=>`<div class="gt-chip" data-nm="${n}" title="click to place">${creationSVG(creations[n],14,i)}<div class="gt-nm">${n}</div><div class="gt-e" data-edit="${n}" title="edit">✎</div><div class="gt-x" data-del="${n}" title="delete">×</div></div>`).join('');
  lib.querySelectorAll('.gt-chip').forEach(ch=>ch.onclick=e=>{
    if(e.target.dataset.del!=null){delCreation(e.target.dataset.del);return;}
    if(e.target.dataset.edit!=null){startEdit(e.target.dataset.edit);return;}
    pushHistory();const at=cursor?{r:cursor.r,c:cursor.c}:{r:0,c:0};
    instances.push({id:instSeq++,name:ch.dataset.nm,r:at.r,c:at.c});render();});}

/* ---------- typing (cursor) ---------- */
function handleTypeKey(e){
  if(e.key==='Escape'){setMode('place');return;}
  if(e.key==='Backspace'){e.preventDefault();typeBackspace();return;}
  if(e.key==='Delete'){e.preventDefault();deleteSelected();return;}
  if(!cursor)return;
  if(e.key==='Enter'){cursor.c=cursor.margin;cursor.r+=(cursor.lineH||typeLineH())+leadN();cursor.lineH=0;render();return;}
  if(e.key===' '){e.preventDefault();cursor.c+=spaceN();render();return;}
  if(e.key.length===1){const m=findCr(e.key);if(m){pushHistory();stampAtCursor(m.cr,m.name);}}  // unsaved char: ignored, takes no space
}
function stampAtCursor(cr,name){
  if(cursor.c+cr.w>COLS){cursor.c=cursor.margin;cursor.r+=(cursor.lineH||cr.h)+leadN();cursor.lineH=0;}
  const inst={id:instSeq++,name,r:cursor.r,c:cursor.c};instances.push(inst);typedSession.push(inst.id);
  cursor.c+=cr.w+trackN();cursor.lineH=Math.max(cursor.lineH||0,cr.h);render();}
// the placed letter immediately left of the cursor on its line
function instanceBeforeCursor(){if(!cursor)return null;let best=null;
  for(const inst of instances){const cr=creations[inst.name];if(!cr)continue;
    if(inst.r<=cursor.r&&cursor.r<inst.r+cr.h&&inst.c<cursor.c){if(!best||inst.c>best.c)best=inst;}}
  return best;}
function typeBackspace(){const inst=instanceBeforeCursor();if(!inst)return;
  pushHistory();instances=instances.filter(i=>i!==inst);if(cursor)cursor.c=inst.c;selInst=null;render();}
function deleteSelected(){if(selInst==null)return;pushHistory();instances=instances.filter(i=>i.id!==selInst);selInst=null;render();}

/* ---------- typing (live field) ---------- */
function fieldType(){
  instances=instances.filter(i=>!fieldInst.includes(i.id));fieldInst=[];
  const str=document.getElementById('typeIn').value;
  if(str){const org=cursor?{r:cursor.r,c:cursor.c,m:cursor.c}:{r:0,c:0,m:0};
    let C=org.c,R=org.r,lineH=0;
    for(const ch of str){
      if(ch===' '){C+=spaceN();continue;}
      const m=findCr(ch);if(!m)continue;                    // unsaved char: takes no space
      if(C+m.cr.w>COLS){C=org.m;R+=(lineH||m.cr.h)+leadN();lineH=0;}
      const inst={id:instSeq++,name:m.name,r:R,c:C};instances.push(inst);fieldInst.push(inst.id);
      C+=m.cr.w+trackN();lineH=Math.max(lineH,m.cr.h);}}
  render();}

/* ---------- file / persistence ---------- */
function projectData(){return {version:2,cols:COLS,rows:ROWS,color:color.value,bg:bg.value,angle:+angle.value,spread:+spread.value,grid,unitMeta,instances,instSeq,creations,typeText:document.getElementById('typeIn').value,fieldInst};}
function applyProject(p){
  COLS=p.cols||COLS;ROWS=p.rows||ROWS;document.getElementById('cols').value=COLS;document.getElementById('rows').value=ROWS;
  if(p.color)color.value=p.color; if(p.bg)bg.value=p.bg;
  if(p.angle!=null){angle.value=p.angle;angleVal.textContent=p.angle+'°';}
  if(p.spread!=null){spread.value=p.spread;spreadVal.textContent=p.spread;}
  grid=p.grid||grid;unitMeta=p.unitMeta||{};instances=p.instances||[];instSeq=p.instSeq||1;creations=p.creations||creations;
  // normalise grid to ROWS x COLS so stale saves can't crash
  const g=Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>(grid[r]&&grid[r][c])||null)); grid=g;
  fieldInst=p.fieldInst||[];document.getElementById('typeIn').value=p.typeText||'';   // restore field so it matches the tiles
  syncNextUnit();selection.clear();renderLib();render();}
let saveT=null;
function persist(){if(editing)return;clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('gt_project',JSON.stringify(projectData()));}catch(e){}},300);}
function loadLocal(){try{const s=localStorage.getItem('gt_project');if(s){applyProject(JSON.parse(s));return true;}}catch(e){}return false;}

/* ---------- keys ---------- */
window.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&(e.key==='z'||e.key==='Z')){e.preventDefault();e.shiftKey?redo():undo();return;}
  if((e.metaKey||e.ctrlKey)&&(e.key==='y'||e.key==='Y')){e.preventDefault();redo();return;}
  if(e.target.tagName==='INPUT')return;
  if(mode==='type'){handleTypeKey(e);return;}
  if(e.key==='v'||e.key==='V')setMode('place');
  else if(e.key==='s'||e.key==='S')setMode('select');
  else if(e.key==='t'||e.key==='T')setMode('type');
  else if(e.key==='a'||e.key==='A')cyclePrimitive(-1);
  else if(e.key==='d'||e.key==='D')cyclePrimitive(1);
  else if(e.key==='r'||e.key==='R')rotateHover();
  else if(e.key==='m'||e.key==='M')merge();
  else if(e.key==='u'||e.key==='U')release();
  else if(e.key==='Escape'){selection.clear();render();}
  else if(e.key>='1'&&e.key<='4'){tool=TOOLS[+e.key-1];setMode('place');buildTools();}
});

/* ---------- controls ---------- */
ROOT.querySelectorAll('#modeSeg button').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
undoBtn.onclick=undo;
const glOn=()=>reliefOn&&typeof GL!=='undefined';
const cglLight=()=>{if(typeof CGL!=='undefined'&&CGL.ok())CGL.setLight(+angle.value,+document.getElementById('elev').value);};
angle.addEventListener('input',()=>{angleVal.textContent=angle.value+'°'; if(carveOn)cglLight(); else if(glOn())GL.setSun(); else render();});
document.getElementById('elev').addEventListener('input',()=>{document.getElementById('elevVal').textContent=document.getElementById('elev').value; if(carveOn)cglLight(); else if(glOn())GL.setSun(); else render();});
color.addEventListener('input',()=>{ if(carveOn)return; glOn()?GL.setColor():render();});
spread.addEventListener('input',()=>{spreadVal.textContent=spread.value; render();});           // relief: rebuilds (bevel depth)
bg.addEventListener('input',()=>{ if(!reliefOn)render();});
document.getElementById('animBtn').onclick=toggleAnim;
document.getElementById('animSpeed').addEventListener('input',e=>document.getElementById('animSpeedVal').textContent=e.target.value);
document.getElementById('reliefBtn').onclick=e=>toggleCarve(e.target);
function doResize(){const nc=Math.max(2,Math.min(40,+cols.value||COLS)),nr=Math.max(2,Math.min(24,+rows.value||ROWS));
  const old=grid;COLS=nc;ROWS=nr;blankGrid();
  for(let r=0;r<nr;r++){const src=old[r];if(!src)continue;for(let c=0;c<nc;c++)if(src[c])grid[r][c]=src[c];}
  pruneMeta();render();}
cols.oninput=doResize; rows.oninput=doResize;
document.getElementById('aspect').addEventListener('input',e=>{
  const a=+e.target.value; CW=100*a; CH=100; document.getElementById('aspectVal').textContent=a.toFixed(2); render();});
gridToggle.onclick=e=>{showGrid=!showGrid;e.target.textContent='Grid: '+(showGrid?'on':'off');if(carveOn)drawCarveAll();else render();};   // in carve mode Grid toggles the tile seams through the composition
clearBtn.onclick=()=>{pushHistory();blankGrid();unitMeta={};instances=[];fieldInst=[];cursor=null;selection.clear();render();};
exportBtn.onclick=()=>{exporting=true;render();
  const blob=new Blob([document.getElementById('board').outerHTML],{type:'image/svg+xml'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='gradient-type.svg';a.click();
  exporting=false;render();};

const crName=document.getElementById('crName');
document.getElementById('saveCrBtn').onclick=()=>{const n=crName.value.trim();if(n){saveCreation(n);crName.value='';updateUnitUI();}};
crName.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('saveCrBtn').click();});

const typeIn=document.getElementById('typeIn');
typeIn.addEventListener('input',fieldType);
['track','lead','space'].forEach(id=>document.getElementById(id).addEventListener('input',fieldType));
document.getElementById('typeBtn').onclick=()=>{if(fieldInst.length){pushHistory();fieldInst=[];typeIn.value='';render();}};

document.getElementById('saveFileBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify(projectData())],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='gradient-type.save.json';a.click();};
document.getElementById('loadFileBtn').onclick=()=>document.getElementById('fileIn').click();
document.getElementById('fileIn').onchange=e=>{const f=e.target.files[0];if(!f)return;
  const rd=new FileReader();rd.onload=()=>{try{applyProject(JSON.parse(rd.result));history=[];future=[];}catch(err){alert('Could not read save file');}};
  rd.readAsText(f);e.target.value='';};

/* ============================================================================
   CARVE — shape-from-shading engine. Reads the live composition's inner-light
   gradient, integrates a height field (proven rule), previews it in 3D and
   exports a manufacturable mesh. Light fixed at az=270, el=35.
   ============================================================================ */
const CEL=Math.cos(35*Math.PI/180), SEL=Math.sin(35*Math.PI/180);   // fixed sun elevation
const CLIGHT=[0,-CEL,SEL];                                            // az=270 => (0,-cos el, sin el)
let CARVE=null;                                                       // {B,inside,Nx,Ny,AR}
let cYaw=0.6, cTilt=0.95, cDrag=null, colorMapOn=false;
function clamp01(v){return v<0?0:v>1?1:v;}
function shadeC(hx,hy){const nl=(-hx*CLIGHT[0]-hy*CLIGHT[1]+CLIGHT[2])/Math.sqrt(1+hx*hx+hy*hy);return nl<0?0:nl;}
function slopeForC(R){R=clamp01(R);if(R>0.999)R=0.999;let lo=-Math.tan(35*Math.PI/180),hi=CEL/SEL;
  for(let it=0;it<44;it++){const m=(lo+hi)/2,f=(m*CEL+SEL)/Math.sqrt(1+m*m);if(f<R)lo=m;else hi=m;}return (lo+hi)/2;}
function gradC(a,inside,i,j,Nx,Ny,dx,dy){
  const jm=inside[i*Nx+Math.max(0,j-1)]?Math.max(0,j-1):j, jp=inside[i*Nx+Math.min(Nx-1,j+1)]?Math.min(Nx-1,j+1):j;
  const im=inside[Math.max(0,i-1)*Nx+j]?Math.max(0,i-1):i, ip=inside[Math.min(Ny-1,i+1)*Nx+j]?Math.min(Ny-1,i+1):i;
  return [jp!==jm?(a[i*Nx+jp]-a[i*Nx+jm])/((jp-jm)*dx):0, ip!==im?(a[ip*Nx+j]-a[im*Nx+j])/((ip-im)*dy):0];
}
/* --- brightness curve (identity by default => raw) --- */
let cPts=[{x:0,y:0},{x:1,y:1}], cM=[], cLUT=new Float32Array(257);
function rebuildC(){cPts.sort((a,b)=>a.x-b.x);const n=cPts.length,sl=[],m=new Array(n);
  for(let i=0;i<n-1;i++){const dx=cPts[i+1].x-cPts[i].x;sl[i]=(cPts[i+1].y-cPts[i].y)/(dx||1e-6);}
  m[0]=sl[0];m[n-1]=sl[n-2];for(let i=1;i<n-1;i++)m[i]=(sl[i-1]*sl[i]<=0)?0:(sl[i-1]+sl[i])/2;
  for(let i=0;i<n-1;i++){if(sl[i]===0){m[i]=0;m[i+1]=0;continue;}const a=m[i]/sl[i],b=m[i+1]/sl[i],h=Math.hypot(a,b);if(h>3){const t=3/h;m[i]=t*a*sl[i];m[i+1]=t*b*sl[i];}}
  cM=m;for(let s=0;s<=256;s++)cLUT[s]=evalC(s/256);}
function evalC(x){const p=cPts;if(x<=p[0].x)return clamp01(p[0].y);if(x>=p[p.length-1].x)return clamp01(p[p.length-1].y);
  let i=0;while(i<p.length-1&&x>p[i+1].x)i++;const h=p[i+1].x-p[i].x,t=(x-p[i].x)/(h||1e-6),t2=t*t,t3=t2*t;
  return clamp01((2*t3-3*t2+1)*p[i].y+(t3-2*t2+t)*h*cM[i]+(-2*t3+3*t2)*p[i+1].y+(t3-t2)*h*cM[i+1]);}
function drawCurveC(){const cv=document.getElementById('cCurveC');const W=cv.width,H=cv.height,pad=W*0.08,sz=W-2*pad,g=cv.getContext('2d');
  const X=x=>pad+x*sz,Y=y=>pad+(1-y)*sz;g.clearRect(0,0,W,H);
  g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=1;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(X(i/4),Y(0));g.lineTo(X(i/4),Y(1));g.moveTo(X(0),Y(i/4));g.lineTo(X(1),Y(i/4));g.stroke();}
  g.strokeStyle='rgba(255,255,255,.16)';g.setLineDash([3,3]);g.beginPath();g.moveTo(X(0),Y(0));g.lineTo(X(1),Y(1));g.stroke();g.setLineDash([]);
  g.strokeStyle='#c187f5';g.lineWidth=2;g.beginPath();for(let s=0;s<=100;s++){const x=s/100,y=evalC(x);s?g.lineTo(X(x),Y(y)):g.moveTo(X(x),Y(y));}g.stroke();
  for(const p of cPts){g.fillStyle='#d6a6ff';g.strokeStyle='#150a1e';g.lineWidth=1.5;g.beginPath();g.arc(X(p.x),Y(p.y),5,0,7);g.fill();g.stroke();}}

/* --- rasterize the live composition to {B,inside} --- */
function svgInk(withBg){const W=COLS*CW,H=ROWS*CH;let defs=shadowFilter('cig',+spread.value);
  const gcells=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const cell=grid[r]&&grid[r][c];for(const h of cellHalves(cell))gcells.push({r,c,type:h.prim.type,v:h.prim.v,unit:h.prim.unit});}
  const gi=inkFor(gcells,unitMeta,CW,CH,'cg','cig',+spread.value);defs+=gi.defs;let ink=gi.ink;
  for(const inst of instances){const cr=creations[inst.name];if(!cr)continue;
    const cells=cr.cells.map(x=>({r:x.r+inst.r,c:x.c+inst.c,type:x.type,v:x.v,unit:x.unit}));
    const ii=inkFor(cells,cr.units,CW,CH,'ci'+inst.id,'cig',+spread.value);defs+=ii.defs;ink+=ii.ink;}
  const bgr=withBg?`<rect width="${W}" height="${H}" fill="${bg.value}"/>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${bgr}<g>${ink}</g></svg>`;}
function svgMask(){const W=COLS*CW,H=ROWS*CH;let paths='';
  const add=(r,c,t,v)=>{paths+=`<path d="${shapeD(t,v,c*CW,r*CH,CW,CH)}" fill="#fff"/>`;};
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const cell=grid[r]&&grid[r][c];for(const h of cellHalves(cell))add(r,c,h.prim.type,h.prim.v);}
  for(const inst of instances){const cr=creations[inst.name];if(!cr)continue;for(const x of cr.cells)add(x.r+inst.r,x.c+inst.c,x.type,x.v);}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${paths}</svg>`;}
// mask where each PIECE (a merged unit / loose primitive / placed letter) gets a distinct id encoded in the red channel
function svgPieces(){const W=COLS*CW,H=ROWS*CH;
  const pieceOf=new Map(), idx=key=>{if(!pieceOf.has(key))pieceOf.set(key,pieceOf.size);return pieceOf.get(key);};
  const items=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const cell=grid[r]&&grid[r][c];for(const h of cellHalves(cell)){const p=h.prim;const key=p.unit!=null?('gu'+p.unit):('gl'+r+'_'+c+'_'+h.half);items.push([shapeD(p.type,p.v,c*CW,r*CH,CW,CH),idx(key)]);}}
  for(const inst of instances){const cr=creations[inst.name];if(!cr)continue;const pi=idx('i'+inst.id);for(const x of cr.cells)items.push([shapeD(x.type,x.v,(x.c+inst.c)*CW,(x.r+inst.r)*CH,CW,CH),pi]);}
  const n=pieceOf.size||1;
  const paths=items.map(it=>`<path d="${it[0]}" fill="rgb(${Math.round((it[1]+1)/(n+1)*255)},0,0)"/>`).join('');
  return {svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${paths}</svg>`, n};}
function rasterize(svg,Nx,Ny){return new Promise(res=>{const img=new Image();
  img.onload=()=>{const cv=document.createElement('canvas');cv.width=Nx;cv.height=Ny;const x=cv.getContext('2d');x.clearRect(0,0,Nx,Ny);x.drawImage(img,0,0,Nx,Ny);res(x.getImageData(0,0,Nx,Ny).data);};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});}
async function computeCarve(){
  const TR=Math.max(6,Math.min(40,+document.getElementById('cDetail').value||24));
  const SS=2;                                              // supersample -> antialiased (geometric-looking) edges
  const sx=COLS*TR*SS, sy=ROWS*TR*SS;
  const PC=svgPieces(), n=PC.n;
  const [gd,md]=await Promise.all([rasterize(svgInk(true),sx,sy),rasterize(PC.svg,sx,sy)]);
  const pin=new Uint8Array(sx*sy),B=new Float32Array(sx*sy),piece=new Int16Array(sx*sy).fill(-1);let lo=1e9,hi=-1e9;
  for(let k=0;k<sx*sy;k++){if(md[k*4+3]>110){pin[k]=1;piece[k]=Math.min(n-1,Math.max(0,Math.round(md[k*4]*(n+1)/255)-1));const lum=(0.2126*gd[k*4]+0.7152*gd[k*4+1]+0.0722*gd[k*4+2])/255;B[k]=lum;if(lum<lo)lo=lum;if(lum>hi)hi=lum;}}
  for(let k=0;k<sx*sy;k++)if(pin[k])B[k]=(B[k]-lo)/((hi-lo)||1);
  CARVE={sx,sy,B,pin,piece,TR,SS,cellAR:CW/CH};
  drawCarveAll();
}
/* --- curve → SfS rule → centre → re-lit proof → build full tile wall → 3D --- */
function drawCarveAll(fast){
  if(!CARVE)return;const {sx,sy,B,pin,piece,TR,SS,cellAR}=CARVE;
  const PAD=Math.max(0,Math.min(8,+document.getElementById('cPad').value||0));
  // --- rule at supersampled resolution ---
  const Bc=new Float32Array(sx*sy);for(let k=0;k<sx*sy;k++)Bc[k]=pin[k]?cLUT[Math.max(0,Math.min(256,Math.round(B[k]*256)))]:0;
  const sdy=1/(TR*SS);                                     // sample spacing (one cell height = 1)
  const Rc=new Float32Array(sx*sy), T=new Float32Array(sx*sy);
  for(let k=0;k<sx*sy;k++)if(pin[k])T[k]=slopeForC(Bc[k])*sdy;      // target vertical step per pixel (precomputed once)
  // column-integration initial guess — restart at every piece change so each piece gets its own datum
  for(let j=0;j<sx;j++){let cur=0,cp=-2;for(let i=0;i<sy;i++){const k=i*sx+j;if(!pin[k]){cp=-2;continue;}
    if(piece[k]!==cp){cp=piece[k];cur=0;Rc[k]=0;}else{cur+=T[k];Rc[k]=cur;}}}
  // 2D Poisson relaxation (SOR): dR/dy = the rule's slope, dR/dx = 0 (light is x-blind). Only relaxes WITHIN a piece,
  // so a merged shape is one continuous surface but separate letters/pieces stay apart. Skipped while dragging.
  const ITERS=fast?0:55, WW=1.7;
  for(let it=0;it<ITERS;it++)for(let i=0;i<sy;i++)for(let j=0;j<sx;j++){const k=i*sx+j;if(!pin[k])continue;const pk=piece[k];
    let s2=0,n=0;const up=k-sx,dn=k+sx;
    if(i>0&&pin[up]&&piece[up]===pk){s2+=Rc[up]+T[up];n++;} if(i<sy-1&&pin[dn]&&piece[dn]===pk){s2+=Rc[dn]-T[k];n++;}
    if(j>0&&pin[k-1]&&piece[k-1]===pk){s2+=Rc[k-1];n++;} if(j<sx-1&&pin[k+1]&&piece[k+1]===pk){s2+=Rc[k+1];n++;}
    if(n)Rc[k]+=WW*(s2/n-Rc[k]);
  }
  let sum=0,cnt=0;for(let k=0;k<sx*sy;k++)if(pin[k]){sum+=Rc[k];cnt++;}
  const mean=cnt?sum/cnt:0;for(let k=0;k<sx*sy;k++)if(pin[k])Rc[k]-=mean;    // centre on wall plane (0)
  // --- downsample SS->tile grid: averaging antialiases the primitive edges ---
  const dnx=COLS*TR, dny=ROWS*TR, Rd=new Float32Array(dnx*dny), Bd=new Float32Array(dnx*dny), dpin=new Uint8Array(dnx*dny);
  for(let i=0;i<dny;i++)for(let j=0;j<dnx;j++){let sr=0,sb=0,c=0;
    for(let a=0;a<SS;a++)for(let b=0;b<SS;b++){const k=(i*SS+a)*sx+(j*SS+b);sr+=Rc[k];if(pin[k]){sb+=B[k];c++;}}
    const kk=i*dnx+j;Rd[kk]=sr/(SS*SS);Bd[kk]=c?sb/c:0;dpin[kk]=2*c>=SS*SS?1:0;}
  // --- re-lit fidelity at tile-grid resolution ---
  const ddx=cellAR/TR, ddy=1/TR, reB=new Float32Array(dnx*dny);let s=0,n=0;
  for(let i=0;i<dny;i++)for(let j=0;j<dnx;j++){const k=i*dnx+j;if(!dpin[k])continue;const gr=gradC(Rd,dpin,i,j,dnx,dny,ddx,ddy);reB[k]=shadeC(gr[0],gr[1]);const t=cLUT[Math.max(0,Math.min(256,Math.round(Bd[k]*256)))];s+=(reB[k]-t)**2;n++;}
  const delta=Math.sqrt(s/(n||1));
  paintThumb('cGradT',Bd,dpin,dnx,dny);paintThumb('cRelitT',reB,dpin,dnx,dny);drawCurveC();
  document.getElementById('cDelta').textContent='Δ '+delta.toFixed(3);
  const v=document.getElementById('cVerdict'),ok=delta<0.06;v.textContent=ok?'faithful':'drifts';v.className='gt-cverdict '+(ok?'gt-cv-ok':'gt-cv-bad');
  // --- build tile wall: low-res while dragging, FULL sampled resolution on release ---
  const edge=+document.getElementById('cEdge').value;
  if(fast) CARVE.wall=buildWall(Rd, dnx, dny, TR, PAD, cellAR, edge);          // quick preview
  else     CARVE.wall=buildWall(Rc, sx, sy, TR*SS, PAD, cellAR, edge*SS);      // mesh at the resolution we sampled the vector
  draw3dCarve();
}
/* place a relief array into a full tile wall (margin of plain tiles + grout), bevel the rim walls.
   grout: the surrounding margin is always tiled; seams cut THROUGH the composition only when Grid is on. */
function buildWall(R, rNx, rNy, tilePx, PAD, cellAR, edge){
  const Wx=(COLS+2*PAD)*tilePx, Wy=(ROWS+2*PAD)*tilePx, ox=PAD*tilePx, oy=PAD*tilePx;
  const Hgt=new Float32Array(Wx*Wy), inside=new Uint8Array(Wx*Wy).fill(1);
  for(let i=0;i<rNy;i++)for(let j=0;j<rNx;j++)Hgt[(oy+i)*Wx+(ox+j)]=R[i*rNx+j];
  bevelEdges(Hgt,Wx,Wy,edge);                                                     // round steep walls only
  const gw=Math.max(1,Math.round(tilePx*0.03)), GD=0.045, gridOn=showGrid;        // thin grout seam (after bevel)
  for(let i=0;i<Wy;i++)for(let j=0;j<Wx;j++){const mj=j%tilePx,mi=i%tilePx;if(mj>=gw&&mi>=gw)continue;
    const inComp=(i>=oy&&i<oy+rNy&&j>=ox&&j<ox+rNx);
    if(!inComp||gridOn)Hgt[i*Wx+j]-=GD;                                            // margin always; composition only when Grid on
  }
  return {Hgt,inside,Wx,Wy,PR:ROWS+2*PAD,AR:((COLS+2*PAD)*cellAR)/(ROWS+2*PAD)};
}
/* separable 3-tap smoothing (used on a scratch copy) */
function blurField(H,Wx,Wy,passes){
  if(!passes)return; const T=new Float32Array(Wx*Wy);
  for(let p=0;p<passes;p++){
    for(let i=0;i<Wy;i++)for(let j=0;j<Wx;j++){const jm=j>0?j-1:j,jp=j<Wx-1?j+1:j;T[i*Wx+j]=0.25*H[i*Wx+jm]+0.5*H[i*Wx+j]+0.25*H[i*Wx+jp];}
    for(let i=0;i<Wy;i++)for(let j=0;j<Wx;j++){const im=i>0?i-1:i,ip=i<Wy-1?i+1:i;H[i*Wx+j]=0.25*T[im*Wx+j]+0.5*T[i*Wx+j]+0.25*T[ip*Wx+j];}
  }
}
/* slope-aware bevel: blend toward the blurred field only where the surface is STEEP
   (perimeter walls facing X/Y); shallow top faces (facing Z) keep their crisp detail */
function bevelEdges(H,Wx,Wy,passes){
  if(!passes)return;
  const B=Float32Array.from(H); blurField(B,Wx,Wy,passes);
  const S=new Float32Array(Wx*Wy); let smax=1e-6;
  for(let i=0;i<Wy;i++)for(let j=0;j<Wx;j++){
    const jm=j>0?j-1:j,jp=j<Wx-1?j+1:j,im=i>0?i-1:i,ip=i<Wy-1?i+1:i;
    const s=Math.max(Math.abs(H[i*Wx+jp]-H[i*Wx+jm]),Math.abs(H[ip*Wx+j]-H[im*Wx+j]));
    S[i*Wx+j]=s; if(s>smax)smax=s;
  }
  const lo=0.22*smax, hi=0.6*smax, inv=1/((hi-lo)||1);
  for(let k=0;k<Wx*Wy;k++){let w=(S[k]-lo)*inv; w=w<0?0:w>1?1:w; w=w*w*(3-2*w); H[k]=H[k]*(1-w)+B[k]*w;}
}
function paintThumb(id,arr,inside,Nx,Ny){const cv=document.getElementById(id);cv.width=Nx;cv.height=Ny;
  const ctx=cv.getContext('2d'),im=ctx.createImageData(Nx,Ny);
  for(let k=0;k<Nx*Ny;k++){if(!inside[k]){im.data[k*4+3]=0;continue;}const val=Math.round(clamp01(arr[k])*255);im.data[k*4]=im.data[k*4+1]=im.data[k*4+2]=val;im.data[k*4+3]=255;}
  ctx.putImageData(im,0,0);}
/* --- orbit 3D (matte painter's algorithm) over the full tile wall.
   fast=true (while dragging) decimates for framerate; fast=false renders full-res. --- */
/* WebGL render: build the ceramic relief from the height field, then apply depth */
function draw3dCarve(fast){
  if(!CARVE||!CARVE.wall||!(typeof CGL!=='undefined'&&CGL.ok()))return;
  CGL.build(CARVE.wall);
  CGL.setDepth((+document.getElementById('cDepth').value)/100);
}
function sizeCarveCv(){const cv=document.getElementById('carveCv'),wrap=cv.parentElement;
  if(typeof CGL!=='undefined'&&CGL.ok())CGL.resize(wrap.clientWidth,wrap.clientHeight);}
const GEN_AZ=270, GEN_EL=35;                       // the light the carving is generated at
let savedAngle=null, savedElev=null;               // gradient-view light, restored on exit
function setCarveLight(az,el){angle.value=az;angleVal.textContent=az+'°';
  const E=document.getElementById('elev');E.value=el;document.getElementById('elevVal').textContent=el;
  if(typeof CGL!=='undefined'&&CGL.ok())CGL.setLight(az,el);}
function toggleCarve(btn){carveOn=!carveOn;btn.textContent='◭ Carve';btn.classList.toggle('gt-primary',carveOn);
  ROOT.classList.toggle('gt-carving',carveOn);
  document.getElementById('resetLightBtn').style.display=carveOn?'block':'none';
  if(carveOn){ROOT.querySelector('.gt-canvas-wrap').classList.add('gt-carve');
    if(typeof CGL!=='undefined'&&!CGL.ok())CGL.mount(document.getElementById('carveCv'));
    savedAngle=angle.value; savedElev=document.getElementById('elev').value;   // remember gradient light
    sizeCarveCv();computeCarve();
    setCarveLight(GEN_AZ,GEN_EL);}                 // display sun starts at the generating light
  else{ROOT.querySelector('.gt-canvas-wrap').classList.remove('gt-carve');
    if(colorMapOn){colorMapOn=false;const cb=document.getElementById('cColorBtn');cb.textContent='◐ Paint gradient on tiles';cb.classList.remove('gt-primary');if(typeof CGL!=='undefined'&&CGL.ok())CGL.setColorMap(null);}
    if(animOn){animOn=false;cancelAnimationFrame(animRAF);document.getElementById('animBtn').textContent='▶ Animate';document.getElementById('animBtn').classList.remove('gt-primary');}
    if(savedAngle!=null){angle.value=savedAngle;angleVal.textContent=savedAngle+'°';document.getElementById('elev').value=savedElev;document.getElementById('elevVal').textContent=savedElev;}
    render();}}

/* --- carve UI wiring --- */
(function initCarve(){
  const cc=document.getElementById('cCurveC');const dpr=Math.min(2,devicePixelRatio||1);cc.width=cc.height=Math.round(200*dpr);
  document.getElementById('cDepth').addEventListener('input',e=>{document.getElementById('cDepthV').textContent=((+e.target.value)/100).toFixed(1);if(typeof CGL!=='undefined'&&CGL.ok())CGL.setDepth((+e.target.value)/100);});
  document.getElementById('cCurveReset').onclick=()=>{cPts=[{x:0,y:0},{x:1,y:1}];rebuildC();drawCarveAll(false);};
  // curve editing
  function cxy(e){const r=cc.getBoundingClientRect();return {x:clamp01((e.clientX-r.left)/r.width),y:clamp01(1-(e.clientY-r.top)/r.height)};}
  function near(x,y,rad){let best=-1,bd=(rad||0.07)**2;for(let i=0;i<cPts.length;i++){const dx=cPts[i].x-x,dy=cPts[i].y-y,dd=dx*dx+dy*dy;if(dd<bd){bd=dd;best=i;}}return best;}
  cc.addEventListener('pointerdown',e=>{const {x,y}=cxy(e);let i=near(x,y,0.11);let p;if(i<0){p={x,y};cPts.push(p);}else p=cPts[i];cDrag={p};rebuildC();cc.setPointerCapture(e.pointerId);drawCarveAll(true);});
  cc.addEventListener('pointermove',e=>{if(!cDrag)return;const {x,y}=cxy(e),p=cDrag.p,idx=cPts.indexOf(p);
    if(idx<=0||idx>=cPts.length-1)p.y=y;else{const lo=cPts[idx-1].x+0.01,hi=cPts[idx+1].x-0.01;p.x=Math.max(lo,Math.min(hi,x));p.y=y;}rebuildC();drawCarveAll(true);});
  cc.addEventListener('pointerup',()=>{if(cDrag){cDrag=null;drawCarveAll(false);}});
  function rm(e){const {x,y}=cxy(e),i=near(x,y,0.13);if(i>0&&i<cPts.length-1){cPts.splice(i,1);rebuildC();drawCarveAll(false);}}
  cc.addEventListener('dblclick',e=>{e.preventDefault();rm(e);});
  cc.addEventListener('contextmenu',e=>{e.preventDefault();rm(e);});
  // orbit
  const cv=document.getElementById('carveCv');
  cv.addEventListener('pointerdown',e=>{cDrag=null;cv._d={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';});
  cv.addEventListener('pointermove',e=>{if(!cv._d)return;const dx=e.clientX-cv._d.x,dy=e.clientY-cv._d.y;cv._d.x=e.clientX;cv._d.y=e.clientY;if(typeof CGL!=='undefined'&&CGL.ok())CGL.orbit(dx,dy);});
  cv.addEventListener('pointerup',()=>{if(cv._d){cv._d=null;cv.style.cursor='grab';}});
  cv.addEventListener('wheel',e=>{e.preventDefault();if(typeof CGL!=='undefined'&&CGL.ok())CGL.zoom(Math.exp(e.deltaY*0.0015));},{passive:false});
  document.getElementById('resetLightBtn').onclick=()=>setCarveLight(GEN_AZ,GEN_EL);
  window.addEventListener('resize',()=>{if(carveOn){sizeCarveCv();if(typeof CGL!=='undefined'&&CGL.ok())CGL.render();}});
  document.getElementById('cDetail').addEventListener('change',()=>{if(carveOn)computeCarve();});
  document.getElementById('cPad').addEventListener('input',()=>{if(carveOn){drawCarveAll();if(colorMapOn)applyColorMap();}});
  document.getElementById('cEdge').addEventListener('input',e=>{document.getElementById('cEdgeV').textContent=e.target.value;if(carveOn)drawCarveAll();});
  document.getElementById('cAmb').addEventListener('input',e=>{document.getElementById('cAmbV').textContent=e.target.value;if(typeof CGL!=='undefined'&&CGL.ok())CGL.setAmbient(+e.target.value/100);});
  document.getElementById('cGloss').addEventListener('input',e=>{document.getElementById('cGlossV').textContent=e.target.value;if(typeof CGL!=='undefined'&&CGL.ok())CGL.setFinish(+e.target.value/100);});
  document.getElementById('cColorBtn').onclick=e=>toggleColorMap(e.target);
  // export the full tile wall mesh
  document.getElementById('cExportObj').onclick=()=>{if(!CARVE||!CARVE.wall)return;const {Hgt,Wx,Wy,AR,PR}=CARVE.wall,depth=(+document.getElementById('cDepth').value)/100;
    let v='',fc='';const dx=AR/(Wx-1),dy=1/(Wy-1);
    for(let i=0;i<Wy;i++)for(let j=0;j<Wx;j++)v+=`v ${(j*dx).toFixed(4)} ${(Hgt[i*Wx+j]*depth/PR).toFixed(4)} ${(i*dy).toFixed(4)}\n`;
    for(let i=0;i<Wy-1;i++)for(let j=0;j<Wx-1;j++){const a=i*Wx+j+1,b=i*Wx+j+2,cc2=(i+1)*Wx+j+1,dd=(i+1)*Wx+j+2;fc+=`f ${a} ${b} ${dd}\nf ${a} ${dd} ${cc2}\n`;}
    dlCarve('tile-wall.obj',v+fc);};
  document.getElementById('cExportJson').onclick=()=>{if(!CARVE||!CARVE.wall)return;const {Hgt,Wx,Wy,PR}=CARVE.wall,depth=(+document.getElementById('cDepth').value)/100;
    const h=[];for(let i=0;i<Wy;i++){const row=[];for(let j=0;j<Wx;j++)row.push(+Hgt[i*Wx+j].toFixed(4));h.push(row);}
    dlCarve('tile-wall.json',JSON.stringify({type:'tile-wall',Wx,Wy,rows:PR,depth,light:{az:270,el:35},height:h}));};
  rebuildC();
})();
function dlCarve(name,txt){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt]));a.download=name;a.click();}
/* build a wall-sized canvas: ceramic-white margin + the designed gradient over the composition */
function buildColorMap(){return new Promise(res=>{
  const PAD=Math.max(0,Math.min(8,+document.getElementById('cPad').value||0));
  const wcols=COLS+2*PAD, wrows=ROWS+2*PAD, cellAR=CW/CH, AR=(wcols*cellAR)/wrows;
  const chh=760, cw=Math.max(2,Math.round(AR*chh));
  const cnv=document.createElement('canvas');cnv.width=cw;cnv.height=chh;
  const ctx=cnv.getContext('2d');ctx.fillStyle='#eceef0';ctx.fillRect(0,0,cw,chh);   // ceramic margin
  const img=new Image();
  img.onload=()=>{const cpw=COLS*cw/wcols,cph=ROWS*chh/wrows,x0=PAD*cw/wcols,y0=PAD*chh/wrows;ctx.drawImage(img,x0,y0,cpw,cph);res(cnv);};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgInk(true));
});}
async function applyColorMap(){ if(typeof CGL==='undefined'||!CGL.ok())return;
  if(colorMapOn){ CGL.setColorMap(await buildColorMap()); } else CGL.setColorMap(null); }
function toggleColorMap(btn){colorMapOn=!colorMapOn;
  btn.textContent=colorMapOn?'◐ Gradient: on':'◐ Paint gradient on tiles';btn.classList.toggle('gt-primary',colorMapOn);
  applyColorMap();}

/* ---------- boot ---------- */
buildTools(); blankGrid(); setMode('place');
if(!loadLocal()) render();
renderLib();

})();
