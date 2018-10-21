var width = window.innerWidth;
var height = window.innerHeight;
var viewAngle = 75;
var nearClipping = 0.1;
var farClipping = 1000;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(viewAngle, width/height, nearClipping, farClipping);
var renderer = new THREE.WebGLRenderer();

/*
var mols = ["C2H2", "C2H6", "CCl2F2", "CCl3F", "CCl4", "CH3Cl", "CH4",
            "CHF2Cl", "ClONO2", "CO", "COF2", "H2CO", "H20", "H2O2", "HCL"];

var molSelect = document.getElementById("Molecules");
for (var i = 0; i < mols.length; i++) {
  var newOption = document.createElement("option");
  newOption.text = mols[i];
  newOption.value = mols[i];
  molSelect.appendChild(newOption);
}
var yearSelect = document.getElementById("Years");
*/

var fileSelect = document.getElementById("FileSelect");
fileSelect.addEventListener('change', getCSV);
function getCSV() {
  if (window.FileReader) {
    var file = fileSelect.files[0];

    var reader = new FileReader();
    reader.onload = loadHandler;
    //reader.onerror = errorHandler;

    reader.readAsText(file);
    /*d3.csv(file, function(data) {
      genEnvMap([[0,0,0.8]]);
      //loadHandler(data);
    }, function(error, rows) {
    });*/
    //genEnvMap([[0,0,0.9]]);
  }
}

function loadHandler(file) {
  var data = file.target.result;
  var lines = data.split(/\r\n|\n/);
  var minMeas = 0;
  var maxMeas = 0;
  var measurments = [];

  for (var i=0; i < lines.length; i++) {
    var row = lines[i].split(",");
    newMeas = [Number(row[1]), Number(row[2]), Number(row[0])];
    if (newMeas[2] > maxMeas) {
      maxMeas = newMeas[2];
    }
    if (newMeas[2] < 0) {
      newMeas[2] = 0;
      continue;
    }
    measurments.push(newMeas);
  }
  for (var i=0; i < measurments.length && maxMeas > 0; i++) {
    measurments[i][2] /= maxMeas;
  }

  genEnvMap(measurments);
  return;
}

renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
var blockedAngle = 0.25;
controls.minPolarAngle = blockedAngle;
controls.maxPolarAngle = Math.PI - blockedAngle;
controls.minDistance = 1.2;
controls.maxDistance = 4;
camera.position.set(2, 0, 0);
controls.update();

var earthGeometry = new THREE.SphereGeometry(1.0, 64, 64);
var earthMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('assets/2_no_clouds_8k.jpg'),
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

var ambiLight = new THREE.AmbientLight(0x808080);
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
  var txtrHeight = txtrScale/2;
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
    var hpos = (txtrHeight/2.0 + (envData[i][1]*txtrHeight/180.0))%txtrHeight;

    var radius = 50;
    //var wradius = hradius;// /(Math.cos(Math.PI*(envData[i][1])/180));
    for (var hzone = -radius; hzone < radius; hzone++) { // draw a box around the point
      var maxw = 0;
      for (var wzone = -radius; wzone < radius; wzone++) {
        if (Math.sqrt((wzone*wzone) + (hzone*hzone)) <= radius) { // change box into point
          if (wzone > maxw) {
            maxw = wzone;
          }
        }
      }
      var wdist = maxw;
      var wscale = 1/Math.sin(Math.PI*((hzone+hpos)%txtrHeight)/txtrHeight);
      // scale wdist
      wdist *= wscale;
      if (wdist > txtrWidth/2) {
        wdist = txtrWidth/2;
      }
      var eh = Math.floor(hzone+hpos)*txtrWidth;
      for (var wzone = -wdist; wzone < wdist; wzone++) {
        var ew = Math.floor(wzone+wpos)%txtrWidth;
        var stride = (eh + ew) * 4;
        txtrData[stride + 3] = envData[i][2]*255;
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
  environment = new THREE.Mesh(envGeometry, envMaterial);
  environment.position.z = 0;
  environment.position.x = 0;
  scene.add(environment);

  animate();
}
//getCSV();

function animate() {
  requestAnimationFrame(animate);
  sunRotation += 0.001
  sun.position.x = Math.cos(sunRotation) * 100;
  sun.position.z = Math.sin(sunRotation) * 100;
  controls.update();
  renderer.render(scene, camera);
}
animate();
