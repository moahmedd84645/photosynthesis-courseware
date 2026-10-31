// Clean Studio 3D Simulations using Three.js (Light Theme)
export class Simulations3D {
  constructor() {
    this.activeSims = {};
  }

  // Station 1: Willow Tree & Analytical Scale Simulation
  initStation1(containerId, onGrowthDone) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); // Clean laboratory light slate

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xffffff, 0.9);
    mainSun.position.set(4, 10, 6);
    mainSun.castShadow = true;
    scene.add(mainSun);

    const softFill = new THREE.PointLight(0x10b981, 0.3, 15);
    softFill.position.set(-4, 3, 2);
    scene.add(softFill);

    // Laboratory Desk / Scale Base
    const baseGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.25, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const desk = new THREE.Mesh(baseGeo, baseMat);
    desk.position.y = -1.1;
    desk.receiveShadow = true;
    scene.add(desk);

    // Ceramic Pot
    const potGeo = new THREE.CylinderGeometry(1.3, 0.85, 1.4, 24);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.6 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = -0.3;
    pot.castShadow = true;

    // Soil
    const soilGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.08, 24);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 0.42;
    pot.add(soil);

    // Tree Group
    const treeGroup = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.14, 1.6, 12);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.2;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ 
      color: 0x059669, 
      roughness: 0.4,
      metalness: 0.1 
    });

    const leafSpheres = [];
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.SphereGeometry(0.35 + Math.random() * 0.15, 8, 8);
      const mesh = new THREE.Mesh(geo, foliageMat);
      const ang = (i / 8) * Math.PI * 2;
      mesh.position.set(Math.cos(ang) * 0.55, 1.7 + Math.sin(i) * 0.25, Math.sin(ang) * 0.55);
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
          growth += 0.007;
          trunk.scale.set(1 + growth * 2.5, 1 + growth * 1.5, 1 + growth * 2.5);
          trunk.position.y = 1.2 + growth * 0.8;
          leafSpheres.forEach(l => {
            l.scale.set(1 + growth * 2.2, 1 + growth * 2.2, 1 + growth * 2.2);
            l.position.y = (l.position.y) + growth * 0.01;
          });
          camera.position.z = 8.5 + growth * 2.2;
        } else {
          isGrowing = false;
          if (onGrowthDone) onGrowthDone();
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    this.activeSims.station1 = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
        renderer.dispose();
      },
      grow: () => { isGrowing = true; }
    };
  }

  // Station 2: Clean Studio Chloroplast Anatomy & Photon Physics
  initStation2(containerId, onPhotonAbsorb) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 8, 4);
    scene.add(dirLight);

    const chloroplast = new THREE.Group();

    // Double Membrane Cutaway
    const outerGeo = new THREE.SphereGeometry(2.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.62);
    const outerMat = new THREE.MeshStandardMaterial({ 
      color: 0x10b981, 
      transparent: true, 
      opacity: 0.35, 
      side: THREE.DoubleSide,
      roughness: 0.1
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.rotation.x = Math.PI;
    chloroplast.add(outer);

    // Stroma Bed
    const stromaGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.15, 32);
    const stromaMat = new THREE.MeshStandardMaterial({ 
      color: 0x6ee7b7, 
      transparent: true, 
      opacity: 0.45 
    });
    const stroma = new THREE.Mesh(stromaGeo, stromaMat);
    stroma.position.y = 0.08;
    chloroplast.add(stroma);

    // Grana Disc Stacks
    const thylakoidMat = new THREE.MeshStandardMaterial({ 
      color: 0x047857, 
      roughness: 0.3,
      metalness: 0.15 
    });
    const stackPoints = [
      { x: -0.9, z: -0.5, count: 6 },
      { x: 0.7, z: -0.6, count: 7 },
      { x: -0.3, z: 0.6, count: 7 },
      { x: 0.8, z: 0.4, count: 5 }
    ];

    stackPoints.forEach(pt => {
      for (let d = 0; d < pt.count; d++) {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 16), thylakoidMat);
        disc.position.set(pt.x, 0.18 + d * 0.09, pt.z);
        chloroplast.add(disc);
      }
    });

    scene.add(chloroplast);

    // Photon Streams
    const photons = [];
    const pGeo = new THREE.SphereGeometry(0.07, 8, 8);
    let activeColor = 0x2563eb; // blue
    let mode = "blue";

    for (let i = 0; i < 40; i++) {
      const pMesh = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: activeColor }));
      pMesh.position.set((Math.random() - 0.5) * 3.8, 3.5 + Math.random() * 2.5, (Math.random() - 0.5) * 3.8);
      scene.add(pMesh);
      photons.push({ mesh: pMesh, speed: 0.04 + Math.random() * 0.04, reflected: false });
    }

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      chloroplast.rotation.y += 0.003;

      photons.forEach(p => {
        if (!p.reflected) {
          p.mesh.position.y -= p.speed;
          if (p.mesh.position.y <= 0.35) {
            if (mode === "green") {
              p.reflected = true; // bounce back to eyes
            } else {
              p.mesh.position.y = 4.5 + Math.random() * 1.5;
              p.mesh.position.x = (Math.random() - 0.5) * 3.8;
              p.mesh.position.z = (Math.random() - 0.5) * 3.8;
              if (onPhotonAbsorb) onPhotonAbsorb(mode);
            }
          }
        } else {
          p.mesh.position.y += p.speed * 1.6;
          p.mesh.position.z += 0.03;
          if (p.mesh.position.y > 5.5) {
            p.mesh.position.set((Math.random() - 0.5) * 3.8, 4 + Math.random() * 1.5, (Math.random() - 0.5) * 3.8);
            p.reflected = false;
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    this.activeSims.station2 = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
        renderer.dispose();
      },
      setLight: (colorName) => {
        mode = colorName;
        let hex = 0x2563eb;
        if (colorName === "red") hex = 0xdc2626;
        if (colorName === "green") hex = 0x16a34a;
        photons.forEach(p => {
          p.mesh.material.color.setHex(hex);
          p.reflected = false;
        });
      }
    };
  }

  // Station 3: Molecular Synthesis 3D Factory
  initStation3(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
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
      const ad = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.5), new THREE.MeshStandardMaterial({ color: 0x4f46e5 }));
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
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.18, 16, 6), new THREE.MeshStandardMaterial({ color: 0x059669 }));
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

    this.activeSims.station3 = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
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

  // Station 4: Glassware Bench & Iodine Reaction
  initStation4(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const spot = new THREE.DirectionalLight(0xffffff, 0.8);
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

    this.activeSims.station4 = {
      cleanup: () => {
        cancelAnimationFrame(reqId);
        renderer.dispose();
      },
      applyStage: (stage) => {
        if (stage === 1) { // Boiling
          fluidMat.color.setHex(0x38bdf8);
          leafMat.color.setHex(0x15803d);
        } else if (stage === 2) { // Alcohol
          fluidMat.color.setHex(0xe2e8f0);
          leafMat.color.setHex(0xfef08a); // pale white/yellow
        } else if (stage === 3) { // Water rinse
          fluidMat.color.setHex(0xbfdbfe);
          leafMat.color.setHex(0xf8fafc);
        } else if (stage === 4) { // Iodine
          fluidMat.color.setHex(0xd97706);
          leafMat.color.setHex(0x1e1b4b); // Midnight blue/black starch reaction
        }
      }
    };
  }
}

export const sims3D = new Simulations3D();
