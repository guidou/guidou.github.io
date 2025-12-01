const startButton = document.getElementById('start');
const levelBar = document.getElementById('level-bar');
const avgLevel = document.getElementById('avg-level');

startButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioTrack = stream.getAudioTracks()[0];

    const trackProcessor = new ShimMediaStreamTrackProcessor({ track: audioTrack });
    const readableStream = trackProcessor.readable;
    const reader = readableStream.getReader();

    let sampleCount = 0;
    let sum = 0;

    function process() {
      reader.read().then(({ value, done }) => {
        if (done) {
          return;
        }

        if (value.format && !value.format.endsWith('-planar')) {
          const errorMessage = `Unsupported audio format: ${value.format}. Expected a planar format.`;
          console.error('Worker error:', errorMessage);
          const errorElement = document.createElement('p');
          errorElement.style.color = 'red';
          errorElement.textContent = `Error: ${errorMessage}`;
          document.body.appendChild(errorElement);
          value.close();
          return;
        }

        const planeIndex = 0;
        const bufferSize = value.allocationSize({ planeIndex });
        const buffer = new Float32Array(bufferSize / Float32Array.BYTES_PER_ELEMENT);
        value.copyTo(buffer, { planeIndex });

        for (let i = 0; i < buffer.length; i++) {
          sum += Math.abs(buffer[i]);
          sampleCount++;

          if (sampleCount >= 10000) {
            const average = sum / sampleCount;
            avgLevel.textContent = average.toFixed(4);
            levelBar.style.width = `${average * 400}%`; // Scale for visibility
            sum = 0;
            sampleCount = 0;
          }
        }

        value.close();
        process();
      }).catch(err => {
        console.error('Error processing stream:', err);
      });
    }

    process();

    startButton.disabled = true;
  } catch (err) {
    console.error('Error starting microphone:', err);
  }
});