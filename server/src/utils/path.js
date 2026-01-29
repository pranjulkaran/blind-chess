import { squareToCoords } from './coords.js';

export function getSquarePath(from, to) {
    const fromCoords = squareToCoords(from);
    const toCoords = squareToCoords(to);
    const path = [];
    let [x, y] = fromCoords;
    const dx = Math.sign(toCoords[0] - x);
    const dy = Math.sign(toCoords[1] - y);

    while (x !== toCoords[0] || y !== toCoords[1]) {
        x += dx;
        y += dy;
        if (x === toCoords[0] && y === toCoords[1]) break;
        path.push(coordsToSquare([x, y]));
    }
    return path;
}
