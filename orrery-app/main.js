import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { asteroids } from './api.js'; // Importar los datos de los asteroides

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000); // Prueba con un valor más grande para el "far"
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear la instancia de OrbitControls
var controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 200, 800); // Aumentar el zoom inicial para evitar hacer zoom out demasiado
controls.update();

// Añadir luces
var sunLight = new THREE.PointLight(0xffffff, 3, 10000); // Aumentar la intensidad y alcance
sunLight.position.set(0, 0, 0); // Colocar la luz en el centro (el sol)
scene.add(sunLight);

var ambientLight = new THREE.AmbientLight(0x404040, 2); // Aumentar la intensidad de la luz ambiental
scene.add(ambientLight);

const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('/textures/sun.jpg'); // Asegúrate de que la ruta sea correcta



// Crear el Sol
function createSun() {
  var sunDiameter = 1391000 * 0.00001; // Diámetro del Sol en km a escala
  var sunGeometry = new THREE.SphereGeometry(sunDiameter / 2, 32, 32); // Radio = diámetro/2
  var sunMaterial = new THREE.MeshBasicMaterial({ 
    map: sunTexture
  });
  var sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(0, 0, 0);
  scene.add(sun);
}

var asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

// Material para los planetas


// Datos de los diámetros reales (en km)
var planetSizes = {
  Mercury: 4880,
  Venus: 12104,
  Earth: 12742,
  Mars: 6779,
  Jupiter: 139820,
  Saturn: 116460,
  Uranus: 50724,
  Neptune: 49244
};

// Factores de escala
var distanceScale = 100; // Reducir el factor de escala para las distancias orbitales
var sizeScale = 0.00001;   // Aumentar el tamaño de los planetas para que sean más visibles
var asteroidScale = .01  


// Orbital Elements: a (semi-major axis), e (eccentricity), I (inclination),
// L (mean longitude), long.peri. (longitude of perihelion), long.node. (longitude of ascending node)
var orbitalElements = [
  { name: "Mercury", a: 0.38709843, e: 0.20563661, i: 7.00559432, long_peri: 77.45771895, long_node: 48.33961819, period: 87.97, texture:"./textures/mercury.jpg" },
  { name: "Venus", a: 0.72332102, e: 0.00676399, i: 3.39777545, long_peri: 131.76755713, long_node: 76.67261496, period: 224.70, texture:"./textures/venus.jpg" },
  { name: "Earth", a: 1.00000018, e: 0.01673163, i: -0.00054346, long_peri: 102.93005885, long_node: -5.11260389, period: 365.25, texture:"./textures/earth.jpg" },
  { name: "Mars", a: 1.52371243, e: 0.09336511, i: 1.85181869, long_peri: -23.91744784, long_node: 49.71320984, period: 686.98, texture:"./textures/mars.jpg" },
  { name: "Jupiter", a: 5.20248019, e: 0.04853590, i: 1.29861416, long_peri: 14.27495244, long_node: 100.29282654, period: 4332.59, texture:"./textures/jupiter.jpg" },
  { name: "Saturn", a: 9.54149883, e: 0.05550825, i: 2.49424102, long_peri: 92.86136063, long_node: 113.63998702, period: 10759.22, texture:"./textures/saturn.jpg" },
  { name: "Uranus", a: 19.18797948, e: 0.04685740, i: 0.77298127, long_peri: 172.43404441, long_node: 73.96250215, period: 30688.5, texture:"./textures/uranus.jpg" },
  { name: "Neptune", a: 30.06952752, e: 0.00895439, i: 1.77005520, long_peri: 46.68158724, long_node: 131.78635853, period: 60182, texture:"./textures/neptune.jpg" }
];

// Conversión de grados a radianes
function toRadians(deg) {
  return deg * Math.PI / 180;
}

// Constructor de trayectorias
function Trajectory(orbitalElements) {
  this.name = orbitalElements.name;
  this.smA = orbitalElements.a;
  this.eccentricity = orbitalElements.e;
  this.inclination = toRadians(orbitalElements.i);
  this.argumentOfPerigee = toRadians(orbitalElements.long_peri);
  this.longitudeOfAscendingNode = toRadians(orbitalElements.long_node);
  this.period = orbitalElements.period;
  this.trueAnomaly = 0; // Inicializar la anomalía verdadera
  this.position = [0, 0, 0];
  this.time = 0;
  this.texture=orbitalElements.texture;
}

