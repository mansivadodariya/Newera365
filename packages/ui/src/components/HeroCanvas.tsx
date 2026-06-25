'use client';

import { useEffect, useRef } from 'react';

/**
 * Three.js animated background for the hero section.
 * Renders a perspective floor grid + animated price chart lines + floating particles.
 * Loaded dynamically (import('three') inside useEffect) so Three.js is code-split
 * and only shipped to pages that mount this component.
 */
export function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let animId = 0;
    let disposeFn: (() => void) | null = null;

    import('three').then((THREE) => {
      if (!mounted || !mountRef.current) return;
      const mount = mountRef.current;

      const W = mount.clientWidth || window.innerWidth;
      const H = mount.clientHeight || 500;

      // ── Renderer ──────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
      camera.position.set(0, 3.5, 8);
      camera.lookAt(0, 0, 0);

      // ── Perspective grid (floor plane) ────────────────────────────────
      const gridMat = new THREE.LineBasicMaterial({
        color: 0x00b050,
        transparent: true,
        opacity: 0.1,
      });
      const gridGroup = new THREE.Group();
      const GR = 16; // half-extent
      const STEP = 1.5;

      for (let x = -GR; x <= GR; x += STEP) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0, -GR),
          new THREE.Vector3(x, 0, GR),
        ]);
        gridGroup.add(new THREE.Line(geo, gridMat));
      }
      for (let z = -GR; z <= GR; z += STEP) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-GR, 0, z),
          new THREE.Vector3(GR, 0, z),
        ]);
        gridGroup.add(new THREE.Line(geo, gridMat));
      }
      gridGroup.position.y = -1.5;
      scene.add(gridGroup);

      // ── Animated price chart lines ────────────────────────────────────
      const N = 90;
      type ChartEntry = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geometry: any;
        phase: number;
        freq: number;
        amp: number;
        speed: number;
        yBase: number;
      };
      const chartEntries: ChartEntry[] = [];

      const lineConfigs = [
        { color: 0x00c853, opacity: 0.85, phase: 0, freq: 0.55, amp: 1.1, speed: 1.0, yBase: 0.3 },
        {
          color: 0x00e676,
          opacity: 0.45,
          phase: 1.4,
          freq: 0.35,
          amp: 0.75,
          speed: 0.65,
          yBase: 0.0,
        },
        {
          color: 0x69f0ae,
          opacity: 0.2,
          phase: 2.8,
          freq: 0.9,
          amp: 0.45,
          speed: 1.3,
          yBase: -0.4,
        },
      ];

      lineConfigs.forEach(({ color, opacity, phase, freq, amp, speed, yBase }) => {
        const positions = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          positions[i * 3] = (i / (N - 1)) * 14 - 7;
          positions[i * 3 + 1] = yBase;
          positions[i * 3 + 2] = 0;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        chartEntries.push({ geometry: geo, phase, freq, amp, speed, yBase });
      });

      // ── Floating particles ────────────────────────────────────────────
      const PC = 120;
      const pPos = new Float32Array(PC * 3);
      const pSpeed = new Float32Array(PC);
      for (let i = 0; i < PC; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 18;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
        pSpeed[i] = 0.003 + Math.random() * 0.006;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x00b050,
        size: 0.06,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(pGeo, pMat);
      scene.add(points);

      // ── Animation loop ────────────────────────────────────────────────
      let t = 0;
      const tick = () => {
        animId = requestAnimationFrame(tick);
        t += 0.006;

        // Update chart lines
        chartEntries.forEach(({ geometry, phase, freq, amp, speed, yBase }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const attr = geometry.attributes.position as any;
          for (let i = 0; i < N; i++) {
            const x = attr.getX(i);
            const y =
              yBase +
              Math.sin(x * freq + t * speed + phase) * amp +
              Math.sin(x * freq * 0.5 - t * speed * 0.7 + phase) * amp * 0.4 +
              Math.cos(x * freq * 1.3 + t * speed * 1.1 + phase) * amp * 0.15;
            attr.setY(i, y);
          }
          attr.needsUpdate = true;
        });

        // Drift particles upward, wrap at top
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pAttr = pGeo.attributes.position as any;
        for (let i = 0; i < PC; i++) {
          let y = pAttr.getY(i) + pSpeed[i];
          if (y > 4) y = -4;
          pAttr.setY(i, y);
        }
        pAttr.needsUpdate = true;

        // Subtle camera sway
        camera.position.x = Math.sin(t * 0.08) * 0.4;
        camera.position.y = 3.5 + Math.sin(t * 0.05) * 0.3;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };
      tick();

      // ── Resize handler ────────────────────────────────────────────────
      const onResize = () => {
        if (!mount) return;
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      disposeFn = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        renderer.dispose();
        chartEntries.forEach(({ geometry }) => geometry.dispose());
        pGeo.dispose();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gridGroup.children.forEach((c) => (c as any).geometry.dispose());
      };
    });

    return () => {
      mounted = false;
      disposeFn?.();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
