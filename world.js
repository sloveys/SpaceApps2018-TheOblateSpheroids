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
function genEnvMap(envData) {
  if (environment != null) {
    scene.remove(environment);
    environment = null;
  }
  // create environment
  var txtrScale = 12742; // diameter of earth
  var txtrWidth = txtrScale;
  var txtrHeight = txtrScale;
  var txtrData = new Uint8Array(4 * txtrWidth*txtrHeight);

  for (var w = 0; w < txtrWidth; w++) {
    for (var h = 0; h < txtrHeight; h++) {
    	var stride = (h*txtrWidth + w) * 4;
    	txtrData[stride] = 255; // r; rgb is 0...255
    	txtrData[stride + 1] = 0; // g
      txtrData[stride + 2] = 0; // b
      txtrData[stride + 3] = 0; // a
    }
  }

  for (var i = 0; i < envData.length; i++) {
    var wpos = (txtrWidth/2.0 + (envData[i][0]*txtrWidth/360.0))%txtrWidth;
    var hpos = (txtrHeight/2.0 + (envData[i][1]*txtrHeight/360.0))%txtrHeight;

    for (var wzone = -200; wzone < 200; wzone++) { // draw a box around the point
      for (var hzone = -200; hzone < 200; hzone++) {
        if (Math.sqrt((wzone*wzone) + (hzone*hzone)) <= 200) { // change box into point
          var stride = Math.floor((Math.floor(((hzone+hpos)%txtrHeight)*txtrWidth) + ((wzone+wpos)%txtrWidth))) * 4;
          txtrData[stride + 3] = envData[i][2]*255;
        }
      }
    }
  }

  var envTexture = new THREE.DataTexture(txtrData, txtrWidth, txtrHeight, THREE.RGBAFormat);
  envTexture.needsUpdate = true;

  var envGeometry = new THREE.SphereGeometry(1.03, 64, 64);
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
var evd = [[360,0,0.9], [0.0,20,0.8],
          [0,140,0.4], [180,0,0.8]];
genEnvMap(evd);

function animate() {
  requestAnimationFrame(animate);
  sunRotation += 0.001
  sun.position.x = Math.cos(sunRotation) * 100;
  sun.position.z = Math.sin(sunRotation) * 100;
  controls.update();
  renderer.render(scene, camera);
}
animate();