// Función para propagar la órbita
Trajectory.prototype.propagate = function (trueAnomaly) {
  var r = (this.smA * (1 - this.eccentricity ** 2)) / (1 + this.eccentricity * Math.cos(trueAnomaly));
  var x = r * (Math.cos(this.argumentOfPerigee + trueAnomaly) * Math.cos(this.longitudeOfAscendingNode) -
               Math.sin(this.argumentOfPerigee + trueAnomaly) * Math.cos(this.inclination) * Math.sin(this.longitudeOfAscendingNode));
  var y = r * (Math.cos(this.argumentOfPerigee + trueAnomaly) * Math.sin(this.longitudeOfAscendingNode) +
               Math.sin(this.argumentOfPerigee + trueAnomaly) * Math.cos(this.inclination) * Math.cos(this.longitudeOfAscendingNode));
  var z = r * (Math.sin(this.argumentOfPerigee + trueAnomaly) * Math.sin(this.inclination));
  return [x * distanceScale, y * distanceScale, z * distanceScale]; // Multiplicar por 100 para hacer más visibles las órbitas
};


function calculatePeriod(meanMotion) {
    return meanMotion > 0 ? 360 / meanMotion : 1; // Asegurarse de que no sea cero o negativo
}

// Añadir asteroides a la escena
function addAsteroids() {
    asteroids.data.forEach((asteroid, index) => { // Añadir índice como segundo parámetro
        const name = asteroid[0] || `Asteroide_${index}`; // Asignar un nombre si no hay
        const eccentricity = parseFloat(asteroid[1]);
        const semiMajorAxis = parseFloat(asteroid[2]);
        const inclination = toRadians(parseFloat(asteroid[3]));
        const longNode = toRadians(parseFloat(asteroid[4]));
        const longPeri = toRadians(parseFloat(asteroid[5]));
        const meanMotion = asteroid[7] !== null ? parseFloat(asteroid[7]) : Math.random() * (1 - 0.1) + 0.1; // Valor aleatorio entre 0.1 y 1
        const diameter = asteroid[8] ? parseFloat(asteroid[8]) : 2;

        // Crear geometría y mesh del asteroide
        var asteroidGeometry = new THREE.SphereGeometry(diameter * asteroidScale, 32, 32);
        var asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

        // Calcular el periodo y almacenar la anomalía verdadera
        var period = calculatePeriod(meanMotion);
        asteroidMesh.period = period;
        asteroidMesh.trueAnomaly = 0;

        // Calcular la posición inicial
        var r = (semiMajorAxis * (1 - eccentricity ** 2)) / (1 + eccentricity * Math.cos(asteroidMesh.trueAnomaly));
        var x = r * (Math.cos(longPeri + asteroidMesh.trueAnomaly) * Math.cos(longNode) -
                     Math.sin(longPeri + asteroidMesh.trueAnomaly) * Math.cos(inclination) * Math.sin(longNode));
        var y = r * (Math.cos(longPeri + asteroidMesh.trueAnomaly) * Math.sin(longNode) +
                     Math.sin(longPeri + asteroidMesh.trueAnomaly) * Math.cos(inclination) * Math.cos(longNode));
        var z = r * (Math.sin(longPeri + asteroidMesh.trueAnomaly) * Math.sin(inclination));

        asteroidMesh.position.set(x * 100, y * 100, z * 100);
        asteroidMesh.name = name; // Asignar nombre al asteroide

        // Almacenar datos orbitales
        asteroidMesh.eccentricity = eccentricity;
        asteroidMesh.semiMajorAxis = semiMajorAxis;
        asteroidMesh.inclination = inclination;
        asteroidMesh.longNode = longNode;
        asteroidMesh.longPeri = longPeri;

        scene.add(asteroidMesh);
    });
}


