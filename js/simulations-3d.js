// Studio Grade 3D Simulations using Three.js
// Enhanced with clean laboratory lighting, crisp rendering, and high-fidelity models

export class Simulations3D {
  constructor() {
    this.activeSims = {};
  }

  // LAB 1: Willow Tree & Analytical Scale Simulation
  initStation1(containerId, onGrowthDone) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Clean laboratory light slate

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 8.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xffffff, 0.85);
    mainSun.position.set(4, 10, 6);
    mainSun.castShadow = true;
    scene.add(mainSun);

    const softFill = new THREE.PointLight(0x3b82f6, 0.35, 15);
    softFill.position.set(-4, 3, 2);
    scene.add(softFill);

    // Laboratory Desk / Scale Base
    const baseGeo = new THREE.CylinderGeometry(3.0, 3.0, 0.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const desk = new THREE.Mesh(baseGeo, baseMat);
    desk.position.y = -1.1;
    desk.receiveShadow = true;
    scene.add(desk);

    // Ceramic Pot
    const potGeo = new THREE.CylinderGeometry(1.25, 0.85, 1.3, 24);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.6 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = -0.35;
    pot.castShadow = true;

    // Soil
    const soilGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.08, 24);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 0.42;
    pot.add(soil);

    // Tree Group
    const treeGroup = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.07, 0.13, 1.5, 12);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.15;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ 
      color: 0x16a34a, 
      roughness: 0.4,
      metalness: 0.05 
    });

    const leafSpheres = [];
    for (let i = 0; i < 9; i++) {
      const geo = new THREE.SphereGeometry(0.32 + Math.random() * 0.15, 12, 12);
      const mesh = new THREE.Mesh(geo, foliageMat);
      const ang = (i / 9) * Math.PI * 2;
      mesh.position.set(Math.cos(ang) * 0.52, 1.6 + Math.sin(i) * 0.25, Math.sin(ang) * 0.52);
      mesh.castShadow = true;
      treeGroup.add(mesh);
      leafSpheres.push(mesh);
    }

    pot.add(treeGroup);
    scene.add(pot);

    let isGrowing = false;
    let growth = 0;
    let reqId;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      pot.rotation.y += 0.003;

      if (isGrowing) {
        if (growth < 1.0) {
          growth += 0.008;
          trunk.scale.set(1 + growth * 2.4, 1 + growth * 1.5, 1 + growth * 2.4);
          trunk.position.y = 1.15 + growth * 0.75;
          leafSpheres.forEach(l => {
            l.scale.set(1 + growth * 2.2, 1 + growth * 2.2, 1 + growth * 2.2);
          });
          camera.position.z = 8.0 + growth * 2.0;
        } else {
          isGrowing = false;
          if (onGrowthDone) onGrowthDone();
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    this.activeSims.station1 = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      },
      grow: () => { isGrowing = true; }
    };
  }

  // LAB 2: 3D Chloroplast Anatomy & Organelle Explorer
  initStation2(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(0, 8, 4);
    scene.add(dirLight);

    const chloroplast = new THREE.Group();

    // Double Membrane Cutaway
    const outerGeo = new THREE.SphereGeometry(2.3, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const outerMat = new THREE.MeshStandardMaterial({ 
      color: 0x22c55e, 
      transparent: true, 
      opacity: 0.35, 
      side: THREE.DoubleSide,
      roughness: 0.15
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.rotation.x = Math.PI;
    chloroplast.add(outer);

    // Stroma Bed
    const stromaGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.15, 32);
    const stromaMat = new THREE.MeshStandardMaterial({ 
      color: 0x86efac, 
      transparent: true, 
      opacity: 0.5 
    });
    const stroma = new THREE.Mesh(stromaGeo, stromaMat);
    stroma.position.y = 0.08;
    chloroplast.add(stroma);

    // Grana Disc Stacks (Thylakoids)
    const thylakoidMat = new THREE.MeshStandardMaterial({ 
      color: 0x15803d, 
      roughness: 0.3,
      metalness: 0.1 
    });
    const stackPoints = [
      { x: -0.9, z: -0.5, count: 6 },
      { x: 0.7, z: -0.6, count: 7 },
      { x: -0.3, z: 0.6, count: 7 },
      { x: 0.8, z: 0.4, count: 5 }
    ];

    const granaMeshes = [];
    stackPoints.forEach(pt => {
      for (let d = 0; d < pt.count; d++) {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 16), thylakoidMat);
        disc.position.set(pt.x, 0.18 + d * 0.09, pt.z);
        chloroplast.add(disc);
        granaMeshes.push(disc);
      }
    });

    scene.add(chloroplast);

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      chloroplast.rotation.y += 0.004;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    this.activeSims.station2 = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      },
      highlight: (part) => {
        if (part === 'membrane') {
          outerMat.opacity = 0.85;
          outerMat.color.setHex(0x38bdf8);
        } else if (part === 'stroma') {
          outerMat.opacity = 0.2;
          stromaMat.color.setHex(0xfbbf24);
        } else if (part === 'grana') {
          outerMat.opacity = 0.25;
          thylakoidMat.color.setHex(0x10b981);
        }
      }
    };
  }

  // LAB 3: Optics, Photons & Spectral Absorption 3D
  initStation3(containerId, onPhotonHit) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 7.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(2, 6, 4);
    scene.add(light);

    // Leaf Plate in Center
    const leafGeo = new THREE.BoxGeometry(2.4, 0.1, 2.0);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.y = -0.5;
    scene.add(leaf);

    // Photons
    const photons = [];
    const pGeo = new THREE.SphereGeometry(0.08, 8, 8);
    let activeColor = 0xdc2626; // Red default
    let activeMode = "red";

    for (let i = 0; i < 35; i++) {
      const pMesh = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: activeColor }));
      pMesh.position.set((Math.random() - 0.5) * 2.8, 3.2 + Math.random() * 2.5, (Math.random() - 0.5) * 2.2);
      scene.add(pMesh);
      photons.push({ mesh: pMesh, speed: 0.045 + Math.random() * 0.04, reflected: false });
    }

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      leaf.rotation.y += 0.002;

      photons.forEach(p => {
        if (!p.reflected) {
          p.mesh.position.y -= p.speed;
          if (p.mesh.position.y <= -0.4) {
            if (activeMode === "green") {
              p.reflected = true; // bounces up
            } else {
              p.mesh.position.y = 3.5 + Math.random() * 1.5;
              p.mesh.position.x = (Math.random() - 0.5) * 2.8;
              p.mesh.position.z = (Math.random() - 0.5) * 2.2;
              if (onPhotonHit) onPhotonHit(activeMode);
            }
          }
        } else {
          p.mesh.position.y += p.speed * 1.5;
          p.mesh.position.z += 0.03;
          if (p.mesh.position.y > 4.5) {
            p.mesh.position.set((Math.random() - 0.5) * 2.8, 3.5 + Math.random() * 1.5, (Math.random() - 0.5) * 2.2);
            p.reflected = false;
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    this.activeSims.station3 = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      },
      setLight: (colorName) => {
        activeMode = colorName;
        let hex = 0xdc2626;
        if (colorName === "green") hex = 0x16a34a;
        if (colorName === "blue") hex = 0x2563eb;
        photons.forEach(p => {
          p.mesh.material.color.setHex(hex);
          p.reflected = false;
        });
      }
    };
  }

  // LAB 4: 3D Molecular Synthesis (Water Splitting, ATP, Glucose)
  initStation4(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const light = new THREE.DirectionalLight(0xffffff, 0.85);
    light.position.set(2, 5, 4);
    scene.add(light);

    const stage = new THREE.Group();
    scene.add(stage);

    const makeH2O = () => {
      const g = new THREE.Group();
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
      g.add(o);
      const hMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), hMat);
      h1.position.set(0.65, 0.5, 0);
      const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), hMat);
      h2.position.set(-0.65, 0.5, 0);
      g.add(h1);
      g.add(h2);
      return g;
    };

    const makeATP = () => {
      const g = new THREE.Group();
      const ad = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.5), new THREE.MeshStandardMaterial({ color: 0x2563eb }));
      ad.position.x = -1.2;
      g.add(ad);
      for (let i = 0; i < 3; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0xb45309, emissiveIntensity: 0.3 }));
        p.position.x = -0.2 + i * 0.8;
        g.add(p);
      }
      return g;
    };

    const makeGlucose = () => {
      const g = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.18, 16, 6), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
      g.add(ring);
      for (let i = 0; i < 6; i++) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        const a = (i / 6) * Math.PI * 2;
        c.position.set(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0);
        g.add(c);
      }
      return g;
    };

    let activeMesh = makeH2O();
    stage.add(activeMesh);

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      activeMesh.rotation.y += 0.015;
      activeMesh.rotation.x += 0.008;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    this.activeSims.station4 = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      },
      setStep: (step) => {
        stage.remove(activeMesh);
        if (step === 1) activeMesh = makeH2O();
        if (step === 2) activeMesh = makeATP();
        if (step === 3) activeMesh = makeGlucose();
        stage.add(activeMesh);
      }
    };
  }

  // LAB 5: Glassware Beaker, Leaf & 4-Stage Iodine Color Test
  initStation5(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const spot = new THREE.DirectionalLight(0xffffff, 0.85);
    spot.position.set(0, 5, 4);
    scene.add(spot);

    // Beaker
    const beaker = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.1, 2.0, 24, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.92, opacity: 1, transparent: true, roughness: 0.1 })
    );
    scene.add(beaker);

    // Fluid
    const fluidMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 });
    const fluid = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.05, 1.2, 24), fluidMat);
    fluid.position.y = -0.35;
    scene.add(fluid);

    // Leaf
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
    const leafGeo = new THREE.BoxGeometry(0.8, 1.3, 0.04);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.y = -0.2;
    leaf.rotation.x = 0.2;
    scene.add(leaf);

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      leaf.rotation.y += 0.01;
      beaker.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    this.activeSims.station5 = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      },
      applyStage: (stage) => {
        if (stage === 1) { // Boiling water
          fluidMat.color.setHex(0x38bdf8);
          leafMat.color.setHex(0x15803d);
        } else if (stage === 2) { // Warm alcohol
          fluidMat.color.setHex(0xe2e8f0);
          leafMat.color.setHex(0xfef08a); // Bleached
        } else if (stage === 3) { // Water rinse
          fluidMat.color.setHex(0xbfdbfe);
          leafMat.color.setHex(0xf8fafc);
        } else if (stage === 4) { // Iodine reagent
          fluidMat.color.setHex(0xd97706);
          leafMat.color.setHex(0x1e1b4b); // Midnight blue/purple reaction!
        }
      }
    };
  }

  // LAB 6: 3D Smart Vertical Farming Chamber
  initStation6(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const chamberLight = new THREE.PointLight(0xa855f7, 1.2, 12);
    chamberLight.position.set(0, 3, 2);
    scene.add(chamberLight);

    const farmGroup = new THREE.Group();
    scene.add(farmGroup);

    // 3 Tiered Racks
    for (let tier = 0; tier < 3; tier++) {
      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.1, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
      );
      rack.position.y = -1.2 + tier * 1.3;
      farmGroup.add(rack);

      // LED strip above each tier
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.05, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xec4899 })
      );
      led.position.set(0, rack.position.y + 1.15, 0);
      farmGroup.add(led);

      // Crop row
      for (let c = -1.3; c <= 1.3; c += 0.55) {
        const crop = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3 })
        );
        crop.position.set(c, rack.position.y + 0.22, 0);
        farmGroup.add(crop);
      }
    }

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      farmGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    this.activeSims.station6 = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      },
      setLightHue: (hexColor) => {
        chamberLight.color.setHex(hexColor);
      }
    };
  }

  // ==========================================
  // RELATIONSHIP: Chloroplast & Mitochondria Interchange
  // ==========================================
  initRelationship(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.activeSims.relationship && this.activeSims.relationship.cleanup) {
      this.activeSims.relationship.cleanup();
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f7f0);

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 380;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Left: Chloroplast (Green disc)
    const chloroGroup = new THREE.Group();
    chloroGroup.position.set(-3.2, 0, 0);
    mainGroup.add(chloroGroup);

    const chloroGeo = new THREE.SphereGeometry(1.4, 32, 16);
    chloroGeo.scale(1, 0.55, 1);
    const chloroMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const chloroplastMesh = new THREE.Mesh(chloroGeo, chloroMat);
    chloroGroup.add(chloroplastMesh);

    // Thylakoid stacks inside chloroplast
    for (let i = -0.5; i <= 0.5; i += 0.5) {
      const thyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.2 })
      );
      thyl.position.set(i * 1.2, 0, 0);
      chloroGroup.add(thyl);
    }

    // Right: Mitochondria (Amber/Orange capsule)
    const mitoGroup = new THREE.Group();
    mitoGroup.position.set(3.2, 0, 0);
    mainGroup.add(mitoGroup);

    const mitoGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.2, 32);
    mitoGeo.rotateZ(Math.PI / 2);
    const mitoMat = new THREE.MeshStandardMaterial({
      color: 0xe65100,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const mitoMesh = new THREE.Mesh(mitoGeo, mitoMat);
    mitoGroup.add(mitoMesh);

    // Inner folded cristae representation
    for (let c = -0.6; c <= 0.6; c += 0.4) {
      const crista = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.08, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xffb74d })
      );
      crista.position.set(c * 1.4, 0, 0);
      crista.rotateY(Math.PI / 2);
      mitoGroup.add(crista);
    }

    // Circulating exchange particles (Glucose & O2 top arc, CO2 & H2O bottom arc)
    const particleCount = 28;
    const particles = [];
    const particleGroup = new THREE.Group();
    mainGroup.add(particleGroup);

    const pMatGreen = new THREE.MeshBasicMaterial({ color: 0x2e7d32 }); // Glucose/O2
    const pMatBlue = new THREE.MeshBasicMaterial({ color: 0x0288d1 });  // H2O/CO2
    const pMatGold = new THREE.MeshBasicMaterial({ color: 0xfbc02d });  // ATP energy

    for (let i = 0; i < particleCount; i++) {
      const isTopArc = i < particleCount / 2;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        isTopArc ? pMatGreen : pMatBlue
      );
      const angle = (i / (particleCount / 2)) * Math.PI;
      sphere.userData = {
        arc: isTopArc ? 'top' : 'bottom',
        t: Math.random(),
        speed: 0.006 + Math.random() * 0.004
      };
      particleGroup.add(sphere);
      particles.push(sphere);
    }

    let reqId;
    let focusMode = 'all';

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      chloroGroup.rotation.y += 0.008;
      mitoGroup.rotation.y += 0.008;

      particles.forEach((p) => {
        p.userData.t += p.userData.speed;
        if (p.userData.t > 1) p.userData.t = 0;

        const t = p.userData.t;
        if (p.userData.arc === 'top') {
          // Flow from Chloroplast (-3.2) to Mitochondrion (+3.2)
          const x = -3.2 + t * 6.4;
          const y = Math.sin(t * Math.PI) * 1.5;
          p.position.set(x, y + 0.3, 0);
        } else {
          // Flow from Mitochondrion (+3.2) to Chloroplast (-3.2)
          const x = 3.2 - t * 6.4;
          const y = -Math.sin(t * Math.PI) * 1.5;
          p.position.set(x, y - 0.3, 0);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 700;
      const h = container.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    this.activeSims.relationship = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      },
      setStep: (step) => {
        if (step === 1) {
          // Reactants (H2O + CO2)
          particles.forEach(p => {
            p.material = p.userData.arc === 'bottom' ? pMatBlue : pMatBlue;
            p.scale.set(1.4, 1.4, 1.4);
          });
          chloroplastMesh.scale.set(1.15, 0.65, 1.15);
          mitoMesh.scale.set(1, 1, 1);
        } else if (step === 2) {
          // ATP energy batteries
          particles.forEach(p => {
            p.material = pMatGold;
            p.scale.set(1.6, 1.6, 1.6);
          });
        } else if (step === 3) {
          // Glucose + O2 flow
          particles.forEach(p => {
            p.material = p.userData.arc === 'top' ? pMatGreen : pMatGreen;
            p.scale.set(1.4, 1.4, 1.4);
          });
          mitoMesh.scale.set(1.2, 1.2, 1.2);
          chloroplastMesh.scale.set(1, 0.55, 1);
        }
      }
    };
  }
}

export const sims3D = new Simulations3D();
