import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Hand } from 'lucide-react';
import { solarSystemData, CelestialBody } from '../data/solarSystem';
import { useExhibitStore } from '../store/useExhibitStore';
import { playClickSound, playZoomSound } from '../utils/sound';

type BodyFamily =
  | 'star'
  | 'terrestrial'
  | 'gasGiant'
  | 'iceGiant'
  | 'moon'
  | 'dwarf'
  | 'galaxy';

const BODY_FAMILIES: Record<string, BodyFamily> = {
  sun: 'star',
  mercury: 'terrestrial',
  venus: 'terrestrial',
  earth: 'terrestrial',
  moon: 'moon',
  mars: 'terrestrial',
  jupiter: 'gasGiant',
  saturn: 'gasGiant',
  uranus: 'iceGiant',
  neptune: 'iceGiant',
  pluto: 'dwarf',
  milkyway: 'galaxy',
};

const ATMOSPHERE_COLORS: Partial<Record<string, string>> = {
  venus: '#ffd08a',
  earth: '#6cc8ff',
  mars: '#ff8c5a',
  jupiter: '#ffd2a8',
  saturn: '#f6d9aa',
  uranus: '#93f5ff',
  neptune: '#6aa2ff',
  pluto: '#b8d6ff',
};

const ATMOSPHERE_OPACITY: Partial<Record<string, number>> = {
  venus: 0.18,
  earth: 0.22,
  mars: 0.12,
  jupiter: 0.08,
  saturn: 0.08,
  uranus: 0.16,
  neptune: 0.18,
  pluto: 0.08,
};

const CLOUD_LAYER_BODIES = new Set(['earth', 'venus', 'jupiter', 'saturn', 'uranus', 'neptune']);
const BODY_TILT: Partial<Record<string, number>> = {
  mercury: 0.03,
  venus: 0.08,
  earth: 0.41,
  moon: 0.12,
  mars: 0.44,
  jupiter: 0.05,
  saturn: 0.47,
  uranus: 1.71,
  neptune: 0.49,
  pluto: 0.3,
};

const ORBIT_DAYS_PER_SECOND = 18;
const BODY_LOOKUP = new Map<string, CelestialBody>(solarSystemData.map((body) => [body.id, body]));

function getBodyPosition(data: CelestialBody, elapsedTime: number): THREE.Vector3 {
  if (!data.orbit) {
    return new THREE.Vector3(data.distance, 0, 0);
  }

  const parentPosition = data.orbit.parentId
    ? getBodyPosition(BODY_LOOKUP.get(data.orbit.parentId) ?? { ...data, orbit: undefined }, elapsedTime)
    : new THREE.Vector3(0, 0, 0);
  const angle =
    THREE.MathUtils.degToRad(data.orbit.initialAngle) +
    (elapsedTime * ORBIT_DAYS_PER_SECOND * Math.PI * 2) / data.orbit.periodDays;

  return parentPosition.add(new THREE.Vector3(
    Math.cos(angle) * data.distance,
    0,
    Math.sin(angle) * data.distance,
  ));
}

