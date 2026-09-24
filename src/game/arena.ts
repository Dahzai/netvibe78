import * as THREE from 'three';

export interface TorchData {
  light: THREE.PointLight;
  flameMesh: THREE.Mesh;
  baseIntensity: number;
  phase: number;
  particles: THREE.Points;
  particlePositions: Float32Array;
}

export interface ArenaScene {
  group: THREE.Group;
  torches: TorchData[];
  update: (delta: number) => void;
  sparkBurst: (pos: THREE.Vector3, isSparks?: boolean) => void;
  groundDust: (pos: THREE.Vector3) => void;
}

export function createCastleArena(): ArenaScene {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  // Load generated textures
  const floorTexture = textureLoader.load('/src/assets/images/stone_floor_tiles_1790230590477.jpg');
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(12, 12);

  const bannerTexture = textureLoader.load('/src/assets/images/banner_lion_crest_1790230572159.jpg');

  const skyTexture = textureLoader.load('/src/assets/images/skybox_castle_moon_1790230553601.jpg');

  // 1. SKY SPHERE / PANORAMIC BACKDROP
  const skyGeo = new THREE.SphereGeometry(95, 32, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  skyMesh.position.y = 15;
  group.add(skyMesh);

  // 2. COURTYARD FLOOR
  const floorGeo = new THREE.PlaneGeometry(50, 50, 24, 24);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.88,
    metalness: 0.12,
    color: 0x8a929a,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI * 0.5;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Courtyard boundary stones (curb / low wall ring)
  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x474c54,
    roughness: 0.9,
    metalness: 0.1,
  });

  // Materials for stone walls & columns
  const stoneWallMat = new THREE.MeshStandardMaterial({
    color: 0x4a525d,
    roughness: 0.92,
    metalness: 0.08,
  });

  const stoneRubbleMat = new THREE.MeshStandardMaterial({
    color: 0x545d68,
    roughness: 0.95,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x3d271d,
    roughness: 0.85,
    metalness: 0.05,
  });

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x2b2e34,
    roughness: 0.6,
    metalness: 0.8,
  });

  // 3. BROKEN STONE WALLS & BATTLEMENTS AROUND ARENA
  const arenaRadius = 22;
  const wallSegments = 16;
  for (let i = 0; i < wallSegments; i++) {
    const angle = (i / wallSegments) * Math.PI * 2;
    const x = Math.cos(angle) * arenaRadius;
    const z = Math.sin(angle) * arenaRadius;
    const wallHeight = 5.5 + Math.sin(i * 1.7) * 2.2; // Varied ruined height

    // Ruined wall section
    const wallGeo = new THREE.BoxGeometry(8.5, wallHeight, 1.8);
    const wall = new THREE.Mesh(wallGeo, stoneWallMat);
    wall.position.set(x, wallHeight * 0.5, z);
    wall.lookAt(0, wallHeight * 0.5, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);

    // Crenellations / broken teeth on walls (every 2nd)
    if (i % 2 === 0) {
      const crenGeo = new THREE.BoxGeometry(1.6, 1.2, 1.9);
      const cren = new THREE.Mesh(crenGeo, stoneWallMat);
      cren.position.set(x * 0.98, wallHeight + 0.6, z * 0.98);
      cren.lookAt(0, wallHeight + 0.6, 0);
      cren.castShadow = true;
      group.add(cren);
    }
  }

  // 4. DESTROYED COLUMNS & FALLEN PILLARS
  const columnPositions = [
    { x: -9, z: -8, height: 7.2, broken: false },
    { x: 9, z: -8, height: 4.5, broken: true },
    { x: -11, z: 7, height: 3.2, broken: true },
    { x: 10, z: 9, height: 6.8, broken: false },
    { x: -14, z: -1, height: 5.0, broken: true },
    { x: 13, z: 2, height: 7.5, broken: false },
  ];

  columnPositions.forEach((col) => {
    // Column base pedestal
    const baseGeo = new THREE.BoxGeometry(1.6, 0.8, 1.6);
    const base = new THREE.Mesh(baseGeo, stoneWallMat);
    base.position.set(col.x, 0.4, col.z);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Fluted cylindrical column
    const colGeo = new THREE.CylinderGeometry(0.55, 0.62, col.height, 12);
    const column = new THREE.Mesh(colGeo, stoneWallMat);
    column.position.set(col.x, 0.8 + col.height * 0.5, col.z);
    column.castShadow = true;
    column.receiveShadow = true;
    group.add(column);

    if (col.broken) {
      // Fallen shattered column segment on ground nearby
      const fallenGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.2, 10);
      const fallen = new THREE.Mesh(fallenGeo, stoneWallMat);
      fallen.position.set(col.x + 1.4, 0.4, col.z + 0.9);
      fallen.rotation.z = Math.PI * 0.48;
      fallen.rotation.y = 0.5;
      fallen.castShadow = true;
      fallen.receiveShadow = true;
      group.add(fallen);

      // Cracked drum chunk
      const drumGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.8, 10);
      const drum = new THREE.Mesh(drumGeo, stoneWallMat);
      drum.position.set(col.x - 1.2, 0.35, col.z - 0.7);
      drum.rotation.x = Math.PI * 0.45;
      drum.castShadow = true;
      group.add(drum);
    } else {
      // Column capital
      const capGeo = new THREE.BoxGeometry(1.5, 0.6, 1.5);
      const cap = new THREE.Mesh(capGeo, stoneWallMat);
      cap.position.set(col.x, 0.8 + col.height + 0.3, col.z);
      cap.castShadow = true;
      group.add(cap);
    }
  });

  // 5. OLD WOODEN SCAFFOLDING & BARRICADES
  const scaffoldLocations = [
    { x: -16, z: -10, rotY: 0.4 },
    { x: 15, z: -12, rotY: -0.6 },
    { x: -15, z: 12, rotY: 2.2 },
  ];

  scaffoldLocations.forEach((scaff) => {
    const scaffGroup = new THREE.Group();
    scaffGroup.position.set(scaff.x, 0, scaff.z);
    scaffGroup.rotation.y = scaff.rotY;

    // Upright wood poles
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 5, 6);
    const p1 = new THREE.Mesh(poleGeo, woodMat);
    p1.position.set(-1.4, 2.5, -0.6);
    const p2 = new THREE.Mesh(poleGeo, woodMat);
    p2.position.set(1.4, 2.5, -0.6);
    const p3 = new THREE.Mesh(poleGeo, woodMat);
    p3.position.set(-1.4, 2.5, 0.6);
    const p4 = new THREE.Mesh(poleGeo, woodMat);
    p4.position.set(1.4, 2.5, 0.6);
    scaffGroup.add(p1, p2, p3, p4);

    // Cross planks / floor planks
    const plankGeo = new THREE.BoxGeometry(3.4, 0.12, 1.5);
    const plank1 = new THREE.Mesh(plankGeo, woodMat);
    plank1.position.set(0, 2.8, 0);
    scaffGroup.add(plank1);

    // Diagonal support beam
    const diagGeo = new THREE.BoxGeometry(0.12, 3.8, 0.12);
    const diag = new THREE.Mesh(diagGeo, woodMat);
    diag.position.set(0, 2.5, 0.6);
    diag.rotation.z = 0.6;
    scaffGroup.add(diag);

    group.add(scaffGroup);
  });

  // Wooden spiked barricade on courtyard edge
  const barricadeGeo = new THREE.CylinderGeometry(0.08, 0.12, 2.4, 6);
  for (let b = 0; b < 6; b++) {
    const spike = new THREE.Mesh(barricadeGeo, woodMat);
    spike.position.set(16 + b * 0.4, 0.9, 14 + (b % 2) * 0.3);
    spike.rotation.x = 0.8 * (b % 2 === 0 ? 1 : -0.7);
    spike.rotation.z = 0.35;
    spike.castShadow = true;
    group.add(spike);
  }

  // 6. SCATTERED STONES & BOULDERS
  const stoneGeos = [
    new THREE.DodecahedronGeometry(0.45, 1),
    new THREE.DodecahedronGeometry(0.75, 1),
    new THREE.DodecahedronGeometry(0.32, 1),
  ];
  for (let s = 0; s < 28; s++) {
    const geo = stoneGeos[s % stoneGeos.length];
    const rock = new THREE.Mesh(geo, stoneRubbleMat);
    const rad = 7 + Math.random() * 12;
    const ang = Math.random() * Math.PI * 2;
    rock.position.set(Math.cos(ang) * rad, 0.25 + Math.random() * 0.2, Math.sin(ang) * rad);
    rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    rock.scale.set(1 + Math.random() * 0.6, 0.7 + Math.random() * 0.5, 1 + Math.random() * 0.6);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  }

  // 7. MEDIEVAL HERALDIC BANNERS HANGING FROM WALLS
  const bannerMat = new THREE.MeshStandardMaterial({
    map: bannerTexture,
    side: THREE.DoubleSide,
    roughness: 0.85,
    metalness: 0.05,
  });

  const bannerGeo = new THREE.PlaneGeometry(2.4, 4.2, 4, 8);
  const bannerPositions = [
    { x: 0, z: -21.1, rotY: 0 },
    { x: -15, z: -14.8, rotY: Math.PI * 0.25 },
    { x: 15, z: -14.8, rotY: -Math.PI * 0.25 },
    { x: -21.1, z: 0, rotY: Math.PI * 0.5 },
    { x: 21.1, z: 0, rotY: -Math.PI * 0.5 },
  ];

  bannerPositions.forEach((bp) => {
    // Iron horizontal rod
    const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.8, 6);
    const rod = new THREE.Mesh(rodGeo, ironMat);
    rod.rotation.z = Math.PI * 0.5;
    rod.position.set(bp.x, 5.8, bp.z);
    rod.rotation.y = bp.rotY;
    group.add(rod);

    const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
    bannerMesh.position.set(bp.x, 3.8, bp.z + (bp.z < 0 ? 0.1 : -0.1));
    bannerMesh.rotation.y = bp.rotY;
    bannerMesh.castShadow = true;
    group.add(bannerMesh);
  });

  // 8. BURNING TORCHES & IRON BRAZIERS WITH DYNAMIC LIGHTS & PARTICLES
  const torches: TorchData[] = [];
  const torchLocations = [
    { x: -8, y: 3.2, z: -12 },
    { x: 8, y: 3.2, z: -12 },
    { x: -14, y: 3.2, z: 4 },
    { x: 14, y: 3.2, z: 4 },
    { x: 0, y: 3.2, z: 15 },
    { x: -7, y: 2.2, z: -3 }, // Standalone courtyard iron brazier
    { x: 7, y: 2.2, z: 5 },  // Standalone courtyard iron brazier
  ];

  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.9,
  });

  torchLocations.forEach((tloc, index) => {
    const isBrazier = index >= 5;

    if (isBrazier) {
      // Iron tripodal brazier on ground
      const brazierBowlGeo = new THREE.CylinderGeometry(0.7, 0.35, 0.45, 8);
      const bowl = new THREE.Mesh(brazierBowlGeo, ironMat);
      bowl.position.set(tloc.x, 1.3, tloc.z);
      bowl.castShadow = true;
      group.add(bowl);

      // Charcoal embers inside bowl
      const coalGeo = new THREE.SphereGeometry(0.5, 6, 4);
      const coal = new THREE.Mesh(coalGeo, new THREE.MeshBasicMaterial({ color: 0xff3b00 }));
      coal.position.set(tloc.x, 1.4, tloc.z);
      group.add(coal);
    } else {
      // Iron wall sconce
      const sconceGeo = new THREE.CylinderGeometry(0.05, 0.03, 0.9, 6);
      const sconce = new THREE.Mesh(sconceGeo, ironMat);
      sconce.position.set(tloc.x, tloc.y - 0.3, tloc.z);
      sconce.rotation.z = tloc.x < 0 ? -0.3 : 0.3;
      group.add(sconce);
    }

    // Flame mesh billboard
    const flameGeo = new THREE.ConeGeometry(isBrazier ? 0.38 : 0.22, isBrazier ? 0.75 : 0.48, 6);
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(tloc.x, isBrazier ? 1.7 : tloc.y + 0.15, tloc.z);
    group.add(flame);

    // Flickering PointLight (warm fiery orange)
    const baseIntensity = isBrazier ? 2.8 : 2.0;
    const light = new THREE.PointLight(0xff7722, baseIntensity, isBrazier ? 18 : 14, 1.4);
    light.position.set(tloc.x, isBrazier ? 1.9 : tloc.y + 0.3, tloc.z);
    light.castShadow = index < 3; // Shadows on first 3 to preserve performance
    group.add(light);

    // Rising spark embers particle system
    const pCount = 20;
    const pPositions = new Float32Array(pCount * 3);
    for (let p = 0; p < pCount; p++) {
      pPositions[p * 3] = tloc.x + (Math.random() - 0.5) * 0.4;
      pPositions[p * 3 + 1] = (isBrazier ? 1.7 : tloc.y) + Math.random() * 1.5;
      pPositions[p * 3 + 2] = tloc.z + (Math.random() - 0.5) * 0.4;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffbb44,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);

    torches.push({
      light,
      flameMesh: flame,
      baseIntensity,
      phase: Math.random() * 10,
      particles,
      particlePositions: pPositions,
    });
  });

  // 9. ATMOSPHERIC GROUND MIST / VOLUMETRIC FOG PLANES
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (let m = 0; m < 5; m++) {
    const mistGeo = new THREE.PlaneGeometry(36, 36);
    const mist = new THREE.Mesh(mistGeo, mistMat);
    mist.rotation.x = -Math.PI * 0.5;
    mist.position.set(0, 0.2 + m * 0.35, 0);
    group.add(mist);
  }

  // 10. DYNAMIC IMPACT SPARK BURST POOL
  const maxSparks = 60;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPositions = new Float32Array(maxSparks * 3);
  const sparkVelocities: THREE.Vector3[] = [];
  for (let i = 0; i < maxSparks; i++) {
    sparkPositions[i * 3] = 0;
    sparkPositions[i * 3 + 1] = -100; // Hidden initially
    sparkPositions[i * 3 + 2] = 0;
    sparkVelocities.push(new THREE.Vector3());
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

  const sparkMat = new THREE.PointsMaterial({
    color: 0xffe680,
    size: 0.18,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sparkSystem = new THREE.Points(sparkGeo, sparkMat);
  group.add(sparkSystem);

  let sparkLife = 0;

  const sparkBurst = (pos: THREE.Vector3, isSparks: boolean = true) => {
    sparkLife = 1.0;
    sparkMat.color.setHex(isSparks ? 0xffea88 : 0xaa2222); // Sparks or blood
    sparkMat.size = isSparks ? 0.22 : 0.16;
    sparkMat.opacity = 1.0;

    const posAttr = sparkGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < maxSparks; i++) {
      posAttr.setXYZ(i, pos.x, pos.y, pos.z);
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;
      const up = 1.5 + Math.random() * 3.5;
      sparkVelocities[i].set(
        Math.cos(angle) * speed,
        up,
        Math.sin(angle) * speed
      );
    }
    posAttr.needsUpdate = true;
  };

  // Ground dust cloud on dodge/heavy stomp
  const dustGeo = new THREE.RingGeometry(0.3, 1.8, 16);
  const dustMat = new THREE.MeshBasicMaterial({
    color: 0xa1a1aa,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const dustMesh = new THREE.Mesh(dustGeo, dustMat);
  dustMesh.rotation.x = -Math.PI * 0.5;
  dustMesh.position.y = 0.05;
  group.add(dustMesh);

  let dustLife = 0;
  const groundDust = (pos: THREE.Vector3) => {
    dustMesh.position.set(pos.x, 0.08, pos.z);
    dustMesh.scale.set(0.4, 0.4, 0.4);
    dustLife = 1.0;
    dustMat.opacity = 0.45;
  };

  // Arena loop update
  let elapsed = 0;
  const update = (delta: number) => {
    elapsed += delta;

    // Animate torches & braziers with realistic natural flicker
    torches.forEach((torch, idx) => {
      const flicker =
        Math.sin(elapsed * 12 + torch.phase) * 0.18 +
        Math.sin(elapsed * 27 + torch.phase * 2) * 0.12 +
        (Math.random() - 0.5) * 0.08;

      torch.light.intensity = torch.baseIntensity * (1 + flicker);
      torch.flameMesh.scale.set(
        1 + flicker * 0.3,
        1 + flicker * 0.5,
        1 + flicker * 0.3
      );

      // Animate rising spark particles
      const posAttr = torch.particles.geometry.attributes.position as THREE.BufferAttribute;
      const arr = torch.particlePositions;
      const baseY = torch.light.position.y - 0.2;
      for (let p = 0; p < arr.length / 3; p++) {
        arr[p * 3 + 1] += delta * (1.2 + Math.random() * 0.8);
        arr[p * 3] += (Math.random() - 0.5) * 0.03;
        arr[p * 3 + 2] += (Math.random() - 0.5) * 0.03;

        // Reset if reached ceiling
        if (arr[p * 3 + 1] > baseY + 2.2) {
          arr[p * 3 + 1] = baseY;
          arr[p * 3] = torch.light.position.x + (Math.random() - 0.5) * 0.3;
          arr[p * 3 + 2] = torch.light.position.z + (Math.random() - 0.5) * 0.3;
        }
      }
      posAttr.needsUpdate = true;
    });

    // Update sparks
    if (sparkLife > 0) {
      sparkLife -= delta * 2.8;
      sparkMat.opacity = Math.max(0, sparkLife);

      const posAttr = sparkGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < maxSparks; i++) {
        sparkVelocities[i].y -= 9.8 * delta; // Gravity
        const x = posAttr.getX(i) + sparkVelocities[i].x * delta;
        const y = Math.max(0.05, posAttr.getY(i) + sparkVelocities[i].y * delta);
        const z = posAttr.getZ(i) + sparkVelocities[i].z * delta;
        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;
    }

    // Update dust ring expansion
    if (dustLife > 0) {
      dustLife -= delta * 2.2;
      const curScale = dustMesh.scale.x + delta * 3.5;
      dustMesh.scale.set(curScale, curScale, curScale);
      dustMat.opacity = Math.max(0, dustLife * 0.45);
    }
  };

  return {
    group,
    torches,
    update,
    sparkBurst,
    groundDust,
  };
}
