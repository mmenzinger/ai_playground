/**
 * scenario.js
 * 
 * This file contains all the logic for the Flappy Bird scenario.
 * There should be no need to edit anything in this file unless you
 * want to change the core functionality of the scenario!
 * 
 */

import * as _ from 'lib/utils.js';

export const CANVAS_WIDTH = 300;
export const CANVAS_HEIGHT = 400;
export const PIPE_DISTANCE = 200;
export const MAX_PIPE_GAP = 150;
export const PIPE_WIDTH = 50;
const PIPE_WIDTH_2 = PIPE_WIDTH / 2;
export const PIPE_SPACE = 100;
const PIPE_SPACE_2 = PIPE_SPACE / 2;
const BIRD_SHIFT = 100;
export const BIRD_SIZE = 40;
const BIRD_SIZE_2 = BIRD_SIZE / 2;
const BIRD_SCALE = 1.5;
const BIRD_SHIFT_X = -4;
const BIRD_SHIFT_Y = 2;
export const FLOOR_HEIGHT = 50;
const MAX_PIPES = 2;

const DRAW_BOUNDING_BOX = false;

export const GRAVITY = 0.05;
export const JUMP_STRENGTH = 2.2;

export const canvas = _.getCanvas();
export const ctx = canvas.getContext("2d");
export const scale = Math.min(canvas.width / CANVAS_WIDTH, canvas.height / CANVAS_HEIGHT);

/** @typedef {{
 *      distance: number,
 *      height: number,
 *      velocity: number,
 * }} Bird */

/** @typedef {{
 *      maxScore: number,
 *      seed: number | number[],
 *      bird?: Bird,
 * }} Settings */

/**
 * Creates a settings-object.
 * @param {number} maxScore
 * @param {number | number[]} seed
 * @return {Settings}
 */
export function Settings(maxScore, seed = Math.random()){
    return {
        maxScore,
        seed,
    }
}

/**
 * An object containing all observed variables.
 * @typedef {{
     *      velocity?: number,
     *      height?: number,
     *      distance?: number,
     *      horizontalDistance?: number,
     *      verticalDistance?: number,
     * }} Observations
 */

/**
 * An object containing all callbacks for the player agent.
 * @typedef {{
     *      init?: () => Promise<void>,
     *      update?: (obs: Observations) => Promise<number>,
     *      result?: (
     *          obs: Observations,
     *          action: number,
     *          newObs: Observations,
     *          alive: boolean
     *      ) => Promise<void>,
     *      finish?: (
     *          score: number,
     *          alive: boolean
     *      ) => Promise<void>,
     * }} Agent
 */

/**
 * Creates an agent-object.
 * @param {{
 *      init?: () => Promise<void>,
 *      update?: (obs: Observations) => Promise<number>,
 *      result?: (
 *          obs: Observations,
 *          action: number,
 *          newObs: Observations,
 *          alive: boolean
 *      ) => Promise<void>,
 *      finish?: (
 *          score: number,
 *          alive: boolean
 *      ) => Promise<void>,
 *  }} callbacks
 * @return {Agent}
 */
export function Agent(callbacks){
    return {...callbacks}
}

/**
 * @readonly
 * @enum {number}
 */
export const EAction = {
    Idle: 0 | 0,
    Jump: 1 | 0,
    // @ts-ignore
    0: 'Idle',
    // @ts-ignore
    1: 'Jump',
}

/** 
 * Start a game of Flappy Bird, given the settings and agent.
 * @param {Settings} settings
 * @param {Agent} agent
 * @param {boolean} render
 * @param {number} frameDelay
 */
