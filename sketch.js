let featureExtractor;
let classifier;
let video;
let loss;
let ExcellentImages = 0;
let NoGoodImages = 0;
let wdyeImages = 0;

function setup() {
  noCanvas();
  // Create a video element
  video = createCapture(VIDEO);
  video.parent("videoContainer");
  video.size(640, 480);

  // Extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor("MobileNet", modelReady);

  // Create a new classifier using those features and give the video we want to use
  const options = { numLabels: 3 };
  classifier = featureExtractor.classification(video, options);
  // Set up the UI buttons
  setupButtons();
}

// A function to be called when the model has been loaded
function modelReady() {
  select("#modelStatus").html("MobileNet Loaded!");
}

// Classify the current frame.
function classify() {
  classifier.classify(gotResults);
}

// A util function to create UI buttons
function setupButtons() {
  // When the button is pressed, add the current frame
  // from the video with a label of "No Good" to the classifier
  buttonA = select("#ngButton");
  buttonA.mousePressed(function() {
    classifier.addImage("No Good");
    select("#amountOfngImages").html((NoGoodImages += 1));
  });

  // When the Excellent button is pressed, add the current frame
  // from the video with a label of "Excellent" to the classifier
  buttonB = select("#exButton");
  buttonB.mousePressed(function() {
    classifier.addImage("Excellent");
    select("#amountOfexImages").html((ExcellentImages += 1));
  });

  // When the What do you expect? button is pressed, add the current frame
  // from the video with a label of "What do you expect?" to the classifier
  buttonC = select("#wdyeButton");
  buttonC.mousePressed(function() {
    classifier.addImage("What do you expect?");
    select("#amountOfwdyeImages").html((wdyeImages += 1));
  });

  // Train Button
  train = select("#train");
  train.mousePressed(function() {
    classifier.train(function(lossValue) {
      if (lossValue) {
        loss = lossValue;
        select("#loss").html(`Loss: ${loss}`);
      } else {
        select("#loss").html(`Done Training! Final Loss: ${loss}`);
      }
    });
  });

  // Predict Button
  buttonPredict = select("#buttonPredict");
  buttonPredict.mousePressed(classify);

  // Save model
  saveBtn = select("#save");
  saveBtn.mousePressed(function() {
    classifier.save();
  });

  // Load model
  loadBtn = select("#load");
  loadBtn.changed(function() {
    classifier.load(loadBtn.elt.files, function() {
      select("#modelStatus").html("Custom Model Loaded!");
    });
  });
}

// Show the results
function gotResults(err, results) {
  // Display any error
  if (err) {
    console.error(err);
  }
  if (results && results[0]) {
    select("#result").html(results[0].label);
    select("#confidence").html(`${results[0].confidence.toFixed(2) * 100  }%`);
    classify();
  }
}
