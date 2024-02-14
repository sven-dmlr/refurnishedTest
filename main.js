//IMPORT MODULES
import "./style.css";
import * as THREE from "/node_modules/three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import GUI from "lil-gui";
import { LoopSubdivision } from "./LoopSubdivision.js";
import { CSG } from "./THREE-CSGMesh/dist/client/CSGMesh.js";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OBB } from 'three/addons/math/OBB.js';

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

var thicknessController;
var elevationController;


//-- All variables for the Part list
var radiusController, partLengthController;
var initialPartID = 0;
var initialPartList = [];
let notCollidingObjectsUnsorted = [];

//-- All variables for Support Structure
var supportCount;

//-- Unknown to me
var libraryFolder;

//-- Global Scope Varibables

let allVectorsArray = [];

//-- Paar Variablen für die Tests
let cylinderRadius = 1;
let shortCylinderDummy = [];
let shortCylinderArray = [];
let anschluss = 8;
let generateRandomBasePointsCount = 0;
let diagonaleCylinder = [];

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
let sphereDiameter = 2;
let exportGeometry = [];

//-- GUI PARAMETER

const parameters = {

  ///INPUTS For Part
  partLength: 0,
  radius: 0,
  Add() {
    addMaterialToLibrary(parameters.partLength, (parameters.radius), initialPartID);
  },

  ///INPUTS For Board
  width: 100,
  depth: 100,
  thickness: 5,
  Board() {
    createBoard();
  },


  ///Inputs Algorythm
  elevation: 50,
  supportCount: 3,
  Generate() {

    generatorStarting()

  },


  ///Export
  fileName: "exported_Model",
  export() {
    exportScene();
  },


  ///Testing
  move() {
    moveMode();
  },
  rotate() {
    rotateMode();
  },



  /// Spare Parts
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
logoEmbed.src = "./public/assets/logo.svg";
logoEmbed.style.position = "absolute";
logoEmbed.style.top = "calc(5% - 0px)";
logoEmbed.style.left = "calc(5% - 0px)";
logoEmbed.style.width = "50px";
logoEmbed.style.height = "auto";
landingPage.appendChild(logoEmbed);

window.onload = function () {
  const loudingscreeen = document.createElement("div");
  loudingscreeen.id = "loudingscreeen";
  loudingscreeen.style.position = "absolute";
  loudingscreeen.style.top = "0";
  loudingscreeen.style.left = "0";
  loudingscreeen.style.right = "0";
  loudingscreeen.style.bottom = "0";
  loudingscreeen.style.display = "flex";
  loudingscreeen.style.flexDirection = "column";
  loudingscreeen.style.alignItems = "center";
  loudingscreeen.style.justifyContent = "center";
  loudingscreeen.style.textAlign = "center";
  loudingscreeen.style.color = "#333";
  loudingscreeen.style.width = "100px";
  loudingscreeen.style.height = "100px";


  loudingscreeen.style.backgroundColor = "red";

  var reloadFlag = localStorage.getItem('reloadFlag');
  if (reloadFlag === 'true') {
    const loadingscreen = document.createElement("div");


    console.log('Page reloaded, performing action...');
    showProject();

    generatorStarting()

    // Clear the flag in local storage
    localStorage.removeItem('reloadFlag');
  }
};



const logoICD = document.createElement("embed");
logoICD.src = "./public/assets/ICD-LOGO.png";
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

const logoManual = document.createElement("embed");
logoManual.src = "./public/assets/manual v2.svg";
logoManual.style.position = "center";
logoManual.style.top = "calc(18% - 0px)";
logoManual.style.left = "calc(23.5% - 0px)";
logoManual.style.width = "900px";
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


// Add a Manual Button
const manualButton = document.createElement("button");
manualButton.id = "manual-button";
manualButton.innerText = "manual";
manualButton.style.padding = "15px 30px";
manualButton.style.fontSize = "18px";
manualButton.style.cursor = "pointer";
manualButton.style.backgroundColor = "#666666";
manualButton.style.color = "white";
manualButton.style.border = "none";
manualButton.style.borderRadius = "5px";
manualButton.style.position = "absolute";
manualButton.style.bottom = "20px";
manualButton.style.left = "20px";
manualButton.style.fontFamily = "Montserrat, sans-serif";
manualButton.onclick = function (event) {
  event.preventDefault();
  toggleManual();
}
threejsContainer.appendChild(manualButton);

const manualDiv = document.createElement("div");
manualDiv.id = "manual-div";
manualDiv.style.display = "none";
manualDiv.style.position = "absolute";
manualDiv.style.top = "calc(13% - 0px)";
manualDiv.style.left = "calc(13% - 0px)";
manualDiv.style.width = "70%";
manualDiv.style.height = "75%";
manualDiv.style.backgroundColor = "white";
manualDiv.innerHTML = "<img src='./public/assets/manual v2.svg' style='width: 90%; height: auto;' />";
threejsContainer.appendChild(manualDiv);

let manualVisible = false;

function toggleManual() {
  if (manualVisible) {
    manualDiv.style.display = "none";
  } else {
    manualDiv.style.display = "block";
  }
  manualVisible = !manualVisible;
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////77
///All things for Creating the Text in the Scene
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
  size: 2,
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

  //Add Parts
  const addObjectFolder = gui.addFolder("Add Parts");
  partLengthController = addObjectFolder.add(parameters, "partLength");
  radiusController = addObjectFolder.add(parameters, "radius");
  addObjectFolder.add(parameters, "Add");


  //Spare Part List
  libraryFolder = gui.addFolder("Spare parts library");
  //ADD DELET BUTTON

  //ADD Board
  const boardFolder = gui.addFolder("Set Board");
  widthController = boardFolder.add(parameters, "width");
  depthController = boardFolder.add(parameters, "depth");
  thicknessController = boardFolder.add(parameters, "thickness");
  boardFolder.add(parameters, "Board");
  //Generator Settings
  const generatorSettings = gui.addFolder("Generator Settings");
  elevationController = generatorSettings.add(parameters, "elevation", 0, 200, 1);
  supportCount = generatorSettings.add(parameters, "supportCount", [3, 4, 5, 6, 7, 8, 9, 10]);/// ADD more Support Options

  gui.add(parameters, "Generate");

  //Add Export
  const exportFolder = gui.addFolder("Export");
  exportFolder.add(parameters, "fileName");
  exportFolder.add(parameters, "export");

  //Add Library

  gui.add({ ShowText: showText }, 'ShowText').onChange((value) => {
    showText = value;
    toggleTextGroupVisibility();
  });


  function toggleTextGroupVisibility() {
    textgroup.forEach((object) => {
      object.visible = showText;
    });
  }


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

  control = new TransformControls(camera, renderer.domElement);
  //Die folgende Zeile lässt iwie alles ruckeln???

  //control.addEventListener("change", animate);

  control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });
  control.setMode("translate");
  control.setTranslationSnap(1);
  control.setSize(1.2);


  //EXECUTE THE UPDATE
  animate();
}

