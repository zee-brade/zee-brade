    // ============================================================================
    // 4. CUSTOM GLSL SKY DOME, MIRROR LAKE WATER & CRYSTAL FALLS SHADERS
    // ============================================================================
    // ============================================================================
    // INTERACTIVE STYLIZED FOLIAGE SHADER
    // Reactive wind, dash gusts, footsteps, glide ripple and night bioluminescence.
    // Requires per-vertex `aTipFactor` on foliage geometry (0 at root, 1 at tip).
    // ============================================================================
    const foliageUniforms = {
      uTime: { value: 0 },
      uPlayerPos: { value: new THREE.Vector3() },
      uDashStrength: { value: 0 },
      uDashDir: { value: new THREE.Vector2(1, 0) },
      uGlideRipple: { value: 0 },
      uNightFactor: { value: 0 }
    };

    function createStylizedFoliageMaterial() {
      const mat = new THREE.MeshToonMaterial({
        color: 0xffffff,
        vertexColors: true,
        side: THREE.DoubleSide,
        gradientMap: typeof GLOBAL_TOON_GRADIENT !== 'undefined' ? GLOBAL_TOON_GRADIENT : null
      });

      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = foliageUniforms.uTime;
        shader.uniforms.uPlayerPos = foliageUniforms.uPlayerPos;
        shader.uniforms.uDashStrength = foliageUniforms.uDashStrength;
        shader.uniforms.uDashDir = foliageUniforms.uDashDir;
        shader.uniforms.uGlideRipple = foliageUniforms.uGlideRipple;
        shader.uniforms.uNightFactor = foliageUniforms.uNightFactor;

        shader.vertexShader = `
          attribute float aTipFactor;
          uniform float uTime;
          uniform vec3 uPlayerPos;
          uniform float uDashStrength;
          uniform vec2 uDashDir;
          uniform float uGlideRipple;
          varying float vTipFactor;
          varying float vGlowWave;
        ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <project_vertex>',
          `
          vTipFactor = aTipFactor;
          vec4 worldPos = vec4( transformed, 1.0 );
          #ifdef USE_INSTANCING
            worldPos = instanceMatrix * worldPos;
          #endif

          float bendWeight = aTipFactor * aTipFactor;

          // A. Calm idle sway and rolling valley wind.
          float mainWave = sin(worldPos.x * 0.22 + worldPos.z * 0.18 + uTime * 2.1);
          float microFlutter = cos(worldPos.x * 0.85 - uTime * 4.2) * 0.25;
          vec2 windOffset = vec2(1.0, 0.55) * (mainWave + microFlutter) * 0.16;

          // B. Anemo wind-dash gust.
          float dashWave = sin(uTime * 14.0 + worldPos.x * 0.5) * 0.35 + 1.0;
          windOffset += uDashDir * uDashStrength * dashWave * 0.65;

          // C. Footstep parting around the player's feet.
          vec2 toGrass = worldPos.xz - uPlayerPos.xz;
          float dist = length(toGrass);
          float heightDiff = abs(worldPos.y - uPlayerPos.y);
          if (dist < 1.35 && heightDiff < 1.8) {
            float push = 1.0 - smoothstep(0.15, 1.35, dist);
            vec2 pushDir = dist > 0.001 ? normalize(toGrass) : vec2(1.0, 0.0);
            windOffset += pushDir * push * 0.58;
            worldPos.y -= push * bendWeight * 0.18;
          }

          // D. Circular downdraft ripple while the traveler is gliding.
          if (uGlideRipple > 0.01 && dist < 4.5 && heightDiff < 4.5) {
            float ring = sin(dist * 3.8 - uTime * 9.0) * (1.0 - smoothstep(0.4, 4.5, dist));
            vec2 radialDir = dist > 0.001 ? normalize(toGrass) : vec2(1.0, 0.0);
            windOffset += radialDir * ring * uGlideRipple * 0.32;
          }

          worldPos.xz += windOffset * bendWeight;
          vGlowWave = 0.65 + 0.35 * sin(worldPos.x * 0.4 + worldPos.z * 0.4 + uTime * 2.5);

          vec4 mvPosition = modelViewMatrix * worldPos;
          gl_Position = projectionMatrix * mvPosition;
          `
        );

        shader.fragmentShader = `
          uniform float uNightFactor;
          varying float vTipFactor;
          varying float vGlowWave;
        ` + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <emissivemap_fragment>',
          `
          #include <emissivemap_fragment>
          float tipGlow = smoothstep(0.55, 1.0, vTipFactor) * uNightFactor * vGlowWave;
          totalEmissiveRadiance += vec3(0.12, 0.92, 0.82) * tipGlow * 0.85;
          `
        );

        // Preserve the project's subtle anime rim highlight on grass and flowers.
        shader.uniforms.uRimColor = GLOBAL_RIM_COLOR;
        shader.uniforms.uRimPower = { value: 3.2 };
        shader.uniforms.uRimStrength = { value: 0.20 };
        shader.fragmentShader = `
          uniform vec3 uRimColor;
          uniform float uRimPower;
          uniform float uRimStrength;
        ` + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `
          vec3 foliageNorm = normalize( vNormal );
          vec3 foliageView = normalize( vViewPosition );
          float foliageRim = pow(1.0 - clamp(abs(dot(foliageNorm, foliageView)), 0.0, 1.0), uRimPower);
          gl_FragColor.rgb += uRimColor * foliageRim * uRimStrength;
          #include <dithering_fragment>
          `
        );
      };

      mat.customProgramCacheKey = () => 'aetheria-interactive-foliage-v1';
      return mat;
    }

    // Multi-blade clump geometry. Each vertex stores aTipFactor (root=0, tip=1)
    // so the vertex shader bends the tip while keeping the base comparatively still.
    function createStylizedGrassGeometry() {
      const positions = [];
      const colors = [];
      const tipFactors = [];
      const indices = [];
      const bladeCount = 7;
      const rows = 4;

      for (let blade = 0; blade < bladeCount; blade++) {
        const angle = (blade / bladeCount) * Math.PI * 2 + blade * 0.31;
        const dirX = Math.cos(angle);
        const dirZ = Math.sin(angle);
        const sideX = -dirZ;
        const sideZ = dirX;
        const height = 0.72 + (blade % 4) * 0.13;
        const baseWidth = 0.065 + (blade % 3) * 0.012;
        const lean = 0.10 + (blade % 3) * 0.045;
        const firstVertex = positions.length / 3;

        for (let row = 0; row < rows; row++) {
          const t = row / (rows - 1);
          const centerX = dirX * lean * t * t;
          const centerZ = dirZ * lean * t * t;
          const halfWidth = baseWidth * (1.0 - 0.82 * t);
          const y = height * t;

          positions.push(
            centerX - sideX * halfWidth, y, centerZ - sideZ * halfWidth,
            centerX + sideX * halfWidth, y, centerZ + sideZ * halfWidth
          );
          // White vertex colors let InstancedMesh.instanceColor provide the palette tint.
          colors.push(1, 1, 1, 1, 1, 1);
          tipFactors.push(t, t);
        }

        for (let row = 0; row < rows - 1; row++) {
          const a = firstVertex + row * 2;
          const b = a + 1;
          const c = a + 2;
          const d = a + 3;
          indices.push(a, c, b, b, c, d);
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('aTipFactor', new THREE.Float32BufferAttribute(tipFactors, 1));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      return geometry;
    }

    // A small five-petal wildflower geometry with a contrasting golden center.
    // Color attributes are multiplied by each instance's white/blue/buttercup tint.
    function createStylizedFlowerGeometry() {
      const positions = [];
      const colors = [];
      const indices = [];
      const petalColor = new THREE.Color(0xffffff);
      const centerColor = new THREE.Color(0xffd76a);

      function addVertex(x, y, z, color) {
        const index = positions.length / 3;
        positions.push(x, y, z);
        colors.push(color.r, color.g, color.b);
        return index;
      }

      for (let petal = 0; petal < 5; petal++) {
        const angle = (petal / 5) * Math.PI * 2;
        const dx = Math.cos(angle);
        const dz = Math.sin(angle);
        const sideX = -dz;
        const sideZ = dx;
        const base = addVertex(dx * 0.025, 0.31, dz * 0.025, petalColor);
        const left = addVertex(dx * 0.12 - sideX * 0.052, 0.345, dz * 0.12 - sideZ * 0.052, petalColor);
        const tip = addVertex(dx * 0.225, 0.325, dz * 0.225, petalColor);
        const right = addVertex(dx * 0.12 + sideX * 0.052, 0.345, dz * 0.12 + sideZ * 0.052, petalColor);
        indices.push(base, left, tip, base, tip, right);
      }

      const centerIndex = addVertex(0, 0.365, 0, centerColor);
      const segments = 10;
      const ringStart = positions.length / 3;
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        addVertex(Math.cos(angle) * 0.057, 0.362, Math.sin(angle) * 0.057, centerColor);
      }
      for (let i = 0; i < segments; i++) {
        const a = ringStart + i;
        const b = ringStart + ((i + 1) % segments);
        indices.push(centerIndex, a, b);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      return geometry;
    }

    // Shared per-frame foliage controls. Player yaw in AETHERIA faces toward -Z at yaw=0.
    function updateMeadowFoliage(elapsedTime, delta, playerPos, playerYaw, isDashing, isGliding, nightFactor) {
      foliageUniforms.uTime.value = elapsedTime;
      foliageUniforms.uPlayerPos.value.copy(playerPos);

      const dashTarget = isDashing ? 1.0 : 0.0;
      foliageUniforms.uDashStrength.value +=
        (dashTarget - foliageUniforms.uDashStrength.value) * Math.min(1, delta * 10);
      foliageUniforms.uDashDir.value.set(-Math.sin(playerYaw), -Math.cos(playerYaw));

      const glideTarget = isGliding ? 1.0 : 0.0;
      foliageUniforms.uGlideRipple.value +=
        (glideTarget - foliageUniforms.uGlideRipple.value) * Math.min(1, delta * 6);

      // Keep the environment's dusk-to-night transition smooth rather than snapping.
      const nightBlend = 1 - Math.exp(-2.8 * Math.max(0, delta));
      foliageUniforms.uNightFactor.value +=
        (nightFactor - foliageUniforms.uNightFactor.value) * nightBlend;
    }

    function createSkyDome() {
      const geo = new THREE.SphereGeometry(460, 48, 32);
      const mat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTopColor: { value: TIME_MOODS[0].topColor.clone() },
          uHorizonColor: { value: TIME_MOODS[0].horizonColor.clone() },
          uBottomColor: { value: TIME_MOODS[0].bottomColor.clone() },
          uSunDir: { value: TIME_MOODS[0].sunDir.clone() },
          uSunColor: { value: TIME_MOODS[0].sunColor.clone() },
          uStarIntensity: { value: 0.0 },
          uAuroraIntensity: { value: 0.0 },
          uTime: { value: 0.0 }
        },
        vertexShader: `
          varying vec3 vWorldDir;
          void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldDir = normalize(worldPos.xyz);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: `
          uniform vec3 uTopColor;
          uniform vec3 uHorizonColor;
          uniform vec3 uBottomColor;
          uniform vec3 uSunDir;
          uniform vec3 uSunColor;
          uniform float uStarIntensity;
          uniform float uAuroraIntensity;
          uniform float uTime;
          varying vec3 vWorldDir;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
              mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
              u.y
            );
          }

          void main() {
            vec3 dir = normalize(vWorldDir);
            float h = dir.y;

            vec3 col = mix(uHorizonColor, uTopColor, pow(clamp(h, 0.0, 1.0), 0.58));
            col = mix(col, uBottomColor, smoothstep(0.0, -0.25, h));

            float sunAmt = max(dot(dir, normalize(uSunDir)), 0.0);
            col += uSunColor * pow(sunAmt, 8.0) * 0.35;
            col += uSunColor * pow(sunAmt, 90.0) * 0.65;
            float sunDisc = smoothstep(0.9982, 0.9994, sunAmt);
            col = mix(col, uSunColor * 1.6, sunDisc);

            if (h > 0.03) {
              vec2 cloudUV = dir.xz / (h + 0.18) * 1.5 + vec2(uTime * 0.011, uTime * 0.005);
              float c1 = noise(cloudUV * 2.2);
              float c2 = noise(cloudUV * 4.4 - vec2(uTime * 0.016, 0.0));
              float rawCloud = c1 * 0.68 + c2 * 0.32;
              float cloudMask = smoothstep(0.55, 0.72, rawCloud) * smoothstep(0.03, 0.22, h);
              vec3 cloudTint = mix(uHorizonColor, vec3(1.0), 0.68) + uSunColor * pow(sunAmt, 4.0) * 0.25;
              col = mix(col, cloudTint, cloudMask * 0.62);
            }

            if (uStarIntensity > 0.01 && h > 0.05) {
              vec2 starGrid = floor(dir.xz / (h + 0.35) * 165.0);
              float sVal = hash(starGrid);
              if (sVal > 0.992) {
                float twinkle = 0.6 + 0.4 * sin(uTime * 3.5 + sVal * 100.0);
                col += vec3(0.85, 0.94, 1.0) * twinkle * uStarIntensity * smoothstep(0.05, 0.3, h);
              }
            }

            if (uAuroraIntensity > 0.01 && h > 0.12) {
              vec2 aUV = dir.xz / (h + 0.25);
              float wave = sin(aUV.x * 3.5 + uTime * 0.45 + noise(aUV * 2.0) * 3.0);
              float ribbon = smoothstep(0.85, 1.0, 1.0 - abs(wave)) * smoothstep(0.12, 0.45, h) * (1.0 - smoothstep(0.55, 0.9, h));
              vec3 auroraCol = mix(vec3(0.2, 0.95, 0.72), vec3(0.45, 0.55, 1.0), sin(aUV.x * 2.0 + uTime * 0.3) * 0.5 + 0.5);
              col += auroraCol * ribbon * 0.48 * uAuroraIntensity;
            }

            gl_FragColor = vec4(col, 1.0);
          }
        `
      });
      return new THREE.Mesh(geo, mat);
    }

    function createMirrorLakeWater() {
      const geo = new THREE.CircleGeometry(33, 64);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0.0 },
          uDeepColor: { value: new THREE.Color(0x1a7ca3) },
          uShallowColor: { value: new THREE.Color(0x6ce8de) },
          uSunDir: { value: TIME_MOODS[0].sunDir.clone() },
          uSunColor: { value: TIME_MOODS[0].sunColor.clone() }
        },
        vertexShader: `
          uniform float uTime;
          varying vec3 vWorldPos;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.y += sin(pos.x * 0.45 + uTime * 1.8) * 0.035 + cos(pos.z * 0.45 + uTime * 1.5) * 0.035;
            vec4 wp = modelMatrix * vec4(pos, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uDeepColor;
          uniform vec3 uShallowColor;
          uniform vec3 uSunDir;
          uniform vec3 uSunColor;
          varying vec3 vWorldPos;
          varying vec2 vUv;

          void main() {
            float distFromCenter = length(vUv - vec2(0.5)) * 2.0;
            float ripple1 = sin(vWorldPos.x * 1.4 + uTime * 2.2) * cos(vWorldPos.z * 1.4 - uTime * 1.9);
            float ripple2 = sin((vWorldPos.x + vWorldPos.z) * 2.6 - uTime * 2.8);
            float wave = (ripple1 + ripple2) * 0.5;

            float band = smoothstep(0.35, 0.98, distFromCenter) * 0.65 + wave * 0.1;
            float toonWater = floor(band * 4.0) / 4.0;
            vec3 baseCol = mix(uDeepColor, uShallowColor, toonWater);

            vec3 normal = normalize(vec3(wave * 0.14, 1.0, ripple2 * 0.14));
            vec3 viewDir = normalize(cameraPosition - vWorldPos);
            vec3 halfVec = normalize(normalize(uSunDir) + viewDir);
            float spec = smoothstep(0.72, 0.85, pow(max(dot(normal, halfVec), 0.0), 42.0));
            baseCol += uSunColor * spec * 0.8;

            float shoreFoam = smoothstep(0.87, 0.96, distFromCenter + wave * 0.025);
            baseCol = mix(baseCol, vec3(0.95, 0.99, 1.0), shoreFoam * 0.72);

            float alpha = 1.0 - smoothstep(0.94, 1.0, distFromCenter);
            gl_FragColor = vec4(baseCol, alpha * 0.92);
          }
        `
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-14, WATER_LEVEL, -10);
      return mesh;
    }

    function createWaterfallCascade() {
      const group = new THREE.Group();
      group.position.set(WATERFALL_POS.x, 7.6, WATERFALL_POS.z);
      group.rotation.y = Math.PI * 0.25;

      const wfGeo = new THREE.PlaneGeometry(7.2, 16.5, 16, 24);
      const pos = wfGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const py = pos.getY(i);
        const topCurve = Math.max(0, (py - 4.0) / 4.25);
        pos.setZ(i, -topCurve * topCurve * 1.4);
      }
      wfGeo.computeVertexNormals();

      const wfMat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0.0 } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec2 vUv;

          void main() {
            float flow1 = sin(vUv.x * 24.0 + sin(vUv.y * 8.0 + uTime * 5.0) * 0.8);
            float flow2 = cos(vUv.x * 38.0 - uTime * 3.0 + vUv.y * 16.0 + uTime * 7.5);
            float streaks = smoothstep(0.15, 0.75, (flow1 + flow2) * 0.5 + 0.35);

            vec3 deepWater = vec3(0.16, 0.58, 0.82);
            vec3 brightWater = vec3(0.55, 0.92, 0.98);
            vec3 foamWhite = vec3(0.96, 0.99, 1.0);

            vec3 col = mix(deepWater, brightWater, streaks);

            float topFoam = smoothstep(0.84, 0.98, vUv.y + sin(vUv.x * 20.0 + uTime * 4.0) * 0.03);
            float botFoam = smoothstep(0.24, 0.02, vUv.y + cos(vUv.x * 18.0 - uTime * 6.0) * 0.04);
            col = mix(col, foamWhite, max(topFoam, botFoam) * 0.9);

            float edgeFade = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
            gl_FragColor = vec4(col, edgeFade * 0.92);
          }
        `
      });

      const waterfallMesh = new THREE.Mesh(wfGeo, wfMat);
      group.add(waterfallMesh);

      const splashGeo = new THREE.RingGeometry(1.2, 5.4, 32);
      splashGeo.rotateX(-Math.PI / 2);
      const splashMat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: { uTime: { value: 0.0 } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - vec2(0.5)) * 2.0;
            float ring = sin(d * 22.0 - uTime * 5.5) * 0.5 + 0.5;
            float mask = smoothstep(0.35, 0.55, ring) * (1.0 - smoothstep(0.65, 1.0, d)) * smoothstep(0.2, 0.45, d);
            gl_FragColor = vec4(0.95, 0.99, 1.0, mask * 0.85);
          }
        `
      });
      const splashMesh = new THREE.Mesh(splashGeo, splashMat);
      splashMesh.position.set(0, -7.8, 1.4);
      group.add(splashMesh);

      return { group, wfMat, splashMat };
    }

