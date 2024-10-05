import * as THREE from 'three';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a point light to simulate the Sun
const light = new THREE.PointLight(0xffffff, 2, 1000);
light.position.set(0, 0, 0); // Sun at the origin
scene.add(light);

// Add the Sun
const sunGeometry = new THREE.SphereGeometry(2, 30, 30);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet data (Example: Earth)
const planets = [
    {
        name: 'Earth',
        semiMajorAxis: 10, // Distance from Sun
        eccentricity: 0.0167,
        inclination: 0, // Degrees
        longitudeOfAscendingNode: 348.73936, // Degrees
        argumentOfPeriapsis: 114.20783, // Degrees
        meanAnomalyAtEpoch: 357.51716, // Degrees
        orbitalPeriod: 365.25, // Days
        radius: 0.5, // Visual size of the planet
        color: 0x0000ff // Blue color for Earth
    }
];

// Function to convert degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Keplerian system: calculate true anomaly (for simplicity, this uses a basic circular orbit approximation)
function calculatePosition(planet, time) {
    const meanAnomaly = (planet.meanAnomalyAtEpoch + (360 / planet.orbitalPeriod) * time) % 360;
    const trueAnomaly = toRadians(meanAnomaly); // Approximate true anomaly (ignores eccentricity for now)
    
    const x = planet.semiMajorAxis * Math.cos(trueAnomaly);
    const y = planet.semiMajorAxis * Math.sin(trueAnomaly);
    
    return { x, y };
}

// Add planets to the scene
planets.forEach(planet => {
    const planetGeometry = new THREE.SphereGeometry(planet.radius, 32, 32);
    const planetMaterial = new THREE.MeshBasicMaterial({ color: planet.color });
    planet.mesh = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(planet.mesh);
});

// Set camera position
camera.position.z = 30;

// Animation loop to update the position of planets
let time = 0;
function animate() {
    requestAnimationFrame(animate);

    // Update planet positions based on the Keplerian system
    planets.forEach(planet => {
        const position = calculatePosition(planet, time);
        planet.mesh.position.set(position.x, position.y, 0);
    });

    time += 0.01; // Increment time for planet motion
    renderer.render(scene, camera);
}

animate();
