// Get the video element from the DOM
const video = document.getElementById('video');

// Load face detection models and start the application
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('/models')
]).then(start);

// Function to start the face detection application
async function start() {
  // Create a container div to hold the video and canvas elements
  const container = document.createElement('div');
  container.style.position = 'relative';
  document.body.append(container);

  // Get user media stream for video
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;

  // Wait for the video metadata to load
  video.addEventListener('loadedmetadata', function() {
    video.play(); // Start playing the video

    // Event listener to perform face detection when the video is playing
    video.addEventListener('play', async () => {
      // Create a canvas to draw face detections
      const canvas = faceapi.createCanvasFromMedia(video);
      container.append(canvas);

      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      // Interval to perform face detection in the video feed
      setInterval(async () => {
        // Detect all faces in the video using TinyFaceDetector
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Clear previous drawings on the canvas
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        // Draw bounding boxes around detected faces
        resizedDetections.forEach(detection => {
          const box = detection.detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face' });
          drawBox.draw(canvas);
        });
      }, 100); // Detect faces every 100 milliseconds
    });
  });
}