// Crear objetos de trayectorias
var heavenlyBodies = [];
orbitalElements.forEach(planet => {
  heavenlyBodies.push(new Trajectory(planet));
});
// Añadir órbitas a la escena
function traceOrbits() {
    var geometry, material = new THREE.LineBasicMaterial({ color: 0xCCCCFF });

    heavenlyBodies.forEach(body => {
        geometry = new THREE.BufferGeometry();
        var positions = [];
        const step = 0.01; // Pasos más pequeños para una línea más suave

        // Recorrer de 0 a 2π para crear la elipse completa
        for (var i = 0; i <= 2 * Math.PI; i += step) {
            // Obtener la posición del planeta en ese ángulo
            var pos = body.propagate(i);
            positions.push(pos[0], pos[1], pos[2]);
        }
        // Asegúrate de que el primer punto se repita para cerrar la elipse
        var firstPos = body.propagate(0);
        positions.push(firstPos[0], firstPos[1], firstPos[2]); // Agregar el primer punto nuevamente

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        var line = new THREE.Line(geometry, material);
        scene.add(line);
    });
}

// Añadir planetas a la escenafunction addPlanets() {
// Añadir planetas a la escena
function addPlanets() {
    heavenlyBodies.forEach(body => {
      // Obtener el tamaño del planeta y aplicarle la escala
      var planetDiameter = planetSizes[body.name] * sizeScale;
      const planetTexture = textureLoader.load(body.texture); 
      // Geometría del planeta (usando el diámetro a escala)
      var planetGeometry = new THREE.SphereGeometry(planetDiameter / 2, 32, 32); // Radio = diámetro/2
  
      var planetMaterial = new THREE.MeshBasicMaterial({
        map: planetTexture, // Cargar la textura del planeta
      });
      var planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  
      // Corregir la orientación de la textura
      planetMesh.rotation.x = Math.PI / 2; // Rotar 90 grados en el eje Y
  
      // Posición inicial del planeta
      var initialPos = body.propagate(body.trueAnomaly);
      planetMesh.position.set(initialPos[0], initialPos[1], initialPos[2]);
      planetMesh.name = body.name;
      scene.add(planetMesh);
    });
  }  


// Animación para actualizar las posiciones de los planetas
function animate() {
    requestAnimationFrame(animate);

    // Actualizar posiciones de los planetas
    heavenlyBodies.forEach(body => {
        var planet = scene.getObjectByName(body.name);
        var newPos = body.propagate(body.trueAnomaly);
        planet.position.set(newPos[0], newPos[1], newPos[2]);

        // Incrementar la anomalía verdadera para animar la órbita
        body.trueAnomaly += (2 * Math.PI / body.period) * 0.1; // Ajustar la velocidad según el periodo
        if (body.trueAnomaly > 2 * Math.PI) {
            body.trueAnomaly -= 2 * Math.PI;
        }
    });

    // Actualizar posiciones de los asteroides
    scene.children.forEach(obj => {
        if (obj.name && obj.name !== 'Sun' && obj.period) { // Identificar solo los asteroides
            var r = (obj.semiMajorAxis * (1 - obj.eccentricity ** 2)) / (1 + obj.eccentricity * Math.cos(obj.trueAnomaly));
            var x = r * (Math.cos(obj.longPeri + obj.trueAnomaly) * Math.cos(obj.longNode) -
                         Math.sin(obj.longPeri + obj.trueAnomaly) * Math.cos(obj.inclination) * Math.sin(obj.longNode));
            var y = r * (Math.cos(obj.longPeri + obj.trueAnomaly) * Math.sin(obj.longNode) +
                         Math.sin(obj.longPeri + obj.trueAnomaly) * Math.cos(obj.inclination) * Math.cos(obj.longNode));
            var z = r * (Math.sin(obj.longPeri + obj.trueAnomaly) * Math.sin(obj.inclination));

            obj.position.set(x * distanceScale, y * distanceScale, z * distanceScale);

            // Incrementar la anomalía verdadera para animar la órbita del asteroide
            obj.trueAnomaly += (2 * Math.PI / obj.period) * 0.1; // Ajustar la velocidad según el periodo
            if (obj.trueAnomaly > 2 * Math.PI) {
                obj.trueAnomaly -= 2 * Math.PI;
            }

            // Log de depuración
            
        }
    });
    controls.update();
    renderer.render(scene, camera);
}
// Llamadas a las funciones
createSun();  // Añadir el sol
addAsteroids();
traceOrbits(); // Añadir las órbitas primero
addPlanets();  // Después añadir los planetas
animate();
