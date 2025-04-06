let squareCounter = 0;

let hueData = {};

const MAX_X_MM = 50;
const MAX_Y_MM = 50;
const SCALE_MULTIPLIER = 4; // Increase this value to make AxiDraw drawings larger

const axi = new axidraw.AxiDraw();
axi.setSpeed(40);
let connected = false;
let lastSquare = null; // Initialize lastSquare

// Fetch data for how many times a hue was seen
fetch("/hues.json")
  .then((response) => response.json())
  .then((data) => {
    hueData = data.hues;
    console.log(hueData); // Now hueData will hold the data from hueData.json
  })
  .catch((error) => {
    console.error("Error loading hue data:", error);
  });

// Connect to axidraw
function mouseClicked() {
  loop();

  if (!connected) {
    axi.connect().then(() => {
      connected = true;
    });
    return;
  }
}

function mmToPx(mmPos) {
  return createVector(
    constrain(map(mmPos.x, 0, MAX_X_MM, 0, width), 0, width),
    constrain(map(mmPos.y, 0, MAX_Y_MM, 0, height), 0, height)
  );
}

function pxToMm(pxPos) {
  return createVector(
    map(pxPos.x, 0, width, 0, MAX_X_MM * SCALE_MULTIPLIER),
    map(pxPos.y, 0, height, 0, MAX_Y_MM * SCALE_MULTIPLIER)
  );
}

function setup() {
  let width = 500;
  let height = 700;
  let canvas = createCanvas(width, height);
  canvas.parent("canvas-container");
  colorMode(HSL);
  noLoop();
}

let rectangles = 3;
let startHue = 20;
let hueRange = 140;

function draw() {
  background(0, 255, 0, 0);

  for (let i = 0; i < rectangles; i++) {
    let hue = startHue + (hueRange / rectangles) * i;
    fill(hue % 360, 100, 50, 0);
    noStroke();
    rect(0, (height / rectangles) * i, width, height / rectangles);
  }
}

function PrintSquare() {
  if (squareCounter < 100) {
    // For randomly generated hsl values
    let h = Math.floor(Math.random() * (150 - 20 + 1)) + 20;
    let s = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
    let l = Math.floor(Math.random() * (60 - 40 + 1)) + 40;

    // Get hue count from hueData (ensure hueData[h] is not undefined)
    let hueCount = hueData[h] || 0; // Default to 0 if undefined

    // Print data to screen
    DataToScreen(h, hueCount, s, l);

    // Set the size of the square based on hue count
    let size = hueCount / 8;

    // Placing square based on hue
    // Determine the column index for the hue range
    let columnIndex = Math.floor((h - startHue) / (hueRange / 6));
    let sectionHeight = height / rectangles;
    let x = Math.random() * width;
    let y = sectionHeight * columnIndex + Math.random() * sectionHeight;

    if (
      x - size / 2 >= 0 &&
      x + size / 2 <= width &&
      y - size / 2 >= 0 &&
      y + size / 2 <= height
    ) {
      fill(h, s, l, 1);
      stroke(1);
      rectMode(CENTER);
      rect(x, y, size, size);

      lastSquare = { x, y, size };

      squareCounter++;

      if (connected) {
        drawShapeOnAxiDraw(lastSquare.x, lastSquare.y, lastSquare.size);
      }

      if (squareCounter == 100) {
        console.log("Squares reached");
      }
    }
  }
}

// Call PrintSquare at the desired interval
setInterval(PrintSquare, 200);
// if (connected) {
//   setInterval(PrintSquare, 500);
// }

function drawShapeOnAxiDraw(x, y, size) {
  if (!connected) {
    console.error("AxiDraw is not connected.");
    return;
  }

  // Convert the rectangle's center position and size from pixels to millimeters
  const shapeCenterMm = pxToMm(createVector(x, y));
  const sizeMm = size * (MAX_X_MM / width) * SCALE_MULTIPLIER; // Map size proportionally to the AxiDraw area

  // Calculate the corners of the square in millimeters
  const halfSizeMm = sizeMm / 2;
  const corners = [
    createVector(-halfSizeMm, -halfSizeMm),
    createVector(halfSizeMm, -halfSizeMm),
    createVector(halfSizeMm, halfSizeMm),
    createVector(-halfSizeMm, halfSizeMm),
  ];

  // Draw the square on the AxiDraw
  axi
    .penUp()
    .then(() =>
      axi.moveTo(corners[0].x + shapeCenterMm.x, corners[0].y + shapeCenterMm.y)
    )
    .then(() => axi.penDown())
    .then(() =>
      axi.moveTo(corners[1].x + shapeCenterMm.x, corners[1].y + shapeCenterMm.y)
    )
    .then(() =>
      axi.moveTo(corners[2].x + shapeCenterMm.x, corners[2].y + shapeCenterMm.y)
    )
    .then(() =>
      axi.moveTo(corners[3].x + shapeCenterMm.x, corners[3].y + shapeCenterMm.y)
    )
    .then(() =>
      axi.moveTo(corners[0].x + shapeCenterMm.x, corners[0].y + shapeCenterMm.y)
    ) // Close the square
    .then(() => axi.penUp())
    .catch((err) => {
      console.error("Error during drawing:", err);
    });
}

function DataToScreen(hue, hueTimes, saturation, lightness) {
  // Add to data to screen
  let outputHueCount = document.querySelector(".one");
  let outputHue = document.querySelector(".two");
  const newParagraphSeen = document.createElement("p");
  const newParagraphHue = document.createElement("p");
  if (isNaN(hue)) {
    newParagraphSeen.textContent = ``;
    newParagraphHue.textContent = ``;
  } else {
    newParagraphSeen.textContent = `Hue ${hue} seen: ${hueTimes} times`;
    outputHueCount.appendChild(newParagraphSeen);

    newParagraphHue.textContent = `HSL= ${hue}${saturation}${lightness}`;
    outputHue.appendChild(newParagraphHue);
  }

  // Convert to binary and add to screen
  let outputBinary = document.querySelector(".three");
  const newParagraphBinary = document.createElement("p");
  const hueBinary = hue.toString(2).padStart(9, "0"); // Hue ranges from 0 to 360
  const saturationBinary = saturation.toString(2).padStart(8, "0"); // Saturation ranges from 0 to 100
  const lightnessBinary = lightness.toString(2).padStart(8, "0"); // Lightness ranges from 0 to 100
  if (isNaN(hue)) {
    newParagraphBinary.textContent = ``;
  } else {
    newParagraphBinary.textContent = `${hueBinary}${saturationBinary}${lightnessBinary}`;
    outputBinary.appendChild(newParagraphBinary);
  }
}
