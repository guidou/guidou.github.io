function GetTransform() {
    return new TransformStream({
        async transform(frame, controller) {
            await new Promise(resolve => setTimeout(resolve, 100));
            controller.enqueue(frame);
        },
    });
}

oncapturetransform = event => {
    event.processor.readable.pipeThrough(GetTransform()).pipeTo(event.generator.writable);

}