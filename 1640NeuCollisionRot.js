//IMPORT MODULES
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import GUI from "lil-gui";
import { LoopSubdivision } from "./LoopSubdivision.js";
import { CSG } from "./THREE-CSGMesh/dist/client/CSGMesh.js";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

//CONSTANT & VARIABLES

const iterations = 1;

const params = {
  split: true, // optional, default: true
  uvSmooth: true, // optional, default: false
  preserveEdges: true, // optional, default: false
  flatOnly: false, // optional, default: false
  maxTriangles: Infinity, // optional, default: Infinity
};

//-- WINDOW
let width = window.innerWidth;
let height = window.innerHeight;

//-- GUI
var gui;
var widthController;
var heightController;
var depthController;
var formatController;
var diameterController;
var lengthController;
var elevationController;
var barLengths = [];//länge der stäbe
var barDiameters = [];
var libraryFolder;


//-- Paar Variablen für die Tests
let cylinderRadius = 0.1;
let shortCylinderDummy = [];
let shortCylinderArray = [];
let anschluss = 0.8;
let generateRandomBasePointsCount = 0;
let diagonaleCylinder = [];
let allVectorsArray = [];
let remainingParts = [];
let surfaceArray = [];
let possible = true;
let legCountNr;
let tableHeightNr;
let partList = [];
let sortedInput = [];
let startingPoints = [];
let cantCreateLimit = 30;
let cantCreateCount = 0;
let fullLengthCount = 0;
let cylinderCount = 0;
let sphereDiameter = 0.2;
let exportGeometry = [];

//-- GUI PARAMETER

const parameters = {
  length: 0,
  width: 0,
  height: 0,
  depth: 0,
  diameter: 0,
  format: "square",
  fileName: "exported_Model",
  elevation: 5,
  legCount: 3,
  spareLength: 0,

  Board() {
    createBoard();
  },
  Beam() {
    createBeam();
  },
  Bar() {
    createBar();
  },
  Joint() {
    createJoint();
  },
  delete() {
    deleteTransformedObject();
  },
  export() {
    exportScene();
  },
  move() {
    moveMode();
  },
  rotate() {
    rotateMode();
  },
  Add() {
    addMaterialToLibrary();
  },
  Generate() {
    generatorStarting()

  },
  push() {
    pushValuestoArray();
  },

  clearValues() {
    partList = [];
    alert("Array Cleared");
  },
};

//-- SCENE VARIABLES
var scene;
var camera;
var renderer;
var container;
var orbit;
var control;
var ambientLight;
var directionalLight;

//-- EXPORTER VARIABLES
const exporterOptions = { binary: true };
var exporter;

//-- RAYCASTER VARIABLES
let group;
let selectedObject = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
var transformedObject = null;

//-- GEOMETRY PARAMETERS
//Create an empty array for storing all the cubes
let sceneObjects = [];
let boardCounter = 1;
let beamCounter = 1;
let barCounter = 1;
let jointCounter = 1;
let jointGroup;

//-----------------------------------------------------------------------------------
// LANDING PAGE
//----------------------------------------------------------------------------------

// Create landing page dynamically

const landingPage = document.createElement("div");
landingPage.id = "landing-page";
landingPage.style.position = "absolute";
landingPage.style.top = "0";
landingPage.style.left = "0";
landingPage.style.right = "0";
landingPage.style.bottom = "0";
landingPage.style.display = "flex";
landingPage.style.flexDirection = "column";
landingPage.style.alignItems = "center";
landingPage.style.justifyContent = "center";
landingPage.style.textAlign = "center";
landingPage.style.color = "#333";
landingPage.style.backgroundColor = "white";

const logoEmbed = document.createElement("embed");
logoEmbed.src = "./pubic/logo.svg";
logoEmbed.style.position = "absolute";
logoEmbed.style.top = "calc(5% - 0px)";
logoEmbed.style.left = "calc(5% - 0px)";
logoEmbed.style.width = "50px";
logoEmbed.style.height = "auto";
landingPage.appendChild(logoEmbed);

const logoICD = document.createElement("embed");
logoICD.src = "./pubic/ICD-LOGO.png";
logoICD.style.position = "absolute";
logoICD.style.top = "calc(95% - 0px)";
logoICD.style.left = "calc(1% - 0px)";
logoICD.style.width = "60px";
logoICD.style.height = "auto";
landingPage.appendChild(logoICD);

const title = document.createElement("h1");
title.id = "title";
title.innerText = "ReFurnish3d";
title.style.fontSize = "44px";
title.style.position = "absolute";
title.style.color = "black";
title.style.border = "none";
title.style.borderRadius = "5px";
title.style.top = "calc(5% - 28px)";
title.style.left = "calc(5% + 70px)";
title.style.fontFamily = "Josefin Sans, Arial, sans-serif";


const names = document.createElement("n1");
names.id = "names";
names.innerText = "a project by Lennart Dolderer, Julian Hoch, Elias Röhner, Timo Sawitzky";
names.style.fontSize = "16px";
names.style.position = "absolute";
names.style.color = "#666666";
names.style.border = "none";
names.style.borderRadius = "5px";
names.style.top = "calc(5% + 20px)";
names.style.left = "calc(5% + 330px)";
names.style.fontFamily = "Montserrat, Arial, sans-serif";
names.style.fontWeight = 600;

const uni = document.createElement("u1");
uni.id = "uni";
uni.innerText = "Supervision: Tenure-Track Prof. Dr. Thomas Wortmann  |  Tutors: Zuardin Akbar, Gili Ron  |  WS23/24  |  B.Sc. Architecture and Urban Planning  |  5th semester";
uni.style.fontSize = "12px";
uni.style.position = "absolute";
uni.style.color = "#666666";
uni.style.border = "none";
uni.style.borderRadius = "5px";
uni.style.top = "calc(96% + 0px)";
uni.style.left = "calc(5% + 0px)";
uni.style.fontFamily = "Montserrat, Arial, sans-serif";
uni.style.fontWeight = 500;


// const manual = document.createElement("m1");
// manual.id = "manual";
// manual.innerText = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. ";
// manual.style.fontSize = "20px";
// manual.style.position = "absolute";
// manual.style.color = "#666666";
// manual.style.border = "none";
// manual.style.borderRadius = "5px";
// manual.style.top = "calc(40% + 0px)";
// manual.style.left = "calc(5% + 0px)";
// manual.style.width = "calc(90% + 0px)";
// manual.style.fontFamily = "Montserrat, Arial, sans-serif";
// manual.style.fontWeight = 400;

const logoManual = document.createElement("embed");
logoManual.src = "./pubic/manual test.svg";
logoManual.style.position = "absolute";
logoManual.style.top = "calc(40% - 0px)";
logoManual.style.left = "calc(25% - 0px)";
logoManual.style.width = "1000px";
logoManual.style.height = "auto";
landingPage.appendChild(logoManual);


const createProjectButton = document.createElement("button");
createProjectButton.id = "create-project-button";
createProjectButton.innerText = "Refurnish!";
createProjectButton.style.padding = "15px 30px";
createProjectButton.style.fontSize = "18px";
createProjectButton.style.cursor = "pointer";
createProjectButton.style.backgroundColor = "#666666";
createProjectButton.style.color = "white";
createProjectButton.style.border = "none";
createProjectButton.style.borderRadius = "5px";
createProjectButton.style.position = "absolute";
createProjectButton.style.top = "calc(80% + 0px)";
createProjectButton.style.fontFamily = "Montserrat, sans-serif";
createProjectButton.onclick = function (event) {
  event.preventDefault();
  showProject();
}

