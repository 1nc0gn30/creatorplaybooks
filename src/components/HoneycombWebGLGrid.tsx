import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CreatorProfile } from '../types';

interface HoneycombWebGLGridProps {
  filteredCreators: CreatorProfile[];
  openCreatorModal: (c: CreatorProfile) => void;
  modalCreatorId: string | null;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '', cy = y, lc = 0;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' ';
    if (ctx.measureText(test).width > maxW && n > 0) {
      ctx.fillText(line.trim(), x, cy);
      line = words[n] + ' ';
      cy += lh;
      lc++;
      if (lc >= 2) { ctx.fillText(words[n] + '…', x, cy); return; }
    } else { line = test; }
  }
  ctx.fillText(line.trim(), x, cy);
}

export function HoneycombWebGLGrid({ filteredCreators, openCreatorModal, modalCreatorId }: HoneycombWebGLGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const texturesRef = useRef<Record<string, THREE.CanvasTexture>>({});
  const canvasesRef = useRef<Record<string, HTMLCanvasElement>>({});
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  
  const [interacted, setInteracted] = useState(false);
  const interactedRef = useRef(false);

  const [zoomedInCreator, setZoomedInCreator] = useState<CreatorProfile | null>(null);
  const zoomedInCreatorRef = useRef<CreatorProfile | null>(null);

  const handleInteract = () => {
    interactedRef.current = true;
    setInteracted(true);
  };

  // Reset zoom state if modal closes
  useEffect(() => {
    if (modalCreatorId === null) {
      zoomedInCreatorRef.current = null;
      setZoomedInCreator(null);
    }
  }, [modalCreatorId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 700;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    const loseCtxExt = gl.getExtension('WEBGL_lose_context');
    const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050510, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
    const defaultCamPos = new THREE.Vector3(0, 0, 9.0);
    camera.position.copy(defaultCamPos);

    // ── SPACE SCENE ──────────────────────────────────────────────
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(starCount * 3);
    const sc = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      sp[i * 3] = (Math.random() - 0.5) * 80;
      sp[i * 3 + 1] = (Math.random() - 0.5) * 50;
      sp[i * 3 + 2] = -8 - Math.random() * 40;
      sc[i * 3] = 0.7 + Math.random() * 0.3;
      sc[i * 3 + 1] = 0.7 + Math.random() * 0.3;
      sc[i * 3 + 2] = 0.85 + Math.random() * 0.15;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(sc, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.07, transparent: true, opacity: 0.85, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const nebGeo = new THREE.SphereGeometry(6, 16, 16);
    const mkNeb = (col: number, op: number, p: [number, number, number], s: [number, number, number]) => {
      const m = new THREE.Mesh(nebGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.position.set(...p); m.scale.set(...s); scene.add(m); return m;
    };
    const neb1 = mkNeb(0xec4899, 0.025, [-8, 5, -18], [2.5, 1.8, 1]);
    const neb2 = mkNeb(0x8b5cf6, 0.02, [9, -4, -20], [3, 2, 1]);
    mkNeb(0x22d3ee, 0.018, [1, 1, -25], [4, 3, 1]);
    mkNeb(0x6366f1, 0.015, [-3, -5, -22], [2, 2.5, 1]);

    // ── LIGHTING ─────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(2, 4, 8); scene.add(key);
    const fill = new THREE.DirectionalLight(0x8b5cf6, 0.4);
    fill.position.set(-4, -2, 5); scene.add(fill);
    const rim = new THREE.DirectionalLight(0x22d3ee, 0.35);
    rim.position.set(0, -1, -4); scene.add(rim);
    const spot = new THREE.SpotLight(0xffffff, 1.8, 20, Math.PI / 5, 0.5, 1);
    spot.position.set(0, 0, 7); scene.add(spot);

    // ── LAYOUT ───────────────────────────────────────────────────
    const getPlacement = (idx: number, total: number) => {
      let row = 0, col = 0;
      const out: { x: number; y: number }[] = [];
      for (let i = 0; i < total; i++) {
        const odd = row % 2 === 1;
        const cap = odd ? 2 : 3;
        out.push({ x: (col - (cap - 1) / 2) * 2.85, y: -row * 2.45 });
        col++;
        if (col >= cap) { row++; col = 0; }
      }
      const ys = out.map(p => p.y);
      const off = -(Math.min(...ys) + Math.max(...ys)) / 2;
      return out[idx] ? { x: out[idx].x, y: out[idx].y + off } : { x: 0, y: 0 };
    };

    // ── CARD TEXTURE ─────────────────────────────────────────────
    const TEX = 1024;
    const renderCardCanvas = (cr: CreatorProfile) => {
      let cv = canvasesRef.current[cr.id];
      if (!cv) { cv = document.createElement('canvas'); cv.width = TEX; cv.height = TEX; canvasesRef.current[cr.id] = cv; }
      const ctx = cv.getContext('2d')!;
      const cx = TEX / 2;

      ctx.clearRect(0, 0, TEX, TEX);
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 2 + i * (Math.PI * 2 / 6);
        const px = cx + (TEX / 2) * Math.cos(a);
        const py = cx - (TEX / 2) * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = '#08080e';
      ctx.fillRect(0, 0, TEX, TEX);

      const grad = ctx.createRadialGradient(cx, cx * 0.7, 40, cx, cx * 0.7, TEX * 0.55);
      grad.addColorStop(0, `${cr.theme.primary}25`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, TEX, TEX);

      ctx.strokeStyle = `${cr.theme.primary}18`;
      ctx.lineWidth = 16;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 2 + i * (Math.PI * 2 / 6);
        const px = cx + (TEX / 2 - 8) * Math.cos(a);
        const py = cx - (TEX / 2 - 8) * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      const avatarImg = imageCacheRef.current[cr.id];
      const avY = 350, avR = 76;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, avY, avR, 0, Math.PI * 2);
      ctx.clip();
      if (avatarImg) {
        ctx.drawImage(avatarImg, cx - avR, avY - avR, avR * 2, avR * 2);
      } else {
        const ig = ctx.createLinearGradient(cx - avR, avY - avR, cx + avR, avY + avR);
        ig.addColorStop(0, cr.theme.primary); ig.addColorStop(1, cr.theme.secondary || cr.theme.primary);
        ctx.fillStyle = ig; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 56px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(cr.name.split(' ').map(n => n[0]).slice(0, 2).join(''), cx, avY);
      }
      ctx.restore();

      ctx.strokeStyle = cr.theme.primary; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, avY, avR + 4, 0, Math.PI * 2); ctx.stroke();

      if (cr.status === 'verified') {
        const bx = cx + avR - 4, by = avY - avR + 12;
        ctx.fillStyle = cr.theme.primary;
        ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(bx - 8, by); ctx.lineTo(bx - 2, by + 6); ctx.lineTo(bx + 8, by - 6); ctx.stroke();
      }

      ctx.fillStyle = '#fff'; ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(cr.name, cx, 456);

      ctx.fillStyle = '#777'; ctx.font = '28px sans-serif';
      const formattedHandle = cr.handle.startsWith('@') ? cr.handle : `@${cr.handle}`;
      ctx.fillText(formattedHandle, cx, 512);

      ctx.fillStyle = '#999'; ctx.font = '24px sans-serif';
      wrapText(ctx, cr.bio, cx, 560, 520, 32);

      const getCategoryLabel = (id: string) => {
        if (id === 'netlify-shippers') return 'Netlify Shippers';
        if (id === 'indie-hackers') return 'Indie Hackers';
        if (id === 'big-players') return 'Big Players';
        return id;
      };
      const tags = [getCategoryLabel(cr.category), ...(cr.tags || []).slice(0, 1).map(String)];
      ctx.font = '20px sans-serif'; ctx.textAlign = 'left';
      let tw = 0; tags.forEach(t => { tw += ctx.measureText(t).width + 36; });
      let tx = (TEX - tw) / 2;
      tags.forEach((tag, i) => {
        const w = ctx.measureText(tag).width + 24;
        ctx.fillStyle = i === 0 ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.05)';
        ctx.strokeStyle = i === 0 ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 2;
        const ry = 648, rh = 40, rad = 20;
        ctx.beginPath();
        ctx.moveTo(tx + rad, ry); ctx.lineTo(tx + w - rad, ry); ctx.quadraticCurveTo(tx + w, ry, tx + w, ry + rad);
        ctx.lineTo(tx + w, ry + rh - rad); ctx.quadraticCurveTo(tx + w, ry + rh, tx + w - rad, ry + rh);
        ctx.lineTo(tx + rad, ry + rh); ctx.quadraticCurveTo(tx, ry + rh, tx, ry + rh - rad);
        ctx.lineTo(tx, ry + rad); ctx.quadraticCurveTo(tx, ry, tx + rad, ry);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = i === 0 ? '#ec4899' : '#999';
        ctx.fillText(tag, tx + 12, ry + 28);
        tx += w + 10;
      });

      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(320, 710); ctx.lineTo(TEX - 320, 710); ctx.stroke();

      const plays = Array.isArray(cr.plays) ? cr.plays.length : 0;
      ctx.fillStyle = '#fff'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(plays.toLocaleString(), cx, 752);
      ctx.fillStyle = '#555'; ctx.font = '18px sans-serif';
      ctx.fillText('GROWTH PLAYS', cx, 788);

      ctx.restore();
    };

    // ── GEOMETRY ─────────────────────────────────────────────────
    const HEX_R = 1.25;
    const DEPTH = 0.15;

    const hexShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 2 + i * (Math.PI * 2 / 6);
      if (i === 0) hexShape.moveTo(HEX_R * Math.cos(a), HEX_R * Math.sin(a));
      else hexShape.lineTo(HEX_R * Math.cos(a), HEX_R * Math.sin(a));
    }
    hexShape.closePath();

    const frontGeo = new THREE.ShapeGeometry(hexShape);
    {
      const pos = frontGeo.getAttribute('position') as THREE.BufferAttribute;
      const uv = frontGeo.getAttribute('uv') as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        uv.setX(i, (pos.getX(i) + HEX_R) / (2 * HEX_R));
        uv.setY(i, (pos.getY(i) + HEX_R) / (2 * HEX_R));
      }
      uv.needsUpdate = true;
    }
    frontGeo.translate(0, 0, DEPTH / 2);

    const sidesGeo = new THREE.CylinderGeometry(HEX_R, HEX_R, DEPTH, 6, 1, true);
    sidesGeo.rotateX(-Math.PI / 2);

    // ── BUILD CARDS ──────────────────────────────────────────────
    const groups: THREE.Group[] = [];
    const frontMeshes: THREE.Mesh[] = [];
    const meshesGroup = new THREE.Group();
    scene.add(meshesGroup);

    filteredCreators.forEach((cr, idx) => {
      renderCardCanvas(cr);

      const tex = new THREE.CanvasTexture(canvasesRef.current[cr.id]);
      tex.colorSpace = THREE.SRGBColorSpace;
      texturesRef.current[cr.id] = tex;

      const matFront = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
      const matSides = new THREE.MeshStandardMaterial({ color: 0x14141e, roughness: 0.3, metalness: 0.9, flatShading: true });

      const fMesh = new THREE.Mesh(frontGeo, matFront);
      fMesh.userData = { index: idx, creator: cr };

      const sMesh = new THREE.Mesh(sidesGeo, matSides);

      const edgeGeo = new THREE.EdgesGeometry(frontGeo, 1);
      const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(cr.theme.primary), transparent: true, opacity: 0.5 });
      const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);

      const grp = new THREE.Group();
      grp.add(fMesh);
      grp.add(sMesh);
      grp.add(edgeMesh);

      const coord = getPlacement(idx, filteredCreators.length);
      grp.position.set(coord.x, coord.y, 0);
      grp.userData = { index: idx, creator: cr, baseX: coord.x, baseY: coord.y };

      if (cr.avatar && !imageCacheRef.current[cr.id]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = cr.avatar;
        img.onload = () => {
          imageCacheRef.current[cr.id] = img;
          renderCardCanvas(cr);
          texturesRef.current[cr.id].needsUpdate = true;
        };
      }

      groups.push(grp);
      frontMeshes.push(fMesh);
      meshesGroup.add(grp);
    });

    // ── CONNECTIONS ──────────────────────────────────────────────
    const conns: { from: number; to: number }[] = [];
    for (let i = 0; i < groups.length; i++)
      for (let j = i + 1; j < groups.length; j++)
        if (groups[i].position.distanceTo(groups[j].position) < 4.2)
          conns.push({ from: i, to: j });

    const linesGrp = new THREE.Group();
    scene.add(linesGrp);
    conns.forEach(c => {
      const p1 = groups[c.from].position, p2 = groups[c.to].position;
      const pts = new THREE.LineCurve3(new THREE.Vector3(p1.x, p1.y, -0.1), new THREE.Vector3(p2.x, p2.y, -0.1)).getPoints(10);
      linesGrp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x18182a, transparent: true, opacity: 0.35 })));
    });

    const pulseGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const pulses: { m: THREE.Mesh; path: THREE.LineCurve3; t: number; spd: number }[] = [];
    conns.forEach(c => {
      const p1 = groups[c.from].position, p2 = groups[c.to].position;
      const path = new THREE.LineCurve3(new THREE.Vector3(p1.x, p1.y, -0.1), new THREE.Vector3(p2.x, p2.y, -0.1));
      const pm = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending }));
      scene.add(pm);
      pulses.push({ m: pm, path, t: Math.random(), spd: 0.002 + Math.random() * 0.003 });
    });

    // Particles
    const pCount = 90;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) { pPos[i] = (Math.random() - 0.5) * 18; pPos[i + 1] = (Math.random() - 0.5) * 12; pPos[i + 2] = -2 + Math.random() * 2; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x8b5cf6, size: 0.035, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── ORBIT CONTROLS ───────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 80;
    controls.minDistance = 4;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enabled = false;

    // ── INPUT ────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-99, -99);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      spot.position.x = mouse.x * 5;
      spot.position.y = mouse.y * 4;
    };
    const onLeave = () => mouse.set(-99, -99);

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const duration = Date.now() - startTime;

      if (dist < 6 && duration < 300) {
        if (!interactedRef.current) {
          interactedRef.current = true;
          setInteracted(true);
          return;
        }

        if (modalCreatorId || zoomedInCreatorRef.current) return;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(frontMeshes);
        if (hits.length > 0) {
          const creator = (hits[0].object as THREE.Mesh).userData.creator as CreatorProfile;
          zoomedInCreatorRef.current = creator;
          setZoomedInCreator(creator);
        }
      }
    };

    window.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);

    // ── RESIZE ───────────────────────────────────────────────────
    let resObs: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resObs = new ResizeObserver(ent => {
        if (!ent.length) return;
        const { width: w, height: h } = ent[0].contentRect;
        renderer.setSize(w || width, h || height);
        camera.aspect = (w || width) / (h || height);
        if (w < 480) defaultCamPos.set(0, 0, 16);
        else if (w < 768) defaultCamPos.set(0, 0, 13);
        else if (w < 1024) defaultCamPos.set(0, 0, 10.5);
        else defaultCamPos.set(0, 0, 9.0);
        camera.updateProjectionMatrix();
      });
      resObs.observe(container);
    }

    // ── ANIMATE ──────────────────────────────────────────────────
    let aId: number;
    const animStartTime = performance.now();
    const tCamPos = new THREE.Vector3().copy(defaultCamPos);
    const tLookAt = new THREE.Vector3(0, 0, 0);
    
    let prevZoomId = '';
    let isTransitioningBack = false;

    const animate = () => {
      aId = requestAnimationFrame(animate);
      const t = (performance.now() - animStartTime) / 1000;

      const zId = modalCreatorId || zoomedInCreatorRef.current?.id || '';

      if (!zId && prevZoomId) {
        isTransitioningBack = true;
      }
      prevZoomId = zId;

      if (zId) {
        controls.enabled = false;
        const tg = groups.find(g => g.userData.creator.id === zId);
        if (tg) {
          tCamPos.set(tg.position.x, tg.position.y, 3.0);
          tLookAt.set(tg.position.x, tg.position.y, 0);

          camera.position.lerp(tCamPos, 0.08);
          controls.target.copy(tLookAt);
          camera.lookAt(tLookAt);
        }
      } else {
        if (isTransitioningBack) {
          controls.enabled = false;
          camera.position.lerp(defaultCamPos, 0.08);
          camera.lookAt(0, 0, 0);

          if (camera.position.distanceTo(defaultCamPos) < 0.1) {
            isTransitioningBack = false;
            camera.position.copy(defaultCamPos);
            controls.target.set(0, 0, 0);
            controls.update();
          }
        } else {
          if (interactedRef.current) {
            controls.enabled = true;
            controls.update();
          } else {
            controls.enabled = false;
            camera.position.lerp(defaultCamPos, 0.08);
            camera.lookAt(0, 0, 0);
          }
        }
      }

      let hovIdx: number | null = null;
      if (!zId) {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(frontMeshes);
        if (hits.length > 0) { hovIdx = (hits[0].object as THREE.Mesh).userData.index; canvas.style.cursor = 'pointer'; }
        else canvas.style.cursor = 'default';
      } else { canvas.style.cursor = 'default'; }

      groups.forEach((g, idx) => {
        const d = g.userData;
        let tx = d.baseX, ty = d.baseY, tz = 0, ts = 1.0;
        if (!zId && hovIdx !== null) {
          if (hovIdx === idx) { tz = 0.55; ts = 1.1; }
          else {
            const hg = groups[hovIdx];
            const dx = d.baseX - hg.userData.baseX, dy = d.baseY - hg.userData.baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) { tx = d.baseX + (dx / dist) * 0.3; ty = d.baseY + (dy / dist) * 0.3; }
          }
        }
        g.position.x += (tx - g.position.x) * 0.1;
        g.position.y += (ty - g.position.y) * 0.1;
        g.position.z += (tz - g.position.z) * 0.1;
        const s = g.scale.x + (ts - g.scale.x) * 0.1;
        g.scale.setScalar(s);

        let rx = 0, ry = 0;
        if (!zId) {
          if (hovIdx === idx) { rx = -mouse.y * 0.14; ry = mouse.x * 0.14; }
          else { rx = -mouse.y * 0.025; ry = mouse.x * 0.025; }
        }
        g.rotation.x += (rx - g.rotation.x) * 0.07;
        g.rotation.y += (ry - g.rotation.y) * 0.07;
      });

      pulses.forEach(p => { p.t += p.spd; if (p.t > 1) p.t = 0; p.m.position.copy(p.path.getPointAt(p.t)); (p.m.material as THREE.MeshBasicMaterial).opacity = Math.sin(p.t * Math.PI) * 0.75; });

      stars.rotation.y = t * 0.002;
      stars.rotation.x = t * 0.001;
      particles.rotation.y = t * 0.012;
      neb1.scale.x = 2.5 + Math.sin(t * 0.3) * 0.2;
      neb2.scale.x = 3 + Math.sin(t * 0.25 + 1) * 0.25;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(aId);
      window.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      if (resObs) resObs.disconnect();
      frontGeo.dispose(); sidesGeo.dispose(); pulseGeo.dispose(); pGeo.dispose(); pMat.dispose();
      starGeo.dispose(); starMat.dispose(); nebGeo.dispose();
      Object.values(texturesRef.current).forEach(t => t.dispose());
      controls.dispose();
      renderer.dispose();
      if (loseCtxExt) loseCtxExt.loseContext();
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
    };
  }, [filteredCreators, modalCreatorId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '700px' }}>
      <style>{`
        @keyframes pulse-explore {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.03); opacity: 1; filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.8)); }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      
      {!interacted && (
        <div 
          onClick={handleInteract}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            background: 'rgba(5, 5, 16, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 10,
            cursor: 'pointer',
            borderRadius: '24px',
            pointerEvents: 'auto'
          }}
        >
          <div 
            style={{
              color: '#ffffff',
              fontFamily: '"Cal Sans", "Instrument Sans", sans-serif',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              animation: 'pulse-explore 2s infinite ease-in-out',
              background: 'linear-gradient(45deg, #ec4899, #8b5cf6, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              padding: '10px'
            }}
          >
            Click me to interact
          </div>
          <div style={{ color: '#7c7c8d', fontSize: '0.95rem', marginTop: '12px', letterSpacing: '0.5px' }}>
            Drag to rotate & pan • Scroll to zoom • Click cards to open
          </div>
        </div>
      )}

      {zoomedInCreator && !modalCreatorId && (
        <div
          style={{
            position: 'absolute',
            bottom: '45px',
            left: '50%',
            display: 'flex',
            gap: '16px',
            zIndex: 20,
            transform: 'translate(-50%, 0)',
            animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            pointerEvents: 'auto'
          }}
        >
          <button
            onClick={() => {
              if (zoomedInCreator) openCreatorModal(zoomedInCreator);
            }}
            style={{
              background: `linear-gradient(135deg, ${zoomedInCreator.theme.primary}, ${zoomedInCreator.theme.secondary || zoomedInCreator.theme.primary})`,
              color: '#ffffff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: `0 8px 24px ${zoomedInCreator.theme.primary}40`,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = `0 12px 30px ${zoomedInCreator?.theme.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${zoomedInCreator?.theme.primary}40`;
            }}
          >
            Select Playbook
          </button>
          <button
            onClick={() => {
              zoomedInCreatorRef.current = null;
              setZoomedInCreator(null);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = '#e2e8f0';
            }}
          >
            Back to Grid
          </button>
        </div>
      )}

      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)' 
        }} 
      />
    </div>
  );
}
