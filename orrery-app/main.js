import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Crear la escena, cámara y renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Añadir una luz ambiental para iluminar ligeramente toda la escena
const ambientLight = new THREE.AmbientLight(0x9999999); // Luz suave
scene.add(ambientLight);

// Añadir una luz puntual para simular el Sol
const sunLight = new THREE.PointLight(0xffffff, 1.5, 0); // Intensidad ajustada
sunLight.position.set(0, 0, 0); // El Sol está en el origen
scene.add(sunLight);

// Añadir el Sol con MeshBasicMaterial para que no responda a las luces
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
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
        color: 0xaaaaaa // Color gris
    },
    {
        name: 'Venus',
        semiMajorAxis: 7, // Escala ajustada para visualización
        eccentricity: 0.0068,
        inclination: 3.39, // Grados
        longitudeOfAscendingNode: 76.6807, // Grados
        argumentOfPeriapsis: 54.8523, // Grados
        meanLongitude: 181.97973, // Grados
        orbitalPeriod: 224.7, // Días
        rotationPeriod: -243, // Días (Rotación retrógrada)
        radius: 0.45, // Tamaño visual
        color: 0xffddaa // Color amarillo claro
    },
    {
        name: 'Tierra',
        semiMajorAxis: 10, // Escala ajustada para visualización
        eccentricity: 0.0167,
        inclination: 0.0, // Grados
        longitudeOfAscendingNode: 0.0, // Grados
        argumentOfPeriapsis: 102.94719, // Grados
        meanLongitude: 100.46435, // Grados
        orbitalPeriod: 365.25, // Días
        rotationPeriod: 1, // Días
        radius: 0.5, // Tamaño visual
        color: 0x0000ff // Azul
    },
    {
        name: 'Marte',
        semiMajorAxis: 15, // Escala ajustada para visualización
        eccentricity: 0.0934,
        inclination: 1.85, // Grados
        longitudeOfAscendingNode: 49.57854, // Grados
        argumentOfPeriapsis: 286.502, // Grados
        meanLongitude: 355.45332, // Grados
        orbitalPeriod: 687, // Días
        rotationPeriod: 1.03, // Días
        radius: 0.4, // Tamaño visual
        color: 0xff4500 // Naranja
    },
    {
        name: 'Júpiter',
        semiMajorAxis: 52, // Escala ajustada para visualización
        eccentricity: 0.0489,
        inclination: 1.303, // Grados
        longitudeOfAscendingNode: 100.55615, // Grados
        argumentOfPeriapsis: 273.867, // Grados
        meanLongitude: 34.40438, // Grados
        orbitalPeriod: 4331, // Días
        rotationPeriod: 0.41, // Días
        radius: 1, // Tamaño visual
        color: 0xffa500 // Naranja brillante
    },
    {
        name: 'Saturno',
        semiMajorAxis: 95, // Escala ajustada para visualización
        eccentricity: 0.0565,
        inclination: 2.485, // Grados
        longitudeOfAscendingNode: 113.71504, // Grados
        argumentOfPeriapsis: 339.392, // Grados
        meanLongitude: 49.94432, // Grados
        orbitalPeriod: 10747, // Días
        rotationPeriod: 0.44, // Días
        radius: 0.85, // Tamaño visual
        color: 0xf5deb3 // Color beige
    },
    {
        name: 'Urano',
        semiMajorAxis: 191, // Escala ajustada para visualización
        eccentricity: 0.0463,
        inclination: 0.773, // Grados
        longitudeOfAscendingNode: 74.22988, // Grados
        argumentOfPeriapsis: 96.73436, // Grados
        meanLongitude: 313.23218, // Grados
        orbitalPeriod: 30589, // Días
        rotationPeriod: -0.72, // Días (Rotación retrógrada)
        radius: 0.7, // Tamaño visual
        color: 0xadd8e6 // Azul claro
    },
    {
        name: 'Neptuno',
        semiMajorAxis: 300, // Escala ajustada para visualización
        eccentricity: 0.0095,
        inclination: 1.770, // Grados
        longitudeOfAscendingNode: 131.72169, // Grados
        argumentOfPeriapsis: 276.045, // Grados
        meanLongitude: -55.120029, // Grados
        orbitalPeriod: 59800, // Días
        rotationPeriod: 0.67, // Días
        radius: 0.65, // Tamaño visual
        color: 0x0000ff // Azul
    }
];