landingPage.appendChild(title);
landingPage.appendChild(names);
landingPage.appendChild(uni);
// landingPage.appendChild(manual);
landingPage.appendChild(createProjectButton);
document.body.appendChild(landingPage);

const threejsContainer2 = document.createElement("div");
threejsContainer2.id = "threejs-container2";
threejsContainer2.style.display = "none";
threejsContainer2.style.height = "100vh";
document.body.appendChild(threejsContainer2);

const threejsContainer = document.createElement("div");
threejsContainer.id = "threejs-container";
threejsContainer.style.display = "none";
threejsContainer.style.height = "100vh";
document.body.appendChild(threejsContainer);


function showProject() {
  landingPage.style.position = "fixed";
  landingPage.style.width = "100%";
  landingPage.style.height = "100%";
  landingPage.style.overflow = "hidden";
  landingPage.style.display = "none";
  threejsContainer.style.display = "block";
  threejsContainer2.style.display = "block";
  threejsContainer2.appendChild(title);
  threejsContainer2.appendChild(logoEmbed);
  gui.domElement.style.display = "block";
}




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////77
// Function to create text geometry with predefined parameters
function createTextGeometry(text, font, parameters) {
  return new Promise((resolve, reject) => {
    const textGeometry = new TextGeometry(text, {
      font: font,
      ...parameters
    });
    // Compute bounding box
    textGeometry.computeBoundingBox();

    // Compute text width and height
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;


    // Adjust position to center horizontally
    textGeometry.translate(-textWidth / 2, 0, 0);


    // Adjust position to center vertically
    textGeometry.translate(0, -textHeight / 2, 0);


    resolve(textGeometry);
  });
}


// Load the font
const fontPromise = new Promise((resolve, reject) => {
  const fontLoader = new FontLoader();
  fontLoader.load('./node_modules/three/examples/fonts/helvetiker_regular.typeface.json', resolve);
});


// Define parameters
const textParameters = {
  size: 0.2,
  height: 0,
  curveSegments: 12,
  bevelEnabled: false,
  bevelThickness: 0,
  bevelSize: 0,
  bevelOffset: 0,
  bevelSegments: 0
};


let showText = false;
var textgroup = [];
const Textmaterial = new THREE.MeshBasicMaterial({ color: 0x8A2BE2 });
const BeamTextmaterial = new THREE.MeshBasicMaterial({ color: 0xCC00CC });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////77//////////////////



//-----------------------------------------------------------------------------------
// MAIN
//-----------------------------------------------------------------------------------
function main() {
  //GUI
  gui = new GUI();


  // Hide the GUI controls initially
  gui.domElement.style.display = 'none';

  //Add Objects
  const addObjectFolder = gui.addFolder("Add Objects");
  // formatController= addObjectFolder.add(parameters, "format", ["square", "round"]);
  lengthController = addObjectFolder.add(parameters, "length");
  diameterController = addObjectFolder.add(parameters, "diameter");

  addObjectFolder.add(parameters, "Add");
  libraryFolder = gui.addFolder("Spare parts library");

  const boardFolder = gui.addFolder("Set board parameters");

  widthController = boardFolder.add(parameters, "width");
  depthController = boardFolder.add(parameters, "depth");
  elevationController = boardFolder.add(parameters, "elevation");
  gui.add(parameters, "Generate");



  //Add Object Settings
  //   const selectedObjectFolder = gui.addFolder("Selected Object");
  //   selectedObjectFolder.add(parameters, "move");
  //   selectedObjectFolder.add(parameters, "rotate");
  //   selectedObjectFolder.add(parameters, "delete");

  //Add Export
  const exportFolder = gui.addFolder("Export");
  exportFolder.add(parameters, "fileName");
  exportFolder.add(parameters, "export");

  //Add Library
  //Vorläufiger Ordner mit input für Tests
  const testInputFolder = gui.addFolder("Test Input");
  testInputFolder.add(parameters, "Generate");
  testInputFolder.add(parameters, "elevation", 1, 10);
  testInputFolder.add(parameters, "legCount", 3, 5, 1);
  testInputFolder.add(parameters, "spareLength", 0, 15);
  testInputFolder.add(parameters, "push");

  gui.add({ ShowText: showText }, 'ShowText').onChange((value) => {
    showText = value;
    toggleTextGroupVisibility();
  });


  function toggleTextGroupVisibility() {
    textgroup.forEach((object) => {
      object.visible = showText;
    });
  }



  //set Controller Value
  // widthController.setValue(null);
  // heightController.setValue(null);
  // depthController.setValue(null);

  // diameterController.show(false);

  // formatController.onFinishChange(function (v) {
  //   if (v == "round") {
  //     widthController.show(false);
  //     depthController.show(false);
  //     diameterController.show(true);
  //   }
  //   if (v == "square") {
  //     widthController.show(true);
  //     depthController.show(true);
  //     diameterController.show(false);
  //   }
  // });

  //CREATE SCENE AND CAMERA
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(15, width / height, 0.1, 2000);
  camera.position.set(200, 100, 170);

  //LIGHTINGS
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(2, 5, 5);
  directionalLight.target.position.set(-1, -1, 0);
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  //GEOMETRY INITIATION
  // Create Base Grid
  createGrid();

  //CREATE A RENDERER
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container = document.querySelector("#threejs-container");
  let canvas = renderer.domElement;
  container.append(renderer.domElement);

  //RESPONSIVE WINDOW
  window.addEventListener("resize", handleResize);
  document.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("click", onClick);
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", upKey);

  //RAYCASTER
  group = new THREE.Group();
  jointGroup = new THREE.Group();
  scene.add(group);
  scene.add(jointGroup);
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.minDistance = 2;
  orbit.maxDistance = 1000;

  //Exporter
  exporter = new STLExporter();

  //Transform selected Objects
  // widthController.onFinishChange(function (v) {
  //   if (transformedObject != null) {
  //     transformedObject.scale.x =
  //       parameters.width / transformedObject.geometry.parameters.width;
  //   }
  // });

  // heightController.onFinishChange(function (v) {
  //   if (transformedObject != null) {
  //     transformedObject.scale.y =
  //       parameters.width / transformedObject.geometry.parameters.width;
  //   }
  // });

  // depthController.onFinishChange(function (v) {
  //   if (transformedObject != null) {
  //     transformedObject.scale.z =
  //       parameters.width / transformedObject.geometry.parameters.width;
  //   }
  // });

  control = new TransformControls(camera, renderer.domElement);
  //Die folgende Zeile lässt iwie alles ruckeln???

  //control.addEventListener("change", animate);

  control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });
  control.setMode("translate");
  control.setTranslationSnap(1);
  control.setSize(1.2);

  //Create export Button
  //createButton("export", "export", 20, exportScene());


  //EXECUTE THE UPDATE
  animate();
}

//-----------------------------------------------------------------------------------
/////Class
class ChildPart {
  constructor(mesh) {
    this.mesh = mesh;
    this.boxwire = null;
  }

  // add my bounding box wire to the given mesh
  addBoundingBoxWire(toMesh) {
    const boxwire = new THREE.BoxHelper(this.mesh, 0xff8000);
    this.boxwire = boxwire;
    ChildPart.adjustRelativeTo(boxwire, toMesh);
    toMesh.add(boxwire);
  }
  static adjustRelativeTo(mesh, toMesh) {
    toMesh.updateMatrixWorld(true); // important !
    mesh.applyMatrix4(new THREE.Matrix4().invert(toMesh.matrixWorld));
  }
}
// class Projection {
//   constructor(min, max) {
//       this.min = min;
//       this.max = max;
//   }

//   overlaps(projection) {
//       return this.max > projection.min && this.min < projection.max;
//   }
// }

