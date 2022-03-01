export const NUM_ROWS = 8;
export const NUM_COLS = 8;

export function positionToCoords(san){
    let row = Math.abs(Number(san[1]) - NUM_ROWS);
    let col = Math.abs(san.charCodeAt(0) - 97);
    return [row, col];
}

export const fenCharMap = {
    'b': 'b',
    'B': 'B',
    'k': 'k',
    'K': 'K',
    'n': 'n',
    'N': 'N',
    'p': 'p',
    'P': 'P',
    'q': 'q',
    'Q': 'Q',
    'r': 'r',
    'R': 'R',
    '1': 'x',
    '2': 'xx',
    '3': 'xxx',
    '4': 'xxxx',
    '5': 'xxxxx',
    '6': 'xxxxxx',
    '7': 'xxxxxxx',
    '8': 'xxxxxxxx'    
}

export function reverseStr(string){
    if (!string || !string.length){
        return null;
    }
    let output = '';
    for (let i = string.length - 1; i >= 0; i--){
        output += string.charAt(i);
    }
    return output;
}

export function unfoldFen(fen, isReversed){
    let fenOriented = isReversed ? reverseStr(fen) : fen;
    return fenOriented
            .split('/').map(line => {
                let unfoldedLine = '';
                for (let i = 0; i < line.length; i++){
                    unfoldedLine += fenCharMap[line.charAt(i)];
                }
                return unfoldedLine;
            })
            .join('');
}