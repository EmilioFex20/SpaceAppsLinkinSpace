import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { asteroids } from './api.js'; // Importar los datos de los asteroides

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000); // Aumentar el "far" para ver objetos lejanos
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear la instancia de OrbitControls
var controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 200, 800); // Aumentar el zoom inicial para evitar hacer zoom out demasiado
controls.update();

// Añadir luces
var sunLight = new THREE.PointLight(0xffffff, 2, 5000); // Aumentar el alcance de la luz
sunLight.position.set(0, 0, 0); // Colocar la luz en el centro (el sol)
scene.add(sunLight);

var ambientLight = new THREE.AmbientLight(0x404040, 2); // Aumentar la intensidad de la luz ambiental
scene.add(ambientLight);

const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('./textures/sun.jpg'); // Asegúrate de que la ruta sea correcta

// Crear el Sol
function createSun() {
    var sunGeometry = new THREE.SphereGeometry((1390900*.00001)/2, 32, 32); // Tamaño del Sol
    var sunMaterial = new THREE.MeshBasicMaterial({ 
      map: sunTexture
  }); // Material con textura para el Sol
    var sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0);
    sun.name = "Sun";
    scene.add(sun);
}
var asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

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
var distanceScale = 100; // Escala para las distancias orbitales
var sizeScale = 0.0001;  // Escala para los tamaños de los planetas
var asteroidScale = 0.05999;  

// Orbital Elements: a (semi-major axis), e (eccentricity), I (inclination),
// L (mean longitude), long.peri. (longitude of perihelion), long.node. (longitude of ascending node)
var orbitalElements = [
    { name: "Mercury", a: 0.38709843, e: 0.20563661, i: 7.00559432, long_peri: 77.45771895, long_node: 48.33961819, period: 87.97, texture:"./textures/mercury.jpg" },
    { name: "Venus", a: 0.72332102, e: 0.00676399, i: 3.39777545, long_peri: 131.76755713, long_node: 76.67261496, period: 224.70, texture:"./textures/venus.jpg" },
    { name: "Earth", a: 1.00000018, e: 0.01673163, i: -0.00054346, long_peri: 102.93005885, long_node: -5.11260389, period: 365.25, texture:"./textures/earth.jpg", 
      moon: { size: 0.01, distance: 0.027, texture: "./textures/moon.jpg" } 
    },
    { name: "Mars", a: 1.52371243, e: 0.09336511, i: 1.85181869, long_peri: -23.91744784, long_node: 49.71320984, period: 686.98, texture:"./textures/mars.jpg" },
    { name: "Jupiter", a: 5.20248019, e: 0.04853590, i: 1.29861416, long_peri: 14.27495244, long_node: 100.29282654, period: 4332.59, texture:"./textures/jupiter.jpg", 
      moon: { size: 0.03, distance: 0.5, texture: "./textures/moon.jpg" } 
    },
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
  this.texture = orbitalElements.texture;
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
    var colors = [
        0xCCCCFF, // Mercury
        0xFFCCCC, // Venus
        0xCCFFCC, // Earth
        0xFFCC99, // Mars
        0xFFFF99, // Jupiter
        0x99CCFF, // Saturn
        0xFF99CC, // Uranus
        0xCCCCFF  // Neptune
    ];

    heavenlyBodies.forEach((body, index) => {
        var geometry = new THREE.BufferGeometry();
        var positions = [];
        const step = 0.01; // Pasos más pequeños para una línea más suave

        // Recorrer de 0 a 2π para crear la elipse completa
        for (var i = 0; i <= 2 * Math.PI; i += step) {
            var pos = body.propagate(i);
            positions.push(pos[0], pos[1], pos[2]);
        }
        // Cerrar la elipse
        var firstPos = body.propagate(0);
        positions.push(firstPos[0], firstPos[1], firstPos[2]);

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        var material = new THREE.LineBasicMaterial({ color: colors[index] }); // Usar el color correspondiente
        var line = new THREE.Line(geometry, material);
        scene.add(line);
    });
}

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
      planetMesh.rotation.y = Math.PI / 2; // Rotar 90 grados en el eje Y (corregido)
  
      const planetGroup = new THREE.Group();
      planetGroup.add(planetMesh);
      planetGroup.name = body.name;
      
      // Verificar si el planeta tiene una luna
      const planetData = orbitalElements.find(p => p.name === body.name);
      if (planetData.moon) {
          // Crear la luna
          var moonGeometry = new THREE.SphereGeometry(planetData.moon.size*10, 32, 32);
          const moonTexture = textureLoader.load(planetData.moon.texture);
          var moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
          var moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

          // Posicionar la luna respecto al planeta
          moonMesh.position.set(planetData.moon.distance*2, 0, 0);
          planetGroup.add(moonMesh); // Añadir la luna al grupo del planeta

          // Añadir la animación para que la luna orbite alrededor del planeta
          function animateMoon() {
            const time = Date.now() * 0.001;
            const distance = planetData.moon.distance * distanceScale * 2;
            
            // Cambiar la rotación para el plano XY
            moonMesh.position.x = Math.cos(time) * distance;
            moonMesh.position.y = Math.sin(time) * distance;
        }
        

          animateFunctions.push(animateMoon); // Añadir la animación de la luna a las funciones de animación
      }
      // **Añadir los anillos a Saturno**
      if (body.name === "Saturn") {
        // Definir los parámetros de los anillos
        const innerRadius = planetDiameter * 1.2; // Radio interno ligeramente mayor que el diámetro del planeta
        const outerRadius = planetDiameter * 2; // Radio externo según preferencia
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);

        // Crear un material semi-transparente para los anillos
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });

        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);

        // Rotar los anillos para alinearlos con la inclinación de Saturno
        ringMesh.rotation.x = Math.PI / 2; // Alinear con el plano XY
        ringMesh.rotation.z = toRadians(planetData.i); // Aplicar inclinación orbital


        planetGroup.add(ringMesh); // Añadir los anillos al grupo de Saturno
    }
      scene.add(planetGroup);
    });
}  