// class OBB {
//   constructor(center, halfSize, rotation) {
//       this.center = center;
//       this.halfSize = halfSize;
//       this.rotation = rotation;
//   }

//   // Check if this OBB intersects with another OBB
//   intersects(other) {
//       let axes = [this.rotation, other.rotation];
//       for (let i = 0; i < axes.length; i++) {
//           let axis = axes[i];
//           let projection1 = this.project(axis);
//           let projection2 = other.project(axis);
//           if (!projection1.overlaps(projection2)) {
//               return false;
//           }
//       }
//       return true;
//   }

//   project(axis) {
//       let dotProduct = this.halfSize.dot(axis);
//       return new Projection(this.center.dot(axis) - dotProduct, this.center.dot(axis) + dotProduct);
//   }
// }

// function createOBBFromCylinder(cylinder) {
//   let center = cylinder.position;
//   let halfSize = new THREE.Vector3(cylinder.geometry.parameters.radius, cylinder.geometry.parameters.height / 2, cylinder.geometry.parameters.radius);
//   let rotation = cylinder.quaternion;

//   return new OBB(center, halfSize, rotation);
// }

// function checkCollision(cylinder1, cylinder2) {
//   let obb1 = createOBBFromCylinder(cylinder1);
//   let obb2 = createOBBFromCylinder(cylinder2);
//   visualizeOBB(obb1, scene);
//   visualizeOBB(obb2, scene);

//   return obb1.intersects(obb2); 
// }

// function visualizeOBB(obb, scene) {
//   // Create a THREE.Box3 from the OBB
//   let box3 = new THREE.Box3(
//     new THREE.Vector3(
//       obb.center.x - obb.halfSize.x,
//       obb.center.y - obb.halfSize.y,
//       obb.center.z - obb.halfSize.z
//     ),
//     new THREE.Vector3(
//       obb.center.x + obb.halfSize.x,
//       obb.center.y + obb.halfSize.y,
//       obb.center.z + obb.halfSize.z
//     )
//   );

//   // Create a helper for the box
//   let helper = new THREE.Box3Helper(box3, 0xffff00);

//   // Add the helper to the scene
//   scene.add(helper);
// }

//HELPER FUNCTIONS
function generatorStarting() {
  legCountNr = parameters.legCount;
  tableHeightNr = parameters.elevation;
  partList = [5.5, 8, 8, 8, 8, 8, 8, 8, 8, 3, 3, 3, 3, 3, 3];//barLengths;//[5.5,8,8,8,8,8,8,8,8,3,3,3,3,3,3];///für Elias hier array barLengths = partlist einfügen
  let testInputSorted = partList.sort((a, b) => a - b);
  possible = testForPosibility(testInputSorted);
  if (possible) {
    createSurface(legCountNr);
    startingPoints = placePointsTop(surfaceArray);
    // console.log(startingPoints);
    placePointsBottom(startingPoints);
    // console.log(bottomPoints);
    for (let i = 0; i < 3; i++) {

      createDiagonalConnections(remainingParts, allVectorsArray);

    }

  } else { alert("Da musst du nochmal in die Kiste schauen. Zu wenig Teile") }
  console.log(allVectorsArray);
  console.log(diagonaleCylinder);
  UnionJoints(shortCylinderDummy);
}

function pushValuestoArray() {

  if (parameters.spareLength != 0) {
    partList.push(parameters.spareLength)
    parameters.spareLength = 0;
    // console.log(partList);
    // testInputFolder.updateDisplay(); Update GUI will nicht

  }
  else {
    alert("empty Value");
  }

}

function splitArray(numbers, count) {
  const resultArrays = [];
  let sortingArray = [...numbers];

  for (let j = 0; j < count && sortingArray.length > 0; j++) {
    let currentArray = [];
    let sum = 0;

    while (sum < tableHeightNr && sortingArray.length > 0) {
      currentArray.push(sortingArray.shift()); // Combine the smallest
      if (sum < tableHeightNr && sortingArray.length > 0) {
        currentArray.push(sortingArray.pop()); // Combine the largest
      }
      sum = currentArray.reduce((acc, value) => acc + value, 0);
    }

    resultArrays.push([...currentArray]);
  }

  return resultArrays;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// function getAllParts(){

// }

function checkRemainingParts(allShortParts, usedShortParts, remainingLongParts) {

  let flatArray = [].concat(...usedShortParts);

  const resultShort = (sourceArray, filterArray) => {
    filterArray.forEach(item => {
      const index = sourceArray.indexOf(item);
      if (index !== -1) {
        sourceArray.splice(index, 1);
      }
    });
    return (sourceArray);
  };

  let remainingShortParts = resultShort(allShortParts, flatArray);
  remainingLongParts.push(remainingShortParts);
  let flatRemainArray = [].concat(...remainingLongParts);
  flatRemainArray.sort((a, b) => a - b);

  return flatRemainArray;


}

function filterVectorsByY(value, vectorsArray) {
  let sortValue = value.y;
  const filteredArray = vectorsArray.filter((vector) => vector.y !== sortValue);
  return filteredArray;
}

function optimalLength(values, target) {

  let closestSum = Infinity;
  let resultArray = [];
  let remainingValues = [...values];

  // Check for single values
  for (let i = 0; i < values.length; i++) {
    const currentSum = values[i];
    if (currentSum >= target && Math.abs(target - currentSum) < Math.abs(target - closestSum)) {
      closestSum = currentSum;
      resultArray = [values[i]];
      remainingValues.splice(i, 1)
      break;
    }
  }

  // Check for pairs of values
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const currentSum = values[i] + values[j];
      if (currentSum >= target && Math.abs(target - currentSum) < Math.abs(target - closestSum)) {
        closestSum = currentSum;
        resultArray = [values[i], values[j]];
        remainingValues.splice(i, 1);
        remainingValues.splice((j - 1), 1);
        break;
      }
    }
  }

  // Check for triplets
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      for (let k = j + 1; k < values.length; k++) {
        const currentSum = values[i] + values[j] + values[k];
        if (currentSum >= target && Math.abs(target - currentSum) < Math.abs(target - closestSum)) {
          closestSum = currentSum;
          resultArray = [values[i], values[j], values[k]];
          remainingValues.splice(i, 1);
          remainingValues.splice((j - 1), 1);
          remainingValues.splice((k - 2), 1);
          break;
        }
      }
    }
  }

  return {
    resultArray,
    remainingValues,
  };

}

function generateBranchConnectionAlongLineAB(usedParts, diagonalStartingPoint, endVector, distanceEndtoEnd) {
  let directionalVector = endVector.clone().sub(diagonalStartingPoint);
  let newStartingPoint = diagonalStartingPoint;
  let distanceTotal = 0;
  let collisionCheck = true;

  // generateBranchConnectionAB(diagonalStartingPoint,endVector);
  // let testcylinder = diagonaleCylinder[0];
  // testcylinder.geometry.parameters.height -= 5;
  // console.log(testcylinder);


  // collisionCheck = checkForColission(testcylinder);

  if (collisionCheck) {

    // console.log(usedParts);

    for (let i = 0; i < usedParts.length; i++) {


      let distance = usedParts[i];
      distanceTotal += usedParts[i];

      let newVector = directionalVector.clone().normalize().multiplyScalar(distance);

      let newEndVector = newStartingPoint.clone().add(newVector);

      const sphereGeometry = new THREE.SphereGeometry(sphereDiameter);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x8800EAF9 });
      const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere1.position.copy(newEndVector);



      if (distanceTotal <= distanceEndtoEnd) {
        newEndVector.name = "GeneratedPoint" + generateRandomBasePointsCount;
        generateRandomBasePointsCount++;
        allVectorsArray.push(newEndVector);

        // scene.add(sphere1);

        generateBranchConnectionAB(newStartingPoint, newEndVector);

      } else {
        // sphere1.position.copy(endVector);
        generateBranchConnectionAB(newStartingPoint, endVector);
        // scene.add(sphere1);
      }
      newStartingPoint = newEndVector;



      // allVectorsArray.push(newEndVector);

      // return true

    }
  } else {

    // return false
  }
}

