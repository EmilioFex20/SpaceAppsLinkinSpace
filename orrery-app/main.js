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

// Crear el Sol con textura
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('/textures/sun.jpg'); // Asegúrate de que la ruta sea correcta

const sunGeometry = new THREE.SphereGeometry(2, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ 
    map: sunTexture
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Configurar OrbitControls para permitir el movimiento de la cámara con el ratón
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Movimiento suave de la cámara
controls.dampingFactor = 0.05;
controls.enableZoom = true; // Permitir zoom con la rueda del ratón

// Definir un factor de escala para los planetas
const scaleFactor = 5; // Ajusta este valor para cambiar el tamaño de los planetas