const animateFunctions = [];

// Definir una sola función animate
function animate() {
    requestAnimationFrame(animate);

    // Actualizar posiciones de los planetas
    heavenlyBodies.forEach(body => {
        var planetGroup = scene.getObjectByName(body.name);
        if (planetGroup) {
            var newPos = body.propagate(body.trueAnomaly);
            planetGroup.position.set(newPos[0], newPos[1], newPos[2]);

            // Incrementar la anomalía verdadera para animar la órbita
            body.trueAnomaly += (2 * Math.PI / body.period) * 0.1; // Ajustar la velocidad según el periodo
            if (body.trueAnomaly > 2 * Math.PI) {
                body.trueAnomaly -= 2 * Math.PI;
            }
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

            obj.position.set(x * 100, y * 100, z * 100);

            // Incrementar la anomalía verdadera para animar la órbita del asteroide
            obj.trueAnomaly += (2 * Math.PI / obj.period) * 0.1; // Ajustar la velocidad según el periodo
            if (obj.trueAnomaly > 2 * Math.PI) {
                obj.trueAnomaly -= 2 * Math.PI;
            }

            // Puedes agregar aquí logs de depuración si lo necesitas
            // console.log(`Asteroide ${obj.name} posición: (${x}, ${y}, ${z})`);
        }
    });

    // Ejecutar funciones de animación adicionales (como animar lunas)
    animateFunctions.forEach(fn => fn());

    // Manejar la cámara si se está siguiendo un planeta
    if (targetPlanet) {
        const targetPosition = targetPlanet.position.clone();
        const offset = new THREE.Vector3(0, 0, 1).normalize().multiplyScalar(20); // Ajustar el offset si es necesario
        camera.position.lerp(targetPosition.clone().add(offset), 0.1); // Interpolación suave
        controls.target.copy(targetPosition); // Actualizar el control para seguir el planeta
    }

    controls.update();
    renderer.render(scene, camera);
}

