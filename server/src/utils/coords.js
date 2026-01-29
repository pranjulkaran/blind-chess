export function squareToCoords(square) {
    return [square.charCodeAt(0) - 'a'.charCodeAt(0), parseInt(square.substring(1)) - 1];
}

export function coordsToSquare(coords) {
    return `${String.fromCharCode('a'.charCodeAt(0) + coords[0])}${coords[1] + 1}`;
}