// function checkForColission(allsphere){


// for (var vertexIndex = 0; vertexIndex < allsphere.geometry.attributes.position.array.length; vertexIndex++)
// {       
//     var localVertex = new THREE.Vector3().fromBufferAttribute(allsphere.geometry.attributes.position, vertexIndex).clone();
//     var globalVertex = localVertex.applyMatrix4(allsphere.matrix);
//     var directionVector = globalVertex.sub( allsphere.position );


//     var ray = new THREE.Raycaster( allsphere.position, directionVector.clone().normalize() );
//     var collisionResults = ray.intersectObjects( sceneObjects );
//     if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
//     {
//       console.log("collision")
//       removeObject(allsphere)
//       return false; // a collision occurred... do something...

//     }else{

//       console.log("keine Collision")
//       return true;


//     }
// }

// }

// function shortenCylinder(cylinder,newHeight){

//   const currentHeight = cylinder.geometry.parameters.height;

// const newGeometry = cylinder.geometry.clone();

// newGeometry.parameters.height = newHeight;

// const quaternion = new THREE.Quaternion();
// quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), cylinder.rotation.y);

// const translationVector = new THREE.Vector3(0, 0, (newHeight - currentHeight) / 2);
// translationVector.applyQuaternion(quaternion);

// newGeometry.translate(translationVector.x, translationVector.y, translationVector.z);

// cylinder.geometry.dispose(); // Entferne die alte Geometrie
// cylinder.geometry = newGeometry;

// return cylinder;


// }

//-----------------------------------------------------------------------------------


//Alles zum Algorythmus hier
function testForPosibility(testInput) {

  let totalLengthCalculated = testInput.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  let shortUsedList = [];
  let check;
  let filterInputHigh = [];
  let filterInputHighFlat = [];

  if (totalLengthCalculated > (tableHeightNr * legCountNr)) {
    alert("geht");
    check = true;
  } else {
    alert("geht nicht");
    return false;
  }


  filterInputHighFlat.push(testInput.filter(testInput => testInput >= tableHeightNr));
  filterInputHigh = [].concat(...filterInputHighFlat);

  sortedInput = [...filterInputHigh];
  let longSortedInput = filterInputHigh;

  let filterInputLow = testInput.filter(testInput => testInput < tableHeightNr);
  let shortRemainList = filterInputLow;

  let checkRemain = legCountNr - filterInputHigh.length;
  let longRemainList = longSortedInput.splice(legCountNr, Math.abs(checkRemain));
  //longSortedInput behält alle Linien welche für die beine genutzt werden können

  if (checkRemain > 0) {


    let sumFilterInputLow = filterInputLow.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    if (sumFilterInputLow >= (tableHeightNr * checkRemain)) {
      filterInputLow = splitArray(filterInputLow, checkRemain);
    }

    for (let i = 0; i < filterInputLow.length; i++) {
      sortedInput.push(filterInputLow[i])
      shortUsedList.push(filterInputLow[i])
    }
  } else {
    sortedInput.push(filterInputLow)
  }

  remainingParts = checkRemainingParts(shortRemainList, shortUsedList, longRemainList)

  return true;
}

function createSurface(divisions) {

  const upperSurfaceGeometry = new THREE.PlaneGeometry(10, 10,);
  const upperSurfaceMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, wireframe: false });
  const upperSurface = new THREE.Mesh(upperSurfaceGeometry, upperSurfaceMaterial);
  upperSurface.position.set(0, tableHeightNr, 0);
  upperSurface.rotation.x = -Math.PI / 2;


  switch (divisions) {

    case 3:
      surfaceArray = surfaceDevisionThree(divisions, upperSurface);
      break;

    case 4:
      surfaceArray = surfaceDevisionFour(divisions, upperSurface);
      break;

    case 5:
      console.log("five");
      break;

    case 6:
      console.log("six");
      break;
    default:
      alert("kein Input du otto")

  }
  return surfaceArray
}

function surfaceDevisionThree(count, surface) {


  const upperSurfaceMaterial = new THREE.MeshBasicMaterial({ color: 0x101010, side: THREE.DoubleSide, wireframe: true });
  let surfacePool = [];

  let baseHeight = surface.geometry.parameters.height;
  let baseWidth = surface.geometry.parameters.width;

  let halfHeight = baseHeight / 2;
  let halfWidth = baseWidth / 2;

  const upperSurfaceGeometry1 = new THREE.PlaneGeometry(baseHeight, halfWidth);
  const upperSurface1 = new THREE.Mesh(upperSurfaceGeometry1, upperSurfaceMaterial);
  upperSurface1.rotation.x = -Math.PI / 2;
  upperSurface1.position.set(0, tableHeightNr, (halfWidth / 2));
  surfacePool.push(upperSurface1);
  scene.add(upperSurface1);

  const upperSurfaceGeometry2 = new THREE.PlaneGeometry(halfHeight, halfWidth);
  const upperSurface2 = new THREE.Mesh(upperSurfaceGeometry2, upperSurfaceMaterial);
  upperSurface2.rotation.x = -Math.PI / 2;
  upperSurface2.position.set((halfHeight / 2), tableHeightNr, -(halfWidth / 2));
  surfacePool.push(upperSurface2);
  scene.add(upperSurface2);

  const upperSurface3 = new THREE.Mesh(upperSurfaceGeometry2, upperSurfaceMaterial);
  upperSurface3.rotation.x = -Math.PI / 2;
  upperSurface3.position.set(-(halfHeight / 2), tableHeightNr, -(halfWidth / 2));
  surfacePool.push(upperSurface3);
  scene.add(upperSurface3);

  return surfacePool;


}

function surfaceDevisionFour(count, surface) {

  const upperSurfaceMaterial = new THREE.MeshBasicMaterial({ color: 0x101010, side: THREE.DoubleSide, wireframe: true });
  let surfacePool = [];

  let baseHeight = surface.geometry.parameters.height;
  let baseWidth = surface.geometry.parameters.width;

  let halfHeight = baseHeight / 2;
  let halfWidth = baseWidth / 2;

  const upperSurfaceGeometry1 = new THREE.PlaneGeometry(halfHeight, halfWidth);
  const upperSurface1 = new THREE.Mesh(upperSurfaceGeometry1, upperSurfaceMaterial);
  upperSurface1.rotation.x = -Math.PI / 2;
  upperSurface1.position.set((halfHeight / 2), tableHeightNr, (halfWidth / 2));
  upperSurface1.name = "S1";
  surfacePool.push(upperSurface1);
  scene.add(upperSurface1);

  const upperSurface2 = new THREE.Mesh(upperSurfaceGeometry1, upperSurfaceMaterial);
  upperSurface2.rotation.x = -Math.PI / 2;
  upperSurface2.position.set((halfHeight / 2), tableHeightNr, -(halfWidth / 2));
  upperSurface2.name = "S2";
  surfacePool.push(upperSurface2);
  scene.add(upperSurface2);

  const upperSurface3 = new THREE.Mesh(upperSurfaceGeometry1, upperSurfaceMaterial);
  upperSurface3.rotation.x = -Math.PI / 2;
  upperSurface3.position.set(-(halfHeight / 2), tableHeightNr, -(halfWidth / 2));
  upperSurface3.name = "S3";
  surfacePool.push(upperSurface3);
  scene.add(upperSurface3);


  const upperSurface4 = new THREE.Mesh(upperSurfaceGeometry1, upperSurfaceMaterial);
  upperSurface4.rotation.x = -Math.PI / 2;
  upperSurface4.position.set(-(halfHeight / 2), tableHeightNr, (halfWidth / 2));
  upperSurface4.name = "S4";
  surfacePool.push(upperSurface4);
  scene.add(upperSurface4);
  console.log(surfacePool);

  return surfacePool;


}