//-----------------------------------------------------------------------------------
//HELPER FUNCTIONS




function generatorStarting() {
  
  console.log(scene);
  legCountNr = parameters.supportCount;
  tableHeightNr = parameters.elevation;
  partList = initialPartList;
  // [60, 60, 60, 60, 60, 60, 60];

  let testInputSorted = partList.sort((a, b) => a - b);

  possible = testForPosibility(testInputSorted);

  if (possible) {
    if (diagonaleCylinder.length != 0) {
      // Set a flag in local storage before reloading
      localStorage.setItem('reloadFlag', 'true');

      window.location.reload();


      return;
    }



    createSurface(legCountNr);

    placePointsBottom(startingPoints);

    for (let i = 0; i < 11; i++) {

      // console.log(remainingParts);

      createDiagonalConnections(allVectorsArray);

    }

  } else { alert("Da musst du nochmal in die Kiste schauen. Zu wenig Teile") }
  console.log(allVectorsArray);
  console.log(diagonaleCylinder);
  console.log(scene);
  UnionJoints(shortCylinderDummy);
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



  if (collisionCheck) {

    console.log(usedParts);

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



//-----------------------------------------------------------------------------------


//Testing and Pre Sorting
function testForPosibility(testInput) {

  let totalLengthCalculated = testInput.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  let shortUsedList = [];
  let filterInputHigh = [];
  let filterInputHighFlat = [];


  if (totalLengthCalculated > (tableHeightNr * legCountNr)) {
    // alert("geht");
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


//For generating Points along the edge of the top plate
function createSurface(divisions) {


  const upperSurfaceGeometry = new THREE.PlaneGeometry(parameters.width, parameters.depth,);
  const upperSurfaceMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, wireframe: false });
  const upperSurface = new THREE.Mesh(upperSurfaceGeometry, upperSurfaceMaterial);
  upperSurface.position.set(0, tableHeightNr, 0);
  upperSurface.rotation.x = -Math.PI / 2;
  // scene.add(upperSurface);

  distributePointsOnPlaneGeometry(upperSurface, divisions);

}

function distributePointsOnPlaneGeometry(planeGeometry, numPoints) {

  console.log(planeGeometry);
  let points = [];
  let width = planeGeometry.geometry.parameters.width;
  let height = planeGeometry.geometry.parameters.height;
  let perimeter = 2 * (width + height);
  let distanceBetweenPoints = perimeter / numPoints;

  for (let i = 0; i < numPoints; i++) {
    let distanceAlongEdge = i * distanceBetweenPoints;
    let point = new THREE.Vector3();

    if (distanceAlongEdge <= width) {
      // Top edge
      point.x = distanceAlongEdge - width / 2;
      point.z = height / 2;
      point.y = tableHeightNr;
    } else if (distanceAlongEdge <= width + height) {
      // Right edge
      point.x = width / 2;
      point.z = height / 2 - (distanceAlongEdge - width);
      point.y = tableHeightNr;
    } else if (distanceAlongEdge <= 2 * width + height) {
      // Bottom edge
      point.x = width / 2 - (distanceAlongEdge - width - height);
      point.z = -height / 2;
      point.y = tableHeightNr;
    } else {
      // Left edge
      point.x = -width / 2;
      point.z = -height / 2 + (distanceAlongEdge - 2 * width - height);
      point.y = tableHeightNr;
    }



    const sphereGeometry = new THREE.SphereGeometry(sphereDiameter);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x8888888 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    startingPoints.push(point);

    point.name = "GeneratedPoint" + generateRandomBasePointsCount;
    allVectorsArray.push(point);
    generateRandomBasePointsCount++;

    sphere.position.copy(point);

    // scene.add(sphere)
  }

  return points;
}


//For generating first connections to the bottom
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

      // scene.add(circle);
      let direction = new THREE.Vector3().subVectors(startingPoints[i], randomBPoints);
      let height = direction.length();
      testlength = testlength - height;

      startPointForPlacing = startingPoints[i];
      generateBranchConnectionAB(startPointForPlacing, bottomPointForPlacing);
      // alert(testlength);
    }
  }
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


