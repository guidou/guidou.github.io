let track = null;
function GetTransform() {
    return new TransformStream({
        async transform(frame, controller) {
            await new Promise(resolve => setTimeout(resolve, 100));
            controller.enqueue(frame);        },
    });
}
onmessage = event => {
    if (event.data.command == "process-track") {
        track = event.data.param;
        let processor = new MediaStreamTrackProcessor({track});
        let generator = new VideoTrackGenerator();
        processor.readable.pipeThrough(GetTransform()).pipeTo(generator.writable);
        postMessage({command: "processed-track", param: generator.track}, [generator.track]);
    } else if (event.data.command == "stop-track") {
        track.stop();
        postMessage({command: "stopped-track"});
    }
}