function placePointsTop(surfaceArray) {


  for (let i = 0; i < surfaceArray.length; i++) {
    let currentSurface = surfaceArray[i];
    let currentSurfaceZ = currentSurface.position.z;
    let currentSurfaceX = currentSurface.position.x;
    let newPosition = new THREE.Vector3();

    let currentSurfaceH = currentSurface.geometry.parameters.height;
    let currentSurfaceW = currentSurface.geometry.parameters.width;

    let x = THREE.MathUtils.randFloat(-(currentSurfaceW / 2), currentSurfaceW / 2);
    let z = THREE.MathUtils.randFloat(-(currentSurfaceH / 2), currentSurfaceH / 2);

    let newRandomPosition = new THREE.Vector3(x, 0, z);
    let oldPosition = new THREE.Vector3(currentSurfaceX, tableHeightNr, currentSurfaceZ);
    newPosition.subVectors(oldPosition, newRandomPosition);
    startingPoints.push(newPosition);

    newPosition.name = "GeneratedPoint" + generateRandomBasePointsCount;
    allVectorsArray.push(newPosition);
    generateRandomBasePointsCount++;

    const sphereGeometry = new THREE.SphereGeometry(sphereDiameter);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x8888888 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphere.position.copy(newPosition);
    // scene.add(sphere);
  }

  return startingPoints;

}

function placePointsBottom(startingPoints) {
  let testlength = partList.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  let startingPointsCount = startingPoints.length;
  let randomBPoints;

  let a = testlength / startingPointsCount;
  let c = tableHeightNr;
  let b = 0;


  for (let i = 0; i < legCountNr; i++) {
    // Check for Array if Arry multiple lines are created
    if (Array.isArray(sortedInput[i])) {
      let arrayIntern = []
      arrayIntern = sortedInput[i];

      arrayIntern.sort((a, b) => a - b);

      let firstItemforBranch = arrayIntern[0];
      let center = startingPoints[i];
      let centerArray;
      let inbetweenArray;
      let bottomArray;
      let topArray;


      centerArray = startingPoints[i];

      let c = firstItemforBranch - 0.01;
      let b = Math.sqrt((firstItemforBranch * firstItemforBranch) - (c * c));

      // Generierung vom Punkt auf der Zwischnebene
      let randomPointInbetween = generateRandomBasePoints(center, b, (tableHeightNr - c));
      const sphereGeometry = new THREE.SphereGeometry(sphereDiameter);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0808088 });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(randomPointInbetween);
      // scene.add(sphere);
      inbetweenArray = randomPointInbetween;
      generateBranchConnectionAB(centerArray, inbetweenArray);
      //Soritierung von restlichen punkten in Punkte nach oben oder nach unten
      let decissionHeight = tableHeightNr - firstItemforBranch;
      arrayIntern.splice(0, 1);

      let arrayInternBotoom = arrayIntern.filter(arrayIntern => arrayIntern > decissionHeight);
      let arrayInternTop = arrayIntern.filter(arrayIntern => arrayIntern < decissionHeight);



      //punkte die nach unten gehen
      for (let j = 0; j < arrayInternBotoom.length; j++) {
        let cBottom = decissionHeight;
        let aBottom = arrayInternBotoom[j];
        let bBottom = Math.sqrt((aBottom * aBottom) - (cBottom * cBottom));
        let randomPointBottomBranch = generateRandomBasePoints(randomPointInbetween, bBottom, 0);
        const sphereGeometry = new THREE.SphereGeometry(sphereDiameter);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0800000 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(randomPointBottomBranch);
        // scene.add(sphere);
        bottomArray = randomPointBottomBranch;
        generateBranchConnectionAB(inbetweenArray, bottomArray);
      }

      //Punkte die nach oben gehen
      for (let k = 0; k < arrayInternTop.length; k++) {
        let cTop = c;
        let aTop = arrayInternTop[k];
        let bTop = Math.sqrt((aTop * aTop) - (cTop * cTop));
        let randomPointTopBranch = generateRandomBasePoints(randomPointInbetween, bTop, tableHeightNr);
        const sphereGeometry = new THREE.SphereGeometry(sphereDiameter);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000088 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(randomPointTopBranch);
        // scene.add(sphere);
        topArray = randomPointTopBranch;
        generateBranchConnectionAB(inbetweenArray, topArray);
      }

      // constructPoints
      // generateBranchConnectionAB()
    }
    else {
      let startPointForPlacing;
      let bottomPointForPlacing;
      fullLengthCount += 1;
      a = sortedInput[i];
      c = tableHeightNr;
      b = 0;

      if (a > c) {
        b = Math.sqrt((a * a) - (c * c));
      } else { b = 0 }

      let center = startingPoints[i];
      randomBPoints = generateRandomBasePoints(center, b, 0);
      const sphereGeometry = new THREE.SphereGeometry(sphereDiameter);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0808088 });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(randomBPoints);
      // scene.add(sphere);
      bottomPointForPlacing = randomBPoints;

      const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const geometry = new THREE.CircleGeometry(b, 32);
      const circle = new THREE.Mesh(geometry, material);
      circle.rotation.x = -Math.PI / 2;
      // circle.position.copy(center);
      circle.position.set(center.x, 0, center.z)

      scene.add(circle);
      let direction = new THREE.Vector3().subVectors(startingPoints[i], randomBPoints);
      let height = direction.length();
      testlength = testlength - height;

      startPointForPlacing = startingPoints[i];
      generateBranchConnectionAB(startPointForPlacing, bottomPointForPlacing);
      // alert(testlength);
    }
  }
  console.log(allVectorsArray);
}

function generateRandomBasePoints(center, radius, height) {

  const theta = Math.random() * Math.PI * 2; // Azimuthal angle
  const phi = Math.acos(2 * Math.random() - 1); // Polar angle
  const x = center.x + radius * Math.sin(phi) * Math.cos(theta);
  const z = center.z + radius * Math.sin(phi) * Math.sin(theta);

  let randomBPoint = new THREE.Vector3(x, height, z);

  randomBPoint.name = "GeneratedPoint" + generateRandomBasePointsCount;
  allVectorsArray.push(randomBPoint);
  generateRandomBasePointsCount++;

  return randomBPoint;

}

// function generateConnectionAB(startingPoints, bottomPoints) {

//   for (let i = 0; i < bottomPoints.length; i++) {
//     const cylinderY = createCylinderBetweenPoints(startingPoints[i], bottomPoints[i], 0.2, 8);
//     scene.add(cylinderY);
//   }



// }

function generateBranchConnectionAB(startingPoints, bottomPoints) {

  const cylinderY = createCylinderBetweenPoints(startingPoints, bottomPoints, cylinderRadius, 8);


  scene.add(cylinderY);
  return (cylinderY);

}

