import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Set up OrbitControls to allow camera movement with the mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;
controls.enableZoom = true;    // Allow zooming in/out with the scroll wheel

// Planet data (Example: Earth and Mars with 3D parameters)
const planets = [
    {
        name: 'Earth',
        semiMajorAxis: 10, // AU
        eccentricity: 0.0167,
        inclination: 7.155, // Degrees (tilted orbit)
        longitudeOfAscendingNode: -11.26064, // Degrees
        argumentOfPeriapsis: 114.20783, // Degrees
        meanLongitude: 100.46435, // Degrees
        orbitalPeriod: 365.25, // Days
        radius: 0.5, // Visual size of the planet
        color: 0x0000ff // Blue color for Earth
    },
    {
        name: 'Mars',
        semiMajorAxis: 15, // AU
        eccentricity: 0.0934,
        inclination: 1.85, // Degrees
        longitudeOfAscendingNode: 49.57854, // Degrees
        argumentOfPeriapsis: 286.502, // Degrees
        meanLongitude: 355.45332, // Degrees
        orbitalPeriod: 687, // Days
        radius: 0.4,
        color: 0xff4500 // Red color for Mars
    }
];

// Function to convert degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Keplerian system: Calculate true anomaly and position in 3D space
function calculatePosition(planet, time) {
    const meanAnomaly = toRadians((planet.meanLongitude + (360 / planet.orbitalPeriod) * time) % 360);
    
    // Simplified true anomaly (you can use Kepler's equation for better accuracy)
    const trueAnomaly = meanAnomaly;
    
    // Distance from the focus (Sun) to the planet in orbit
    const r = planet.semiMajorAxis * (1 - planet.eccentricity * Math.cos(trueAnomaly));
    
    // Calculate the planet's position in the orbital plane (ignoring inclination)
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
    const orbitRadius = planet.semiMajorAxis;
    const curve = new THREE.EllipseCurve(
        0, 0,                    // ax, aY: x and y of the center of ellipse
        orbitRadius, orbitRadius, // xRadius, yRadius: semi-major axis length
        0, 2 * Math.PI,           // StartAngle, EndAngle
        false,                    // Clockwise
        0                         // Rotation angle
    );
    
    const points = curve.getPoints(64); // Higher number for smoother orbit
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
    const ellipse = new THREE.Line(geometry, material);
    
    // Rotate orbit to account for inclination and longitude of ascending node
    ellipse.rotation.x = toRadians(planet.inclination); // Inclination tilt
    ellipse.rotation.z = toRadians(planet.longitudeOfAscendingNode); // Rotation in 3D space
    
    return ellipse;
}

// Add planets and their orbits to the scene
planets.forEach(planet => {
    // Create planet mesh
    const planetGeometry = new THREE.SphereGeometry(planet.radius, 32, 32);
    const planetMaterial = new THREE.MeshBasicMaterial({ color: planet.color });
    planet.mesh = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(planet.mesh);

    // Create orbit and add to scene
    const orbit = createOrbit(planet);
    scene.add(orbit);
});

// Set camera position
camera.position.z = 50;

// Animation loop to update the position of planets
let time = 0;
function animate() {
    requestAnimationFrame(animate);

    // Update planet positions based on the Keplerian system
    planets.forEach(planet => {
        const position = calculatePosition(planet, time);
        planet.mesh.position.set(position.x, position.z, position.y); // Map to x, y, z coordinates
    });

    time += 0.01; // Increment time for planet motion
    
    // Update camera controls (OrbitControls)
    controls.update();
    
    renderer.render(scene, camera);

}

function ShowInfo(){
    const div=document.getElementById("inf");
    const atributes=document.getElementById("atributes");

    

    if(div.style.display==="none")
    {
        div.style.display="block";
    } else{
        div.style.display="none";
    }
}

animate();
