"use client";

import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { ITEM_BY_ID, PET_MODELS, petModelUrl } from "@/lib/items";

function Model({ url, scale = 1, y = 0, spin }) {
  const holder = useRef();
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  // клон, чтобы одну модель можно было показывать в двух местах
  const { obj, k, center } = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const k = 1.8 / Math.max(size.x, size.y, size.z || 1);
    return { obj: c, k, center };
  }, [scene]);

  useEffect(() => {
    const name =
      names.find((n) => /idle|stand|walk/i.test(n)) ?? names[0];
    const a = name ? actions[name] : null;
    a?.reset().fadeIn(0.3).play();
    return () => {
      a?.fadeOut(0.2);
    };
  }, [actions, names]);

  useFrame((_, dt) => {
    if (spin && holder.current) holder.current.rotation.y += dt * 0.8;
  });

  return (
    <group ref={holder} position={[0, y, 0]} scale={k * scale}>
      <group ref={group}>
        <primitive
          object={obj}
          position={[-center.x, -center.y, -center.z]}
        />
      </group>
    </group>
  );
}

export default function PetViewer({
  petId,
  interactive = false,
  className = "",
}) {
  const item = ITEM_BY_ID[petId];
  const cfg = PET_MODELS[petId];

  // нет модели, показываем эмодзи
  if (!item || !cfg) {
    return (
      <div
        className={`flex items-center justify-center w-full h-full text-4xl animate-pulse ${className}`}
      >
        {item?.emoji}
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0.5, 3.2], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        style={{ pointerEvents: interactive ? "auto" : "none" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <directionalLight position={[-4, 2, -3]} intensity={1.2} color="#5ecbff" />
        <Suspense fallback={null}>
          <Model
            url={petModelUrl(petId)}
            scale={cfg.scale}
            y={cfg.y}
            spin={!interactive}
          />
        </Suspense>
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={2}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.9}
          />
        )}
      </Canvas>
    </div>
  );
}