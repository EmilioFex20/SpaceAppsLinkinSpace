import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear la instancia de OrbitControls
var controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 200, 400);
controls.update();

var light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 0, 0); // Colocar la luz en el centro (el sol)
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040)); // Luz ambiental

// Material para los planetas
var planetMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// Orbital Elements: a (semi-major axis), e (eccentricity), I (inclination),
// L (mean longitude), long.peri. (longitude of perihelion), long.node. (longitude of ascending node)
// Fuente: Tabla proporcionada
var orbitalElements = [
  { name: "Mercury", a: 0.38709843, e: 0.20563661, i: 7.00559432, long_peri: 77.45771895, long_node: 48.33961819, period: 87.97 },
  { name: "Venus", a: 0.72332102, e: 0.00676399, i: 3.39777545, long_peri: 131.76755713, long_node: 76.67261496, period: 224.70 },
  { name: "Earth", a: 1.00000018, e: 0.01673163, i: -0.00054346, long_peri: 102.93005885, long_node: -5.11260389, period: 365.25 },
  { name: "Mars", a: 1.52371243, e: 0.09336511, i: 1.85181869, long_peri: -23.91744784, long_node: 49.71320984, period: 686.98 },
  { name: "Jupiter", a: 5.20248019, e: 0.04853590, i: 1.29861416, long_peri: 14.27495244, long_node: 100.29282654, period: 4332.59 },
  { name: "Saturn", a: 9.54149883, e: 0.05550825, i: 2.49424102, long_peri: 92.86136063, long_node: 113.63998702, period: 10759.22 },
  { name: "Uranus", a: 19.18797948, e: 0.04685740, i: 0.77298127, long_peri: 172.43404441, long_node: 73.96250215, period: 30688.5 },
  { name: "Neptune", a: 30.06952752, e: 0.00895439, i: 1.77005520, long_peri: 46.68158724, long_node: 131.78635853, period: 60182 }
];

// Conversión de grados a radianes
function toRadians(deg) {
  return deg * Math.PI / 180;
}

// Constructor de trayectorias
function Trajectory(planet) {
  this.name = planet.name;
  this.smA = planet.a;
  this.eccentricity = planet.e;
  this.inclination = toRadians(planet.i);
  this.argumentOfPerigee = toRadians(planet.long_peri);
  this.longitudeOfAscendingNode = toRadians(planet.long_node);
  this.period = planet.period;
  this.trueAnomaly = 0; // Inicializar la anomalía verdadera
  this.position = [0, 0, 0];
  this.time = 0;
}

// Función para propagar la órbita
Trajectory.prototype.propagate = function (trueAnomaly) {
  var r = (this.smA * (1 - this.eccentricity ** 2)) / (1 + this.eccentricity * Math.cos(trueAnomaly));
  var x = r * (Math.cos(this.argumentOfPerigee + trueAnomaly) * Math.cos(this.longitudeOfAscendingNode) -
               Math.sin(this.argumentOfPerigee + trueAnomaly) * Math.cos(this.inclination) * Math.sin(this.longitudeOfAscendingNode));
  var y = r * (Math.cos(this.argumentOfPerigee + trueAnomaly) * Math.sin(this.longitudeOfAscendingNode) +
               Math.sin(this.argumentOfPerigee + trueAnomaly) * Math.cos(this.inclination) * Math.cos(this.longitudeOfAscendingNode));
  var z = r * (Math.sin(this.argumentOfPerigee + trueAnomaly) * Math.sin(this.inclination));
  return [x * 100, y * 100, z * 100]; // Multiplicar por 100 para hacer más visibles las órbitas
};

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
    for (var i = 0; i <= 2 * Math.PI; i += 0.1) {
      var pos = body.propagate(i);
      positions.push(pos[0], pos[1], pos[2]);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    var line = new THREE.Line(geometry, material);
    scene.add(line);
  });
}

// Añadir planetas a la escena
function addPlanets() {
  heavenlyBodies.forEach(body => {
    var planetGeometry = new THREE.SphereGeometry(2, 32, 32); // Tamaño de los planetas
    var planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    var initialPos = body.propagate(body.trueAnomaly);
    planetMesh.position.set(initialPos[0], initialPos[1], initialPos[2]);
    planetMesh.name = body.name;
    scene.add(planetMesh);
  });
}

// Animación para actualizar las posiciones de los planetas
function animate() {
  requestAnimationFrame(animate);

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

  controls.update();
  renderer.render(scene, camera);
}

// Llamadas a las funciones
traceOrbits();
addPlanets();
animate(); 