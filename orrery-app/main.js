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
const sunTexture = textureLoader.load('/textures/sun.jpg'); // Asegúrate de que la ruta sea correcta

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

// Definir un factor de escala para los planetas
const scaleFactor = 5; // Ajusta este valor para cambiar el tamaño de los planetas

// Datos de los planetas del sistema solar con información adicional
const planets = [
    {
        name: 'Mercury',
        semiMajorAxis: 5, // Escala ajustada para visualización
        eccentricity: 0.2056,
        inclination: 7.00, // Grados
        longitudeOfAscendingNode: 48.3313, // Grados
        argumentOfPeriapsis: 29.1241, // Grados
        meanLongitude: 252.25084, // Grados
        orbitalPeriod: 88, // Días
        rotationPeriod: 58.6, // Días (Rotación retrógrada)
        radius: 0.2 * scaleFactor, // Tamaño visual escalado
        color: 0xaaaaaa, // Color gris
        texture: '/textures/mercury.jpg', // Ruta absoluta correcta
        info: {
            Mass: '3.30 × 10^23 kg',
            Diameter: '4,879 km',
            DistanceFromSun: '57.9 million km',
            Moons: '0'
        }
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
        radius: 0.45 * scaleFactor,
        color: 0xffddaa,
        texture: '/textures/venus.jpg',
        info: {
            Mass: '4.87 × 10^24 kg',
            Diameter: '12,104 km',
            DistanceFromSun: '108.2 million km',
            Moons: '0'
        }
    },
    {
        name: 'Earth',
        semiMajorAxis: 10,
        eccentricity: 0.0167,
        inclination: 0.0,
        longitudeOfAscendingNode: 0.0,
        argumentOfPeriapsis: 102.94719,
        meanLongitude: 100.46435,
        orbitalPeriod: 365.25,
        rotationPeriod: 1,
        radius: 0.5 * scaleFactor,
        color: 0x0000ff,
        texture: '/textures/earth.jpg',
        info: {
            Mass: '5.97 × 10^24 kg',
            Diameter: '12,742 km',
            DistanceFromSun: '149.6 million km',
            Moons: '1'
        }
    },
    {
        name: 'Mars',
        semiMajorAxis: 15,
        eccentricity: 0.0934,
        inclination: 1.85,
        longitudeOfAscendingNode: 49.57854,
        argumentOfPeriapsis: 286.502,
        meanLongitude: 355.45332,
        orbitalPeriod: 687,
        rotationPeriod: 1.03,
        radius: 0.4 * scaleFactor,
        color: 0xff4500,
        texture: '/textures/mars.jpg',
        info: {
            Mass: '6.42 × 10^23 kg',
            Diameter: '6,779 km',
            DistanceFromSun: '227.9 million km',
            Moons: '2'
        }
    },
    {
        name: 'Jupiter',
        semiMajorAxis: 52,
        eccentricity: 0.0489,
        inclination: 1.303,
        longitudeOfAscendingNode: 100.55615,
        argumentOfPeriapsis: 273.867,
        meanLongitude: 34.40438,
        orbitalPeriod: 4331,
        rotationPeriod: 0.41,
        radius: 1 * scaleFactor,
        color: 0xffa500,
        texture: '/textures/jupiter.jpg',
        info: {
            Mass: '1.90 × 10^27 kg',
            Diameter: '139,820 km',
            DistanceFromSun: '778.5 million km',
            Moons: '79'
        }
    },
    {
        name: 'Saturn',
        semiMajorAxis: 95,
        eccentricity: 0.0565,
        inclination: 2.485,
        longitudeOfAscendingNode: 113.71504,
        argumentOfPeriapsis: 339.392,
        meanLongitude: 49.94432,
        orbitalPeriod: 10747,
        rotationPeriod: 0.44,
        radius: 0.85 * scaleFactor,
        color: 0xf5deb3,
        texture: '/textures/saturn.jpg',
        info: {
            Mass: '5.68 × 10^26 kg',
            Diameter: '116,460 km',
            DistanceFromSun: '1.434 billion km',
            Moons: '82'
        }
    },
    {
        name: 'Uranus',
        semiMajorAxis: 191,
        eccentricity: 0.0463,
        inclination: 0.773,
        longitudeOfAscendingNode: 74.22988,
        argumentOfPeriapsis: 96.73436,
        meanLongitude: 313.23218,
        orbitalPeriod: 30589,
        rotationPeriod: -0.72,
        radius: 0.7 * scaleFactor,
        color: 0xadd8e6,
        texture: '/textures/uranus.jpg',
        info: {
            Mass: '8.68 × 10^25 kg',
            Diameter: '50,724 km',
            DistanceFromSun: '2.871 billion km',
            Moons: '27'
        }
    },
    {
        name: 'Neptune',
        semiMajorAxis: 300,
        eccentricity: 0.0095,
        inclination: 1.770,
        longitudeOfAscendingNode: 131.72169,
        argumentOfPeriapsis: 276.045,
        meanLongitude: -55.120029,
        orbitalPeriod: 59800,
        rotationPeriod: 0.67,
        radius: 0.65 * scaleFactor,
        color: 0x0000ff,
        texture: '/textures/neptune.jpg',
        info: {
            Mass: '1.02 × 10^26 kg',
            Diameter: '49,244 km',
            DistanceFromSun: '4.495 billion km',
            Moons: '14'
        }
    }
];


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