//For generating Cylinders
function generateBranchConnectionAB(startingPoints, bottomPoints) {

  const cylinderY = createCylinderBetweenPoints(startingPoints, bottomPoints, cylinderRadius, 32);


  scene.add(cylinderY);



}

function createCylinderBetweenPoints(startPoint, endPoint, radius, radialSegments) {

  const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
  const directionCounter = new THREE.Vector3().subVectors(startPoint, endPoint);
  const height = direction.length();
  // console.log(height);



  const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
  const cylinderMaterial = new THREE.MeshPhysicalMaterial({ color: 0xFFE400, wireframe: false });



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

  newVectorA.addScaledVector(directionCounter, anschluss);
  newVectorB.addScaledVector(direction, anschluss);

  let newVectorShortA = new THREE.Vector3().subVectors(newVectorB, startPoint);
  let newVectorShortB = new THREE.Vector3().subVectors(newVectorA, endPoint);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const cylinderGeometryShort = new THREE.CylinderGeometry(radius + 0.1, radius + 0.1, anschluss, radialSegments);
  const cylinderMaterialShort = new THREE.MeshPhysicalMaterial({ color: 0xF90000, wireframe: false });

  let cylinderShortA = new THREE.Mesh(cylinderGeometryShort, cylinderMaterialShort);
  cylinderShortA.position.copy(startPoint);
  cylinderShortA.position.addScaledVector(newVectorShortA.normalize(), anschluss / 2);
  cylinderShortA.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), directionCounter.clone().normalize());
  // scene.add(cylinderShortA);


  //////////////////////////////////////////////////////////


  let cylinderShortB = new THREE.Mesh(cylinderGeometryShort, cylinderMaterialShort);
  cylinderShortB.position.copy(endPoint);
  cylinderShortB.position.addScaledVector(newVectorShortB.normalize(), anschluss / 2);
  cylinderShortB.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
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


  // scene.add(finalTubexmeshA);
  // scene.add(finalTubexmeshB);
  shortCylinderDummy.push(cylinderShortA);
  shortCylinderDummy.push(cylinderShortB);

  shortCylinderArray.push(finalTubexmeshA);
  shortCylinderArray.push(finalTubexmeshB);

  ///

  diagonaleCylinder.push(cylinder);
  // sceneObjects.push(cylinder);
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


