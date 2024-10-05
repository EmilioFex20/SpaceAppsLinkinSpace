import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a point light to simulate the Sun
const light = new THREE.PointLight(0xffffff, 2, 1000);
light.position.set(0, 0, 0); // Sun at the origin
scene.add(light);

// Add the Sun
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Set up OrbitControls to allow camera movement with the mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;
controls.enableZoom = true; // Allow zooming in/out with the scroll wheel

// Planet data (All planets)
const planets = [
    {
        name: 'Mercury',
        semiMajorAxis: 0.39, // AU
        eccentricity: 0.2056,
        inclination: 7.00, // Degrees
        longitudeOfAscendingNode: 48.3313, // Degrees
        argumentOfPeriapsis: 29.1241, // Degrees
        meanLongitude: 252.25084, // Degrees
        orbitalPeriod: 88.0, // Days
        rotationPeriod: 58.6, // Days
        radius: 0.2, // Arbitrary units
        color: 0xaaaaaa // Gray color for Mercury
    },
    {
        name: 'Venus',
        semiMajorAxis: 0.72,
        eccentricity: 0.0068,
        inclination: 3.39,
        longitudeOfAscendingNode: 76.6807,
        argumentOfPeriapsis: 54.8523,
        meanLongitude: 181.97973,
        orbitalPeriod: 224.7,
        rotationPeriod: -243.0, // Retrograde rotation
        radius: 0.45,
        color: 0xffddaa // Light orange for Venus
    },
    {
        name: 'Earth',
        semiMajorAxis: 1.00,
        eccentricity: 0.0167,
        inclination: 0.00,
        longitudeOfAscendingNode: 0.0,
        argumentOfPeriapsis: 0.0,
        meanLongitude: 100.46435,
        orbitalPeriod: 365.25,
        rotationPeriod: 1.0,
        radius: 0.5,
        color: 0x0000ff // Blue color for Earth
    },
    {
        name: 'Mars',
        semiMajorAxis: 1.52,
        eccentricity: 0.0934,
        inclination: 1.85,
        longitudeOfAscendingNode: 49.5785,
        argumentOfPeriapsis: 286.502,
        meanLongitude: 355.45332,
        orbitalPeriod: 687.0,
        rotationPeriod: 1.03,
        radius: 0.4,
        color: 0xff4500 // Red color for Mars
    },
    {
        name: 'Jupiter',
        semiMajorAxis: 5.20,
        eccentricity: 0.0484,
        inclination: 1.31,
        longitudeOfAscendingNode: 100.55615,
        argumentOfPeriapsis: 273.867,
        meanLongitude: 34.40438,
        orbitalPeriod: 4331.0,
        rotationPeriod: 0.41,
        radius: 1.0,
        color: 0xffa500 // Orange color for Jupiter
    },
    {
        name: 'Saturn',
        semiMajorAxis: 9.58,
        eccentricity: 0.0565,
        inclination: 2.49,
        longitudeOfAscendingNode: 113.71504,
        argumentOfPeriapsis: 339.392,
        meanLongitude: 49.94432,
        orbitalPeriod: 10747.0,
        rotationPeriod: 0.44,
        radius: 0.85,
        color: 0xffc0cb // Pink color for Saturn
    },
    {
        name: 'Uranus',
        semiMajorAxis: 19.20,
        eccentricity: 0.0463,
        inclination: 0.77,
        longitudeOfAscendingNode: 74.22988,
        argumentOfPeriapsis: 96.6612,
        meanLongitude: 313.23218,
        orbitalPeriod: 30589.0,
        rotationPeriod: -0.72, // Retrograde rotation
        radius: 0.7,
        color: 0xadd8e6 // Light blue for Uranus
    },
    {
        name: 'Neptune',
        semiMajorAxis: 30.05,
        eccentricity: 0.0092,
        inclination: 1.77,
        longitudeOfAscendingNode: 131.72169,
        argumentOfPeriapsis: 272.846,
        meanLongitude: 304.88003,
        orbitalPeriod: 59800.0,
        rotationPeriod: 0.67,
        radius: 0.65,
        color: 0x0000ff // Blue color for Neptune
    }
];

// Function to convert degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Keplerian system: Calculate true anomaly and position in 3D space
function calculatePosition(planet, time) {
    const meanAnomaly = toRadians(
        (planet.meanLongitude + (360 / planet.orbitalPeriod) * time) % 360
    );

    // Simplified true anomaly (for more accuracy, implement Kepler's Equation)
    const trueAnomaly = meanAnomaly;

    // Distance from the focus (Sun) to the planet in orbit
    const r = planet.semiMajorAxis * (1 - planet.eccentricity * Math.cos(trueAnomaly));

    // Calculate the planet's position in the orbital plane
    const xOrbitalPlane = r * Math.cos(trueAnomaly);
    const yOrbitalPlane = r * Math.sin(trueAnomaly);

    // Apply argument of periapsis rotation (ω)
    const cosArgPeriapsis = Math.cos(toRadians(planet.argumentOfPeriapsis));
    const sinArgPeriapsis = Math.sin(toRadians(planet.argumentOfPeriapsis));

    const xRotated = xOrbitalPlane * cosArgPeriapsis - yOrbitalPlane * sinArgPeriapsis;
    const yRotated = xOrbitalPlane * sinArgPeriapsis + yOrbitalPlane * cosArgPeriapsis;

    // Apply inclination (i) tilt
    const cosInclination = Math.cos(toRadians(planet.inclination));
    const sinInclination = Math.sin(toRadians(planet.inclination));

    const zInclined = yRotated * sinInclination;
    const yInclined = yRotated * cosInclination;

    // Apply longitude of ascending node (Ω) rotation around the z-axis
    const cosLongAscNode = Math.cos(toRadians(planet.longitudeOfAscendingNode));
    const sinLongAscNode = Math.sin(toRadians(planet.longitudeOfAscendingNode));

    const xFinal = xRotated * cosLongAscNode - yInclined * sinLongAscNode;
    const yFinal = xRotated * sinLongAscNode + yInclined * cosLongAscNode;

    // Return the position in 3D space
    return { x: xFinal, y: yFinal, z: zInclined };
}