// Función para manejar clics en los planetas
function onDocumentMouseDown(event) {
    event.preventDefault();

    // Calcular la posición del mouse en el espacio de la pantalla
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Crear un rayo a partir de la cámara y la posición del mouse
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Calcular objetos intersectados
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let selectedObject = intersects[0].object;

        // Si el objeto pertenece a un grupo (por ejemplo, un planeta con su luna), selecciona el grupo completo
        if (selectedObject.parent && selectedObject.parent.isGroup) {
            selectedObject = selectedObject.parent;
        }

        // Si el objeto es un planeta (grupo), hacer zoom y seguirlo
        if (selectedObject.name && orbitalElements.find(o => o.name === selectedObject.name)) {
            const targetPosition = selectedObject.position.clone();
            zoomToPlanet(targetPosition, selectedObject);
            createBackButton(); // Crear el botón de regreso
        }
    }
}

let targetPlanet = null; // Variable para almacenar el planeta seleccionado

// Función para hacer zoom en un planeta
function zoomToPlanet(targetPosition, planet) {
    // Guardar el planeta como el objetivo a seguir
    if (targetPlanet !== planet) {
        targetPlanet = planet;
    }
    
    // Ajustar la posición de la cámara para hacer zoom en el planeta
    const zoomFactor = 2; // Factor de zoom ajustable
    const offset = new THREE.Vector3(0, 0, 1).normalize().multiplyScalar(zoomFactor); // Offset ajustado con el zoomFactor

    // Animar la cámara hacia la posición del planeta
    const duration = 1000; // Duración de la animación en milisegundos
    const startPosition = camera.position.clone();
    const targetCameraPosition = targetPosition.clone().add(offset);
    const startTime = performance.now();

    function animateZoom() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Interpolación lineal para el movimiento
        camera.position.lerpVectors(startPosition, targetCameraPosition, progress);
        controls.target.lerp(targetPosition, progress);

        if (progress < 1) {
            requestAnimationFrame(animateZoom);
        }
    }

    animateZoom();
}



// Variable para almacenar la posición original de la cámara
const originalCameraPosition = camera.position.clone();

// Botón de regreso
let backButton;

// Función para crear el botón de regreso
// Función para crear el botón de regreso
function createBackButton() {
    // Eliminar el botón previo si existe
    if (backButton) {
        backButton.removeEventListener('click', zoomOutFromPlanet);
        document.body.removeChild(backButton);
    }

    // Crear un nuevo botón de regreso
    backButton = document.createElement('button');
    backButton.innerText = 'Regresar';
    backButton.style.position = 'absolute';
    backButton.style.top = '20px';
    backButton.style.left = '20px';
    backButton.style.zIndex = '10';
    document.body.appendChild(backButton);

    // Agregar evento al botón para regresar
    backButton.addEventListener('click', () => {
        zoomOutFromPlanet();
    });
}

// Función para hacer zoom fuera del planeta
function zoomOutFromPlanet() {
    const sun = scene.getObjectByName("Sun"); // Asegúrate de que el Sol tenga el nombre 'Sun' en tu escena
    if (!sun) {
        console.error("No se encontró el objeto del Sol en la escena.");
        return;
    }

    const sunPosition = sun.position.clone(); // Posición del Sol
    const offset = new THREE.Vector3(0, 0, 1).normalize().multiplyScalar(400); // Ajusta el offset si es necesario para la vista
    const targetCameraPosition = sunPosition.clone().add(offset);

    const duration = 1000; // Duración de la animación en milisegundos
    const startPosition = camera.position.clone();
    const startTime = performance.now();

    // Animación para hacer zoom out al sol
    function animateZoomOut() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Interpolación lineal para el movimiento
        camera.position.lerpVectors(startPosition, targetCameraPosition, progress);
        controls.target.lerp(sunPosition, progress);

        if (progress < 1) {
            requestAnimationFrame(animateZoomOut);
        } else {
            // Reiniciar el objetivo del planeta y eliminar el botón
            targetPlanet = null;
            backButton.removeEventListener('click', zoomOutFromPlanet);
            document.body.removeChild(backButton);
            backButton = null;
        }
    }

    animateZoomOut();
}



// Agregar el evento de clic al documento
window.addEventListener('mousedown', onDocumentMouseDown, false);

// Llamadas a las funciones
createSun();      // Añadir el sol
addAsteroids();   // Añadir asteroides
traceOrbits();    // Añadir las órbitas primero
addPlanets();     // Después añadir los planetas
animate();        // Iniciar la animación