function createCylinderBetweenPoints(startPoint, endPoint, radius, radialSegments) {
  const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
  const directionCounter = new THREE.Vector3().subVectors(startPoint, endPoint);
  const height = direction.length()-3;
  // console.log(height);



  const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
  const cylinderMaterial = new THREE.MeshPhysicalMaterial({ color: 0x00ff00, wireframe: false });



  let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

  // Position the cylinder between the two points
  cylinder.position.copy(startPoint);
  cylinder.position.addScaledVector(direction, 0.5);

  // Align the cylinder to the direction vector
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  // console.log(cylinder);

  cylinder.name = "Cylinder" + cylinderCount;
  cylinderCount++;

  let newVectorA = startPoint.clone();
  let newVectorB = endPoint.clone();

  newVectorA.addScaledVector(direction, anschluss);
  newVectorB.addScaledVector(directionCounter, anschluss);

  let newVectorShortA = new THREE.Vector3().subVectors(newVectorB, startPoint);
  let newVectorShortB = new THREE.Vector3().subVectors(newVectorA, endPoint);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const cylinderGeometryShort = new THREE.CylinderGeometry(radius + 0.1, radius + 0.1, anschluss, radialSegments);
  const cylinderMaterialShort = new THREE.MeshPhysicalMaterial({ color: 0xF90000, wireframe: true });

  let cylinderShortA = new THREE.Mesh(cylinderGeometryShort, cylinderMaterialShort);
  cylinderShortA.position.copy(startPoint);
  cylinderShortA.position.addScaledVector(newVectorShortA.normalize(), anschluss / 2);
  cylinderShortA.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  // scene.add(cylinderShortA);


  //////////////////////////////////////////////////////////


  let cylinderShortB = new THREE.Mesh(cylinderGeometryShort, cylinderMaterialShort);
  cylinderShortB.position.copy(endPoint);
  cylinderShortB.position.addScaledVector(newVectorShortB.normalize(), anschluss / 2);
  cylinderShortB.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), directionCounter.clone().normalize());
  // scene.add(cylinderShortB);

  // createCylinderJoint(direction,startPoint,directionCounter,endPoint);
  cylinderShortA.updateMatrix();
  cylinderShortB.updateMatrix();
  cylinder.updateMatrix();


  let bspA = CSG.fromMesh(cylinderShortA);//knotenanschluss 
  let bspC = CSG.fromMesh(cylinder);//Holzstab


  // Subtract bspB from bspA
  let bspResultA = bspA.subtract(bspC);
  let finalTubexmeshA = CSG.toMesh(bspResultA, cylinderShortA.matrix, cylinderShortA.material);
  // FinalTubexmesh.name = "JointTube" + tubeCounter;
  // tubeCounter++;
  let bspB = CSG.fromMesh(cylinderShortB);//knotenanschluss 


  // Subtract bspB from bspA
  let bspResultB = bspB.subtract(bspC);
  let finalTubexmeshB = CSG.toMesh(bspResultB, cylinderShortB.matrix, cylinderShortB.material);


  scene.add(finalTubexmeshA);
  scene.add(finalTubexmeshB);
  shortCylinderDummy.push(cylinderShortA);
  shortCylinderDummy.push(cylinderShortB);

  shortCylinderArray.push(finalTubexmeshA);
  shortCylinderArray.push(finalTubexmeshB);



  diagonaleCylinder.push(cylinder);
  // sceneObjects.push(cylinder);


  //add text //////////
  fontPromise.then(font => {
    // Create text 1
    createTextGeometry("stick_" + diagonaleCylinder.indexOf(cylinder) + " length: " + cylinder.geometry.parameters.height.toFixed(2) + " cm", font, textParameters).then(textGeometry => {
      var textMesh = new THREE.Mesh(textGeometry, BeamTextmaterial);
      textMesh.position.copy(cylinder.position);
      textgroup.push(textMesh);
      scene.add(textMesh);
    });
  });






  return (cylinder);

}

function allVectorsToSpheres() {

  let allSphereJoint = [];
  for (let i = 0; i < allVectorsArray.length; i++) {
    const sphereGeometry = new THREE.SphereGeometry(sphereDiameter);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x88950509, wireframe: true });
    const sphereJoint = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereJoint.position.copy(allVectorsArray[i]);
    allSphereJoint.push(sphereJoint);
    scene.add(sphereJoint)

  }

  // console.log(allSphereJoint)
  return allSphereJoint;
}

// function checkCollisionAndUnion(sphere, cylinders) {
//   sphere.updateMatrix();
//   let sphereCSG = CSG.fromMesh(sphere);

//   shortCylinderDummy.forEach(cylinder => {
//     cylinder.updateMatrix();
//     let cylinderCSG = CSG.fromMesh(cylinder);

//     let vertices = sphere.geometry.attributes.position.array;
//     for (let vertexIndex = 0; vertexIndex < vertices.length; vertexIndex++) {
//       let localVertex = new THREE.Vector3().fromBufferAttribute(sphere.geometry.attributes.position, vertexIndex).clone();
//       let globalVertex = localVertex.applyMatrix4(sphere.matrix);
//       let directionVector = globalVertex.sub(sphere.position);

//       let ray = new THREE.Raycaster(sphere.position, directionVector.clone().normalize());
//       let collisionResults = ray.intersectObjects(cylinder);
//       if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
//         sphereCSG = sphereCSG.union(cylinderCSG);
//       }
//     }
//   });

//   return sphereCSG;
// }

// function detectCollisionCubes(object1, object2){
//   object1.geometry.computeBoundingBox(); //not needed if its already calculated
//   object2.geometry.computeBoundingBox();
//   object1.updateMatrixWorld();
//   object2.updateMatrixWorld();

//   let materialBox = new THREE.MeshPhysicalMaterial();
//   materialBox.color = new THREE.Color(0x8850D9B2);

//   var box1 = object1.geometry.boundingBox.clone();
//   box1.applyMatrix4(object1.matrixWorld);
//   // box1.material = materialBox;

//   var box2 = object2.geometry.boundingBox.clone();
//   box2.applyMatrix4(object2.matrixWorld);
//     // Create a BoxGeometry with the dimensions of the bounding box
//     var geometry = new THREE.BoxGeometry(box2.max.x - box2.min.x, box2.max.y - box2.min.y, box2.max.z - box2.min.z);
//     var mesh = new THREE.Mesh(geometry, materialBox);

//     // Set the position of the mesh to be the center of the bounding box
//     mesh.position.x = (box2.max.x + box2.min.x) / 2;
//     mesh.position.y = (box2.max.y + box2.min.y) / 2;
//     mesh.position.z = (box2.max.z + box2.min.z) / 2;

//     // scene.add(mesh);

//   return box1.intersectsBox(box2);
// }


//   function detectCollisionRays(object1, object2) {
//     let materialBox = new THREE.MeshPhysicalMaterial();
//     materialBox.color = new THREE.Color(0x8850D9B2);

//     object1.geometry.computeBoundingBox();
//     object2.geometry.computeBoundingBox();

//     // Ensure matrices are updated
//     object1.updateMatrix();
//     object2.updateMatrix();

//     // Apply object's world matrices
//     object1.updateMatrixWorld();
//     object2.updateMatrixWorld();

//     // Get the local bounding boxes
//     var box1 = object1.geometry.boundingBox.clone();
//     var box2 = object2.geometry.boundingBox.clone();

//     // Apply the object's world matrix to the rotated bounding boxes
//     box1.applyMatrix4(object1.matrixWorld);
//     box2.applyMatrix4(object2.matrixWorld);

//       // Create a BoxGeometry with the dimensions of the bounding box
//       var geometry = new THREE.BoxGeometry(box2.max.x - box2.min.x, box2.max.y - box2.min.y, box2.max.z - box2.min.z);
//       var mesh = new THREE.Mesh(geometry, materialBox);

