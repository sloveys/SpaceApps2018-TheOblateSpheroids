var width = window.innerWidth;
var height = window.innerHeight;
var viewAngle = 75;
var nearClipping = 0.1;
var farClipping = 1000;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(viewAngle, width/height, nearClipping, farClipping);
var renderer = new THREE.WebGLRenderer();

renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera);
controls.enablePan = false;
var blockedAngle = 0.25;
controls.minPolarAngle = blockedAngle;
controls.maxPolarAngle = Math.PI - blockedAngle;
controls.minDistance = 1.1;
controls.maxDistance = 4;
camera.position.set(2, 0, 0);
controls.update();

var earthGeometry = new THREE.SphereGeometry(1.0, 64, 64);
var earthMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('Assets/2_no_clouds_8k.jpg'),
  shininess: 0.5});
var earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.z = 0;
earth.position.x = 0;
scene.add(earth);

var sun = new THREE.PointLight(0xFFFFFF); // perhaps replace this with the type of light the sun produces?
sun.position.x = 100;
sun.position.y = 0;
sun.position.z = 0;
var sunRotation = 0;
scene.add(sun);

var ambiLight = new THREE.AmbientLight(0x606060);
scene.add(ambiLight);

var environment = null;
function genEnvMap() {
  if (environment != null) {
    scene.remove(environment);
    environment = null;
  }
  // create environment
  var envScale = 1024;
  var envWidth = 2*envScale;
  var envHeight = envScale;
  var envSize = envWidth*envHeight;
  var envData = new Uint8Array(4 * envSize);

  for (var i = 0; i < envSize; i++) {
  	var stride = i * 4;
  	envData[stride] = 0; // r; rgb is 0...255
  	envData[stride + 1] = 0; // g
    envData[stride + 2] = 200; // b
    envData[stride + 3] = 100; // a
  }
  var envTexture = new THREE.DataTexture(envData, envWidth, envHeight, THREE.RGBAFormat);
  envTexture.needsUpdate = true;

  var envGeometry = new THREE.SphereGeometry(1.05, 64, 64);
  var envMaterial = new THREE.MeshPhongMaterial({
    map: envTexture,
    shininess: 0.5,
    transparent: true
  });
  var environment = new THREE.Mesh(envGeometry, envMaterial);
  environment.position.z = 0;
  environment.position.x = 0;
  scene.add(environment);

  animate();
}
genEnvMap();

function animate() {
  requestAnimationFrame(animate);
  sunRotation += 0.001
  sun.position.x = Math.cos(sunRotation) * 100;
  sun.position.z = Math.sin(sunRotation) * 100;
  controls.update();
  renderer.render(scene, camera);
}
animate();
