const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const audioElement = document.getElementById('bgm'); 

let hearts = [];

function resizeCanvas() {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createHeartFromBottom() {
    const startX = Math.random() * canvasElement.width;
    const startY = canvasElement.height + 50;
    hearts.push({
        x: startX, y: startY,
        size: Math.random() * 25 + 25, 
        speedY: Math.random() * 8 + 6, 
        wobble: Math.random() * 2 - 1, 
        wobbleSpeed: Math.random() * 0.1,
        opacity: 1 
    });
}

function drawAndEmitHearts() {
    for (let i = hearts.length - 1; i >= 0; i--) {
        let h = hearts[i];
        canvasCtx.save();
        canvasCtx.globalAlpha = h.opacity;
        canvasCtx.font = `${h.size}px Arial`;
        canvasCtx.fillText('❤️', h.x, h.y);
        canvasCtx.restore();

        h.y -= h.speedY;
        h.x += Math.sin(Date.now() * h.wobbleSpeed) * h.wobble;

        if (h.y < canvasElement.height * 0.7) h.opacity -= 0.02;
        if (h.opacity <= 0 || h.y < -50) hearts.splice(i, 1);
    }
}


function onResults(results) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    let isVGesture = false;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];


        const isIndexUp = landmarks[8].y < landmarks[6].y;
        const isMiddleUp = landmarks[12].y < landmarks[10].y;

    
        const isRingDown = landmarks[16].y > landmarks[14].y;
        const isPinkyDown = landmarks[20].y > landmarks[18].y;

       
        if (isIndexUp && isMiddleUp && isRingDown && isPinkyDown) {
            isVGesture = true;
        }
    }

  
    if (isVGesture) {
        videoElement.classList.add('blur-effect');
        
        if (audioElement && audioElement.paused) {
            audioElement.play().catch(err => console.log(err));
        }

        if (Math.random() < 0.75) { 
            createHeartFromBottom();
        }
    } else {
        videoElement.classList.remove('blur-effect');
        if (audioElement && !audioElement.paused) {
            audioElement.pause();
        }
    }

    drawAndEmitHearts();
}

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});


hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7, 
    minTrackingConfidence: 0.7
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
});
camera.start();