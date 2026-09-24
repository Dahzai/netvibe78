import * as THREE from 'three';
import { WarriorType } from './types.ts';

export interface WarriorRig {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftShoulder: THREE.Group;
  leftArm: THREE.Group;
  leftForearm: THREE.Group;
  leftHand: THREE.Group;
  rightShoulder: THREE.Group;
  rightArm: THREE.Group;
  rightForearm: THREE.Group;
  rightHand: THREE.Group;
  leftThigh: THREE.Group;
  leftShin: THREE.Group;
  leftFoot: THREE.Group;
  rightThigh: THREE.Group;
  rightShin: THREE.Group;
  rightFoot: THREE.Group;
  weapon: THREE.Group;
  weaponTip: THREE.Object3D;
  trailMesh: THREE.Mesh;
  updateTrail: (active: boolean) => void;
  type: WarriorType;
}

export function createWarriorModel(type: WarriorType): WarriorRig {
  const root = new THREE.Group();
  root.castShadow = true;

  // Materials tailored for swordsman (polished knight steel) vs axeman (blackened heavy iron)
  const isSword = type === 'swordsman';

  const armorSteel = new THREE.MeshStandardMaterial({
    color: isSword ? 0xb0b8c4 : 0x484c54,
    metalness: 0.88,
    roughness: isSword ? 0.32 : 0.48,
  });

  const armorTrim = new THREE.MeshStandardMaterial({
    color: isSword ? 0xd4af37 : 0x7c2d12, // Gold vs rusted bronze
    metalness: 0.85,
    roughness: 0.38,
  });

  const clothTabard = new THREE.MeshStandardMaterial({
    color: isSword ? 0x1e293b : 0x450a0a, // Dark royal navy vs dark oxblood crimson
    roughness: 0.82,
    metalness: 0.08,
  });

  const leatherStraps = new THREE.MeshStandardMaterial({
    color: 0x271810,
    roughness: 0.75,
    metalness: 0.1,
  });

  const chainmail = new THREE.MeshStandardMaterial({
    color: 0x5a6068,
    roughness: 0.65,
    metalness: 0.75,
  });

  const woodHaft = new THREE.MeshStandardMaterial({
    color: 0x422616,
    roughness: 0.78,
    metalness: 0.05,
  });

  const bladeSteel = new THREE.MeshStandardMaterial({
    color: 0xdde3ea,
    metalness: 0.95,
    roughness: 0.18,
  });

  // Pelvis / Body center
  const body = new THREE.Group();
  body.position.y = 0.95; // Hip height
  root.add(body);

  // Pelvis mesh (Armored fauld & belt)
  const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.22, 8);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, armorSteel);
  pelvisMesh.castShadow = true;
  body.add(pelvisMesh);

  // Armored belt
  const beltGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 8);
  const beltMesh = new THREE.Mesh(beltGeo, armorTrim);
  body.add(beltMesh);

  // Tabard cloth / Fauld hanging down
  const tabardGeo = new THREE.BoxGeometry(0.28, 0.38, 0.28);
  const tabardMesh = new THREE.Mesh(tabardGeo, clothTabard);
  tabardMesh.position.y = -0.15;
  body.add(tabardMesh);

  // Chainmail skirt under fauld
  const skirtGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.32, 8);
  const skirtMesh = new THREE.Mesh(skirtGeo, chainmail);
  skirtMesh.position.y = -0.16;
  body.add(skirtMesh);

  // Torso / Cuirass
  const torso = new THREE.Group();
  torso.position.y = 0.12;
  body.add(torso);

  // Main breastplate (Chest plate tapered down)
  const breastplateGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.42, 8);
  const breastplateMesh = new THREE.Mesh(breastplateGeo, armorSteel);
  breastplateMesh.position.y = 0.22;
  breastplateMesh.castShadow = true;
  torso.add(breastplateMesh);

  // Armor central ridge (Plackart)
  const ridgeGeo = new THREE.BoxGeometry(0.06, 0.38, 0.32);
  const ridgeMesh = new THREE.Mesh(ridgeGeo, armorTrim);
  ridgeMesh.position.y = 0.22;
  torso.add(ridgeMesh);

  // Gorget / Neck guard
  const gorgetGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.1, 8);
  const gorgetMesh = new THREE.Mesh(gorgetGeo, armorSteel);
  gorgetMesh.position.y = 0.46;
  torso.add(gorgetMesh);

  // Head & Helmet
  const head = new THREE.Group();
  head.position.y = 0.52;
  torso.add(head);

  // Armored Great Helm / Bascinet
  const helmetGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.24, 8);
  const helmetMesh = new THREE.Mesh(helmetGeo, armorSteel);
  helmetMesh.position.y = 0.12;
  helmetMesh.castShadow = true;
  head.add(helmetMesh);

  // Helmet Dome Top
  const domeGeo = new THREE.SphereGeometry(0.13, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const domeMesh = new THREE.Mesh(domeGeo, armorSteel);
  domeMesh.position.y = 0.24;
  head.add(domeMesh);

  // Helmet Visor / Eye slit
  const visorGeo = new THREE.BoxGeometry(0.18, 0.04, 0.12);
  const visorMesh = new THREE.Mesh(visorGeo, new THREE.MeshBasicMaterial({ color: 0x050505 }));
  visorMesh.position.set(0, 0.12, 0.11);
  head.add(visorMesh);

  // Helmet crest or horns (swordsman has crest ridge, axeman has iron ridge spike)
  const crestGeo = isSword
    ? new THREE.BoxGeometry(0.03, 0.12, 0.24)
    : new THREE.BoxGeometry(0.04, 0.16, 0.18);
  const crestMesh = new THREE.Mesh(crestGeo, armorTrim);
  crestMesh.position.set(0, 0.28, 0);
  head.add(crestMesh);

  // Shoulders & Pauldrons
  // Left Shoulder
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.32, 0.38, 0);
  torso.add(leftShoulder);

  const pauldronGeo = new THREE.SphereGeometry(0.14, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const leftPauldron = new THREE.Mesh(pauldronGeo, armorSteel);
  leftPauldron.rotation.z = 0.35;
  leftPauldron.castShadow = true;
  leftShoulder.add(leftPauldron);

  const leftArm = new THREE.Group();
  leftShoulder.add(leftArm);

  const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.26, 6);
  const leftArmMesh = new THREE.Mesh(armGeo, chainmail);
  leftArmMesh.position.y = -0.13;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  const leftForearm = new THREE.Group();
  leftForearm.position.y = -0.26;
  leftArm.add(leftForearm);

  const forearmGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.24, 6);
  const leftForearmMesh = new THREE.Mesh(forearmGeo, armorSteel);
  leftForearmMesh.position.y = -0.12;
  leftForearmMesh.castShadow = true;
  leftForearm.add(leftForearmMesh);

  const leftHand = new THREE.Group();
  leftHand.position.y = -0.24;
  leftForearm.add(leftHand);

  const handGeo = new THREE.BoxGeometry(0.08, 0.1, 0.08);
  const leftHandMesh = new THREE.Mesh(handGeo, leatherStraps);
  leftHand.add(leftHandMesh);

  // Right Shoulder & Arm (Main weapon arm)
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.32, 0.38, 0);
  torso.add(rightShoulder);

  const rightPauldron = new THREE.Mesh(pauldronGeo, armorSteel);
  rightPauldron.rotation.z = -0.35;
  rightPauldron.castShadow = true;
  rightShoulder.add(rightPauldron);

  const rightArm = new THREE.Group();
  rightShoulder.add(rightArm);

  const rightArmMesh = new THREE.Mesh(armGeo, chainmail);
  rightArmMesh.position.y = -0.13;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  const rightForearm = new THREE.Group();
  rightForearm.position.y = -0.26;
  rightArm.add(rightForearm);

  const rightForearmMesh = new THREE.Mesh(forearmGeo, armorSteel);
  rightForearmMesh.position.y = -0.12;
  rightForearmMesh.castShadow = true;
  rightForearm.add(rightForearmMesh);

  const rightHand = new THREE.Group();
  rightHand.position.y = -0.24;
  rightForearm.add(rightHand);

  const rightHandMesh = new THREE.Mesh(handGeo, leatherStraps);
  rightHand.add(rightHandMesh);

  // Legs & Feet
  // Left Leg
  const leftThigh = new THREE.Group();
  leftThigh.position.set(-0.14, -0.1, 0);
  body.add(leftThigh);

  const thighGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.42, 6);
  const leftThighMesh = new THREE.Mesh(thighGeo, armorSteel);
  leftThighMesh.position.y = -0.21;
  leftThighMesh.castShadow = true;
  leftThigh.add(leftThighMesh);

  const leftShin = new THREE.Group();
  leftShin.position.y = -0.42;
  leftThigh.add(leftShin);

  const shinGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.4, 6);
  const leftShinMesh = new THREE.Mesh(shinGeo, armorSteel);
  leftShinMesh.position.y = -0.2;
  leftShinMesh.castShadow = true;
  leftShin.add(leftShinMesh);

  const leftFoot = new THREE.Group();
  leftFoot.position.y = -0.4;
  leftShin.add(leftFoot);

  const footGeo = new THREE.BoxGeometry(0.11, 0.08, 0.22);
  const leftFootMesh = new THREE.Mesh(footGeo, armorSteel);
  leftFootMesh.position.set(0, -0.04, 0.06);
  leftFoot.add(leftFootMesh);

  // Right Leg
  const rightThigh = new THREE.Group();
  rightThigh.position.set(0.14, -0.1, 0);
  body.add(rightThigh);

  const rightThighMesh = new THREE.Mesh(thighGeo, armorSteel);
  rightThighMesh.position.y = -0.21;
  rightThighMesh.castShadow = true;
  rightThigh.add(rightThighMesh);

  const rightShin = new THREE.Group();
  rightShin.position.y = -0.42;
  rightThigh.add(rightShin);

  const rightShinMesh = new THREE.Mesh(shinGeo, armorSteel);
  rightShinMesh.position.y = -0.2;
  rightShinMesh.castShadow = true;
  rightShin.add(rightShinMesh);

  const rightFoot = new THREE.Group();
  rightFoot.position.y = -0.4;
  rightShin.add(rightFoot);

  const rightFootMesh = new THREE.Mesh(footGeo, armorSteel);
  rightFootMesh.position.set(0, -0.04, 0.06);
  rightFoot.add(rightFootMesh);

  // WEAPON ATTACHMENT
  const weapon = new THREE.Group();
  rightHand.add(weapon);

  // Marker for hit detection tip
  const weaponTip = new THREE.Object3D();

  if (isSword) {
    // --- LONG MEDIEVAL SWORD ---
    // Grip
    const gripGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.28, 6);
    const gripMesh = new THREE.Mesh(gripGeo, leatherStraps);
    gripMesh.position.y = 0.08;
    weapon.add(gripMesh);

    // Pommel (iron counterweight sphere)
    const pommelGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const pommelMesh = new THREE.Mesh(pommelGeo, armorTrim);
    pommelMesh.position.y = -0.07;
    weapon.add(pommelMesh);

    // Crossguard (quillon)
    const guardGeo = new THREE.BoxGeometry(0.36, 0.035, 0.05);
    const guardMesh = new THREE.Mesh(guardGeo, armorTrim);
    guardMesh.position.y = 0.22;
    weapon.add(guardMesh);

    // Blade (long tapered steel bastard sword)
    const bladeGeo = new THREE.BoxGeometry(0.065, 1.15, 0.015);
    const bladeMesh = new THREE.Mesh(bladeGeo, bladeSteel);
    bladeMesh.position.y = 0.8;
    bladeMesh.castShadow = true;
    weapon.add(bladeMesh);

    // Blade fuller (blood groove along center)
    const fullerGeo = new THREE.BoxGeometry(0.015, 0.85, 0.018);
    const fullerMesh = new THREE.Mesh(fullerGeo, new THREE.MeshStandardMaterial({ color: 0x889098, metalness: 0.9, roughness: 0.4 }));
    fullerMesh.position.y = 0.72;
    weapon.add(fullerMesh);

    // Tip point
    weaponTip.position.set(0, 1.38, 0);
    weapon.add(weaponTip);

    weapon.rotation.x = Math.PI * 0.45;
    weapon.position.set(0, 0, 0.06);
  } else {
    // --- BATTLE AXE ---
    // Stout wooden haft
    const haftGeo = new THREE.CylinderGeometry(0.03, 0.032, 1.1, 8);
    const haftMesh = new THREE.Mesh(haftGeo, woodHaft);
    haftMesh.position.y = 0.35;
    haftMesh.castShadow = true;
    weapon.add(haftMesh);

    // Iron reinforcement collars
    const collarGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.06, 8);
    const collarMesh1 = new THREE.Mesh(collarGeo, armorSteel);
    collarMesh1.position.y = 0.75;
    weapon.add(collarMesh1);

    const collarMesh2 = new THREE.Mesh(collarGeo, armorSteel);
    collarMesh2.position.y = 0.15;
    weapon.add(collarMesh2);

    // Axe head eye socket
    const eyeGeo = new THREE.BoxGeometry(0.1, 0.14, 0.1);
    const eyeMesh = new THREE.Mesh(eyeGeo, armorSteel);
    eyeMesh.position.y = 0.82;
    weapon.add(eyeMesh);

    // Bearded crescent axe blade
    const axeBladeShape = new THREE.Shape();
    axeBladeShape.moveTo(0, -0.06);
    axeBladeShape.lineTo(0.32, -0.22); // Deep beard curve down
    axeBladeShape.quadraticCurveTo(0.42, 0.08, 0.28, 0.25); // Curved cutting edge
    axeBladeShape.lineTo(0, 0.07);
    axeBladeShape.closePath();

    const extrudeSettings = {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    };
    const axeBladeGeo = new THREE.ExtrudeGeometry(axeBladeShape, extrudeSettings);
    const axeBladeMesh = new THREE.Mesh(axeBladeGeo, bladeSteel);
    axeBladeMesh.position.set(0.02, 0.82, -0.01);
    axeBladeMesh.castShadow = true;
    weapon.add(axeBladeMesh);

    // Rear armor-piercing spike pick
    const spikeGeo = new THREE.ConeGeometry(0.04, 0.18, 4);
    const spikeMesh = new THREE.Mesh(spikeGeo, armorSteel);
    spikeMesh.position.set(-0.12, 0.82, 0);
    spikeMesh.rotation.z = Math.PI * 0.5;
    weapon.add(spikeMesh);

    // Tip marker (outer cutting edge center)
    weaponTip.position.set(0.38, 0.82, 0);
    weapon.add(weaponTip);

    weapon.rotation.x = Math.PI * 0.45;
    weapon.position.set(0, 0, 0.06);
  }

  // --- WEAPON SWING TRAIL MESH ---
  // Dynamic ribbon arc rendered during active attack swings
  const trailSegments = 8;
  const trailGeo = new THREE.PlaneGeometry(0.35, 1.2, 1, trailSegments);
  const trailMat = new THREE.MeshBasicMaterial({
    color: isSword ? 0x93c5fd : 0xf97316,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const trailMesh = new THREE.Mesh(trailGeo, trailMat);
  trailMesh.visible = false;
  root.add(trailMesh);

  let trailAlpha = 0;
  const updateTrail = (active: boolean) => {
    if (active) {
      trailAlpha = Math.min(0.65, trailAlpha + 0.18);
      trailMesh.visible = true;
    } else {
      trailAlpha = Math.max(0, trailAlpha - 0.12);
      if (trailAlpha <= 0.01) {
        trailMesh.visible = false;
      }
    }
    trailMat.opacity = trailAlpha;
  };

  return {
    root,
    body,
    torso,
    head,
    leftShoulder,
    leftArm,
    leftForearm,
    leftHand,
    rightShoulder,
    rightArm,
    rightForearm,
    rightHand,
    leftThigh,
    leftShin,
    leftFoot,
    rightThigh,
    rightShin,
    rightFoot,
    weapon,
    weaponTip,
    trailMesh,
    updateTrail,
    type,
  };
}
