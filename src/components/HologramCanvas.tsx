import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HologramCanvasProps {
  creatorId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function HologramCanvas({ creatorId, primaryColor, secondaryColor, accentColor }: HologramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    // Dynamically create the canvas to avoid StrictMode re-using a lost context
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.display = 'block';
    canvas.style.zIndex = '1';
    container.appendChild(canvas);

    // Renderer setup with manual context validation to prevent Three.js internal TypeErrors
    const width = parent.clientWidth || 320;
    const height = parent.clientHeight || 150;
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL context could not be initialized (limit reached or unsupported).');
      return;
    }

    const loseContextExt = gl.getExtension('WEBGL_lose_context');

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGLRenderer initialization failed:', e);
      if (loseContextExt) {
        loseContextExt.loseContext();
      }
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 5.8;

    // Create solid hexagonal prism and a slightly larger glowing wireframe outline
    const geometry1 = new THREE.CylinderGeometry(1.65, 1.65, 0.35, 6);
    const geometry2 = new THREE.CylinderGeometry(1.66, 1.66, 0.36, 6);

    // Rotate so flat faces face the camera and align corners vertically
    geometry1.rotateX(Math.PI / 2);
    geometry1.rotateZ(Math.PI / 6);
    geometry2.rotateX(Math.PI / 2);
    geometry2.rotateZ(Math.PI / 6);

    // Solid dark card backing that catches lighting facets
    const material1 = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0e0e14),
      roughness: 0.3,
      metalness: 0.85,
      flatShading: true,
    });

    // Glowing edge outline
    const material2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(primaryColor),
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const mesh1 = new THREE.Mesh(geometry1, material1);
    const mesh2 = new THREE.Mesh(geometry2, material2);
    
    scene.add(mesh1);
    scene.add(mesh2);

    // Lights to illuminate 3D facets of the solid extruded card
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(new THREE.Color(primaryColor), 2.2);
    dirLight1.position.set(4, 5, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(new THREE.Color(secondaryColor), 1.6);
    dirLight2.position.set(-4, -5, 5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(new THREE.Color(accentColor), 2.0, 15);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    // Floating particles
    const particleCount = 60;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 1.8 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = (Math.random() - 0.5) * 1.0;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(accentColor),
      size: 0.04,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Track mouse coordinates for interactive tilt - matching CSS direction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      targetRotation.current.x = -y * 0.45; // Match CSS rotateX tilt
      targetRotation.current.y = x * 0.45;  // Match CSS rotateY tilt
    };

    const handleMouseLeave = () => {
      targetRotation.current.x = 0;
      targetRotation.current.y = 0;
    };

    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);

    // Handle Resize
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const entry = entries[0];
        const newWidth = entry.contentRect.width || parent.clientWidth;
        const newHeight = entry.contentRect.height || parent.clientHeight;
        
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
      });
      resizeObserver.observe(parent);
    }

    // Animation Loop using performance.now()
    let animationFrameId: number;
    const startTime = performance.now();
    let currentScale = 0.1;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smoothly grow the hexagonal cylinder from scale 0.1 to 1.0 on mount
      currentScale += (1.0 - currentScale) * 0.12;

      // Smooth interpolation of mouse tilt (lerp)
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      // Align ThreeJS orientation with CSS tilt
      mesh1.rotation.x = currentRotation.current.x;
      mesh1.rotation.y = currentRotation.current.y;
      mesh2.rotation.copy(mesh1.rotation);

      // Scale meshes
      mesh1.scale.setScalar(currentScale);
      mesh2.scale.setScalar(currentScale * 1.005);

      // Subtle float of particles in background
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.z = elapsedTime * 0.02;

      // Random projector glitch flicker effect (1.5% chance per frame)
      const isGlitching = Math.random() < 0.015;
      if (isGlitching) {
        const glitchScale = currentScale * (1.0 + (Math.random() - 0.5) * 0.05);
        mesh1.scale.setScalar(glitchScale);
        mesh2.scale.setScalar(glitchScale * 1.005);
        material2.opacity = 0.2 + Math.random() * 0.5;
        particleMaterial.opacity = 0.1 + Math.random() * 0.6;
      } else {
        mesh1.scale.setScalar(currentScale);
        mesh2.scale.setScalar(currentScale * 1.005);
        material2.opacity = 0.5;
        particleMaterial.opacity = 0.45;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      
      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      geometry1.dispose();
      geometry2.dispose();
      material1.dispose();
      material2.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      
      renderer.dispose();
      
      // Forcefully release the GPU context instantly
      if (loseContextExt) {
        loseContextExt.loseContext();
      }
      
      // Remove the canvas from the DOM
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [creatorId, primaryColor, secondaryColor, accentColor]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        display: 'block',
        zIndex: 1
      }} 
    />
  );
}
