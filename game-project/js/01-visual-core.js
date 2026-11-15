    /**
     * ============================================================================
     * AETHERIA: CEL-SHADED HORIZON
     * Complete 60 FPS 3D TPP Anime Cel-Shaded Open-World Exploration Game
     * Built with Three.js r128 + Custom Cel-Shading + Hierarchical Anime Rig
     * ============================================================================
     */

    // ============================================================================
    // 1. ANIME CEL-SHADING, FACE CANVAS TEXTURE & INVERTED-HULL OUTLINE FACTORY
    // ============================================================================
    function createToonGradientTexture() {
      // 4 crisp anime shading bands: deep shadow, mid shadow, lit, bright highlight
      const steps = [
        [82, 88, 112, 255],
        [154, 162, 184, 255],
        [224, 228, 238, 255],
        [255, 255, 255, 255]
      ];
      const data = new Uint8Array(steps.length * 4);
      steps.forEach((rgba, i) => {
        data[i * 4] = rgba[0];
        data[i * 4 + 1] = rgba[1];
        data[i * 4 + 2] = rgba[2];
        data[i * 4 + 3] = rgba[3];
      });
      const tex = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    }

    const GLOBAL_TOON_GRADIENT = createToonGradientTexture();
    const GLOBAL_RIM_COLOR = { value: new THREE.Color(0xfff1d6) };

    function createCelMaterial(opts = {}) {
      const mat = new THREE.MeshToonMaterial({
        color: opts.color !== undefined ? opts.color : 0xffffff,
        map: opts.map || null,
        gradientMap: GLOBAL_TOON_GRADIENT,
        vertexColors: opts.vertexColors || false,
        emissive: opts.emissive !== undefined ? opts.emissive : 0x000000,
        emissiveIntensity: opts.emissiveIntensity !== undefined ? opts.emissiveIntensity : 0.0,
        transparent: opts.transparent || false,
        opacity: opts.opacity !== undefined ? opts.opacity : 1.0,
        side: opts.side || THREE.FrontSide
      });

      const rimPower = opts.rimPower !== undefined ? opts.rimPower : 3.2;
      const rimStrength = opts.rimStrength !== undefined ? opts.rimStrength : 0.34;
      const customRimHex = opts.rimColor !== undefined ? new THREE.Color(opts.rimColor) : null;

      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uRimColor = customRimHex ? { value: customRimHex } : GLOBAL_RIM_COLOR;
        shader.uniforms.uRimPower = { value: rimPower };
        shader.uniforms.uRimStrength = { value: rimStrength };

        shader.fragmentShader = `
          uniform vec3 uRimColor;
          uniform float uRimPower;
          uniform float uRimStrength;
          ${shader.fragmentShader}
        `.replace(
          '#include <dithering_fragment>',
          `
          vec3 celNorm = normalize( vNormal );
          vec3 celView = normalize( vViewPosition );
          float fresnelRim = pow( 1.0 - clamp( abs( dot( celNorm, celView ) ), 0.0, 1.0 ), uRimPower );
          gl_FragColor.rgb += uRimColor * fresnelRim * uRimStrength;
          #include <dithering_fragment>
          `
        );
      };
      return mat;
    }

    function addAnimeOutline(mesh, scaleFactor = 1.045, outlineColor = 0x1e1b2e) {
      const outlineMat = new THREE.MeshBasicMaterial({
        color: outlineColor,
        side: THREE.BackSide
      });
      const outline = new THREE.Mesh(mesh.geometry, outlineMat);
      outline.scale.set(scaleFactor, scaleFactor, scaleFactor);
      outline.castShadow = false;
      outline.receiveShadow = false;
      mesh.add(outline);
      return outline;
    }

    /**
     * Generates a crisp 512x512 Anime Face Texture with expressive emerald-teal eyes,
     * upper lashes, specular catchlights, warm eyebrows, blush, and gentle smile.
     */
    function createAnimeFaceTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Base warm anime skin tone
      ctx.fillStyle = '#ffe5cf';
      ctx.fillRect(0, 0, 512, 512);

      // Sphere UV mapping: center of -Z face aligns around U = 0.75 (x = 384) or U = 0.25 depending on rotation.
      // We rotate the head sphere by +Math.PI/2 on Y so U=0.5 (x = 256) sits dead-center on -Z!
      const cx = 256;
      const cy = 272;

      // Soft anime cheek blush
      [-48, 48].forEach((bx) => {
        const grad = ctx.createRadialGradient(cx + bx, cy + 24, 2, cx + bx, cy + 24, 22);
        grad.addColorStop(0, 'rgba(255, 145, 155, 0.36)');
        grad.addColorStop(1, 'rgba(255, 145, 155, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx + bx, cy + 24, 22, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw both anime eyes
      [-34, 34].forEach((ex, idx) => {
        const eyeX = cx + ex;
        const eyeY = cy;
        const dir = idx === 0 ? -1 : 1;

        // Eyebrow
        ctx.strokeStyle = '#6e5239';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(eyeX - 16 * dir, eyeY - 26);
        ctx.quadraticCurveTo(eyeX, eyeY - 31, eyeX + 16 * dir, eyeY - 24);
        ctx.stroke();

        // Sclera (white of eye)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, 15, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Emerald-Teal Iris Gradient
        const irisGrad = ctx.createLinearGradient(eyeX, eyeY - 14, eyeX, eyeY + 15);
        irisGrad.addColorStop(0, '#184e4a');
        irisGrad.addColorStop(0.55, '#2a9d8f');
        irisGrad.addColorStop(1, '#6efce8');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY + 1, 11, 14.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#10252b';
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY + 1, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Upper Eyelash Arch
        ctx.strokeStyle = '#241c24';
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(eyeX - 17, eyeY - 4);
        ctx.quadraticCurveTo(eyeX, eyeY - 21, eyeX + 17, eyeY - 3);
        ctx.stroke();

        // Anime Specular Catchlights
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX - 4.5, eyeY - 6, 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(eyeX + 5, eyeY + 5, 2.1, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle Nose Dot
      ctx.fillStyle = '#d9a384';
      ctx.beginPath();
      ctx.arc(cx, cy + 20, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Confident Gentle Anime Smile
      ctx.strokeStyle = '#9c5a49';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 11, cy + 36);
      ctx.quadraticCurveTo(cx, cy + 42, cx + 11, cy + 36);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    /**
     * Generates the Starlight / Galaxy Pouch Texture for the character's hip pouch
     */
    function createStarlightPouchTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 128, 128);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);

      // Gold trim border
      ctx.strokeStyle = '#e6b85c';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 118, 118);

      // Sparkling golden stars
      ctx.fillStyle = '#fde68a';
      const stars = [[38, 44, 7], [84, 38, 5], [64, 76, 9], [36, 92, 4], [92, 86, 6]];
      stars.forEach(([sx, sy, sr]) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy - sr);
        ctx.lineTo(sx + sr * 0.3, sy - sr * 0.3);
        ctx.lineTo(sx + sr, sy);
        ctx.lineTo(sx + sr * 0.3, sy + sr * 0.3);
        ctx.lineTo(sx, sy + sr);
        ctx.lineTo(sx - sr * 0.3, sy + sr * 0.3);
        ctx.lineTo(sx - sr, sy);
        ctx.lineTo(sx - sr * 0.3, sy - sr * 0.3);
        ctx.closePath();
        ctx.fill();
      });

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