//       // Set the position of the mesh to be the center of the bounding box
//       mesh.position.x = (box2.max.x + box2.min.x) / 2;
//       mesh.position.y = (box2.max.y + box2.min.y) / 2;
//       mesh.position.z = (box2.max.z + box2.min.z) / 2;

//       // scene.add(mesh);

//     return box1.intersectsBox(box2);
//     // // Create a raycaster
//     // var raycaster = new THREE.Raycaster();

//     // // Create points on the surface of the first cylinder
//     // var points = [];
//     // for (var y = 0; y < Math.PI * 2; y += 0.1) {
//     //     for (var x = 0; x < Math.PI * 2; x += 0.1) {
//     //         var point = new THREE.Vector3();
//     //         point.x = cylinder1.geometry.parameters.radiusTop * Math.cos(x);
//     //         point.y = y;
//     //         point.z = cylinder1.geometry.parameters.radiusTop * Math.sin(x);
//     //         points.push(point);
//     //     }
//     // }

//     // // Check each point
//     // for (var i = 0; i < points.length; i++) {
//     //     // Update the raycaster to originate from the current point and point towards the other cylinder
//     //     raycaster.set(cylinder1.position, points[i].clone().sub(cylinder1.position).normalize());

//     //     // Check if the ray intersects the other cylinder
//     //     var intersects = raycaster.intersectObject(cylinder2);

//     //     // If there is an intersection, return true
//     //     if (intersects.length > 0) {
//     //         return true;
//     //     }
//     // }

//     // // If no intersections were found, return false
//     // return false;
// }
function detectCollisionCubes(object1, object2) {

  // Backup the original world matrices
  var originalMatrix1 = object1.matrixWorld.clone();
  var originalMatrix2 = object2.matrixWorld.clone();

  // Update the world matrices to apply rotation only
  object1.updateMatrix();
  object1.updateMatrixWorld(true);
  object2.updateMatrix();
  object2.updateMatrixWorld(true);

  // Compute bounding boxes
  object1.geometry.computeBoundingBox();
  object2.geometry.computeBoundingBox();

  // Clone the bounding boxes
  var box1 = object1.geometry.boundingBox.clone();
  var box2 = object2.geometry.boundingBox.clone();

  // Apply world matrices (with rotation only) to the bounding boxes
  box1.applyMatrix4(object1.matrixWorld);
  box2.applyMatrix4(object2.matrixWorld);

  // Restore original world matrices
  object1.matrixWorld.copy(originalMatrix1);
  object2.matrixWorld.copy(originalMatrix2);


  // Set the position of the mesh to be the center of the bounding box

  // Check for intersection
  return box1.intersectsBox(box2);
}
function UnionJoints(allcylindermitLoch) {

  let allsphere = allVectorsToSpheres()
  let collision = false;

  for (let i = 0; i < allsphere.length; i++) {
    for (let j = 0; j < allcylindermitLoch.length; j++) {

      collision = detectCollisionCubes(allsphere[i], allcylindermitLoch[j]);
      if (collision) {
        allsphere[i].updateMatrix();
        shortCylinderArray[j].updateMatrix();
        var bspSphere = CSG.fromMesh(allsphere[i]);
        var bspCylinder = CSG.fromMesh(shortCylinderArray[j]);

        var sphereAndShortCylinder = bspSphere.union(bspCylinder);

        const material = new THREE.MeshPhysicalMaterial();
        material.color = new THREE.Color("#69f");

        var joint = CSG.toMesh(sphereAndShortCylinder, allsphere[i].matrix, material);

        console.log(joint);
        exportGeometry.push(joint);
        scene.add(joint);

      }
    }
    //add text //////////




    fontPromise.then(font => {
      // Create text 1
      createTextGeometry("Joint_" + allsphere.indexOf(allsphere[i]), font, textParameters).then(textGeometry => {
        var textMesh = new THREE.Mesh(textGeometry, Textmaterial);



        textMesh.position.copy(allsphere[i].position);





        textgroup.push(textMesh);
        scene.add(textMesh);
      });
    });





  }
}

function createDiagonalConnections(remainingParts, allVectorsArray) {


  // do {

  let vectorsForDiagonal = [...allVectorsArray];
  let remainingPartsLokal = [...remainingParts];
  let usedParts = [];
  let unUsedParts = [];
  let collisionCheck1 = false;
  let testCylinder1;

  let remainingLength = 0
  for (let i = 0; i < remainingPartsLokal.length; i++) {

    remainingLength += remainingPartsLokal[i] + 1;

  }
  for (let i = 0; i < vectorsForDiagonal.length; i++) {
    shuffleArray(vectorsForDiagonal);

    let diagonalStartingPointArray = vectorsForDiagonal.splice(0, 1);
    let diagonalStartingPoint = diagonalStartingPointArray[0]

    let potentialEndPoints = filterVectorsByY(diagonalStartingPoint, vectorsForDiagonal);



    shuffleArray(potentialEndPoints)
    let endVector = potentialEndPoints[1]

    testCylinder1 = generateBranchConnectionAB(diagonalStartingPoint, endVector);

    console.log(testCylinder1);

    for (let j = 0; j < diagonaleCylinder.length; j++) {

      collisionCheck1 = detectCollisionCubes(testCylinder1, diagonaleCylinder[j])
      console.log(collisionCheck1)
      //     // alert("erstmal Pause")
      if (collisionCheck1) {

        const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        testCylinder1.removeFromParent();
        testCylinder1.material = redMaterial;
        scene.add(testCylinder1);
        // testCylinder1.geometry.dispose();
        // console.log(testCylinder1);
        // alert("schaum mal console")

        
        break;

      }

    }
    // for(let i = 0; i < potentialEndPoints.length;i++)
    // {


    let distance = diagonalStartingPoint.distanceTo(endVector);

    if (remainingLength > distance) {


      const { resultArray, remainingValues } = optimalLength(remainingPartsLokal, distance);
      remainingParts = remainingValues;
      
      generateBranchConnectionAlongLineAB(resultArray, diagonalStartingPoint, endVector, distance);

      if (!collisionCheck1) {

        // collisionCheck1 = 
        generateBranchConnectionAlongLineAB(resultArray, diagonalStartingPoint, endVector, distance);

        // if(!collisionCheck1){
        //   //  generateBranchConnectionAlongLineAB
        //   //  break;

        //   }// generateBranchConnectionAB(diagonalStartingPoint,endVector)

      } else {

        // alert("Diagonale nicht Moglich");
        if (collisionCheck1) {

          const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

          testCylinder1.removeFromParent();
          testCylinder1.material = redMaterial;
          scene.add(testCylinder1);
          // testCylinder1.geometry.dispose();
          // console.log(scene);
          // alert("schaum mal console")
  
          
          break;
  
        }
        // cantCreateCount++;

      }

    }


    // if (collisionCheck1){
    //      break
    // }
  }



  // }
  // } while (cantCreateLimit < cantCreateCount );
  // && remainingParts.length < 0

}
///////////////////////////////////////////////////////////////////////////////////////


// Create Grid

function addMaterialToLibrary() {
  barLengths.push(parameters.length);
  barDiameters.push(parameters.diameter);
  parameters.bar = parameters.length + " x " + parameters.diameter;
  let controller1;
  controller1 = libraryFolder.add(parameters, "bar");
  controller1.disable();
}


function createGrid() {
  scene.add(new THREE.GridHelper(100, 100, 0xd3d3d3, 0xd3d3d3));
  scene.add(new THREE.GridHelper(100, 10, 0x151515, 0x151515));
}