export async function run(settings, agent, render = true, frameDelay = 10) {
    let alive = true;
    const bird = {
        distance: 0,
        height: CANVAS_HEIGHT / 2,
        velocity: 0,
        // ...settings.bird,
    }
    let score = ~~(bird.distance / PIPE_DISTANCE);
    const pipes = [
        getNextPipe(settings.seed, score, bird.distance % PIPE_DISTANCE),
    ];
    pipes[0].x -= PIPE_WIDTH_2;

    if (render) {
        await _.loadImages([
            'project/bird1.png',
            'project/bird2.png',
            'project/floor.png',
            'project/crate.png',
            'project/sign.png',
            'project/background.png',
        ]);

        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const render = () => {
            drawState(pipes, bird, score);
            if (alive && score <= settings.maxScore) {
                requestAnimationFrame(render);
            }
        }
        requestAnimationFrame(render);
    }

    if (agent.init instanceof Function)
        await agent.init();

    let obs = getObservations(bird, pipes);
    while (score < settings.maxScore && alive) {
        const action = await agent.update(obs);

        score = ~~(bird.distance / PIPE_DISTANCE);
        if ((bird.distance + PIPE_WIDTH_2) % PIPE_DISTANCE === 0) {
            pipes.push(getNextPipe(settings.seed, score, 0));
            if (pipes.length > MAX_PIPES) {
                pipes.shift();
            }
        }

        bird.distance++;
        for (let pipe of pipes) {
            pipe.x--;
        }

        if (action === 1) {
            bird.velocity = JUMP_STRENGTH;
        }
        bird.velocity -= GRAVITY;
        bird.height -= bird.velocity;


        alive = !getCollision(bird, pipes);

        const newObs = getObservations(bird, pipes);

        if (agent.result instanceof Function)
            await agent.result(obs, action, newObs, alive);

        obs = newObs;
        if (render && (frameDelay === 0 || (frameDelay < 0 && bird.distance % -frameDelay === 0))) {
            await _.sleep(0);
        }
        if (frameDelay > 0) {
            await _.sleep(frameDelay);
        }
    }
    if (agent.finish instanceof Function){
        await agent.finish(score, alive);
    }
    if(render){
        await _.sleep(500);
    }
    
    return score;
}

/** 
 * @param {number | number[]} seed
 * @param {number} score
 * @param {number} shift
 */
function getNextPipe(seed, score, shift = 0) {
    let rand;
    if(Array.isArray(seed)){
        rand = seed[score % seed.length];
    }
    else{
        rand = _.seedRandom(`${seed},${score}`).quick();
    }
    return {
        x: CANVAS_WIDTH + PIPE_WIDTH_2 - shift,
        y: ~~(CANVAS_HEIGHT / 2 - FLOOR_HEIGHT / 2 + MAX_PIPE_GAP * (rand - 0.5)),
    }
}

function getObservations(bird, pipes) {
    let activePipe;
    let pipeDistance = Infinity;
    for (const pipe of pipes) {
        activePipe = pipe;
        if (pipe.x + PIPE_WIDTH_2 + BIRD_SIZE/2 >= BIRD_SHIFT)
            break;
    }
    return {
        velocity: bird.velocity,
        height: bird.height,
        distance: bird.distance,
        horizontalDistance: activePipe.x - BIRD_SHIFT,
        verticalDistance: activePipe.y - bird.height,
    };
}

function getCollision(bird, pipes) {
    // collide with floor
    if (bird.height > CANVAS_HEIGHT - BIRD_SIZE_2 - FLOOR_HEIGHT)
        return true;
    for (const pipe of pipes) {
        const distx = Math.abs(pipe.x - BIRD_SHIFT);
        // in range of pipe
        if (distx < PIPE_WIDTH_2 + BIRD_SIZE_2) {
            const disty = Math.abs(pipe.y - bird.height);
            // outside of gap
            if (disty >= PIPE_SPACE_2) {
                return true;
            }
            // inside gap
            if (distx <= PIPE_WIDTH_2) {
                if (disty > PIPE_SPACE_2 - BIRD_SIZE_2) {
                    return true;
                }
            }
            // at the edge
            else {
                for (const x of [pipe.x - PIPE_WIDTH_2, pipe.x + PIPE_WIDTH_2]) {
                    for (const y of [pipe.y - PIPE_SPACE_2, pipe.y + PIPE_SPACE_2]) {
                        if ((BIRD_SHIFT - x) ** 2 + (bird.height - y) ** 2 < BIRD_SIZE_2 ** 2) {
                            return true;
                        }
                    }
                }
            }

        }
    }
    return false;
}

