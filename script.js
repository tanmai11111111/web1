const video = document.getElementById('camera');
const randomButton = document.getElementById('randomButton');
const luckyFaceImg = document.getElementById('luckyFace');
const faceDisplay = document.getElementById('faceDisplay');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const loadFaceAPI = async () => {
  await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('./models');
  await faceapi.nets.faceExpressionNet.loadFromUri('./models');
  console.log("✅ Đã load xong model");
};

function getCameraStream() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => {
      console.error("❌ Lỗi camera:", err);
      alert("Vui lòng cấp quyền truy cập camera!");
    });
}

video.addEventListener('loadeddata', () => {
  // Lấy kích thước video thực tế
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const displaySize = {
    width: video.videoWidth,
    height: video.videoHeight
  };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
    const resized = faceapi.resizeResults(detections, displaySize);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resized);

    // Lưu để dùng cho random
    window.currentDetections = resized;
  }, 300);
});

// 🎯 Xử lý chọn khuôn mặt ngẫu nhiên
randomButton?.addEventListener('click', () => {
  if (window.currentDetections && window.currentDetections.length > 0) {
    const randomIndex = Math.floor(Math.random() * window.currentDetections.length);
    const selectedFace = window.currentDetections[randomIndex];
    const box = selectedFace.box;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = box.width;
    tempCanvas.height = box.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Cắt từ video thay vì canvas
    tempCtx.drawImage(
      video,                // nguồn video
      box.x, box.y,         // gốc khuôn mặt
      box.width, box.height,// kích thước cần cắt
      0, 0,                 // vẽ từ (0,0) lên tempCanvas
      box.width, box.height
    );

    const imageDataUrl = tempCanvas.toDataURL('image/png');
    luckyFaceImg.src = imageDataUrl;
    faceDisplay.style.display = 'block';

    // Vẽ khung đỏ quanh khuôn mặt được chọn trên canvas
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  } else {
    alert("❌ Không phát hiện khuôn mặt!");
    faceDisplay.style.display = 'none';
  }
});


// Bắt đầu
loadFaceAPI().then(getCameraStream);
