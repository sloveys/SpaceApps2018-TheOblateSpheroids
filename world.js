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
camera.position.set(2, 0, 0);
controls.update();


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

var sphereGeometry = new THREE.SphereGeometry(1.0, 64, 64);
//var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x000fff});
var sphereMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('Assets/2_no_clouds_8k.jpg'),
  shininess: 0.5});
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

sphere.position.z = 0;
sphere.position.x = 0;
scene.add(sphere);

var sun = new THREE.PointLight(0xFFFFFF); // perhaps replace this with the type of light the sun produces?
sun.position.x = 10;
sun.position.y = 0;
sun.position.z = 10;
scene.add(sun);

var ambiLight = new THREE.AmbientLight(0x404040);
scene.add(ambiLight);
