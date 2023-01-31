export class Piece{
    readonly type: string;
    readonly color: string;
    timesMoved: number;
    constructor(type: string, color: string){
        this.type = type;
        this.color = color;
        this.timesMoved = 0;
    }
}

export type Board = (Piece | null)[][]