//BOARDS
function createBoard() {
  const geometry = new THREE.BoxGeometry(40, 2, 40);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color("#69f");

  const board = new THREE.Mesh(geometry, material);
  board.position.set(0, 1, 0);
  board.name = "board " + boardCounter;
  boardCounter++;
  sceneObjects.push(board);

  scene.add(board);
  group.add(board);
  animate();
}

//BEAMS
function createBeam() {
  const geometry = new THREE.BoxGeometry(40, 2, 2);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color("#69f");

  const beam = new THREE.Mesh(geometry, material);
  beam.position.set(0, 1, 0);
  beam.name = "beam " + beamCounter;
  beamCounter++;
  sceneObjects.push(beam);

  scene.add(beam);
  group.add(beam);
  animate();
}

//BARS
function createBar() {
  const geometry = new THREE.CylinderGeometry(1, 1, 40, 32);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color("#69f");

  const bar = new THREE.Mesh(geometry, material);
  bar.position.set(0, 1, 0);
  bar.rotation.set(90 * (Math.PI / 180), 0, 90 * (Math.PI / 180));
  bar.name = "bar " + beamCounter;
  barCounter++;
  sceneObjects.push(bar);

  scene.add(bar);
  group.add(bar);
  animate();
}

//JOINT SUBDIVISION
//Joint
function createJoint() {
  /* for (let i = 0; i < 3; i++) {
    const geometry = new THREE.CylinderGeometry(2, 2, 20, 32);
    const material = new THREE.MeshPhysicalMaterial();
    material.color = new THREE.Color("#69f");

    const joint = new THREE.Mesh(geometry, material);
    if (i == 0) {
      joint.position.set(10, 2, 0);
      joint.rotation.set(90 * (Math.PI / 180), 0, 90 * (Math.PI / 180));
    }
    if (i == 1) {
      joint.position.set(0, 12, 0);
    }
    if (i == 2) {
      joint.position.set(0, 2, 10);
      joint.rotation.x = 90 * (Math.PI / 180);
    }
    joint.name = "joint " + jointCounter;
    jointCounter++;
    sceneObjects.push(joint);

    scene.add(joint);
    group.add(joint);
    animate();
  }

  let bspA = CSG.fromMesh(joint);
  let bspB = CSG.fromMesh(joint2);

  let bspC = bspA.union(bspB);

  let finalJointMesh = CSG.toMesh(bspC, joint1.matrix, joint1.material);*/

  const tubegeometry = new THREE.CylinderGeometry(2, 2, 20, 32);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color("#69f");

  const Base = new THREE.Mesh(tubegeometry, material);
  Base.position.set(0, 12, 0);
  Base.name = "joint " + jointCounter;
  jointCounter++;

  const tube2Geometry = new THREE.CylinderGeometry(2, 2, 20, 32);
  const cone = new THREE.Mesh(tube2Geometry, material);
  cone.position.set(10, 2, 0);
  cone.rotation.z = 90 * (Math.PI / 180);
  cone.name = "joint " + jointCounter;
  jointCounter++;

  const tube3Geometry = new THREE.CylinderGeometry(2, 2, 20, 32);
  const spacer = new THREE.Mesh(tube3Geometry, material);
  spacer.position.set(0, 2, 10);
  spacer.rotation.x = 90 * (Math.PI / 180);
  spacer.name = "joint " + jointCounter;
  jointCounter++;

  Base.updateMatrix();
  cone.updateMatrix();
  spacer.updateMatrix();

  let bspA = CSG.fromMesh(Base);
  let bspB = CSG.fromMesh(cone);
  let bspC = CSG.fromMesh(spacer);

  bspA = bspA.union(bspB);
  bspA = bspA.union(bspC);

  let FinalJoint = CSG.toMesh(bspA, Base.matrix, Base.material);

  const geometry = LoopSubdivision.modify(
    FinalJoint.geometry,
    iterations,
    params
  );
  let finalJointmesh = new THREE.Mesh(geometry, material);
  sceneObjects.push(finalJointmesh);
  group.add(finalJointmesh);
  scene.add(finalJointmesh);

  animate();
}


//Remove 3D Objects and clean the caches
function removeObject(sceneObject) {

  if (!(sceneObject instanceof THREE.Object3D)) return;

  //Remove the geometry to free GPU resources
  if (sceneObject.geometry) sceneObject.geometry.dispose();

  //Remove the material to free GPU resources
  if (sceneObject.material) {
    if (sceneObject.material instanceof Array) {
      sceneObject.material.forEach((material) => material.dispose());
    } else {
      sceneObject.material.dispose();
    }
  }

  //Remove object from scene
  sceneObject.removeFromParent();
}

//RESPONSIVE
function handleResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.render(scene, camera);



}

//RAYCAST
function onPointerMove(event) {
  if (selectedObject) {
    if (selectedObject !== transformedObject) {
      selectedObject.material.color.set("#69f");
    }
    selectedObject = null;
  }

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(group, true);

  if (intersects.length > 0) {
    const res = intersects.filter(function (res) {
      return res && res.object;
    })[0];

    if (res && res.object) {
      selectedObject = res.object;
      if (selectedObject !== transformedObject) {
        selectedObject.material.color.set("#f00");
      }
    }
  }
}

//CLICK
function onClick() {
  if (selectedObject) {
    transformedObject = selectedObject;
    transformedObject.material.color.set("#ff0");
    parameters.width = transformedObject.geometry.parameters.width;
    parameters.height = transformedObject.geometry.parameters.height;
    parameters.depth = transformedObject.geometry.parameters.depth;
    widthController.updateDisplay();
    heightController.updateDisplay();
    depthController.updateDisplay();
    control.attach(transformedObject);
    scene.add(control);
  } else if (transformedObject) {
    deselectTransformedObject();
  }
}

//KEY PRESSED
function onKey() {
  if (event.key === "Escape") {
    deselectTransformedObject();
  }
  if (event.key === "Backspace") {
    deleteTransformedObject();
  }
  if (event.key === "Shift") {
    control.setRotationSnap(THREE.MathUtils.degToRad(15));
    control.setTranslationSnap(10);
  }
}

//KEY RELEASED
function upKey() {
  if (event.key === "Shift") {
    control.setRotationSnap(false);
    control.setTranslationSnap(1);
  }
}

function deleteTransformedObject() {
  removeObject(transformedObject);
  widthController.setValue(null);
  heightController.setValue(null);
  depthController.setValue(null);
  scene.remove(control);
}

function deselectTransformedObject() {
  transformedObject.material.color.set("#69f");
  transformedObject = null;
  widthController.setValue(null);
  heightController.setValue(null);
  depthController.setValue(null);
  scene.remove(control);
}

function moveMode() {
  control.setMode("translate");
}

function rotateMode() {
  control.setMode("rotate");
}

function exportScene() {
  //Started Troubleshooting Alignment

  /*const quaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(-Math.PI / 2, 0, 0)
  );
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.applyQuaternion(quaternion);
    }
  });
  */
  const download = exporter.parse(scene, exporterOptions);
  const blob = new Blob([download], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = parameters.fileName + ".stl";
  link.click();
  return;
}

// function addMaterialToLibrary() { }

//ANIMATE AND RENDER
function animate() {
  requestAnimationFrame(animate);

  orbit.update();

  for (var i = 0; i < textgroup.length; i++) {
    if (textgroup[i] !== undefined) {
      textgroup[i].lookAt(camera.position);
      textgroup[i].visible = showText;
    }
  }

  renderer.render(scene, camera);
}
//-----------------------------------------------------------------------------------
// EXECUTE MAIN
//-----------------------------------------------------------------------------------


main();