// Configurar la posición inicial de la cámara
camera.position.set(0, 100, 300); // Posición más alejada para visualizar todas las órbitas
controls.update();

// Almacenar la posición y el objetivo inicial de la cámara
const originalCameraPosition = camera.position.clone();
const originalControlsTarget = controls.target.clone();

// Raycaster para detectar la selección de planetas
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Variables para el seguimiento del zoom
let selectedPlanet = null; // Planeta actualmente seleccionado
let isZooming = false;
let zoomDuration = 1000; // Duración del zoom en milisegundos
let zoomStartTime = 0;

// Offset de la cámara respecto al planeta seleccionado (ajustado para un zoom más cercano)
const cameraOffset = new THREE.Vector3(0, 2, 5); // Puedes ajustar estos valores según tus necesidades

// Crear un botón para resetear la vista
const resetButton = document.createElement('button');
resetButton.innerText = 'Return to original view';
resetButton.style.position = 'absolute';
resetButton.style.top = '20px';
resetButton.style.right = '20px'; // Cambiado de left a right para moverlo a la esquina superior derecha
resetButton.style.padding = '10px 20px';
resetButton.style.zIndex = '1';
resetButton.style.backgroundColor = '#ffffff';
resetButton.style.border = 'none';
resetButton.style.borderRadius = '5px';
resetButton.style.cursor = 'pointer';
resetButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
resetButton.style.display = 'none'; // Inicialmente oculto
document.body.appendChild(resetButton);

// Crear un cuadro para mostrar información del planeta
const infoBox = document.createElement('div');
infoBox.id = 'planet-info';
infoBox.style.position = 'absolute';
infoBox.style.top = '20px';
infoBox.style.left = '20px';
infoBox.style.padding = '10px';
infoBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
infoBox.style.color = '#ffffff';
infoBox.style.fontFamily = 'Arial, sans-serif';
infoBox.style.borderRadius = '5px';
infoBox.style.maxWidth = '300px';
infoBox.style.display = 'none'; // Inicialmente oculto
document.body.appendChild(infoBox);

// Añadir el listener para el botón de reset
resetButton.addEventListener('click', () => {
    if (isZooming) return; // Evitar interrumpir una animación de zoom en curso
    resetView();
});