function createSeededRandom(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return () => {
    hash += 0x6d2b79f5;
    let value = hash;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  draw(ctx, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function hexToRgba(hex: string, alpha = 1) {
  const color = new THREE.Color(hex);
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function pickColor(palette: string[], random: () => number) {
  return palette[Math.floor(random() * palette.length)] ?? palette[0];
}

function drawBackgroundGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  top: string,
  middle: string,
  bottom: string,
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.5, middle);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawBands(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: string[],
  random: () => number,
  contrast = 0.12,
) {
  let cursor = 0;

  while (cursor < height) {
    const bandHeight = 10 + random() * 34;
    ctx.fillStyle = pickColor(palette, random);
    ctx.fillRect(0, cursor, width, bandHeight);

    ctx.globalAlpha = contrast;
    ctx.fillStyle = '#ffffff';
    for (let x = 0; x < width; x += 24) {
      const wave = Math.sin((x / width) * Math.PI * 8 + cursor * 0.08) * 6;
      ctx.fillRect(x, cursor + bandHeight * 0.5 + wave, 14, 2);
    }
    ctx.globalAlpha = 1;

    cursor += bandHeight;
  }
}

function drawSpeckles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  palette: string[],
  random: () => number,
  minSize: number,
  maxSize: number,
  alpha = 0.28,
) {
  for (let index = 0; index < count; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = minSize + random() * (maxSize - minSize);
    const color = pickColor(palette, random);

    ctx.beginPath();
    ctx.fillStyle = hexToRgba(color, alpha * (0.7 + random() * 0.5));
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawContinents(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  random: () => number,
) {
  const continentPalette = ['#4f8f45', '#658f41', '#8b8a55', '#baa170'];

  for (let index = 0; index < 9; index += 1) {
    const centerX = random() * width;
    const centerY = height * (0.18 + random() * 0.64);
    const radiusX = 45 + random() * 120;
    const radiusY = 18 + random() * 55;

    ctx.beginPath();
    ctx.moveTo(centerX - radiusX, centerY);
    for (let step = 0; step <= 10; step += 1) {
      const angle = (step / 10) * Math.PI * 2;
      const noise = 0.65 + random() * 0.7;
      const x = centerX + Math.cos(angle) * radiusX * noise;
      const y = centerY + Math.sin(angle) * radiusY * noise;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = pickColor(continentPalette, random);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(0, 0, width, height * 0.08);
  ctx.fillRect(0, height * 0.92, width, height * 0.08);
}

function drawCraterField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  random: () => number,
  count: number,
) {
  for (let index = 0; index < count; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = 5 + random() * 28;

    ctx.beginPath();
    ctx.fillStyle = 'rgba(30, 20, 15, 0.18)';
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.5;
    ctx.arc(x - radius * 0.12, y - radius * 0.12, radius * 0.72, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function createPlanetSurfaceTexture(data: CelestialBody) {
  const random = createSeededRandom(`${data.id}-surface`);

  return createCanvasTexture(1024, 512, (ctx, width, height) => {
    switch (BODY_FAMILIES[data.id]) {
      case 'star':
        drawBackgroundGradient(ctx, width, height, '#ff6b1a', '#ff9b1f', '#7c1200');
        drawBands(ctx, width, height, ['#ff6e1d', '#ff9f1c', '#ffce47', '#c43b00'], random, 0.18);
        drawSpeckles(ctx, width, height, 220, ['#ffd766', '#ff8f33', '#ff5b1f'], random, 8, 26, 0.35);
        break;
      case 'gasGiant':
        if (data.id === 'jupiter') {
          drawBackgroundGradient(ctx, width, height, '#f4d6be', '#c99070', '#8c5b48');
          drawBands(ctx, width, height, ['#f1d9bf', '#d3a57f', '#b7745d', '#7e594f'], random, 0.2);
          ctx.beginPath();
          ctx.fillStyle = 'rgba(166, 73, 47, 0.65)';
          ctx.ellipse(width * 0.72, height * 0.62, 90, 42, -0.08, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawBackgroundGradient(ctx, width, height, '#f2dfbd', '#d6b08d', '#8b6a4c');
          drawBands(ctx, width, height, ['#f4e1bf', '#d0b091', '#b78a67', '#8b6d56'], random, 0.12);
        }
        break;
      case 'iceGiant':
        drawBackgroundGradient(
          ctx,
          width,
          height,
          data.id === 'uranus' ? '#d0fbff' : '#7bb7ff',
          data.id === 'uranus' ? '#95edf7' : '#2d6be3',
          data.id === 'uranus' ? '#7bd9de' : '#183a86',
        );
        drawBands(
          ctx,
          width,
          height,
          data.id === 'uranus'
            ? ['#d6ffff', '#9fe8ee', '#72ccd5']
            : ['#93bbff', '#4c89ff', '#1a4fc0'],
          random,
          0.08,
        );
        drawSpeckles(
          ctx,
          width,
          height,
          data.id === 'uranus' ? 40 : 55,
          ['#ffffff', '#d8eeff'],
          random,
          4,
          14,
          0.08,
        );
        break;
      case 'moon':
        drawBackgroundGradient(ctx, width, height, '#e4e6eb', '#b8bcc4', '#7b8087');
        drawSpeckles(ctx, width, height, 320, ['#d6dae0', '#b0b7bf', '#7d848d'], random, 4, 18, 0.26);
        drawCraterField(ctx, width, height, random, 80);
        break;
      case 'dwarf':
        drawBackgroundGradient(ctx, width, height, '#f7ebdf', '#d7b9a3', '#8b6c61');
        drawSpeckles(ctx, width, height, 260, ['#fff2e8', '#d8baa8', '#b08c7f'], random, 4, 20, 0.2);
        drawCraterField(ctx, width, height, random, 46);
        break;
      case 'galaxy':
        drawBackgroundGradient(ctx, width, height, '#02030a', '#061128', '#010104');
        drawSpeckles(ctx, width, height, 1000, ['#ffffff', '#a7c8ff', '#ffd9b0'], random, 1, 2.6, 0.9);
        ctx.strokeStyle = 'rgba(120, 180, 255, 0.18)';
        ctx.lineWidth = 26;
        ctx.beginPath();
        ctx.moveTo(width * 0.08, height * 0.45);
        ctx.bezierCurveTo(width * 0.28, height * 0.1, width * 0.66, height * 0.92, width * 0.92, height * 0.58);
        ctx.stroke();
        break;
      case 'terrestrial':
      default:
        if (data.id === 'earth') {
          drawBackgroundGradient(ctx, width, height, '#3177d7', '#1d4fa1', '#123262');
          drawContinents(ctx, width, height, random);
          drawSpeckles(ctx, width, height, 90, ['#5fc0ff', '#0c468d'], random, 3, 10, 0.22);
        } else if (data.id === 'venus') {
          drawBackgroundGradient(ctx, width, height, '#ffdf9c', '#db9c56', '#87551d');
          drawBands(ctx, width, height, ['#ffdf9c', '#f4be72', '#ce7f3a', '#8b4d19'], random, 0.12);
          drawSpeckles(ctx, width, height, 160, ['#fff2cd', '#ffcf85', '#b86a2b'], random, 6, 22, 0.14);
        } else if (data.id === 'mars') {
          drawBackgroundGradient(ctx, width, height, '#de7640', '#a1411d', '#612111');
          drawSpeckles(ctx, width, height, 240, ['#f3a062', '#bc5225', '#7b2b12'], random, 5, 18, 0.24);
          drawCraterField(ctx, width, height, random, 28);
        } else {
          drawBackgroundGradient(ctx, width, height, '#b1aaa5', '#7d7775', '#3d3839');
          drawSpeckles(ctx, width, height, 300, ['#d7d2cc', '#8f8b8b', '#4f4c50'], random, 5, 18, 0.24);
          drawCraterField(ctx, width, height, random, 36);
        }
        break;
    }

    const vignette = ctx.createLinearGradient(0, 0, width, 0);
    vignette.addColorStop(0, 'rgba(255,255,255,0.12)');
    vignette.addColorStop(0.15, 'rgba(255,255,255,0.02)');
    vignette.addColorStop(0.85, 'rgba(0,0,0,0.04)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  });
}

function createCloudTexture(data: CelestialBody) {
  if (!CLOUD_LAYER_BODIES.has(data.id)) {
    return null;
  }

  const random = createSeededRandom(`${data.id}-clouds`);

  return createCanvasTexture(1024, 512, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);

    if (data.id === 'earth') {
      for (let index = 0; index < 110; index += 1) {
        const x = random() * width;
        const y = random() * height;
        const cloudWidth = 24 + random() * 90;
        const cloudHeight = 10 + random() * 36;
        ctx.fillStyle = `rgba(255,255,255,${0.12 + random() * 0.36})`;
        ctx.beginPath();
        ctx.ellipse(x, y, cloudWidth, cloudHeight, random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (data.id === 'venus') {
      drawBands(ctx, width, height, ['#fff5d2', '#f8d897', '#d8a555'], random, 0.08);
      ctx.globalAlpha = 0.48;
      for (let index = 0; index < 26; index += 1) {
        ctx.fillStyle = '#fff7dc';
        ctx.beginPath();
        ctx.ellipse(random() * width, random() * height, 160 + random() * 220, 18 + random() * 46, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      const palette =
        data.id === 'jupiter'
          ? ['#fff2e2', '#efd4b9', '#d8b392']
          : data.id === 'saturn'
            ? ['#fff3da', '#ead2ab', '#d4b183']
            : data.id === 'uranus'
              ? ['#f1ffff', '#cbfcff', '#94eef7']
              : ['#e5efff', '#bfd8ff', '#8eb3ff'];

      drawBands(ctx, width, height, palette, random, 0.16);
      ctx.globalAlpha = 0.12;
      for (let index = 0; index < 14; index += 1) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, random() * height, width, 3 + random() * 6);
      }
      ctx.globalAlpha = 1;
    }
  });
}

function createSunCoronaTexture() {
  const random = createSeededRandom('sun-corona');

  return createCanvasTexture(1024, 512, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    drawBackgroundGradient(ctx, width, height, '#ffbe55', '#ff6c1c', '#5e1300');

    for (let index = 0; index < 180; index += 1) {
      const x = random() * width;
      const y = random() * height;
      const radiusX = 12 + random() * 48;
      const radiusY = 4 + random() * 18;
      ctx.fillStyle = `rgba(255, ${150 + Math.floor(random() * 70)}, 80, ${0.08 + random() * 0.14})`;
      ctx.beginPath();
      ctx.ellipse(x, y, radiusX, radiusY, random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function createRingTexture(color: string) {
  const random = createSeededRandom(`ring-${color}`);

  return createCanvasTexture(1024, 64, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.1, hexToRgba(color, 0.7));
    gradient.addColorStop(0.4, hexToRgba('#f7e3be', 0.9));
    gradient.addColorStop(0.62, hexToRgba('#9b724d', 0.65));
    gradient.addColorStop(0.9, hexToRgba(color, 0.65));
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (let x = 0; x < width; x += 10) {
      ctx.fillStyle = `rgba(255,255,255,${0.04 + random() * 0.12})`;
      ctx.fillRect(x, 0, 3 + random() * 6, height);
    }
  });
}

function getBodyMaterialProps(data: CelestialBody) {
  const family = BODY_FAMILIES[data.id];

  switch (family) {
    case 'gasGiant':
      return { roughness: 0.86, metalness: 0.02, clearcoat: 0.08, clearcoatRoughness: 0.7 };
    case 'iceGiant':
      return { roughness: 0.58, metalness: 0.02, clearcoat: 0.22, clearcoatRoughness: 0.35 };
    case 'moon':
    case 'dwarf':
      return { roughness: 0.94, metalness: 0.01, clearcoat: 0, clearcoatRoughness: 1 };
    case 'galaxy':
      return { roughness: 1, metalness: 0, clearcoat: 0, clearcoatRoughness: 1 };
    case 'terrestrial':
    default:
      return {
        roughness: data.id === 'earth' ? 0.56 : 0.88,
        metalness: 0.02,
        clearcoat: data.id === 'earth' ? 0.26 : 0.04,
        clearcoatRoughness: data.id === 'earth' ? 0.3 : 0.7,
      };
  }
}

function useOptionalTexture(url?: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }

    let active = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    loader.load(
      url,
      (loaded) => {
        if (!active) {
          loaded.dispose();
          return;
        }

        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.wrapS = THREE.RepeatWrapping;
        loaded.wrapT = THREE.ClampToEdgeWrapping;
        setTexture(loaded);
      },
      undefined,
      (error) => {
        console.warn(`Could not load texture for ${url}. Falling back to generated texture.`, error);
        if (active) {
          setTexture(null);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [url]);

  return texture;
}

function PlanetMaterial({ data }: { data: CelestialBody }) {
  const remoteTexture = useOptionalTexture(data.id === 'sun' ? undefined : data.textureUrl);
  const generatedTexture = useMemo(() => createPlanetSurfaceTexture(data), [data]);
  const materialProps = getBodyMaterialProps(data);
  const map = data.id === 'sun' ? generatedTexture : remoteTexture ?? generatedTexture;

  useEffect(() => {
    return () => {
      generatedTexture?.dispose();
    };
  }, [generatedTexture]);

  if (data.id === 'sun') {
    return (
      <meshBasicMaterial
        map={map ?? undefined}
        color="#ffffff"
        toneMapped={false}
      />
    );
  }

  if (data.id === 'milkyway') {
    return (
      <meshBasicMaterial
        map={map ?? undefined}
        color="#ffffff"
        transparent
        opacity={0.95}
        toneMapped={false}
      />
    );
  }

  return (
    <meshPhysicalMaterial
      map={map ?? undefined}
      color="#ffffff"
      roughness={materialProps.roughness}
      metalness={materialProps.metalness}
      clearcoat={materialProps.clearcoat}
      clearcoatRoughness={materialProps.clearcoatRoughness}
    />
  );
}

function CloudLayer({ data }: { data: CelestialBody }) {
  const cloudTexture = useMemo(() => createCloudTexture(data), [data]);
  const cloudRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    return () => {
      cloudTexture?.dispose();
    };
  }, [cloudTexture]);

  useFrame((_, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * (data.id === 'venus' ? 0.035 : 0.06);
    }
  });

  if (!cloudTexture) {
    return null;
  }

  return (
    <mesh ref={cloudRef} scale={1.018}>
      <sphereGeometry args={[data.size, 64, 64]} />
      <meshPhysicalMaterial
        map={cloudTexture}
        alphaMap={cloudTexture}
        transparent
        opacity={data.id === 'venus' ? 0.52 : 0.34}
        color={data.id === 'venus' ? '#fff0cc' : '#ffffff'}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        roughness={0.22}
        metalness={0}
      />
    </mesh>
  );
}

function AtmosphereShell({ data }: { data: CelestialBody }) {
  const color = ATMOSPHERE_COLORS[data.id];
  if (!color) {
    return null;
  }

  return (
    <>
      <mesh scale={1.08}>
        <sphereGeometry args={[data.size, 64, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={ATMOSPHERE_OPACITY[data.id] ?? 0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh scale={1.14}>
        <sphereGeometry args={[data.size, 64, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={(ATMOSPHERE_OPACITY[data.id] ?? 0.12) * 0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
}

function SunCorona({ size }: { size: number }) {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const coronaTexture = useMemo(() => createSunCoronaTexture(), []);

  useEffect(() => {
    return () => {
      coronaTexture?.dispose();
    };
  }, [coronaTexture]);

  useFrame((state, delta) => {
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.025;

    if (innerRef.current) {
      innerRef.current.rotation.y += delta * 0.09;
      innerRef.current.scale.setScalar(1.08 * pulse);
    }

    if (outerRef.current) {
      outerRef.current.rotation.y -= delta * 0.05;
      outerRef.current.scale.setScalar(1.24 + Math.sin(state.clock.elapsedTime * 1.5) * 0.04);
    }
  });

  if (!coronaTexture) {
    return null;
  }

  return (
    <>
      <mesh ref={innerRef}>
        <sphereGeometry args={[size * 1.08, 64, 64]} />
        <meshBasicMaterial
          map={coronaTexture}
          color="#ff9e39"
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={outerRef}>
        <sphereGeometry args={[size * 1.24, 64, 64]} />
        <meshBasicMaterial
          map={coronaTexture}
          color="#ff5d1f"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

function SaturnRingMaterial({ data }: { data: CelestialBody }) {
  const remoteTexture = useOptionalTexture(data.ring?.textureUrl);
  const generatedTexture = useMemo(
    () => (data.ring ? createRingTexture(data.ring.color) : null),
    [data],
  );

  useEffect(() => {
    return () => {
      generatedTexture?.dispose();
    };
  }, [generatedTexture]);

  const map = remoteTexture ?? generatedTexture;

  return (
    <meshStandardMaterial
      map={map ?? undefined}
      color="#ffffff"
      transparent
      opacity={0.92}
      roughness={0.84}
      metalness={0.02}
      side={THREE.DoubleSide}
    />
  );
}

function Planet({ data, isSelected }: { data: CelestialBody; isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { selectBody } = useExhibitStore();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (data.id === 'sun' ? 0.08 : 0.2);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.03;
    }

    if (orbitRef.current) {
      orbitRef.current.position.copy(getBodyPosition(data, state.clock.elapsedTime));
    }
  });

  return (
    <>
      {data.orbit && !data.orbit.parentId && data.distance > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.distance - 0.15, data.distance + 0.15, 128]} />
          <meshBasicMaterial color="#9bb6ff" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
      )}

      <group ref={orbitRef}>
        <group
          ref={groupRef}
          rotation={[0, 0, BODY_TILT[data.id] ?? 0]}
          onClick={(event) => {
            event.stopPropagation();
            playClickSound();
            selectBody(data);
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <mesh ref={meshRef}>
            <sphereGeometry args={[data.size, 64, 64]} />
            <PlanetMaterial data={data} />
          </mesh>

          {data.id === 'sun' && (
            <>
              <SunCorona size={data.size} />
              <Sparkles
                count={120}
                scale={data.size * 4.2}
                size={10}
                speed={0.5}
                opacity={0.9}
                color="#ffb347"
              />
              <pointLight intensity={5.5} distance={650} decay={2} color="#ffb347" />
            </>
          )}

          {data.id !== 'sun' && <AtmosphereShell data={data} />}
          {data.id !== 'sun' && <CloudLayer data={data} />}

          {data.ring && (
            <mesh ref={ringRef} rotation={[-Math.PI / 2 + 0.32, 0, 0]}>
              <ringGeometry args={[data.ring.innerRadius, data.ring.outerRadius, 96]} />
              <SaturnRingMaterial data={data} />
            </mesh>
          )}

          {isSelected && (
            <mesh scale={1.1}>
              <sphereGeometry args={[data.size, 32, 32]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.18} wireframe />
            </mesh>
          )}

          {!isSelected && (
            <Html position={[0, -data.size - 2, 0]} center zIndexRange={[100, 0]}>
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all cursor-pointer animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  onClick={(event) => {
                    event.stopPropagation();
                    playClickSound();
                    selectBody(data);
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <Hand size={18} />
                </button>
                <div
                  className="text-white/90 text-xs uppercase tracking-widest font-mono whitespace-nowrap pointer-events-none"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {data.name}
                </div>
              </div>
            </Html>
          )}
        </group>
      </group>
    </>
  );
}

function CameraController() {
  const { selectedBody, isIdle } = useExhibitStore();
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    if (selectedBody) {
      playZoomSound();
    } else if (!isIdle) {
      targetPosition.current.set(260, 150, 420);
      targetLookAt.current.set(0, 0, 0);
      setIsAnimating(true);
      playZoomSound();
    }
  }, [selectedBody, isIdle]);

  useFrame((state, delta) => {
    if (selectedBody) {
      const bodyPos = getBodyPosition(selectedBody, state.clock.elapsedTime);
      const offset = Math.max(selectedBody.size * 3.25, 20);
      const radialOffset = bodyPos.clone().setY(0);

      if (radialOffset.lengthSq() < 1) {
        radialOffset.set(1, 0, 0);
      } else {
        radialOffset.normalize();
      }

      targetPosition.current
        .copy(bodyPos)
        .add(radialOffset.multiplyScalar(offset))
        .add(new THREE.Vector3(0, offset * 0.45, offset * 0.8));
      targetLookAt.current.copy(bodyPos);
      camera.position.lerp(targetPosition.current, delta * 2.4);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, delta * 3);
        controlsRef.current.update();
      }
    } else if (isAnimating) {
      camera.position.lerp(targetPosition.current, delta * 3);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, delta * 3);
        controlsRef.current.update();
      }
      if (camera.position.distanceTo(targetPosition.current) < 1) {
        setIsAnimating(false);
      }
    } else if (isIdle && !selectedBody) {
      const time = state.clock.getElapsedTime();
      targetPosition.current.set(Math.sin(time * 0.04) * 220, 110, Math.cos(time * 0.04) * 220 + 320);
      targetLookAt.current.set(0, 0, 0);
      camera.position.lerp(targetPosition.current, delta * 2);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, delta * 2);
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom
      enablePan
      enableRotate
      makeDefault
      maxDistance={1000}
      minDistance={5}
    />
  );
}

export default function Scene() {
  const { selectedBody } = useExhibitStore();

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [260, 150, 420], fov: 45 }}>
        <color attach="background" args={['#020205']} />

        <ambientLight intensity={0.12} />
        <hemisphereLight intensity={0.1} color="#b8c6ff" groundColor="#05070d" />

        <Stars radius={320} depth={70} count={6000} factor={4} saturation={0} fade speed={1} />
        <Stars radius={130} depth={24} count={1600} factor={2.2} saturation={0.4} fade speed={0.45} />

        <group>
          {solarSystemData.map((body) => (
            <Planet key={body.id} data={body} isSelected={selectedBody?.id === body.id} />
          ))}
        </group>

        <CameraController />
      </Canvas>
    </div>
  );
}
