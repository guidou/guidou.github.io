function GetTransform() {
    return new TransformStream({
        async transform(frame, controller) {
            await new Promise(resolve => setTimeout(resolve, 100));
            controller.enqueue(frame);
        },
   });
}

onmessage = event => {
    event.data.readable.pipeThrough(GetTransform()).pipeTo(event.data.writable);
}