// Función para volver a la vista original (zoom out y dejar de seguir)
function resetView() {
    if (!selectedPlanet) return; // Si no hay planeta seleccionado, no hacer nada

    isZooming = true;
    zoomStartTime = performance.now();
    selectedPlanet = null; // Dejar de seguir al planeta

    resetButton.style.display = 'none'; // Ocultar el botón al hacer zoom out
    infoBox.style.display = 'none'; // Ocultar el cuadro de información
}

// Función para manejar el clic del ratón
function onMouseClick(event) {
    if (isZooming) return; // Evitar múltiples zooms simultáneos

    // Calcular la posición del ratón en coordenadas normalizadas (-1 a +1) para ambos ejes
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Actualizar el raycaster con la posición de la cámara y el ratón
    raycaster.setFromCamera(mouse, camera);

    // Calcular las intersecciones con los planetas
    const intersects = raycaster.intersectObjects(planets.map(planet => planet.mesh));

    if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        const planetData = planets.find(planet => planet.mesh === selectedMesh);

        if (planetData) {
            // Iniciar el proceso de zoom
            isZooming = true;
            selectedPlanet = planetData;
            zoomStartTime = performance.now();

            resetButton.style.display = 'block'; // Mostrar el botón cuando se selecciona un planeta

            // Mostrar la información del planeta
            showPlanetInfo(planetData);
        }
    }
}

// Añadir el listener para el clic
window.addEventListener('click', onMouseClick);

// Función para mostrar la información del planeta
function showPlanetInfo(planet) {
    infoBox.innerHTML = `
        <h2>${planet.name}</h2>
        <p><strong>Mass:</strong> ${planet.info.Mass}</p>
        <p><strong>Diameter:</strong> ${planet.info.Diameter}</p>
        <p><strong>Distance from Sun:</strong> ${planet.info.DistanceFromSun}</p>
        <p><strong>Moons:</strong> ${planet.info.Moons}</p>
    `;
    infoBox.style.display = 'block';
}

// Función para calcular la posición deseada de la cámara respecto al planeta
function getDesiredCameraPosition(planetPosition) {
    // Clone el vector de posición del planeta
    const desiredPosition = planetPosition.clone().add(cameraOffset);
    return desiredPosition;
}

// Función de animación
let time = 0;
const timeIncrement = 0.1; // Ajusta este valor para controlar la velocidad orbital



    // Manejar el zoom y seguimiento
    const currentTime = performance.now();

    if (isZooming) {
        const elapsed = currentTime - zoomStartTime;
        const t = Math.min(elapsed / zoomDuration, 1); // Normalizar el tiempo

        if (selectedPlanet) {
            // Zoom hacia el planeta seleccionado
            const planetPosition = selectedPlanet.mesh.position.clone();

            // Posición objetivo de la cámara
            const desiredPosition = getDesiredCameraPosition(planetPosition);

            // Interpolar la posición de la cámara
            camera.position.lerp(desiredPosition, t);

            // Interpolar el objetivo de los controles para que siga al planeta
            controls.target.lerp(planetPosition, t);
        } else {
            // Volver a la vista original (zoom out)
            const desiredPosition = originalCameraPosition.clone();
            camera.position.lerp(desiredPosition, t);

            // Interpolar el objetivo de los controles hacia el objetivo original
            controls.target.lerp(originalControlsTarget, t);
        }

        controls.update();

        if (t === 1) {
            isZooming = false;
        }
    } else if (selectedPlanet) {
        // Si un planeta está seleccionado, seguir su posición
        const planetPosition = selectedPlanet.mesh.position.clone();
        const desiredPosition = planetPosition.clone().add(cameraOffset);

        // Mantener la cámara en la posición deseada respecto al planeta
        camera.position.lerp(desiredPosition, 0.1); // Ajusta el factor de interpolación para suavizar
        controls.target.lerp(planetPosition, 0.1); // Mantener el objetivo en el planeta

        controls.update();
    }

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
