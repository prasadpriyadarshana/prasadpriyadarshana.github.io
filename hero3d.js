/* ============================================================
   Hero Robot — procedural 3D character (Three.js r128 UMD)
   - Follows the cursor with head / body / eye tracking
   - Waves randomly, and waves on hover
   - Blinks, idles with a gentle float
   - Light-theme palette to match the site
   ============================================================ */
(function () {
    'use strict';

    var container = document.getElementById('hero-3d');
    if (!container || typeof THREE === 'undefined') return;

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Palette (light theme) ---------- */
    var SHELL = 0xeef1f6;   // main body panels
    var SHELL_2 = 0xdbe1ea; // limbs / secondary
    var DARK = 0x1c2230;    // face screen, chest panel
    var JOINT = 0xaeb7c4;   // joints, boots
    var ACCENT = 0x00df73;  // emerald glow
    var ACCENT_2 = 0x01fedc;

    /* ---------- Renderer / scene / camera ---------- */
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.5, 100);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    /* ---------- Lighting ---------- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d2de, 0.55));

    var keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(3.2, 4.2, 4.5);
    scene.add(keyLight);

    var fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-4, 1.2, 2.5);
    scene.add(fillLight);

    var rimRight = new THREE.PointLight(ACCENT, 1.5, 14);
    rimRight.position.set(3.4, 1.6, -2.2);
    scene.add(rimRight);

    var rimLeft = new THREE.PointLight(ACCENT_2, 0.8, 12);
    rimLeft.position.set(-3.2, 0.4, -2);
    scene.add(rimLeft);

    /* ---------- Geometry helpers ---------- */
    function roundedRectShape(w, h, r) {
        var s = new THREE.Shape();
        var hw = w / 2, hh = h / 2;
        s.moveTo(-hw + r, -hh);
        s.lineTo(hw - r, -hh);
        s.quadraticCurveTo(hw, -hh, hw, -hh + r);
        s.lineTo(hw, hh - r);
        s.quadraticCurveTo(hw, hh, hw - r, hh);
        s.lineTo(-hw + r, hh);
        s.quadraticCurveTo(-hw, hh, -hw, hh - r);
        s.lineTo(-hw, -hh + r);
        s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
        return s;
    }

    // Rounded box via extrude + bevel (RoundedBoxGeometry is an addon, unavailable in UMD)
    function roundedBox(w, h, d, r, bevel) {
        bevel = bevel === undefined ? 0.12 : bevel;
        var geo = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
            depth: Math.max(0.01, d - bevel * 2),
            bevelEnabled: true,
            bevelThickness: bevel,
            bevelSize: bevel,
            bevelSegments: 5,
            curveSegments: 14
        });
        geo.center();
        return geo;
    }

    /* ---------- Materials ---------- */
    function shellMat(color) {
        return new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0.15,
            roughness: 0.42,
            clearcoat: 0.9,
            clearcoatRoughness: 0.22
        });
    }

    var matShell = shellMat(SHELL);
    var matShell2 = shellMat(SHELL_2);
    var matJoint = new THREE.MeshPhysicalMaterial({
        color: JOINT, metalness: 0.5, roughness: 0.4, clearcoat: 0.5
    });
    var matDark = new THREE.MeshPhysicalMaterial({
        color: DARK, metalness: 0.3, roughness: 0.5, clearcoat: 0.7,
        clearcoatRoughness: 0.15
    });
    var matEye = new THREE.MeshBasicMaterial({ color: ACCENT });
    var matAccent = new THREE.MeshStandardMaterial({
        color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.85, roughness: 0.35
    });

    /* Fine grid texture for the face screen */
    function screenTexture() {
        var c = document.createElement('canvas');
        c.width = c.height = 128;
        var g = c.getContext('2d');
        g.fillStyle = '#1c2230';
        g.fillRect(0, 0, 128, 128);
        g.strokeStyle = 'rgba(255,255,255,0.05)';
        g.lineWidth = 1;
        for (var i = 0; i <= 128; i += 8) {
            g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke();
            g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke();
        }
        var t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(3, 2.4);
        return t;
    }

    var matScreen = new THREE.MeshStandardMaterial({
        color: 0xffffff, map: screenTexture(), roughness: 0.35, metalness: 0.1
    });

    /* ---------- Rig groups ---------- */
    var root = new THREE.Group();          // whole robot
    var torso = new THREE.Group();         // body + limbs
    var headPivot = new THREE.Group();     // head turns toward cursor
    var eyeGroup = new THREE.Group();      // eyes shift slightly
    scene.add(root);
    root.add(torso);
    root.add(headPivot);

    /* ---------- Head ---------- */
    var head = new THREE.Mesh(roundedBox(2.15, 1.85, 1.55, 0.52, 0.16), matShell);
    headPivot.add(head);
    headPivot.position.set(0, 1.02, 0);

    // Face screen (inset, dark)
    var screen = new THREE.Mesh(roundedBox(1.68, 1.3, 0.14, 0.44, 0.06), matScreen);
    screen.position.set(0, 0.02, 0.75);
    headPivot.add(screen);

    // Pixel-block eyes (pattern matches the reference's chunky eyes)
    var EYE_PATTERN = [
        [0, 1, 1, 0],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [0, 1, 1, 0]
    ];
    var PX = 0.058, GAP = 0.014, STEP = PX + GAP;

    function buildEye(offsetX) {
        var eye = new THREE.Group();
        var cols = EYE_PATTERN[0].length, rows = EYE_PATTERN.length;
        var pxGeo = new THREE.BoxGeometry(PX, PX, 0.03);
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                if (!EYE_PATTERN[r][c]) continue;
                var m = new THREE.Mesh(pxGeo, matEye);
                m.position.set(
                    (c - (cols - 1) / 2) * STEP,
                    ((rows - 1) / 2 - r) * STEP,
                    0
                );
                eye.add(m);
            }
        }
        eye.position.set(offsetX, 0.06, 0.84);
        return eye;
    }

    eyeGroup.add(buildEye(-0.33));
    eyeGroup.add(buildEye(0.33));
    headPivot.add(eyeGroup);

    /* ---------- Antennae ---------- */
    function buildAntenna(x, tilt) {
        var g = new THREE.Group();
        var rod = new THREE.Mesh(
            new THREE.CylinderGeometry(0.022, 0.022, 0.78, 10), matJoint
        );
        rod.position.y = 0.39;
        g.add(rod);
        var ball = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 18), matJoint);
        ball.position.y = 0.8;
        g.add(ball);
        g.position.set(x, 0.86, -0.05);
        g.rotation.z = tilt;
        return g;
    }
    headPivot.add(buildAntenna(-0.62, 0.2));
    headPivot.add(buildAntenna(0.62, -0.2));

    /* ---------- Ear pods ---------- */
    function buildEar(x) {
        var g = new THREE.Group();
        var pod = new THREE.Mesh(roundedBox(0.3, 0.66, 0.46, 0.15, 0.07), matShell2);
        g.add(pod);
        var dial = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.11, 0.1, 20), matJoint
        );
        dial.rotation.z = Math.PI / 2;
        dial.position.x = x > 0 ? 0.14 : -0.14;
        g.add(dial);
        g.position.set(x, 0.02, 0.05);
        return g;
    }
    headPivot.add(buildEar(-1.11));
    headPivot.add(buildEar(1.11));

    /* ---------- Head badge (chevron stripes) ---------- */
    var badge = new THREE.Group();
    for (var b = 0; b < 3; b++) {
        var bar = new THREE.Mesh(new THREE.BoxGeometry(0.34 - b * 0.07, 0.055, 0.05), matAccent);
        bar.position.set(0, 0, -b * 0.11);
        badge.add(bar);
    }
    badge.position.set(0, 0.93, 0.24);
    badge.rotation.x = -0.32;
    headPivot.add(badge);

    /* ---------- Torso ---------- */
    var body = new THREE.Mesh(roundedBox(1.12, 1.02, 0.78, 0.3, 0.1), matShell);
    body.position.set(0, -0.32, 0);
    torso.add(body);

    // Chest panel
    var chest = new THREE.Mesh(roundedBox(0.52, 0.4, 0.1, 0.14, 0.04), matDark);
    chest.position.set(0, -0.28, 0.42);
    torso.add(chest);

    // Neck
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.18, 18), matJoint);
    neck.position.set(0, 0.2, 0);
    torso.add(neck);

    /* ---------- Arms ----------
       Hierarchy: shoulder pivot -> upper arm -> elbow pivot -> forearm + hand
       Pivots let us raise + oscillate for the wave.                        */
    function buildArm(side) {
        var shoulder = new THREE.Group();          // rotates to raise arm
        var ball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), matJoint);
        shoulder.add(ball);

        var upper = new THREE.Mesh(
            new THREE.CylinderGeometry(0.082, 0.075, 0.44, 14), matShell2
        );
        upper.position.y = -0.24;
        shoulder.add(upper);

        var elbow = new THREE.Group();             // rotates for the wave motion
        elbow.position.y = -0.46;
        shoulder.add(elbow);

        var elbowBall = new THREE.Mesh(new THREE.SphereGeometry(0.095, 18, 18), matJoint);
        elbow.add(elbowBall);

        var fore = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.062, 0.4, 14), matShell2
        );
        fore.position.y = -0.22;
        elbow.add(fore);

        var hand = new THREE.Mesh(roundedBox(0.17, 0.21, 0.12, 0.055, 0.03), matShell2);
        hand.position.y = -0.5;
        elbow.add(hand);

        shoulder.position.set(side * 0.68, -0.06, 0);
        shoulder.rotation.z = side * 0.12;
        return { root: shoulder, elbow: elbow };
    }

    var armL = buildArm(-1);
    var armR = buildArm(1);
    torso.add(armL.root);
    torso.add(armR.root);

    /* ---------- Legs ---------- */
    function buildLeg(side) {
        var g = new THREE.Group();

        var hip = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 18), matJoint);
        g.add(hip);

        var thigh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.095, 0.085, 0.34, 14), matShell2
        );
        thigh.position.y = -0.2;
        g.add(thigh);

        // Ribbed boot
        for (var i = 0; i < 3; i++) {
            var rib = new THREE.Mesh(
                new THREE.CylinderGeometry(0.135 - i * 0.006, 0.135 - i * 0.006, 0.085, 18),
                matJoint
            );
            rib.position.y = -0.42 - i * 0.09;
            g.add(rib);
        }

        var foot = new THREE.Mesh(roundedBox(0.26, 0.12, 0.4, 0.05, 0.03), matJoint);
        foot.position.set(0, -0.7, 0.06);
        g.add(foot);

        g.position.set(side * 0.28, -0.78, 0);
        return g;
    }
    torso.add(buildLeg(-1));
    torso.add(buildLeg(1));

    /* ---------- Backdrop grid ---------- */
    var grid = new THREE.GridHelper(7, 7, 0xc4ccd8, 0xd6dce5);
    grid.rotation.x = Math.PI / 2;
    grid.position.set(0.15, -0.1, -2.4);
    if (grid.material) {
        grid.material.transparent = true;
        grid.material.opacity = 0.5;
    }
    scene.add(grid);

    /* Contact shadow (soft ellipse under the feet) */
    var shadowGeo = new THREE.CircleGeometry(0.85, 40);
    var shadowMat = new THREE.MeshBasicMaterial({
        color: 0x9aa5b4, transparent: true, opacity: 0.18
    });
    var shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -1.52, 0.1);
    shadow.scale.set(1, 0.72, 1);
    scene.add(shadow);

    root.position.y = 0.18;

    /* ============================================================
       Interaction state
       ============================================================ */
    var pointer = { x: 0, y: 0 };      // normalised -1..1 target
    var smooth = { x: 0, y: 0 };       // eased value used for rotation

    function onPointerMove(e) {
        var r = container.getBoundingClientRect();
        // Measure against the container centre so the robot "looks at" the cursor
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        pointer.x = THREE.MathUtils.clamp((e.clientX - cx) / (window.innerWidth * 0.45), -1, 1);
        pointer.y = THREE.MathUtils.clamp((e.clientY - cy) / (window.innerHeight * 0.5), -1, 1);
    }
    window.addEventListener('mousemove', onPointerMove, { passive: true });

    // Touch: gently follow the last touch position
    window.addEventListener('touchmove', function (e) {
        if (e.touches && e.touches.length) onPointerMove(e.touches[0]);
    }, { passive: true });

    // Return to neutral when the cursor leaves the window
    window.addEventListener('mouseout', function () {
        pointer.x = 0; pointer.y = 0;
    }, { passive: true });

    /* ---------- Wave ---------- */
    var wave = { active: false, t: 0, duration: 2.4 };
    var nextWaveAt = 2.5;   // first wave shortly after load

    function startWave() {
        if (wave.active) return;
        wave.active = true;
        wave.t = 0;
    }

    function scheduleWave(now) {
        nextWaveAt = now + 5 + Math.random() * 6;   // every 5–11s
    }

    // Wave immediately when the visitor hovers the robot
    container.addEventListener('mouseenter', startWave);

    /* ---------- Blink ---------- */
    var blink = { closing: false, t: 0 };
    var nextBlinkAt = 3;

    /* ---------- Visibility gate (skip rendering when off-screen) ---------- */
    var visible = true;
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
        }, { threshold: 0.01 }).observe(container);
    }

    /* ---------- Resize ---------- */
    function resize() {
        var w = container.clientWidth;
        var h = container.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        // Pull the camera back a little on narrow layouts so the robot still fits
        camera.position.z = w < 420 ? 9.8 : 8.2;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    resize();
    window.addEventListener('resize', resize);

    /* ============================================================
       Animation loop
       ============================================================ */
    var clock = new THREE.Clock();
    var elapsed = 0;

    function animate() {
        requestAnimationFrame(animate);
        if (!visible) return;

        // NOTE: Clock.getElapsedTime() calls getDelta() internally, so we must
        // read the delta once and accumulate our own elapsed time.
        var dt = Math.min(clock.getDelta(), 0.05);
        elapsed += dt;
        var t = elapsed;

        /* --- Ease pointer --- */
        smooth.x += (pointer.x - smooth.x) * 0.075;
        smooth.y += (pointer.y - smooth.y) * 0.075;

        /* --- Cursor tracking: head leads, torso follows subtly --- */
        headPivot.rotation.y = smooth.x * 0.62;
        headPivot.rotation.x = smooth.y * 0.3;
        headPivot.rotation.z = -smooth.x * 0.07;

        torso.rotation.y = smooth.x * 0.24;
        torso.rotation.x = smooth.y * 0.07;

        root.rotation.y = smooth.x * 0.1;

        // Eyes drift a touch further than the head for a "looking" feel
        eyeGroup.position.x = smooth.x * 0.075;
        eyeGroup.position.y = -smooth.y * 0.045;

        /* --- Idle float + sway --- */
        if (!reduceMotion) {
            root.position.y = 0.18 + Math.sin(t * 1.15) * 0.05;
            root.rotation.z = Math.sin(t * 0.75) * 0.012;
            grid.position.y = -0.1 + Math.sin(t * 1.15) * 0.012;
        }

        /* --- Antenna bobble handled by tilt on the whole head, plus idle arm drift --- */
        var idleArm = Math.sin(t * 1.05) * 0.05;
        armL.root.rotation.z = 0.12 + idleArm;
        armL.elbow.rotation.z = -0.1 + idleArm * 0.5;

        /* --- Wave (right arm) --- */
        if (!reduceMotion && !wave.active && t > nextWaveAt) {
            startWave();
        }

        if (wave.active) {
            wave.t += dt;
            var p = wave.t / wave.duration;           // 0 → 1

            if (p >= 1) {
                wave.active = false;
                scheduleWave(t);
                armR.root.rotation.z = -0.12;
                armR.elbow.rotation.z = 0.1;
            } else {
                // Raise on the way in, lower on the way out
                var raise = Math.sin(Math.min(1, p / 0.22) * Math.PI * 0.5);
                if (p > 0.78) raise = Math.sin((1 - (p - 0.78) / 0.22) * Math.PI * 0.5);

                // Oscillate the forearm while the arm is up
                var swing = Math.sin(wave.t * 11) * 0.5 * raise;

                armR.root.rotation.z = -0.12 - raise * 2.05;
                armR.elbow.rotation.z = 0.1 + swing;

                // Friendly head tilt during the wave
                headPivot.rotation.z += raise * 0.06;
            }
        } else {
            armR.root.rotation.z = -0.12 - idleArm;
            armR.elbow.rotation.z = 0.1 - idleArm * 0.5;
        }

        /* --- Blink --- */
        if (!reduceMotion) {
            if (!blink.closing && t > nextBlinkAt) {
                blink.closing = true;
                blink.t = 0;
            }
            if (blink.closing) {
                blink.t += dt;
                var bp = blink.t / 0.16;              // 160ms blink
                if (bp >= 1) {
                    blink.closing = false;
                    eyeGroup.scale.y = 1;
                    nextBlinkAt = t + 2.5 + Math.random() * 3.5;
                } else {
                    // squash down then back up
                    eyeGroup.scale.y = 1 - Math.sin(bp * Math.PI) * 0.88;
                }
            }
        }

        renderer.render(scene, camera);
    }

    animate();
})();
