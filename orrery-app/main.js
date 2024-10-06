import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Crear la escena
const scene = new THREE.Scene();

var heavenlyBodies = [] ;

// Crear la cámara
const camera = new THREE.PerspectiveCamera(
    75, // Campo de visión
    window.innerWidth / window.innerHeight, // Relación de aspecto
    0.1, // Plano cercano
    1000 // Plano lejano
);

// Crear el renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Añadir una luz ambiental para iluminar suavemente toda la escena
const ambientLight = new THREE.AmbientLight(0xaaaaaaaaa); // Luz suave aumentada
scene.add(ambientLight);

// Añadir una luz puntual para simular el Sol
const sunLight = new THREE.PointLight(0xffffff, 5, 0); // Intensidad aumentada
sunLight.position.set(0, 0, 0); // El Sol está en el origen
scene.add(sunLight);




