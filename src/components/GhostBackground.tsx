"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Pane } from "tweakpane";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

export default function GhostBackground({ isHovered = true }: { isHovered?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(isHovered);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    if (!mountRef.current) return;

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]) isVisible = entries[0].isIntersecting;
    }, { threshold: 0.01 });
    observer.observe(mountRef.current);

    // Create scene
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 20;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance",
      alpha: true,
      premultipliedAlpha: false,
      stencil: false,
      depth: true,
      preserveDrawingBuffer: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "2";
    renderer.domElement.style.pointerEvents = "auto";
    renderer.domElement.style.background = "transparent";

    // Setup post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
      0.3, // strength
      1.25, // radius
      0.0 // threshold
    );
    composer.addPass(bloomPass);

    // Analog Decay Shader
    const analogDecayShader = {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uAnalogGrain: { value: 0.4 },
        uAnalogBleeding: { value: 1.0 },
        uAnalogVSync: { value: 1.0 },
        uAnalogScanlines: { value: 1.0 },
        uAnalogVignette: { value: 1.0 },
        uAnalogJitter: { value: 0.4 },
        uAnalogIntensity: { value: 0.6 },
        uLimboMode: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uAnalogGrain;
        uniform float uAnalogBleeding;
        uniform float uAnalogVSync;
        uniform float uAnalogScanlines;
        uniform float uAnalogVignette;
        uniform float uAnalogJitter;
        uniform float uAnalogIntensity;
        uniform float uLimboMode;
        
        varying vec2 vUv;
        
        float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }
        float random(float x) { return fract(sin(x) * 43758.5453123); }
        float gaussian(float z, float u, float o) { return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o)))); }
        vec3 grain(vec2 uv, float time, float intensity) {
          float seed = dot(uv, vec2(12.9898, 78.233));
          float noise = fract(sin(seed) * 43758.5453 + time * 2.0);
          noise = gaussian(noise, 0.0, 0.5 * 0.5);
          return vec3(noise) * intensity;
        }
        
        void main() {
          vec2 uv = vUv;
          float time = uTime * 1.8;
          vec2 jitteredUV = uv;
          
          if (uAnalogJitter > 0.01) {
            float jitterAmount = (random(vec2(floor(time * 60.0))) - 0.5) * 0.003 * uAnalogJitter * uAnalogIntensity;
            jitteredUV.x += jitterAmount;
            jitteredUV.y += (random(vec2(floor(time * 30.0) + 1.0)) - 0.5) * 0.001 * uAnalogJitter * uAnalogIntensity;
          }
          if (uAnalogVSync > 0.01) {
            float vsyncRoll = sin(time * 2.0 + uv.y * 100.0) * 0.02 * uAnalogVSync * uAnalogIntensity;
            float vsyncChance = step(0.95, random(vec2(floor(time * 4.0))));
            jitteredUV.y += vsyncRoll * vsyncChance;
          }
          
          vec4 color = texture2D(tDiffuse, jitteredUV);
          
          if (uAnalogBleeding > 0.01) {
            float bleedAmount = 0.012 * uAnalogBleeding * uAnalogIntensity;
            float offsetPhase = time * 1.5 + uv.y * 20.0;
            vec2 redOffset = vec2(sin(offsetPhase) * bleedAmount, 0.0);
            vec2 blueOffset = vec2(-sin(offsetPhase * 1.1) * bleedAmount * 0.8, 0.0);
            float r = texture2D(tDiffuse, jitteredUV + redOffset).r;
            float g = texture2D(tDiffuse, jitteredUV).g;
            float b = texture2D(tDiffuse, jitteredUV + blueOffset).b;
            color = vec4(r, g, b, color.a);
          }
          if (uAnalogGrain > 0.01) {
            vec3 grainEffect = grain(uv, time, 0.075 * uAnalogGrain * uAnalogIntensity);
            grainEffect *= (1.0 - color.rgb);
            color.rgb += grainEffect;
          }
          if (uAnalogScanlines > 0.01) {
            float scanlineFreq = 600.0 + uAnalogScanlines * 400.0;
            float scanlinePattern = sin(uv.y * scanlineFreq) * 0.5 + 0.5;
            float scanlineIntensity = 0.1 * uAnalogScanlines * uAnalogIntensity;
            color.rgb *= (1.0 - scanlinePattern * scanlineIntensity);
            float horizontalLines = sin(uv.y * scanlineFreq * 0.1) * 0.02 * uAnalogScanlines * uAnalogIntensity;
            color.rgb *= (1.0 - horizontalLines);
          }
          if (uAnalogVignette > 0.01) {
            vec2 vignetteUV = (uv - 0.5) * 2.0;
            float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3 * uAnalogVignette * uAnalogIntensity;
            color.rgb *= vignette;
          }
          if (uLimboMode > 0.5) {
            float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            color.rgb = vec3(gray);
          }
          
          gl_FragColor = color;
        }
      `
    };

    const isMobile = window.innerWidth < 768;
    const analogDecayPass = new ShaderPass(analogDecayShader);
    if (!isMobile) composer.addPass(analogDecayPass);
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Production parameters
    const params = {
      bodyColor: 0x0f172a, glowColor: "purple", eyeGlowColor: "violet", ghostOpacity: 0.88, ghostScale: 2.4,
      emissiveIntensity: 5.8, pulseSpeed: 1.6, pulseIntensity: 0.6, eyeGlowIntensity: 4.5, eyeGlowDecay: 0.95, eyeGlowResponse: 0.31,
      rimLightIntensity: 1.8, followSpeed: 0.12, wobbleAmount: 0.35, floatSpeed: 1.6, movementThreshold: 0.07,
      particleCount: 250, particleDecayRate: 0.005, particleColor: "purple", createParticlesOnlyWhenMoving: true, particleCreationRate: 5,
      revealRadius: 43, fadeStrength: 2.2, baseOpacity: 0.35, revealOpacity: 0.0,
      fireflyGlowIntensity: 2.6, fireflySpeed: 0.04,
      analogIntensity: 0.6, analogGrain: 0.4, analogBleeding: 1.0, analogVSync: 1.0, analogScanlines: 1.0, analogVignette: 1.0, analogJitter: 0.4, limboMode: false
    };

    const fluorescentColors: Record<string, number> = {
      cyan: 0x00ffff, lime: 0x00ff00, magenta: 0xff00ff, yellow: 0xffff00,
      orange: 0xff4500, pink: 0xff1493, purple: 0x9400d3, blue: 0x0080ff,
      green: 0x00ff80, red: 0xff0040, teal: 0x00ffaa, violet: 0x8a2be2
    };

    // Atmosphere
    const atmosphereGeometry = new THREE.PlaneGeometry(300, 300);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ghostPosition: { value: new THREE.Vector3(0, 0, 0) }, revealRadius: { value: params.revealRadius }, fadeStrength: { value: params.fadeStrength },
        baseOpacity: { value: params.baseOpacity }, revealOpacity: { value: params.revealOpacity }, time: { value: 0 }
      },
      vertexShader: `varying vec2 vUv; varying vec3 vWorldPosition; void main() { vUv = uv; vec4 worldPos = modelMatrix * vec4(position, 1.0); vWorldPosition = worldPos.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 ghostPosition; uniform float revealRadius; uniform float fadeStrength; uniform float baseOpacity; uniform float revealOpacity; uniform float time; varying vec2 vUv; varying vec3 vWorldPosition; void main() { float dist = distance(vWorldPosition.xy, ghostPosition.xy); float dynamicRadius = revealRadius + sin(time * 2.0) * 5.0; float reveal = smoothstep(dynamicRadius * 0.2, dynamicRadius, dist); reveal = pow(reveal, fadeStrength); float opacity = mix(revealOpacity, baseOpacity, reveal); gl_FragColor = vec4(0.001, 0.001, 0.002, opacity); }`,
      transparent: true, depthWrite: false
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.position.z = -50;
    atmosphere.renderOrder = -100;
    scene.add(atmosphere);

    // Lights
    scene.add(new THREE.AmbientLight(0x0a0a2e, 0.08));
    const rimLight1 = new THREE.DirectionalLight(0x9333ea, params.rimLightIntensity);
    rimLight1.position.set(-8, 6, -4);
    scene.add(rimLight1);
    const rimLight2 = new THREE.DirectionalLight(0xc084fc, params.rimLightIntensity * 0.7);
    rimLight2.position.set(8, -4, -6);
    scene.add(rimLight2);

    // Ghost
    const ghostGroup = new THREE.Group();
    scene.add(ghostGroup);
    const ghostGeometry = new THREE.SphereGeometry(2, 40, 40);
    const positionAttribute = ghostGeometry.getAttribute("position");
    const positions = positionAttribute.array as any;
    for (let i = 0; i < positions.length; i += 3) {
      if (positions[i + 1] < -0.2) {
        positions[i + 1] = -2.0 + Math.sin(positions[i] * 5) * 0.35 + Math.cos(positions[i + 2] * 4) * 0.25 + Math.sin((positions[i] + positions[i + 2]) * 3) * 0.15;
      }
    }
    ghostGeometry.computeVertexNormals();

    const ghostMaterial = new THREE.MeshStandardMaterial({
      color: params.bodyColor, transparent: true, opacity: params.ghostOpacity,
      emissive: fluorescentColors[params.glowColor], emissiveIntensity: params.emissiveIntensity,
      roughness: 0.02, metalness: 0.0, side: THREE.DoubleSide, alphaTest: 0.1
    });
    const ghostBody = new THREE.Mesh(ghostGeometry, ghostMaterial);
    ghostGroup.add(ghostBody);

    // Eyes
    const eyeGroup = new THREE.Group();
    ghostGroup.add(eyeGroup);
    const socketGeom = new THREE.SphereGeometry(0.45, 16, 16);
    const socketMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    ([[-0.7, 0.6, 1.9], [0.7, 0.6, 1.9]] as any).forEach((pos: any) => {
      const s = new THREE.Mesh(socketGeom, socketMat);
      s.position.set(pos[0], pos[1], pos[2]);
      s.scale.set(1.1, 1.0, 0.6);
      eyeGroup.add(s);
    });

    const eyeGeom = new THREE.SphereGeometry(0.3, 12, 12);
    const eyeMats: THREE.MeshBasicMaterial[] = [];
    const outerGeom = new THREE.SphereGeometry(0.525, 12, 12);
    const outerMats: THREE.MeshBasicMaterial[] = [];
    ([[-0.7, 0.6, 2.0], [0.7, 0.6, 2.0]] as any).forEach((pos: any) => {
      const mat = new THREE.MeshBasicMaterial({ color: fluorescentColors[params.eyeGlowColor], transparent: true, opacity: 0 });
      const eye = new THREE.Mesh(eyeGeom, mat);
      eye.position.set(pos[0], pos[1], pos[2]);
      eyeGroup.add(eye);
      eyeMats.push(mat);

      const omat = new THREE.MeshBasicMaterial({ color: fluorescentColors[params.eyeGlowColor], transparent: true, opacity: 0, side: THREE.BackSide });
      const outer = new THREE.Mesh(outerGeom, omat);
      outer.position.set(pos[0], pos[1], pos[2] - 0.05);
      eyeGroup.add(outer);
      outerMats.push(omat);
    });

    // Fireflies
    const fireflyGroup = new THREE.Group();
    scene.add(fireflyGroup);
    const fireflies: any[] = [];
    for (let i = 0; i < 20; i++) {
      const fGeom = new THREE.SphereGeometry(0.02, 2, 2);
      const fMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.9 });
      const f = new THREE.Mesh(fGeom, fMat);
      f.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20);
      
      const gGeom = new THREE.SphereGeometry(0.08, 8, 8);
      const gMat = new THREE.MeshBasicMaterial({ color: 0xd8b4fe, transparent: true, opacity: 0.4, side: THREE.BackSide });
      f.add(new THREE.Mesh(gGeom, gMat));
      
      f.userData = {
        velocity: new THREE.Vector3((Math.random() - 0.5)*params.fireflySpeed, (Math.random() - 0.5)*params.fireflySpeed, (Math.random() - 0.5)*params.fireflySpeed),
        phase: Math.random() * Math.PI * 2, pulseSpeed: 2 + Math.random() * 3,
        glowMaterial: gMat, fireflyMaterial: fMat
      };
      fireflyGroup.add(f);
      fireflies.push(f);
    }

    // Particles
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);
    const particles: THREE.Mesh[] = [];
    const particlePool: THREE.Mesh[] = [];
    const pGeometries = [new THREE.SphereGeometry(0.05, 6, 6), new THREE.TetrahedronGeometry(0.04, 0), new THREE.OctahedronGeometry(0.045, 0)];
    const pBaseMat = new THREE.MeshBasicMaterial({ color: fluorescentColors[params.particleColor], transparent: true, opacity: 0, alphaTest: 0.1 });
    for (let i = 0; i < 100; i++) {
      const p = new THREE.Mesh(pGeometries[Math.floor(Math.random() * pGeometries.length)], pBaseMat.clone());
      p.visible = false;
      particleGroup.add(p);
      particlePool.push(p);
    }

    function createParticle() {
      let p = particlePool.pop();
      if (!p && particles.length < params.particleCount) {
        p = new THREE.Mesh(pGeometries[Math.floor(Math.random() * pGeometries.length)], pBaseMat.clone());
        particleGroup.add(p);
      } else if (!p) return;
      p.visible = true;
      const c = new THREE.Color(fluorescentColors[params.particleColor]);
      c.offsetHSL(Math.random() * 0.1 - 0.05, 0, 0);
      (p.material as THREE.MeshBasicMaterial).color = c;
      p.position.copy(ghostGroup.position);
      p.position.z -= 0.8 + Math.random() * 0.6;
      p.position.x += (Math.random() - 0.5) * 3.5;
      p.position.y += (Math.random() - 0.5) * 3.5 - 0.8;
      const s = 0.6 + Math.random() * 0.7;
      p.scale.set(s, s, s);
      p.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      p.userData = {
        life: 1.0, decay: Math.random() * 0.003 + params.particleDecayRate,
        rSpeed: { x: (Math.random() - 0.5) * 0.015, y: (Math.random() - 0.5) * 0.015, z: (Math.random() - 0.5) * 0.015 },
        vel: { x: (Math.random() - 0.5) * 0.012, y: (Math.random() - 0.5) * 0.012 - 0.002, z: (Math.random() - 0.5) * 0.012 - 0.006 }
      };
      (p.material as THREE.MeshBasicMaterial).opacity = Math.random() * 0.9;
      particles.push(p);
    }

    // Tweakpane UI
    const pane = new Pane({ title: "Spectral Ghost", expanded: false });
    pane.element.style.display = "none";
    pane.element.style.position = "fixed"; pane.element.style.top = "80px"; pane.element.style.right = "20px";
    pane.element.style.zIndex = "10000"; pane.element.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    pane.element.style.borderRadius = "12px"; pane.element.style.padding = "15px"; pane.element.style.pointerEvents = "auto";
    
    // Interactions
    const mouse = new THREE.Vector2();
    const prevMouse = new THREE.Vector2();
    const mouseSpeed = new THREE.Vector2();
    let currentMovement = 0;
    let isMouseMoving = false;
    let tmr: any;
    let lastInteraction = Date.now();
    
    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      if (!isHoveredRef.current) return;
      lastInteraction = Date.now();
      prevMouse.copy(mouse);
      let cx, cy;
      if ('touches' in e) {
        const touch = e.touches[0];
        if (!touch) return;
        cx = touch.clientX;
        cy = touch.clientY;
      } else {
        cx = (e as MouseEvent).clientX;
        cy = (e as MouseEvent).clientY;
      }
      mouse.x = (cx / window.innerWidth) * 2 - 1;
      mouse.y = -(cy / window.innerHeight) * 2 + 1;
      mouseSpeed.set(mouse.x - prevMouse.x, mouse.y - prevMouse.y);
      isMouseMoving = true;
      if (tmr) clearTimeout(tmr);
      tmr = setTimeout(() => isMouseMoving = false, 80);
    };
    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("touchmove", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      (analogDecayPass.uniforms as any).uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    for (let i = 0; i < 10; i++) createParticle();

    let frameId: number;
    let lastTime = 0;
    let time = 0;
    let lastParticleTime = 0;
    let frameCount = 0;

    const animate = (timestamp: number) => {
      frameId = requestAnimationFrame(animate);
      if (!isVisible) return;
      if (timestamp - lastTime > 100) { lastTime = timestamp; return; }
      time += ((timestamp - lastTime) / 16.67) * 0.01;
      lastTime = timestamp;
      frameCount++;

      (atmosphereMaterial.uniforms as any).time.value = time;
      (analogDecayPass.uniforms as any).uTime.value = time;

      if (!isHoveredRef.current) {
        // Return to center (at z=0 equivalent in screen-tracking coords)
        mouse.x += (0 - mouse.x) * 0.05;
        mouse.y += (0 - mouse.y) * 0.05;
        // Keep it moving slightly for a 'breathing' effect center stage
        mouse.y += Math.sin(time * 0.4) * 0.01;
      } else if (Date.now() - lastInteraction > 3000) {
        prevMouse.copy(mouse);
        mouse.x = Math.sin(time * 0.3) * 0.8;
        mouse.y = Math.cos(time * 0.2) * 0.5 + Math.sin(time * 0.5) * 0.2;
        mouseSpeed.set(mouse.x - prevMouse.x, mouse.y - prevMouse.y);
        isMouseMoving = true;
      }

      const tx = mouse.x * 22;
      const ty = mouse.y * 14;
      const pgPos = ghostGroup.position.clone();
      ghostGroup.position.x += (tx - ghostGroup.position.x) * params.followSpeed;
      ghostGroup.position.y += (ty - ghostGroup.position.y) * params.followSpeed;
      (atmosphereMaterial.uniforms as any).ghostPosition.value.copy(ghostGroup.position);

      currentMovement = currentMovement * params.eyeGlowDecay + pgPos.distanceTo(ghostGroup.position) * (1 - params.eyeGlowDecay);
      ghostGroup.position.y += Math.sin(time*params.floatSpeed*1.5)*0.03 + Math.cos(time*params.floatSpeed*0.7)*0.018;

      const p1 = Math.sin(time*params.pulseSpeed)*params.pulseIntensity;
      ghostMaterial.emissiveIntensity = params.emissiveIntensity + p1 + Math.sin(time*0.6)*0.12;

      fireflies.forEach(f => {
        const p = Math.sin((time + f.userData.phase) * f.userData.pulseSpeed) * 0.4 + 0.6;
        f.userData.glowMaterial.opacity = params.fireflyGlowIntensity * 0.4 * p;
        f.userData.fireflyMaterial.opacity = params.fireflyGlowIntensity * 0.9 * p;
        f.userData.velocity.add(new THREE.Vector3((Math.random()-0.5)*0.001,(Math.random()-0.5)*0.001,(Math.random()-0.5)*0.001)).clampLength(0, params.fireflySpeed);
        f.position.add(f.userData.velocity);
        if (Math.abs(f.position.x)>30) f.userData.velocity.x *= -0.5;
        if (Math.abs(f.position.y)>20) f.userData.velocity.y *= -0.5;
        if (Math.abs(f.position.z)>15) f.userData.velocity.z *= -0.5;
      });

      const md = new THREE.Vector2(tx - ghostGroup.position.x, ty - ghostGroup.position.y).normalize();
      ghostBody.rotation.z = ghostBody.rotation.z * 0.95 + -md.x * (0.1*params.wobbleAmount) * 0.05;
      ghostBody.rotation.x = ghostBody.rotation.x * 0.95 + md.y * (0.1*params.wobbleAmount) * 0.05;
      ghostBody.rotation.y = Math.sin(time*1.4) * 0.05 * params.wobbleAmount;

      const fs = (1 + Math.sin(time*2.1)*0.025*params.wobbleAmount + p1*0.015) * (1 + Math.sin(time*0.8)*0.012);
      ghostBody.scale.set(fs, fs, fs);

      const tgtGlow = currentMovement > params.movementThreshold ? 1.0 : 0.0;
      const gSpeed = currentMovement > params.movementThreshold ? params.eyeGlowResponse*2 : params.eyeGlowResponse;
      const newOp = (eyeMats[0] as any).opacity + (tgtGlow - (eyeMats[0] as any).opacity) * gSpeed;
      eyeMats.forEach(m => m.opacity = newOp);
      outerMats.forEach(m => m.opacity = newOp * 0.3);

      if ((currentMovement > 0.005) && timestamp - lastParticleTime > 100) {
        for (let i = 0; i < Math.min(params.particleCreationRate, Math.max(1, Math.floor(Math.sqrt(mouseSpeed.x*mouseSpeed.x + mouseSpeed.y*mouseSpeed.y)*8*3))); i++) createParticle();
        lastParticleTime = timestamp;
      }

      for (let i = 0; i < Math.min(particles.length, 60); i++) {
        const p = particles[(frameCount + i) % particles.length];
        if (!p) continue;
        p.userData.life -= p.userData.decay;
        (p.material as THREE.MeshBasicMaterial).opacity = p.userData.life * 0.85;
        p.position.add(p.userData.vel);
        p.position.x += Math.cos(time*1.8 + p.position.y)*0.0008;
        p.rotation.x += p.userData.rSpeed.x; p.rotation.y += p.userData.rSpeed.y; p.rotation.z += p.userData.rSpeed.z;
        if (p.userData.life <= 0) { p.visible = false; (p.material as THREE.MeshBasicMaterial).opacity = 0; particlePool.push(p); particles.splice(particles.indexOf(p), 1); }
      }

      composer.render();
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("touchmove", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("resize", handleResize);
      pane.dispose();
      renderer.dispose();
      composer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