// Function to create an orbit ring
function createOrbit(planet) {
    const curve = new THREE.EllipseCurve(
        0, 0, // ax, aY: x and y of the center of ellipse
        planet.semiMajorAxis, planet.semiMajorAxis * Math.sqrt(1 - planet.eccentricity ** 2), // xRadius, yRadius
        0, 2 * Math.PI, // StartAngle, EndAngle
        false, // Clockwise
        0 // Rotation angle
    );

    const points = curve.getPoints(100); // Higher number for smoother orbit
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
    const ellipse = new THREE.Line(geometry, material);

    // Rotate orbit to account for inclination and longitude of ascending node
    ellipse.rotation.x = toRadians(planet.inclination); // Inclination tilt
    ellipse.rotation.z = toRadians(planet.longitudeOfAscendingNode); // Rotation in 3D space

    return ellipse;
}

// Añadir planetas y sus órbitas a la escena
planets.forEach(planet => {
    // Crear mesh del planeta
    const planetGeometry = new THREE.SphereGeometry(planet.radius, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({ color: planet.color });
    planet.mesh = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(planet.mesh);

    // Crear órbita y añadir a la escena
    const orbit = createOrbit(planet);
    scene.add(orbit);
});

// Opcional: Añadir un cometa con cola de partículas
class Comet {
    constructor(params) {
        this.semiMajorAxis = params.semiMajorAxis;
        this.eccentricity = params.eccentricity;
        this.inclination = params.inclination;
        this.longitudeOfAscendingNode = params.longitudeOfAscendingNode;
        this.argumentOfPeriapsis = params.argumentOfPeriapsis;
        this.meanLongitude = params.meanLongitude;
        this.orbitalPeriod = params.orbitalPeriod;
        this.rotationPeriod = params.rotationPeriod;
        this.radius = params.radius;
        this.color = params.color;

        // Crear mesh del cometa
        const cometGeometry = new THREE.SphereGeometry(this.radius, 16, 16);
        const cometMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(cometGeometry, cometMaterial);
        scene.add(this.mesh);

        // Crear sistema de partículas para la cola
        const particleCount = 1000;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3); // x, y, z para cada partícula
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.7
        });
        this.particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(this.particleSystem);

        // Almacenar las posiciones de las partículas
        this.particlesPositions = positions;
        this.particleIndex = 0;
    }

    update(time) {
        const position = calculatePosition(this, time);
        this.mesh.position.set(position.x, position.z, position.y); // Mapeo a x, y, z coordenadas

        // Actualizar sistema de partículas para la cola
        // Generar nuevas partículas detrás del cometa
        const tailLength = 5; // Longitud de la cola
        const tailPosition = new THREE.Vector3(position.x, position.z, position.y)
            .sub(new THREE.Vector3(
                tailLength * Math.cos(toRadians(this.meanLongitude)),
                tailLength * Math.sin(toRadians(this.meanLongitude)),
                0
            ));

        // Añadir nueva partícula
        this.particlesPositions[this.particleIndex * 3] = tailPosition.x;
        this.particlesPositions[this.particleIndex * 3 + 1] = tailPosition.y;
        this.particlesPositions[this.particleIndex * 3 + 2] = tailPosition.z;
        this.particleIndex = (this.particleIndex + 1) % (this.particlesPositions.length / 3);
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    rotateSelf() {
        this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.1 / this.rotationPeriod);
    }
}

// Crear un cometa y añadirlo a la escena (Opcional)
const cometParams = {
    semiMajorAxis: 20,
    eccentricity: 0.7,
    inclination: 10, // Degrees
    longitudeOfAscendingNode: 80, // Degrees
    argumentOfPeriapsis: 45, // Degrees
    meanLongitude: 0, // Degrees
    orbitalPeriod: 150, // Days
    rotationPeriod: 1, // Days
    radius: 0.2,
    color: 0xffffff
};
const comet = new Comet(cometParams);

// Set camera position
camera.position.set(0, 30, 50);

// Animation loop to update the position of planets y cometa
let time = 0;
function animate() {
    requestAnimationFrame(animate);

    // Actualizar posiciones y rotaciones de los planetas
    planets.forEach(planet => {
        const position = calculatePosition(planet, time);
        planet.mesh.position.set(position.x, position.z, position.y); // Mapeo a x, y, z coordenadas

        // Rotación propia
        const rotationAxis = new THREE.Vector3(0, 1, 0); // Eje Y para rotación
        const rotationSpeed = 0.1 / Math.abs(planet.rotationPeriod); // Asegurar velocidad positiva
        const rotationAngle = planet.rotationPeriod > 0 ? rotationSpeed : -rotationSpeed; // Dirección basada en signo
        planet.mesh.rotateOnAxis(rotationAxis, rotationAngle);
    });

    // Actualizar posición y rotación del cometa (Opcional)
    comet.update(time);
    comet.rotateSelf();

    time += 0.1; // Incrementar tiempo para movimiento orbital

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
s