import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Crear la escena
const scene = new THREE.Scene();

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
const sunTexture = textureLoader.load('/textures/sun.jpg'); // Ruta absoluta correcta

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

// Datos de los planetas del sistema solar
const planets = [
    {
        name: 'Mercurio',
        semiMajorAxis: 5, // Escala ajustada para visualización
        eccentricity: 0.2056,
        inclination: 7.00, // Grados
        longitudeOfAscendingNode: 48.3313, // Grados
        argumentOfPeriapsis: 29.1241, // Grados
        meanLongitude: 252.25084, // Grados
        orbitalPeriod: 88, // Días
        rotationPeriod: 58.6, // Días (Rotación retrógrada)
        radius: 0.2, // Tamaño visual
        color: 0xaaaaaa, // Color gris
        texture: '/textures/mercury.jpg' // Ruta absoluta correcta
    },
    {
        name: 'Venus',
        semiMajorAxis: 7,
        eccentricity: 0.0068,
        inclination: 3.39,
        longitudeOfAscendingNode: 76.6807,
        argumentOfPeriapsis: 54.8523,
        meanLongitude: 181.97973,
        orbitalPeriod: 224.7,
        rotationPeriod: -243,
        radius: 0.45,
        color: 0xffddaa,
        texture: '/textures/venus.jpg'
    },
    {
        name: 'Tierra',
        semiMajorAxis: 10,
        eccentricity: 0.0167,
        inclination: 0.0,
        longitudeOfAscendingNode: 0.0,
        argumentOfPeriapsis: 102.94719,
        meanLongitude: 100.46435,
        orbitalPeriod: 365.25,
        rotationPeriod: 1,
        radius: 0.5,
        color: 0x0000ff,
        texture: '/textures/earth.jpg'
    },
    {
        name: 'Marte',
        semiMajorAxis: 15,
        eccentricity: 0.0934,
        inclination: 1.85,
        longitudeOfAscendingNode: 49.57854,
        argumentOfPeriapsis: 286.502,
        meanLongitude: 355.45332,
        orbitalPeriod: 687,
        rotationPeriod: 1.03,
        radius: 0.4,
        color: 0xff4500,
        texture: '/textures/mars.jpg'
    },
    {
        name: 'Júpiter',
        semiMajorAxis: 52,
        eccentricity: 0.0489,
        inclination: 1.303,
        longitudeOfAscendingNode: 100.55615,
        argumentOfPeriapsis: 273.867,
        meanLongitude: 34.40438,
        orbitalPeriod: 4331,
        rotationPeriod: 0.41,
        radius: 1,
        color: 0xffa500,
        texture: '/textures/jupiter.jpg'
    },
    {
        name: 'Saturno',
        semiMajorAxis: 95,
        eccentricity: 0.0565,
        inclination: 2.485,
        longitudeOfAscendingNode: 113.71504,
        argumentOfPeriapsis: 339.392,
        meanLongitude: 49.94432,
        orbitalPeriod: 10747,
        rotationPeriod: 0.44,
        radius: 0.85,
        color: 0xf5deb3,
        texture: '/textures/saturn.jpg'
    },
    {
        name: 'Urano',
        semiMajorAxis: 191,
        eccentricity: 0.0463,
        inclination: 0.773,
        longitudeOfAscendingNode: 74.22988,
        argumentOfPeriapsis: 96.73436,
        meanLongitude: 313.23218,
        orbitalPeriod: 30589,
        rotationPeriod: -0.72,
        radius: 0.7,
        color: 0xadd8e6,
        texture: '/textures/uranus.jpg'
    },
    {
        name: 'Neptuno',
        semiMajorAxis: 300,
        eccentricity: 0.0095,
        inclination: 1.770,
        longitudeOfAscendingNode: 131.72169,
        argumentOfPeriapsis: 276.045,
        meanLongitude: -55.120029,
        orbitalPeriod: 59800,
        rotationPeriod: 0.67,
        radius: 0.65,
        color: 0x0000ff,
        texture: '/textures/neptune.jpg'
    }
];

// Función para convertir grados a radianes
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Función para calcular la posición de un planeta en 3D
function calculatePosition(planet, time) {
    // Calcular la anomalía media (M)
    const meanAnomaly = toRadians(
        (planet.meanLongitude + (360 / planet.orbitalPeriod) * time) % 360
    );

    // Aproximación simplificada de la anomalía verdadera (ν = M)
    // Nota: Para mayor precisión, se debería resolver la ecuación de Kepler
    const trueAnomaly = meanAnomaly;

    // Distancia radial desde el Sol al planeta
    const r = planet.semiMajorAxis * (1 - planet.eccentricity * Math.cos(trueAnomaly));

    // Posición en el plano orbital
    const xOrbital = r * Math.cos(trueAnomaly);
    const yOrbital = r * Math.sin(trueAnomaly);

    // Rotación por argumento del periapsis (ω) alrededor del eje Z
    const cosArgPeriapsis = Math.cos(toRadians(planet.argumentOfPeriapsis));
    const sinArgPeriapsis = Math.sin(toRadians(planet.argumentOfPeriapsis));

    const xRotated = xOrbital * cosArgPeriapsis - yOrbital * sinArgPeriapsis;
    const yRotated = xOrbital * sinArgPeriapsis + yOrbital * cosArgPeriapsis;

    // Inclinación de la órbita (i) alrededor del eje X
    const cosInclination = Math.cos(toRadians(planet.inclination));
    const sinInclination = Math.sin(toRadians(planet.inclination));

    const zInclined = yRotated * sinInclination;
    const yInclined = yRotated * cosInclination;

    // Rotación por longitud del nodo ascendente (Ω) alrededor del eje Z
    const cosLongAscNode = Math.cos(toRadians(planet.longitudeOfAscendingNode));
    const sinLongAscNode = Math.sin(toRadians(planet.longitudeOfAscendingNode));

    const xFinal = xRotated * cosLongAscNode - yInclined * sinLongAscNode;
    const yFinal = xRotated * sinLongAscNode + yInclined * cosLongAscNode;

    return { x: xFinal, y: yFinal, z: zInclined };
}
// Añadir planetas a la escena
planets.forEach(planet => {
    const planetGeometry = new THREE.SphereGeometry(planet.radius, 64, 64);
    const planetMaterial = new THREE.MeshPhongMaterial({
        map: textureLoader.load(planet.texture),
        shininess: 100000,
        specular: new THREE.Color(0xffffff)
    });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.mesh = planetMesh;
    scene.add(planetMesh);
});

