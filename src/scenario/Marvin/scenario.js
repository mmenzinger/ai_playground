import * as _ from 'lib/utils.js';
import {levels} from 'project/levels.js';

/** 
 * An object containing all callbacks for the player agent.
 * @typedef {{
     *      init?: () => Promise<void>,
     *      update?: (obs: Observations) => Promise<(string|(string|(string|string[])[])[])[]>,
     * }} Agent
 */

/**
 * An object containing all robot actions.
 * @typedef {{
 *      moveForward: () => void,
 *      turnLeft: () => void,
 *      turnRight: () => void,
 *      writeNumber: (number: number) => void,
* }} Robot
 */


/**
 * An object containing all observed variables.
 * @typedef {{
 *      number?: number,
 *      state: string,
 *      wallFront: boolean,
 *      wallLeft: boolean,
 *      wallRight: boolean,
 *      wallBack: boolean,
 * }} Observations
 */

/** @typedef {{
 *      level: number,
 *      delay: number,
 * }} Settings */

/** @type string[] */
let actions = [];

/** @type boolean */
let isInit = false;

/** @return {string} action */
export function moveForward() {
    const action = `moveForward`;
    if(isInit){
        actions.push(action);
    }
    return action;
}

/** @return {string} action */
export function turnLeft()  {
    const action = `turnLeft`;
    if(isInit){
        actions.push(action);
    }
    return action;
}

/** @return {string} action */
export function turnRight()  {
    const action = `turnRight`;
    if(isInit){
        actions.push(action);
    }
    return action;
}

/** @param {0|1|2|3|4|5|6|7|8|9|undefined} number 
 * @return {string} action
*/
export function writeNumber(number = undefined) {
    let action = `writeNumber:${number}`;
    if(number === undefined){
        action = 'clearNumber';
    }
    if(isInit){
        actions.push(action);
    }
    return action;
}

/** @param {string} state 
 * @return {string} action
*/
export function setState(state) {
    let action = `setState:${state}`;
    if(isInit){
        actions.push(action);
    }
    return action;
}

/**
 * Creates a settings-object.
 * @param {Agent} agent
 * @param {Settings} settings
 */
export async function run(agent, settings){
    if(settings.level >= levels.length){
        console.error(`Invalid level!`);
        console.error(`Please select a level between 0 and ${levels.length-1}!`);
        return;
    }

    const level = levels[settings.level];
    actions = [];
    // revert y-axis and set values negative
    const map = level.map.map(a => a.map(x => -x)).reverse();
    // count number of diamonds
    const maxDiamonds = level.map.flat().reduce((n,x)=>n+(x===2?1:0),0);
    let x = level.x;
    let y = level.y;
    let dir = level.dir;
    let score = 0;
    let exited = false;
    let state = '';

    const canvas = _.getCanvas();
    const ctx = canvas.getContext("2d");
    let size = Math.min(canvas.width, canvas.height);
    let tileSize = size / Math.max(map.length, map[0].length);

    _.onResize((e) => {
        canvas.width = e.width;
        canvas.height = e.height;
        size = Math.min(canvas.width, canvas.height);
        tileSize = size / Math.max(map.length, map[0].length);
        drawMap(ctx, tileSize, map, level.type);
        updateTile(ctx, tileSize, map, x, y, dir);
    });

    ctx.textAlign = "center";
    await _.loadImages([
        'project/assets/diamond.png',
        'project/assets/tiles.png',
        'project/assets/robot_down.png',
        'project/assets/robot_left.png',
        'project/assets/robot_right.png',
        'project/assets/robot_up.png',
    ]);

    drawMap(ctx, tileSize, map, level.type);
    updateTile(ctx, tileSize, map, x, y, dir);
    await _.sleep(settings.delay);

    if(agent.init){
        isInit = true;
        agent.init();
        isInit = false;
    }

    /** @type string */
    let action;
    do{
        action = actions.shift();
        if(!action && agent.update){
            /** @ts-ignore */
            actions.push(...(await agent.update({
                number: (map[y] !== undefined && map[y][x] > 0) ? map[y][x]-1 : undefined,
                state: state,
                wallFront: wallInDir(map, x, y, dir),
                wallLeft: wallInDir(map, x, y, (dir+3)%4),
                wallRight: wallInDir(map, x, y, (dir+1)%4),
                wallBack: wallInDir(map, x, y, (dir+2)%4),
            })).flat(Infinity));
            action = actions.shift();
        }

        let newX = x;
        let newY = y;
        switch(action){
            case 'moveForward': {
                switch(dir){
                    case 0: newY++; break;
                    case 1: newX++; break;
                    case 2: newY--; break;
                    case 3: newX--; break;
                }
                if(map[newY] !== undefined && map[newY][newX] === 0){
                    console.warn("can't move because of a wall")
                    newX = x;
                    newY = y;
                }
                else{
                    if((x <= 0 && dir === 3)
                    || (y <= 0 && dir === 2)
                    || (x >= map[0].length-1 && dir === 1)
                    || (y >= map.length-1 && dir === 0)){
                        exited = true;
                    }
                    if(map[newY] !== undefined && map[newY][newX] === -2){
                        score++;
                        map[newY][newX] = -1;
                    }
                }
                break;
            }
            case 'turnLeft': dir = (dir + 3) % 4; break;
            case 'turnRight': dir = (dir + 1) % 4; break;
            case 'clearNumber': map[y][x] = 0; break;
            default: {
                if(typeof action === 'string'){
                    const params = action.split(':');
                    if(params[0] === 'setState'){
                        const str = params.slice(1).join(':');
                        state = str;
                    }
                    else if(params[0] === 'writeNumber'){
                        const number = Number(params[1]);
                        if(number < 0 || number > 9){
                            console.warn("number must be between 0 and 9");
                        }
                        else{
                            map[y][x] = number+1;
                        }
                    }
                    else{
                        console.warn(`invalid command '${action}'`);
                    }
                }
            }
        }
        updateTile(ctx, tileSize, map, x, y);
        x = newX;
        y = newY;
        updateTile(ctx, tileSize, map, x, y, dir, state);

        if(!exited && action){
            await _.sleep(settings.delay);
        }
    } while(action && !exited);

    const percent = Math.floor(score / maxDiamonds * 100);
    if(exited){
        console.log(`The robot successfully exited the labyrinth while collecting ${percent}% of all diamonds!`);
    }
    else{
        console.warn(`The robot stopped working while collection ${percent}% of all diamonds.`);
    }
}