//All vectors to spheres
function allVectorsToSpheres() {

  let allSphereJoint = [];
  for (let i = 0; i < allVectorsArray.length; i++) {
    const sphereGeometry = new THREE.SphereGeometry(sphereDiameter);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x88950509, wireframe: true });
    const sphereJoint = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereJoint.position.copy(allVectorsArray[i]);
    allSphereJoint.push(sphereJoint);
    // scene.add(sphereJoint)

  }

  // console.log(allSphereJoint)
  return allSphereJoint;
}


function detectCollisionCubes(object1, object2) {
  object1.geometry.computeBoundingBox(); //not needed if its already calculated
  object2.geometry.computeBoundingBox();
  object1.updateMatrixWorld();
  object2.updateMatrixWorld();

  var box1 = object1.geometry.boundingBox.clone();
  box1.applyMatrix4(object1.matrixWorld);

  var box2 = object2.geometry.boundingBox.clone();
  box2.applyMatrix4(object2.matrixWorld);

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

        scene.add(joint);
        exportGeometry.push(joint);

        console.log(exportGeometry)


      }
    }

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

function createDiagonalConnections(allVectorsArray) {


  // do {

  let vectorsForDiagonal = [...allVectorsArray];
  let remainingPartsLokal = [...remainingParts];
  let usedParts = [];
  let unUsedParts = [];
  let collisionCheck1 = false;

  let remainingLength = 0
  for (let i = 0; i < remainingPartsLokal.length; i++) {

    remainingLength += remainingPartsLokal[i] + 1;

  }

  shuffleArray(vectorsForDiagonal);

  let diagonalStartingPointArray = vectorsForDiagonal.splice(0, 1);
  let diagonalStartingPoint = diagonalStartingPointArray[0]

  let potentialEndPoints = filterVectorsByY(diagonalStartingPoint, vectorsForDiagonal);
  shuffleArray(potentialEndPoints)

  // for(let i = 0; i < potentialEndPoints.length;i++)
  // {

  let endVector = potentialEndPoints[1]
  let distance = diagonalStartingPoint.distanceTo(endVector);

  if (remainingLength > distance) {


    const { resultArray, remainingValues } = optimalLength(remainingPartsLokal, distance);
    console.log("HALLOS")
    console.log(remainingValues)
    remainingParts = remainingValues;

    if (resultArray.length !== 0) {

      // collisionCheck1 = 
      generateBranchConnectionAlongLineAB(resultArray, diagonalStartingPoint, endVector, distance);

      // if(!collisionCheck1){
      //   //  generateBranchConnectionAlongLineAB
      //   //  break;

      //   }// generateBranchConnectionAB(diagonalStartingPoint,endVector)

    } else {

      // alert("Diagonale nicht Moglich");

      cantCreateCount++;

    }

  }


  // }
  // } while (cantCreateLimit < cantCreateCount );
  // && remainingParts.length < 0

}


function addMaterialToLibrary(partLength, radius, id) {
  //// CREATING UNIQUE PARTS WITH 
  if (partLength == 0 || radius == 0) {

    console.error("ERROR PART NOT DEFINED")
  } else {
    const part = {

      partLength: partLength,
      radius: radius,
      id: id,

    }

    initialPartList.push(part.partLength);
    initialPartID++;
    /// VERSTEH ICH NICHT GANZ
    parameters.bar = partLength + " x " + radius;
    let controller1;
    controller1 = libraryFolder.add(parameters, "bar");
    controller1.disable();
    console.log(initialPartList);
  }

}


function createGrid() {
  scene.add(new THREE.GridHelper(100, 100, 0xd3d3d3, 0xd3d3d3));
  scene.add(new THREE.GridHelper(100, 10, 0x151515, 0x151515));
}

//BOARDS
function createBoard() {

  const boardWidth = parameters.width;
  const boardThickness = parameters.thickness;
  const boardDepth = parameters.depth;

  const boardElevation = parameters.elevation + (0.5 * boardThickness);

  const geometry = new THREE.BoxGeometry(boardWidth, boardThickness, boardDepth);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color("#ff0");

  const board = new THREE.Mesh(geometry, material);
  board.position.set(0, boardElevation, 0);
  board.name = "board " + boardCounter;
  boardCounter++;
  sceneObjects.push(board);

  scene.add(board);
  group.add(board);
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
    // heightController.updateDisplay();
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
  for (let i = 0; i < 10; i++) {
    const download = exporter.parse(exportGeometry[i], exporterOptions);
    const blob = new Blob([download], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = parameters.fileName + " " + i + ".stl";
    link.click();
  }
  const download = exporter.parse(scene, exporterOptions);
  const blob = new Blob([download], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = parameters.fileName + " overview" + ".stl";
  link.click();
  showText = false;
}

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