function drawState(pipes, bird, score) {
    // draw background
    const imgBg = _.getImage('background');
    const bgScale = CANVAS_HEIGHT / imgBg.height;
    const bgWidth = imgBg.width * bgScale;
    const bgShift = (bird.distance / 2) % bgWidth;
    for (let i = 0; i < (CANVAS_WIDTH / bgWidth + 1); i++) {
        ctx.drawImage(imgBg, bgWidth * i - bgShift, 0, bgWidth, CANVAS_HEIGHT);
    }

    // draw pipes (aka crates...)
    const imgPipe = _.getImage('crate');
    const pipeScale = PIPE_WIDTH / imgPipe.width;
    const pipeHeight = imgPipe.height * pipeScale;
    for (const pipe of pipes) {
        for (let y = pipe.y - PIPE_SPACE_2 - pipeHeight; y > -pipeHeight; y -= pipeHeight) {
            ctx.drawImage(imgPipe, pipe.x - PIPE_WIDTH_2, y, PIPE_WIDTH, pipeHeight);
        }
        for (let y = pipe.y + PIPE_SPACE_2; y < CANVAS_HEIGHT - FLOOR_HEIGHT; y += pipeHeight) {
            ctx.drawImage(imgPipe, pipe.x - PIPE_WIDTH_2, y, PIPE_WIDTH, pipeHeight);
        }
        if (DRAW_BOUNDING_BOX) {
            ctx.beginPath();
            ctx.moveTo(pipe.x - PIPE_WIDTH_2, 0);
            ctx.lineTo(pipe.x - PIPE_WIDTH_2, pipe.y - PIPE_SPACE_2);
            ctx.lineTo(pipe.x + PIPE_WIDTH_2, pipe.y - PIPE_SPACE_2);
            ctx.lineTo(pipe.x + PIPE_WIDTH_2, 0);
            ctx.moveTo(pipe.x - PIPE_WIDTH_2, CANVAS_HEIGHT - FLOOR_HEIGHT);
            ctx.lineTo(pipe.x - PIPE_WIDTH_2, pipe.y + PIPE_SPACE_2);
            ctx.lineTo(pipe.x + PIPE_WIDTH_2, pipe.y + PIPE_SPACE_2);
            ctx.lineTo(pipe.x + PIPE_WIDTH_2, CANVAS_HEIGHT - FLOOR_HEIGHT);
            ctx.stroke();
        }
    }

    // draw floor
    const imgFloor = _.getImage('floor');
    const floorScale = FLOOR_HEIGHT / imgFloor.height;
    const floorWidth = imgFloor.width * floorScale;
    const floorShift = bird.distance % floorWidth;
    for (let i = 0; i < (CANVAS_WIDTH / floorWidth + 1); i++) {
        ctx.drawImage(imgFloor, floorWidth * i - floorShift, CANVAS_HEIGHT - FLOOR_HEIGHT, floorWidth, FLOOR_HEIGHT);
    }
    if (DRAW_BOUNDING_BOX) {
        ctx.moveTo(0, CANVAS_HEIGHT - FLOOR_HEIGHT);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - FLOOR_HEIGHT);
        ctx.stroke();
    }

    // draw bird
    const imgBird = _.getImage(`bird${bird.distance % 40 < 20 ? 1 : 2}`);
    const birdScale = BIRD_SIZE / Math.max(imgBird.width, imgBird.height) * BIRD_SCALE;
    const birdWidth = imgBird.width * birdScale;
    const birdHeight = imgBird.height * birdScale;
    ctx.drawImage(imgBird, BIRD_SHIFT - birdWidth / 2 + BIRD_SHIFT_X, bird.height - birdHeight / 2 + BIRD_SHIFT_Y, birdWidth, birdHeight);
    if (DRAW_BOUNDING_BOX) {
        ctx.beginPath();
        ctx.arc(BIRD_SHIFT, bird.height, BIRD_SIZE_2, 0, Math.PI * 2, false);
        ctx.restore();
        ctx.stroke();
        ctx.closePath();
    }

    // draw score
    const imgScore = _.getImage(`sign`);
    ctx.save();
    ctx.scale(0.7, -0.7);
    ctx.drawImage(imgScore, CANVAS_WIDTH / 2 + imgScore.width / 2, -imgScore.height, imgScore.width, imgScore.height);
    ctx.restore();
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(`${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 11, imgScore.width*0.9);

    ctx.clearRect(CANVAS_WIDTH, 0, (canvas.width / scale - CANVAS_WIDTH), canvas.height / scale);
    ctx.clearRect(0, CANVAS_HEIGHT, canvas.width / scale, (canvas.height / scale - CANVAS_HEIGHT));
}