    // ============================================================================
    // 5. CUSTOM ANIME "WIND TRAVELER" 3D RIG + ALL 6 PROCEDURAL ANIMATIONS
    // ============================================================================
    class WindTravelerRig {
      constructor(scene) {
        this.root = new THREE.Group();
        scene.add(this.root);

        // Hierarchical Skeleton Joints
        this.hips = new THREE.Group();
        this.hips.position.set(0, 1.02, 0);
        this.root.add(this.hips);

        this.spine = new THREE.Group();
        this.spine.position.set(0, 0.08, 0);
        this.hips.add(this.spine);

        this.chest = new THREE.Group();
        this.chest.position.set(0, 0.34, 0);
        this.spine.add(this.chest);

        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.36, 0);
        this.chest.add(this.neck);

        this.head = new THREE.Group();
        this.head.position.set(0, 0.08, 0);
        this.neck.add(this.head);

        // Cel-Shaded Anime Materials matching the Wind Traveler Concept Art
        const skinMat = createCelMaterial({ color: 0xffe5cf, rimStrength: 0.25 });
        const faceTex = createAnimeFaceTexture();
        const faceMat = createCelMaterial({ color: 0xffffff, map: faceTex, rimStrength: 0.25 });

        const hairMainMat = createCelMaterial({ color: 0xb89b7a, rimColor: 0xffe8cc, rimStrength: 0.40 });
        const hairTealMat = createCelMaterial({ color: 0x45c4b0, emissive: 0x164a42, emissiveIntensity: 0.15, rimStrength: 0.45 });

        const tunicCreamMat = createCelMaterial({ color: 0xf4efe6, rimStrength: 0.34 });
        const goldTrimMat = createCelMaterial({ color: 0xe6b85c, emissive: 0x593d08, emissiveIntensity: 0.22, rimStrength: 0.42 });
        const pantsMat = createCelMaterial({ color: 0x23272d, rimStrength: 0.22 });
        const leatherMat = createCelMaterial({ color: 0x5c3a21, rimStrength: 0.25 });
        const gloveMat = createCelMaterial({ color: 0x3b2d26, rimStrength: 0.22 });
        const wrapMat = createCelMaterial({ color: 0xebe4d5, rimStrength: 0.25 });

        // Dynamic Elemental Materials (recolored when resonating with shrines or switching elements)
        this.elementalMainMat = createCelMaterial({
          color: ELEMENTAL_VISIONS[0].color,
          emissive: ELEMENTAL_VISIONS[0].color,
          emissiveIntensity: 0.18,
          rimStrength: 0.45
        });

        this.elementalGlowMat = createCelMaterial({
          color: ELEMENTAL_VISIONS[0].glow,
          emissive: ELEMENTAL_VISIONS[0].color,
          emissiveIntensity: 1.35,
          rimStrength: 0.55
        });

        // ------------------------------------------------------------------------
        // TORSO, INNER VEST, BELT & STARLIGHT POUCH
        // ------------------------------------------------------------------------
        const lowerTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.38, 16), tunicCreamMat);
        lowerTorso.position.y = 0.18;
        lowerTorso.castShadow = true;
        addAnimeOutline(lowerTorso, 1.05);
        this.spine.add(lowerTorso);

        const upperChest = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.24, 0.42, 16), tunicCreamMat);
        upperChest.position.y = 0.18;
        upperChest.castShadow = true;
        addAnimeOutline(upperChest, 1.045);
        this.chest.add(upperChest);

        // Teal Inner Diamond Vest & Gold Chest Lapels
        const innerVest = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.36, 0.46), this.elementalMainMat);
        innerVest.position.set(0, 0.20, -0.04);
        this.chest.add(innerVest);

        [-0.12, 0.12].forEach((lx, idx) => {
          const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.48), goldTrimMat);
          lapel.position.set(lx, 0.19, -0.04);
          lapel.rotation.z = idx === 0 ? -0.18 : 0.18;
          this.chest.add(lapel);
        });

        // Back Gold Diamond Emblem & Vision Crystal
        const backEmblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), this.elementalGlowMat);
        backEmblem.scale.set(0.85, 1.2, 0.5);
        backEmblem.position.set(0, 0.22, 0.26);
        addAnimeOutline(backEmblem, 1.12);
        this.chest.add(backEmblem);

        // Leather Belt + Gold Buckle + Starlight Galaxy Pouch on Hip
        const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.275, 0.285, 0.11, 16), leatherMat);
        belt.position.y = 0.03;
        addAnimeOutline(belt, 1.05);
        this.hips.add(belt);

        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.06), goldTrimMat);
        buckle.position.set(0, 0.03, -0.28);
        this.hips.add(buckle);

        // Galaxy Starlight Pouch on Left Hip
        const pouchTex = createStarlightPouchTexture();
        const pouchMat = createCelMaterial({ map: pouchTex, rimStrength: 0.4 });
        const starPouch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.20, 0.18), pouchMat);
        starPouch.position.set(-0.31, -0.08, -0.06);
        starPouch.rotation.z = -0.15;
        addAnimeOutline(starPouch, 1.07);
        this.hips.add(starPouch);

        // Side Leather Satchel on Right Hip
        const sideSatchel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.17, 0.18), leatherMat);
        sideSatchel.position.set(0.30, -0.07, 0.02);
        sideSatchel.rotation.z = 0.12;
        addAnimeOutline(sideSatchel, 1.07);
        this.hips.add(sideSatchel);

        // ------------------------------------------------------------------------
        // ARTICULATED SPLIT ADVENTURER COAT-TAILS (WITH GOLD TRIM & TEAL LINING)
        // ------------------------------------------------------------------------
        this.coatTailLeft = this._createCoatTail(-1, tunicCreamMat, goldTrimMat);
        this.coatTailRight = this._createCoatTail(1, tunicCreamMat, goldTrimMat);
        this.hips.add(this.coatTailLeft, this.coatTailRight);

        // ------------------------------------------------------------------------
        // WRAPPED TEAL SCARF COLLAR + MULTI-SEGMENT DUAL FLOWING SCARF TAILS
        // ------------------------------------------------------------------------
        const scarfCollar = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.085, 12, 22), this.elementalMainMat);
        scarfCollar.rotation.x = Math.PI / 2;
        scarfCollar.position.set(0, 0.37, 0);
        addAnimeOutline(scarfCollar, 1.05);
        this.chest.add(scarfCollar);

        const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 10, 22), goldTrimMat);
        scarfRing.rotation.x = Math.PI / 2;
        scarfRing.rotation.y = 0.14;
        scarfRing.position.set(0, 0.34, 0);
        this.chest.add(scarfRing);

        // Dual Multi-Segment Physics Scarf Tails (Left & Right)
        this.leftScarfSegs = this._createScarfTailChain(scene, goldTrimMat);
        this.rightScarfSegs = this._createScarfTailChain(scene, goldTrimMat);

        // ------------------------------------------------------------------------
        // ANIME HEAD, EXPRESSIVE EYES, WIND-SWEPT HAIR + TEAL HIGHLIGHTS + AHOGE
        // ------------------------------------------------------------------------
        const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.14, 12), skinMat);
        this.neck.add(neckMesh);

        // Head Sphere rotated so texture U=0.5 faces -Z forward
        const headGeo = new THREE.SphereGeometry(0.31, 24, 24);
        headGeo.rotateY(Math.PI / 2);
        const headMesh = new THREE.Mesh(headGeo, faceMat);
        headMesh.position.y = 0.25;
        headMesh.castShadow = true;
        addAnimeOutline(headMesh, 1.045);
        this.head.add(headMesh);

        // Layered Wind-Swept Light-Brown Hair Crown
        const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.335, 22, 18), hairMainMat);
        hairCrown.position.set(0, 0.30, 0.03);
        hairCrown.castShadow = true;
        addAnimeOutline(hairCrown, 1.04);
        this.head.add(hairCrown);

        // Sculpted Front Bangs (keeping eyes clearly visible!)
        const bangConfigs = [
          { x: -0.14, y: 0.43, z: -0.25, rx: 0.35, rz: 0.28, s: 1.0 },
          { x: 0.0, y: 0.45, z: -0.28, rx: 0.42, rz: -0.05, s: 1.05 },
          { x: 0.14, y: 0.43, z: -0.25, rx: 0.35, rz: -0.28, s: 1.0 }
        ];
        bangConfigs.forEach((b) => {
          const bang = new THREE.Mesh(new THREE.ConeGeometry(0.085 * b.s, 0.24 * b.s, 8), hairMainMat);
          bang.position.set(b.x, b.y, b.z);
          bang.rotation.set(Math.PI + b.rx, 0, b.rz);
          addAnimeOutline(bang, 1.06);
          this.head.add(bang);
        });

        // Side Hair Locks with Teal Inner Highlights
        [-1, 1].forEach((side) => {
          const outerLock = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.36, 8), hairMainMat);
          outerLock.position.set(side * 0.29, 0.20, -0.08);
          outerLock.rotation.set(Math.PI - 0.1, 0, side * -0.22);
          addAnimeOutline(outerLock, 1.06);
          this.head.add(outerLock);

          const innerTealLock = new THREE.Mesh(new THREE.ConeGeometry(0.058, 0.33, 8), hairTealMat);
          innerTealLock.position.set(side * 0.255, 0.18, -0.11);
          innerTealLock.rotation.set(Math.PI - 0.12, 0, side * -0.15);
          this.head.add(innerTealLock);
        });

        // Spiky Back Hair Tufts
        const backTufts = [
          { x: -0.18, y: 0.24, z: 0.27, rx: -0.55, rz: 0.35 },
          { x: 0.0, y: 0.22, z: 0.30, rx: -0.65, rz: 0.0 },
          { x: 0.18, y: 0.24, z: 0.27, rx: -0.55, rz: -0.35 },
          { x: -0.24, y: 0.36, z: 0.18, rx: -0.35, rz: 0.55 },
          { x: 0.24, y: 0.36, z: 0.18, rx: -0.35, rz: -0.55 }
        ];
        backTufts.forEach((t) => {
          const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 8), hairMainMat);
          tuft.position.set(t.x, t.y, t.z);
          tuft.rotation.set(Math.PI + t.rx, 0, t.rz);
          addAnimeOutline(tuft, 1.05);
          this.head.add(tuft);
        });

        // Iconic Springy Top Ahoge Hair Strand!
        this.ahogePivot = new THREE.Group();
        this.ahogePivot.position.set(0.02, 0.58, 0.02);
        const ahogeMesh = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.26, 8), hairMainMat);
        ahogeMesh.position.set(0.04, 0.10, 0.03);
        ahogeMesh.rotation.set(-0.35, 0, -0.45);
        addAnimeOutline(ahogeMesh, 1.08);
        this.ahogePivot.add(ahogeMesh);
        this.head.add(this.ahogePivot);

        // ------------------------------------------------------------------------
        // ARTICULATED ARMS (SHOULDER -> ELBOW -> FINGERLESS GLOVED HAND)
        // ------------------------------------------------------------------------
        this.leftArm = this._createArticulatedArm(-1, tunicCreamMat, goldTrimMat, skinMat, wrapMat, gloveMat);
        this.rightArm = this._createArticulatedArm(1, tunicCreamMat, goldTrimMat, skinMat, wrapMat, gloveMat);
        this.chest.add(this.leftArm.shoulder, this.rightArm.shoulder);

        // ------------------------------------------------------------------------
        // ARTICULATED LEGS (THIGH -> CALF -> ADVENTURER BOOT)
        // ------------------------------------------------------------------------
        this.leftLeg = this._createArticulatedLeg(-1, pantsMat, leatherMat, goldTrimMat);
        this.rightLeg = this._createArticulatedLeg(1, pantsMat, leatherMat, goldTrimMat);
        this.hips.add(this.leftLeg.thigh, this.rightLeg.thigh);

        // ------------------------------------------------------------------------
        // SCULPTED TEAL & GOLD MAGICAL WIND GLIDER (OVERHEAD DEPLOYABLE)
        // ------------------------------------------------------------------------
        this.gliderGroup = new THREE.Group();
        this.gliderGroup.position.set(0, 1.05, 0.02);
        this.gliderGroup.scale.set(0.001, 0.001, 0.001);
        this.gliderGroup.visible = false;
        this.chest.add(this.gliderGroup);

        // Central Gold & Teal Emblem Hub
        const gliderCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), goldTrimMat);
        gliderCore.scale.set(1.2, 0.7, 1.2);
        addAnimeOutline(gliderCore, 1.08);
        this.gliderGroup.add(gliderCore);

        this.gliderWingMat = createCelMaterial({
          color: ELEMENTAL_VISIONS[0].glow,
          emissive: ELEMENTAL_VISIONS[0].color,
          emissiveIntensity: 0.78,
          transparent: true,
          opacity: 0.88,
          side: THREE.DoubleSide
        });

        [-1, 1].forEach((side) => {
          const wingPivot = new THREE.Group();

          // Handlebar Grip for Traveler's Hands
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.24, 8), leatherMat);
          handle.position.set(side * 0.34, -0.22, -0.08);
          handle.rotation.z = side * 0.35;
          wingPivot.add(handle);

          // Ornate Gold Upper Filigree Spar
          const upperSpar = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.022, 1.95, 8), goldTrimMat);
          upperSpar.rotation.z = side * Math.PI * 0.42;
          upperSpar.position.set(side * 0.98, 0.25, 0.06);
          addAnimeOutline(upperSpar, 1.06);
          wingPivot.add(upperSpar);

          // Glowing Translucent Cyan-Teal Feather Wing Membrane
          const sailShape = new THREE.Shape();
          sailShape.moveTo(0.12 * side, 0.02);
          sailShape.lineTo(1.95 * side, 0.48);
          sailShape.lineTo(1.75 * side, -0.18);
          sailShape.lineTo(1.38 * side, -0.58);
          sailShape.lineTo(0.88 * side, -0.45);
          sailShape.lineTo(0.45 * side, -0.62);
          sailShape.lineTo(0.14 * side, -0.32);
          sailShape.closePath();

          const sailGeo = new THREE.ShapeGeometry(sailShape);
          const sail = new THREE.Mesh(sailGeo, this.gliderWingMat);
          sail.rotation.x = -0.22;
          sail.position.set(0, 0.06, 0.08);
          wingPivot.add(sail);

          this.gliderGroup.add(wingPivot);
        });

        // ------------------------------------------------------------------------
        // WIND-DASH ANEMO RIBBON SWIRLS (AROUND CHARACTER DURING DASH)
        // ------------------------------------------------------------------------
        this.dashSwirlGroup = new THREE.Group();
        this.dashSwirlGroup.position.set(0, 1.0, 0);
        this.dashSwirlGroup.visible = false;
        this.root.add(this.dashSwirlGroup);

        this.dashRibbonMat = new THREE.MeshBasicMaterial({
          color: ELEMENTAL_VISIONS[0].glow,
          transparent: true,
          opacity: 0.78,
          side: THREE.DoubleSide,
          depthWrite: false
        });

        for (let r = 0; r < 3; r++) {
          const arcGeo = new THREE.TorusGeometry(0.85 + r * 0.22, 0.035, 8, 28, Math.PI * 1.35);
          const arc = new THREE.Mesh(arcGeo, this.dashRibbonMat);
          arc.rotation.x = Math.PI * 0.45 + (r - 1) * 0.22;
          arc.rotation.z = r * 2.1;
          arc.position.y = (r - 1) * 0.35;
          this.dashSwirlGroup.add(arc);
        }

        // ------------------------------------------------------------------------
        // INTERACT HAND STARLIGHT ORB (GLOWS ON RIGHT PALM WHEN PRESSING E)
        // ------------------------------------------------------------------------
        this.handStarlight = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.13, 0),
          new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.0 })
        );
        this.handStarlight.position.set(0, -0.28, -0.05);
        this.rightArm.hand.add(this.handStarlight);

        // Pose State Variables for Smooth Blending
        this.interactTimer = 0;
        this.bankAngle = 0;
      }

      _createCoatTail(side, creamMat, goldMat) {
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.14, -0.02, 0.12);

        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.56, 0.045), creamMat);
        panel.position.set(side * 0.04, -0.27, 0.06);
        panel.rotation.set(0.18, side * -0.22, side * 0.12);
        panel.castShadow = true;
        addAnimeOutline(panel, 1.05);

        const goldBorder = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.07, 0.052), goldMat);
        goldBorder.position.set(side * 0.04, -0.53, 0.11);
        goldBorder.rotation.set(0.18, side * -0.22, side * 0.12);

        const innerTeal = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.52, 0.02), this.elementalMainMat);
        innerTeal.position.set(side * 0.04, -0.27, 0.04);
        innerTeal.rotation.set(0.18, side * -0.22, side * 0.12);

        pivot.add(panel, goldBorder, innerTeal);
        return pivot;
      }

      _createScarfTailChain(scene, goldMat) {
        const segs = [];
        for (let i = 0; i < 6; i++) {
          const isTip = i >= 4;
          const width = 0.13 - i * 0.008;
          const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.035, 0.22),
            isTip ? goldMat : this.elementalMainMat
          );
          mesh.castShadow = true;
          addAnimeOutline(mesh, 1.07);
          scene.add(mesh);
          segs.push({ mesh, pos: new THREE.Vector3(0, 2.5, 54) });
        }
        return segs;
      }

      _createArticulatedArm(side, creamMat, goldMat, skinMat, wrapMat, gloveMat) {
        const shoulder = new THREE.Group();
        shoulder.position.set(side * 0.34, 0.32, 0);

        // Shoulder Pauldron Cap with Gold & Teal Trim
        const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 12), creamMat);
        pauldron.scale.set(1.1, 0.85, 1.1);
        addAnimeOutline(pauldron, 1.06);
        shoulder.add(pauldron);

        const pauldronTrim = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.02, 8, 16), goldMat);
        pauldronTrim.rotation.x = Math.PI / 2;
        pauldronTrim.position.y = -0.04;
        shoulder.add(pauldronTrim);

        // Upper Arm Sleeve
        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.068, 0.28, 10), creamMat);
        upperArm.position.y = -0.14;
        upperArm.castShadow = true;
        addAnimeOutline(upperArm, 1.06);
        shoulder.add(upperArm);

        // Elbow Joint
        const elbow = new THREE.Group();
        elbow.position.set(0, -0.28, 0);
        shoulder.add(elbow);

        // Forearm (Left has adventurer wraps, Right has skin + cuff)
        const forearm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.062, 0.052, 0.25, 10),
          side === -1 ? wrapMat : skinMat
        );
        forearm.position.y = -0.12;
        forearm.castShadow = true;
        addAnimeOutline(forearm, 1.06);
        elbow.add(forearm);

        // Teal & Gold Cuff
        const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.055, 10), this.elementalMainMat);
        cuff.position.y = -0.21;
        elbow.add(cuff);

        // Fingerless Gloved Hand
        const hand = new THREE.Group();
        hand.position.set(0, -0.25, 0);
        const palm = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.11, 0.065), gloveMat);
        palm.position.y = -0.04;
        addAnimeOutline(palm, 1.07);
        hand.add(palm);
        elbow.add(hand);

        return { shoulder, elbow, hand };
      }

      _createArticulatedLeg(side, pantsMat, leatherMat, goldMat) {
        const thigh = new THREE.Group();
        thigh.position.set(side * 0.135, -0.04, 0);

        const thighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.088, 0.44, 12), pantsMat);
        thighMesh.position.y = -0.22;
        thighMesh.castShadow = true;
        addAnimeOutline(thighMesh, 1.05);
        thigh.add(thighMesh);

        const calf = new THREE.Group();
        calf.position.set(0, -0.44, 0);
        thigh.add(calf);

        const calfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.22, 12), pantsMat);
        calfMesh.position.y = -0.10;
        calf.add(calfMesh);

        // Brown, Teal & Gold Adventurer Boot
        const boot = new THREE.Group();
        boot.position.set(0, -0.20, 0);

        const bootShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.084, 0.30, 12), leatherMat);
        bootShaft.position.y = -0.14;
        bootShaft.castShadow = true;
        addAnimeOutline(bootShaft, 1.05);

        const bootTealCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.096, 0.06, 12), this.elementalMainMat);
        bootTealCuff.position.y = -0.01;

        const bootGoldStrap = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.016, 8, 16), goldMat);
        bootGoldStrap.rotation.x = Math.PI / 2;
        bootGoldStrap.position.y = -0.14;

        const bootFoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.10, 0.27), leatherMat);
        bootFoot.position.set(0, -0.28, -0.045);
        bootFoot.castShadow = true;
        addAnimeOutline(bootFoot, 1.05);

        boot.add(bootShaft, bootTealCuff, bootGoldStrap, bootFoot);
        calf.add(boot);

        return { thigh, calf, boot };
      }

      triggerInteractPose() {
        this.interactTimer = 1.15;
      }

      setElementalColor(visionObj) {
        this.elementalMainMat.color.setHex(visionObj.color);
        this.elementalMainMat.emissive.setHex(visionObj.color);
        this.elementalGlowMat.color.setHex(visionObj.glow);
        this.elementalGlowMat.emissive.setHex(visionObj.color);
        this.gliderWingMat.color.setHex(visionObj.glow);
        this.gliderWingMat.emissive.setHex(visionObj.color);
        this.dashRibbonMat.color.setHex(visionObj.glow);
      }

      /**
       * Smoothly blends all 6 full-body procedural animations:
       * 1. Idle
       * 2. Run / Sprint
       * 3. Wind-Dash (with Anemo swirl ribbons)
       * 4. Jump & Wind Gliding (holding overhead Wind Glider + banking)
       * 5. Interact (right hand outstretched with golden-teal starlight)
       * 6. Sit & Chill (relaxed seated vista pose)
       */
      updateAnimation(dt, time, state) {
        const { pos, yaw, turnRate, speed, isGliding, isSitting, onGround, isDashing, isTalking } = state;

        this.root.position.copy(pos);
        this.root.rotation.y = yaw;

        if (this.interactTimer > 0) this.interactTimer -= dt;
        const isInteracting = this.interactTimer > 0 || isTalking;

        // Smooth banking when turning while running or gliding
        const targetBank = Math.max(-0.32, Math.min(0.32, (turnRate || 0) * (isGliding ? 0.24 : 0.08)));
        this.bankAngle += (targetBank - this.bankAngle) * (1 - Math.exp(-10 * dt));

        // Glider Deployment Scale Spring
        const targetGliderScale = isGliding ? 1.0 : 0.001;
        const currGScale = this.gliderGroup.scale.x;
        const nextGScale = currGScale + (targetGliderScale - currGScale) * (1 - Math.exp(-15 * dt));
        this.gliderGroup.scale.set(nextGScale, nextGScale, nextGScale);
        this.gliderGroup.visible = nextGScale > 0.03;
        if (isGliding) {
          this.gliderGroup.rotation.z = Math.sin(time * 3.4) * 0.04;
        }

        // Wind-Dash Swirl Ribbons
        this.dashSwirlGroup.visible = isDashing;
        if (isDashing) {
          this.dashSwirlGroup.rotation.z += dt * 14.0;
          this.dashSwirlGroup.rotation.y += dt * 9.0;
        }

        // Target Joint Pose Dictionary
        const target = {
          hipsY: 1.02,
          hipsRotX: 0,
          hipsRotZ: this.bankAngle,
          spineRotX: 0,
          chestRotX: 0,
          chestRotY: 0,
          headRotX: 0,
          headRotY: 0,
          lShoulderX: 0.06, lShoulderZ: -0.14, lElbowX: -0.14,
          rShoulderX: 0.06, rShoulderZ: 0.14, rElbowX: -0.14,
          lThighX: 0, lThighZ: -0.04, lCalfX: 0,
          rThighX: 0, rThighZ: 0.04, rCalfX: 0,
          coatSpread: 0.18
        };

        if (isSitting) {
          // 6. SIT & CHILL POSE (Matching Concept Pose Sheet!)
          target.hipsY = 0.22;
          target.hipsRotX = -0.16;
          target.hipsRotZ = 0;
          target.spineRotX = -0.12;
          target.chestRotX = -0.06 + Math.sin(time * 2.0) * 0.02;
          target.headRotX = 0.14 + Math.sin(time * 1.1) * 0.03;
          target.headRotY = Math.sin(time * 0.65) * 0.18;

          // Left knee bent up, left forearm resting across knee
          target.lThighX = -1.45;
          target.lThighZ = -0.18;
          target.lCalfX = 1.65;
          target.lShoulderX = -0.65;
          target.lShoulderZ = -0.15;
          target.lElbowX = -0.95;

          // Right leg relaxed out, right arm braced behind on grass
          target.rThighX = -1.25;
          target.rThighZ = 0.35;
          target.rCalfX = 0.55;
          target.rShoulderX = 0.52;
          target.rShoulderZ = 0.38;
          target.rElbowX = -0.18;

          target.coatSpread = 0.65;
        } else if (isGliding) {
          // 4B. WIND GLIDING POSE (Both hands holding overhead Wind Glider handles!)
          target.hipsY = 1.04 + Math.sin(time * 3.0) * 0.05;
          target.hipsRotX = -0.24;
          target.spineRotX = -0.12;
          target.chestRotX = -0.06;
          target.headRotX = 0.34;

          // Arms raised overhead gripping the glider handles
          target.lShoulderX = -2.65;
          target.lShoulderZ = -0.28;
          target.lElbowX = -0.45;

          target.rShoulderX = -2.65;
          target.rShoulderZ = 0.28;
          target.rElbowX = -0.45;

          // Dynamic tucked legs in mid-air flight
          target.lThighX = 0.22 + Math.sin(time * 2.5) * 0.06;
          target.lCalfX = 0.48;
          target.rThighX = 0.45 + Math.cos(time * 2.5) * 0.06;
          target.rCalfX = 0.72;

          target.coatSpread = 0.52;
        } else if (!onGround) {
          // 4A. MID-AIR JUMP POSE
          target.hipsY = 1.05;
          target.hipsRotX = -0.10;
          target.spineRotX = -0.08;
          target.headRotX = 0.14;

          target.lShoulderX = -0.75;
          target.lShoulderZ = -0.26;
          target.lElbowX = -0.42;

          target.rShoulderX = 0.45;
          target.rShoulderZ = 0.26;
          target.rElbowX = -0.35;

          target.lThighX = -0.68;
          target.lCalfX = 0.85;
          target.rThighX = 0.35;
          target.rCalfX = 0.45;

          target.coatSpread = 0.45;
        } else if (isDashing) {
          // 3. WIND-DASH POSE (Low aerodynamic forward lunge)
          const dashPulse = Math.sin(time * 20.0) * 0.04;
          target.hipsY = 0.84 + dashPulse;
          target.hipsRotX = -0.36;
          target.spineRotX = -0.26;
          target.chestRotX = -0.14;
          target.headRotX = 0.56;

          // Swept back aerodynamic arms
          target.lShoulderX = 0.82;
          target.lShoulderZ = -0.34;
          target.lElbowX = -0.35;

          target.rShoulderX = -0.65;
          target.rShoulderZ = 0.28;
          target.rElbowX = -0.85;

          // Front knee bent deeply, back leg extended trailing behind
          target.lThighX = -0.95;
          target.lCalfX = 1.15;
          target.rThighX = 0.88;
          target.rCalfX = 0.35;

          target.coatSpread = 0.72;
        } else if (speed > 0.35) {
          // 2. RUN / SPRINT POSE (Articulated stride with knee bend & swinging arms)
          const strideFreq = 11.2;
          const wave = Math.sin(time * strideFreq);
          const oppWave = Math.sin(time * strideFreq + Math.PI);

          target.hipsY = 1.00 + Math.abs(Math.cos(time * strideFreq)) * 0.09;
          target.hipsRotX = -0.14;
          target.spineRotX = -0.11;
          target.chestRotY = -wave * 0.14;
          target.headRotX = 0.18;

          // Swinging arms with bent elbows
          target.lShoulderX = oppWave * 0.72;
          target.lShoulderZ = -0.18;
          target.lElbowX = -0.55 - Math.max(0, oppWave) * 0.35;

          target.rShoulderX = wave * 0.72;
          target.rShoulderZ = 0.18;
          target.rElbowX = -0.55 - Math.max(0, wave) * 0.35;

          // Striding legs with natural knee bend on recovery phase
          target.lThighX = wave * 0.78;
          target.lCalfX = Math.max(0.08, -Math.cos(time * strideFreq) * 0.95);

          target.rThighX = oppWave * 0.78;
          target.rCalfX = Math.max(0.08, Math.cos(time * strideFreq) * 0.95);

          target.coatSpread = 0.48 + Math.abs(wave) * 0.12;
        } else {
          // 1. IDLE POSE (Relaxed breathing & gentle wind sway)
          const breath = Math.sin(time * 2.2);
          target.hipsY = 1.02 + breath * 0.015;
          target.spineRotX = breath * 0.02;
          target.chestRotX = -0.02 + breath * 0.025;
          target.headRotY = Math.sin(time * 0.85) * 0.08;

          target.lShoulderX = 0.04 + breath * 0.03;
          target.lShoulderZ = -0.14 - breath * 0.02;
          target.lElbowX = -0.16;

          target.rShoulderX = 0.04 - breath * 0.03;
          target.rShoulderZ = 0.14 + breath * 0.02;
          target.rElbowX = -0.16;

          target.coatSpread = 0.18 + Math.sin(time * 2.6) * 0.04;
        }

        // 5. OVERLAY INTERACT POSE (Right arm outstretched with glowing starlight orb!)
        if (isInteracting && !isGliding && !isDashing) {
          target.rShoulderX = -1.28;
          target.rShoulderZ = 0.12;
          target.rElbowX = -0.22;
          target.chestRotY = -0.16;
          this.handStarlight.material.opacity = 0.95;
          this.handStarlight.rotation.y += dt * 5.0;
          const pulse = 1.0 + Math.sin(time * 12.0) * 0.25;
          this.handStarlight.scale.set(pulse, pulse, pulse);
        } else {
          this.handStarlight.material.opacity = Math.max(0, this.handStarlight.material.opacity - dt * 4.0);
        }

        // Smoothly interpolate all skeleton joints
        const poseLerp = 1 - Math.exp(-15 * dt);
        this.hips.position.y += (target.hipsY - this.hips.position.y) * poseLerp;
        this.hips.rotation.x += (target.hipsRotX - this.hips.rotation.x) * poseLerp;
        this.hips.rotation.z += (target.hipsRotZ - this.hips.rotation.z) * poseLerp;

        this.spine.rotation.x += (target.spineRotX - this.spine.rotation.x) * poseLerp;
        this.chest.rotation.x += (target.chestRotX - this.chest.rotation.x) * poseLerp;
        this.chest.rotation.y += (target.chestRotY - this.chest.rotation.y) * poseLerp;

        this.head.rotation.x += (target.headRotX - this.head.rotation.x) * poseLerp;
        this.head.rotation.y += (target.headRotY - this.head.rotation.y) * poseLerp;

        this.leftArm.shoulder.rotation.x += (target.lShoulderX - this.leftArm.shoulder.rotation.x) * poseLerp;
        this.leftArm.shoulder.rotation.z += (target.lShoulderZ - this.leftArm.shoulder.rotation.z) * poseLerp;
        this.leftArm.elbow.rotation.x += (target.lElbowX - this.leftArm.elbow.rotation.x) * poseLerp;

        this.rightArm.shoulder.rotation.x += (target.rShoulderX - this.rightArm.shoulder.rotation.x) * poseLerp;
        this.rightArm.shoulder.rotation.z += (target.rShoulderZ - this.rightArm.shoulder.rotation.z) * poseLerp;
        this.rightArm.elbow.rotation.x += (target.rElbowX - this.rightArm.elbow.rotation.x) * poseLerp;

        this.leftLeg.thigh.rotation.x += (target.lThighX - this.leftLeg.thigh.rotation.x) * poseLerp;
        this.leftLeg.thigh.rotation.z += (target.lThighZ - this.leftLeg.thigh.rotation.z) * poseLerp;
        this.leftLeg.calf.rotation.x += (target.lCalfX - this.leftLeg.calf.rotation.x) * poseLerp;

        this.rightLeg.thigh.rotation.x += (target.rThighX - this.rightLeg.thigh.rotation.x) * poseLerp;
        this.rightLeg.thigh.rotation.z += (target.rThighZ - this.rightLeg.thigh.rotation.z) * poseLerp;
        this.rightLeg.calf.rotation.x += (target.rCalfX - this.rightLeg.calf.rotation.x) * poseLerp;

        // Split Coat-Tails & Top Ahoge Wind Flutter
        this.coatTailLeft.rotation.x += (target.coatSpread - this.coatTailLeft.rotation.x) * poseLerp;
        this.coatTailRight.rotation.x += (target.coatSpread - this.coatTailRight.rotation.x) * poseLerp;
        this.ahogePivot.rotation.z = Math.sin(time * 4.5 + speed * 0.5) * 0.14;
        this.ahogePivot.rotation.x = Math.min(0.45, speed * 0.03) + Math.cos(time * 3.8) * 0.08;

        // Update Dual Multi-Segment Physics Scarf Tails
        this.root.updateMatrixWorld();
        const backDir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
        const rightDir = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

        const chestWorldPos = new THREE.Vector3();
        this.chest.getWorldPosition(chestWorldPos);

        const updateScarfChain = (chain, sideSign) => {
          const anchor = chestWorldPos.clone()
            .add(new THREE.Vector3(0, 0.30, 0))
            .addScaledVector(backDir, 0.18)
            .addScaledVector(rightDir, sideSign * 0.18);

          chain[0].pos.copy(anchor);
          chain[0].mesh.position.copy(anchor);
          chain[0].mesh.rotation.y = yaw;

          const followLerp = 1 - Math.exp(-22 * dt);
          for (let i = 1; i < chain.length; i++) {
            const prev = chain[i - 1].pos;
            const curr = chain[i].pos;
            const waveX = Math.sin(time * 5.2 + i * 0.85 + sideSign) * (0.05 + speed * 0.008);
            const waveY = Math.cos(time * 4.4 + i * 0.7) * 0.035;

            const desired = prev.clone()
              .addScaledVector(backDir, isSitting ? 0.11 : 0.17)
              .addScaledVector(rightDir, sideSign * (0.045 + i * 0.012) + waveX)
              .add(new THREE.Vector3(0, (isGliding ? 0.03 : (isSitting ? -0.10 : -0.07)) + waveY, 0));

            // Keep scarf tails above ground when sitting
            const minFloor = pos.y + 0.04;
            if (desired.y < minFloor) desired.y = minFloor;

            curr.lerp(desired, followLerp);
            chain[i].mesh.position.copy(curr);
            chain[i].mesh.lookAt(prev);
          }
        };

        updateScarfChain(this.leftScarfSegs, -1);
        updateScarfChain(this.rightScarfSegs, 1);
      }
    }

