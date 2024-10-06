import * as THREE from 'three';

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
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ejemplo de cuerpos celestes
const heavenlyBodies = [
    new Trajectory("Mercurio", 57.91, 7.0, 29.0, 0.2056, 48.0, 174.0, 0.2408467),
    new Trajectory("Venus", 108.2, 3.4, 54.0, 0.0068, 76.0, 50.0, 0.61519726),
    // Agrega más cuerpos celestes según sea necesario
];

// Traza las órbitas
traceOrbits(scene, heavenlyBodies);

// Posiciona la cámara
camera.position.z = 150;

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Inicia la animación
animate();