function drawMap(ctx, tileSize, map, type){
    for(let row = 0; row < map.length; row++){
        for(let col = 0; col < map[0].length; col++){
            const tile = map[map.length-row-1][col];
            const img = _.getImage('tiles');
            const size = img.height;
            const x = col * tileSize;
            const y = row * tileSize;

            if(tile === 0){
                // draw wall
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, type*size, 0, size, size, x, y, tileSize+1, tileSize+1);
            }
            else{
                // draw path
                ctx.drawImage(img, 0*size, 0, size, size, x, y, tileSize+1, tileSize+1);
            }
            if(tile > 0){
                // draw number
                ctx.fillStyle = '#fff';
                ctx.font = `${tileSize}px Arial`;
                ctx.textAlign = "center";
                ctx.fillText(`${tile-1}`, x + tileSize/2, y + tileSize - tileSize/10);
            }
            if(tile === -2){
                // draw diamond
                const img = _.getImage('diamond');
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(img, x, y, tileSize, tileSize);
            }
        }
    }
}

function updateTile(ctx, tileSize, map, col, row, dir = undefined, state = undefined){
    if(col < 0 || col >= map[0].length || row < 0 || row >= map.length)
        return;
    
    const tile = map[row][col];
    const img = _.getImage('tiles');
    const size = img.height;
    const x = col * tileSize;
    const y = (map.length - row - 1) * tileSize;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0*size, 0, size, size, x, y, tileSize, tileSize);
    if(tile > 0){
        // draw number
        ctx.fillStyle = '#fff';
        ctx.font = `${tileSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(`${tile-1}`, x + tileSize/2, y + tileSize - tileSize/10);
    }
    if(dir !== undefined){
        // draw robot
        let str = 'up';
        switch(dir){
            case 1: str = 'right'; break;
            case 2: str = 'down'; break;
            case 3: str = 'left'; break;
        }
        const img = _.getImage(`robot_${str}`);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, x, y, tileSize, tileSize);
        if(state){
            // draw state
            ctx.fillStyle = '#fff';
            ctx.font = `${tileSize/3}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText(`${state}`, x + tileSize/2, y + tileSize - tileSize/2.5);
        }
    }
}

function wallInDir(map, x, y, dir){
    switch(dir){
        case 0: return !(map[y+1] === undefined || map[y+1][x] !== 0);
        case 2: return !(map[y-1] === undefined || map[y-1][x] !== 0);
        case 1: return !(map[y] === undefined ||  map[y][x+1] !== 0);
        case 3: return !(map[y] === undefined || map[y][x-1] !== 0);
    }
    return false;
}