export function createBoard(element, clickHandler, dropHandler, rightClickHandler) {
    element.innerHTML = '';
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        const row = Math.floor(i / 8);
        const col = i % 8;
        square.classList.add('square', (row + col) % 2 === 0 ? 'light' : 'dark');
        square.dataset.square = `${String.fromCharCode(97 + col)}${8 - row}`;
        if (clickHandler) {
            square.addEventListener('click', () => clickHandler(square.dataset.square));
        }
        if (dropHandler) {
            square.addEventListener('dragover', e => e.preventDefault());
            square.addEventListener('drop', e => dropHandler(e, square));
        }
        if (rightClickHandler) {
            square.addEventListener('contextmenu', e => rightClickHandler(e, square));
        }
        element.appendChild(square);
    }
}