// Posición inicial de la cámara
camera.position.set(0, 100, 300);
controls.update();

// Raycaster para detectar la selección de planetas
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Manejar clic en la pantalla
function onMouseClick(event) {
    // Convertir las coordenadas del clic a coordenadas normalizadas
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Lanzar un rayo desde la cámara
    raycaster.setFromCamera(mouse, camera);

    // Detectar intersección con planetas
    const intersects = raycaster.intersectObjects(planets.map(planet => planet.mesh));
    if (intersects.length > 0) {
        const selectedPlanet = intersects[0].object;
        
        // Acercar la cámara al planeta seleccionado
        const targetPosition = selectedPlanet.position.clone().multiplyScalar(1.5); // Ajusta la distancia
        controls.target.copy(selectedPlanet.position);
        camera.position.copy(targetPosition);
    }
}

// Evento de clic
window.addEventListener('click', onMouseClick);
// Función para crear una órbita elíptica correctamente orientada
function createOrbit(planet) {
    // Crear una curva elíptica
    const curve = new THREE.EllipseCurve(
        0, 0, // Centro de la elipse
        planet.semiMajorAxis, planet.semiMajorAxis * Math.sqrt(1 - planet.eccentricity ** 2), // Radios X e Y
        0, 2 * Math.PI, // Ángulo de inicio y fin
        false, // Sentido horario
        0 // Ángulo de rotación inicial
    );

    // Obtener los puntos de la curva
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Crear material para la órbita
    const material = new THREE.LineBasicMaterial({ color: 0xffffff }); // Líneas blancas

    // Crear la línea de la órbita
    const ellipse = new THREE.Line(geometry, material);

    // Crear un Object3D para aplicar las rotaciones en el orden correcto
    const orbit = new THREE.Object3D();

    // Rotar por la longitud del nodo ascendente (Ω) alrededor del eje Z
    orbit.rotation.z = toRadians(planet.longitudeOfAscendingNode);

    // Rotar por la inclinación (i) alrededor del eje X
    orbit.rotation.x = toRadians(planet.inclination);

    // Rotar por el argumento del periapsis (ω) alrededor del eje Z
    ellipse.rotation.z = toRadians(planet.argumentOfPeriapsis);

    // Añadir la elipse al Object3D
    orbit.add(ellipse);

    // Añadir el Object3D a la escena
    scene.add(orbit);
}

// Añadir planetas y sus órbitas a la escena
planets.forEach(planet => {
    // Crear mesh del planeta con MeshPhongMaterial para mejor interacción con luces
    const planetGeometry = new THREE.SphereGeometry(planet.radius, 64, 64);
    const planetMaterial = new THREE.MeshPhongMaterial({
        map: textureLoader.load(planet.texture), // Cargar la textura del planeta
        shininess: 100000, // Ajustar brillo
        specular: new THREE.Color(0xffffff)
    });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.mesh = planetMesh;
    scene.add(planetMesh);

    // Crear órbita y añadir a la escena
    createOrbit(planet);
});

// Configurar la posición inicial de la cámara
camera.position.set(0, 100, 300); // Posición más alejada para visualizar todas las órbitas
controls.update();

// Bucle de animación para actualizar la posición de los planetas
let time = 0;
const timeIncrement = 0.1; // Ajusta este valor para controlar la velocidad orbital

function animate() {
    requestAnimationFrame(animate);

    // Actualizar posiciones y rotaciones de los planetas
    planets.forEach(planet => {
        const position = calculatePosition(planet, time);
        planet.mesh.position.set(position.x, position.y, position.z); // Mapeo correcto a X, Y, Z

        // Rotación propia alrededor del eje Y
        const rotationSpeed = (0.01 / Math.abs(planet.rotationPeriod)); // Ajustar la velocidad
        const rotationAxis = new THREE.Vector3(0, 1, 0); // Eje Y
        planet.mesh.rotateOnAxis(rotationAxis, rotationSpeed);
    });

    time += timeIncrement; // Incrementar tiempo (ajustar para velocidad orbital)

    // Actualizar controles y renderizar la escena
    controls.update();
    renderer.render(scene, camera);
}
// Crear un sistema de partículas para el fondo de estrellas
const starsCount = 10000;
const starsGeometryParticles = new THREE.BufferGeometry();
const starsPositions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount; i++) {
    const x = THREE.MathUtils.randFloatSpread(1000); // Distribución aleatoria
    const y = THREE.MathUtils.randFloatSpread(1000);
    const z = THREE.MathUtils.randFloatSpread(1000);
    starsPositions[i * 3] = x;
    starsPositions[i * 3 + 1] = y;
    starsPositions[i * 3 + 2] = z;
}

starsGeometryParticles.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));

const starsMaterialParticles = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true
});

const starParticles = new THREE.Points(starsGeometryParticles, starsMaterialParticles);
scene.add(starParticles);

animate();
animate();

// Manejar el redimensionamiento de la ventana
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
