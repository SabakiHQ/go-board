type Vertex = [number, number];
enum Sign {
    White = -1,
    Empty = 0,
    Black = 1,
}
type SignMap = Sign[][];

declare const alpha: string;

declare function vertexEquals([x1, y1]: Vertex, [x2, y2]: Vertex): boolean;

declare class GoBoard {
    public signMap: SignMap;
    public height: number;
    public width: number;

    private _players: [Sign, Sign];
    private _captures: [number, number];
    private _koInfo: {sign: Sign; vertex: Vertex};

    constructor(signMap?: SignMap);
    static fromDimensions(width: number, height?: number): GoBoard;

    get([x, y]: Vertex): number | null;
    set([x, y]: Vertex, sign: Sign): GoBoard;
    has([x, y]: Vertex): boolean;
    clear(): GoBoard;
    makeMove(
        sign: Sign,
        vertex: Vertex,
        {
            preventSuicide,
            preventOverwrite,
            preventKo,
        }?: {
            preventSuicide?: boolean;
            preventOverwrite?: boolean;
            preventKo?: boolean;
        }
    ): GoBoard;
    analyzeMove(
        sign: Sign,
        vertex: Vertex
    ): {pass: bool; overwrite: bool; capturing: bool; suicide: bool; ko: bool};
    getCaptures(sign: Sign): number;
    setCaptures(sign: Sign, mutator: number | ((m: number) => number)): GoBoard;
    isSquare(): boolean;
    isEmpty(): boolean;
    isValid(): boolean;
    getDistance([x1, y1]: Vertex, [x2, y2]: Vertex): number;
    getNeighbors(vertex: Vertex): Vertex[];
    getConnectedComponent(
        vertex: Vertex,
        predicate: (v: Vertex) => boolean,
        result?: Vertex[]
    ): Vertex[];
    getChain(vertex: Vertex): Vertex[];
    getRelatedChains(vertex: Vertex): Vertex[];
    getLiberties(vertex: Vertex): Vertex[];
    hasLiberties(vertex: Vertex, visited?: {[key: Vertex]: boolean}): boolean;
    clone(): GoBoard;
    diff(board: GoBoard): Vertex[] | null;
    stringifyVertex(vertex: Vertex): string;
    parseVertex(coord: string): Vertex;
    getHandicapPlacement(count: number, {tygem}?: {tygem?: boolean}): Vertex[];
}

export default GoBoard;