// Función para convertir grados a radianes
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Función para calcular la posición de un planeta en 3D
function calculatePosition(planet, time) {
    const meanAnomaly = toRadians(
        (planet.meanLongitude + (360 / planet.orbitalPeriod) * time) % 360
    );

    // Aproximación simplificada de la anomalía verdadera
    const trueAnomaly = meanAnomaly;

    // Distancia radial desde el Sol al planeta
    const r = planet.semiMajorAxis * (1 - planet.eccentricity * Math.cos(trueAnomaly));

    // Posición en el plano orbital
    const xOrbital = r * Math.cos(trueAnomaly);
    const yOrbital = r * Math.sin(trueAnomaly);

    // Rotación por argumento del periapsis (ω)
    const cosArgPeriapsis = Math.cos(toRadians(planet.argumentOfPeriapsis));
    const sinArgPeriapsis = Math.sin(toRadians(planet.argumentOfPeriapsis));

    const xRotated = xOrbital * cosArgPeriapsis - yOrbital * sinArgPeriapsis;
    const yRotated = xOrbital * sinArgPeriapsis + yOrbital * cosArgPeriapsis;

    // Inclinación de la órbita (i)
    const cosInclination = Math.cos(toRadians(planet.inclination));
    const sinInclination = Math.sin(toRadians(planet.inclination));

    const zInclined = yRotated * sinInclination;
    const yInclined = yRotated * cosInclination;

    // Rotación por longitud del nodo ascendente (Ω)
    const cosLongAscNode = Math.cos(toRadians(planet.longitudeOfAscendingNode));
    const sinLongAscNode = Math.sin(toRadians(planet.longitudeOfAscendingNode));

    const xFinal = xRotated * cosLongAscNode - yInclined * sinLongAscNode;
    const yFinal = xRotated * sinLongAscNode + yInclined * cosLongAscNode;

    return { x: xFinal, y: yFinal, z: zInclined };
}

// Función para crear una órbita
function createOrbit(planet) {
    const curve = new THREE.EllipseCurve(
        0, 0, // Centro de la elipse
        planet.semiMajorAxis, planet.semiMajorAxis * Math.sqrt(1 - planet.eccentricity ** 2), // Radios X e Y
        0, 2 * Math.PI, // Ángulo de inicio y fin
        false, // Sentido horario
        0 // Ángulo de rotación
    );

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
    const ellipse = new THREE.Line(geometry, material);

    // Rotar la órbita para tener en cuenta la inclinación y la longitud del nodo ascendente
    ellipse.rotation.x = toRadians(planet.inclination);
    ellipse.rotation.z = toRadians(planet.longitudeOfAscendingNode);

    return ellipse;
}

// Añadir planetas y sus órbitas a la escena
planets.forEach(planet => {
    // Crear mesh del planeta con MeshPhongMaterial para mejor interacción con luces
    const planetGeometry = new THREE.SphereGeometry(planet.radius, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({ color: planet.color });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.mesh = planetMesh;
    scene.add(planetMesh);

    // Crear órbita y añadir a la escena
    const orbit = createOrbit(planet);
    scene.add(orbit);
});

// Configurar la posición inicial de la cámara
camera.position.set(0, 50, 100);
controls.update();

// Bucle de animación para actualizar la posición de los planetas
let time = 0;
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

    time += 1; // Incrementar tiempo (ajustar para velocidad orbital)

    // Actualizar controles y renderizar la escena
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Manejar el redimensionamiento de la ventana
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
