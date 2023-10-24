const video = document.getElementById("video");


Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startWebcam);

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

function getLabeledFaceDescriptions() {
  const labels = [
    "Bibinur",
    "Emunrich",
    "Mukthar",
    "Nursultan Ahmetsha",
    "Mahmud",
    "Kayrbek",
    "Saltanat",
    "Ablay",
    "Makkabhat",
    "Sandugash_8B",
    "Makhabbat_Zharimbetova",
    "Kamilya_Nuryshova",
    "Yenlik_Rismet",
    "Ussenova_Zhansaya",
    "Akhan_Zhuldyz",
    "Baibol_Dias",
    "Dias_Pernebeks"

  ];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      const expression = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.png`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceExpressions()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  const canvas = faceapi.createCanvasFromMedia(video);
  //document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptors();


    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    //canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    var context = canvas.getContext('2d');
context.fillRect(0,0,50,50);
canvas.setAttribute('width', '300'); // clears the canvas
context.fillRect(0,100,50,50);
canvas.width = canvas.width; // clears the canvas
context.fillRect(100,0,50,50); // only this square remains

    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    const results = resizedDetections.map((d) => {
      //console.log(detections[0].expressions.angry);
      return faceMatcher.findBestMatch(d.descriptor);
    });


    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result,
      });

      drawBox.draw(canvas);



     resizedDetections.forEach(result => {
      const {expressions} = result
      //console.log(expressions.angry);
    })
    
      document.getElementById("demo").innerHTML = `Hello ${result.label}`;
      
      let N = parseInt((detections[0].expressions.neutral * 100), 10)

      document.getElementById("neu").innerHTML = `Neutral:${N}%&#128528`;


      document.getElementById("hap").innerHTML = `Happy: ${Math.round(
        detections[0].expressions.happy * 100
      ).toFixed(0)}%&#128512`;

      document.getElementById("angry").innerHTML = `Angry: ${Math.round(
        detections[0].expressions.angry * 100
      ).toFixed(0)}%&#128545`;

      document.getElementById("fearful").innerHTML = `Fearful: ${Math.round(
        detections[0].expressions.fearful * 100
      ).toFixed(0)}%&#128552`;

      document.getElementById("sad").innerHTML = `Sad: ${Math.round(
        detections[0].expressions.sad * 100
      ).toFixed(0)}%&#128554`;
    
    });
  }, 100);



});

