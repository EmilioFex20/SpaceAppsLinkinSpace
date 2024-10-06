import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
// ---------------------------------------------
//           Clase Trajectory
// ---------------------------------------------
function Trajectory(name, smA, oI, aP, oE, aN, mAe, Sidereal) {
    this.name = name;                         // nombre del objeto
    this.smA = smA;                           // semi eje mayor
    this.oI = oI * 0.01745329;                // inclinación orbital --> convertir grados a radianes
    this.aP = aP * 0.01745329;                // argumento del periastro --> convertir grados a radianes
    this.oE = oE;                             // excentricidad orbital
    this.aN = aN * 0.01745329;                // nodo ascendente --> convertir grados a radianes
    this.period = Sidereal;                   // periodo sideral como un múltiplo del periodo orbital de la Tierra
    this.epochMeanAnomaly = mAe * 0.01745329; // anomalia media en la época 
    this.trueAnomoly = 0;                     // inicializar en la anomalia media en la época
    this.position = [0, 0, 0];
    this.time = 0;
}



// ---------------------------------------------
//        Propagador de Trayectorias
// ---------------------------------------------
Trajectory.prototype.propagate = function(uA) {
    var pos = [];
    var theta = uA;                          // Actualizar la anomalia verdadera.
    var smA = this.smA;                      // Semi-eje mayor
    var oI = this.oI;                        // Inclinación orbital
    var aP = this.aP;                        // Obtener los elementos orbitales del objeto.
    var oE = this.oE;                        // Excentricidad orbital
    var aN = this.aN;                        // Nodo ascendente
    var sLR = smA * (1 - oE ** 2);           // Calcular el semi-latus recto.
    var r = sLR / (1 + oE * Math.cos(theta)); // Calcular la distancia radial.

    // Calcular las coordenadas de posición
    pos[0] = r * (Math.cos(aP + theta) * Math.cos(aN) - Math.cos(oI) * Math.sin(aP + theta) * Math.sin(aN));
    pos[1] = r * (Math.cos(aP + theta) * Math.sin(aN) + Math.cos(oI) * Math.sin(aP + theta) * Math.cos(aN));
    pos[2] = r * (Math.sin(aP + theta) * Math.sin(oI));

    return pos;
};

// ---------------------------------------------
//        Traza las Órbitas
// ---------------------------------------------
function traceOrbits(scene, heavenlyBodies) {
    var geometry;
    var material = new THREE.LineBasicMaterial({ color: 0xCCCCFF });
    console.log("Entrando en traceOrbits " + heavenlyBodies.length);
    
    for (var hB in heavenlyBodies) {
        var orbPos = [];
        var j = 0;
        geometry = new THREE.BufferGeometry();   // Crear un objeto para cada órbita.
        var positions = [];

        for (let i = 0; i <= 6.28; i += 0.0785) {
            orbPos = heavenlyBodies[hB].propagate(i); // Propagar las órbitas.
            positions.push(orbPos[0], orbPos[1], orbPos[2]); // Agregar posiciones a la lista.
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); // Establecer las posiciones
        var line = new THREE.Line(geometry, material);
        line.name = heavenlyBodies[hB].name + "_trace";

        scene.add(line);
        console.log("Nombre de la línea " + line.name);
    }
    console.log("Saliendo de traceOrbits");
}

// Aquí puedes incluir tus funciones para calcular anomalías si es necesario
// ...

// ---------------------------------------------
//             Configuración de Three.js
// ---------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 0, 0);

const orbit= new OrbitControls(camera, renderer.domElement);










// Ejemplo de cuerpos celestes
// Definición de planetas usando los elementos orbitales de la tabla
var heavenlyBodies = [];

heavenlyBodies.push(new Trajectory("Mercury", 0.38709843, 7.00559432, 77.45771895, 0.20563661, 48.33961819, 252.25166724 - 77.45771895, 87.969));  // Periodo de Mercurio en días terrestres
heavenlyBodies.push(new Trajectory("Venus", 0.72332102, 3.39777545, 131.76755713, 0.00676399, 76.67261496, 181.97970850 - 131.76755713, 224.701)); // Periodo de Venus en días terrestres
heavenlyBodies.push(new Trajectory("Earth", 1.00000018, 0.00054346, 102.93005885, 0.01673163, -5.11260389, 100.46691572 - 102.93005885, 365.256)); // Periodo de la Tierra
heavenlyBodies.push(new Trajectory("Mars", 1.52371243, 1.85181869, -23.91744784, 0.09336511, 49.71320984, -4.56813164 - (-23.91744784), 686.980)); // Periodo de Marte en días
heavenlyBodies.push(new Trajectory("Jupiter", 5.20248019, 1.29861416, 14.27495244, 0.04853590, 100.29282654, 34.33479152 - 14.27495244, 4332.59));  // Periodo de Júpiter en días
heavenlyBodies.push(new Trajectory("Saturn", 9.54149883, 2.49424102, 92.86136063, 0.05550825, 113.63998702, 50.07571329 - 92.86136063, 10759.22));  // Periodo de Saturno en días
heavenlyBodies.push(new Trajectory("Uranus", 19.18797948, 0.77298127, 172.43404441, 0.04685740, 73.96250215, 314.20276625 - 172.43404441, 30685.4)); // Periodo de Urano en días
heavenlyBodies.push(new Trajectory("Neptune", 30.06952752, 1.77005520, 46.68158724, 0.00895439, 131.78635853, 304.22289287 - 46.68158724, 60190.03)); // Periodo de Neptuno en días


// Traza las órbitas
traceOrbits(scene, heavenlyBodies);

// Posiciona la cámara
camera.position.z = 150;
orbit.update();
// Función de animación
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


// Inicia la animación
animate();
