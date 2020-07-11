import * as _ from 'lib/utils.js';
import { facemesh } from 'lib/tensorflow.js';


export async function start() {
    // load pretrained model
    const model = await facemesh.load();

    const canvas = _.getCanvas();
    const ctx = canvas.getContext('2d');
    // create hidden canvas as a buffer
    const bufferCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    const bctx = bufferCanvas.getContext('2d');
    _.onVideoFrameUpdate(async (data) => {
        // draw image to buffer canvas
        const f = Math.min(canvas.width / data.width, canvas.height / data.height);
        bctx.drawImage(data, // fit to canvas
            0, 0, data.width, data.height,
            0, 0, data.width*f, data.height*f,
        );
        
        // predict facial points
        const imageData = bctx.getImageData(0, 0, canvas.width, canvas.height);
        const predictions = await model.estimateFaces(imageData);
        // draw circles around predicted points
        for (const prediction of predictions) {
            for (const keypoint of prediction.scaledMesh) {
                const [x, y, z] = keypoint;
                bctx.beginPath();
                bctx.arc(x, y, 2, 0, 2 * Math.PI, true);
                bctx.stroke();
            }
        }

        // update visible canvas
        ctx.putImageData(bctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
    });
}