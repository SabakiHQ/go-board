export type Vertex = [number, number]
export enum Sign {
    White = -1,
    Empty = 0,
    Black = 1,
}
export type SignMap = Sign[][]

declare class GoBoard {
    signMap: SignMap
    height: number
    width: number

    constructor(signMap?: SignMap)
    static fromDimensions(width: number, height?: number): GoBoard

    get([x, y]: Vertex): number | null
    set([x, y]: Vertex, sign: Sign): GoBoard
    has([x, y]: Vertex): boolean
    clear(): GoBoard
    makeMove(
        sign: Sign,
        vertex: Vertex,
        options?: {
            preventSuicide?: boolean
            preventOverwrite?: boolean
            preventKo?: boolean
        }
    ): GoBoard
    analyzeMove(
        sign: Sign,
        vertex: Vertex
    ): {
        pass: boolean
        overwrite: boolean
        capturing: boolean
        suicide: boolean
        ko: boolean
    }
    getCaptures(sign: Sign): number
    setCaptures(
        sign: Sign,
        mutator: number | ((prevCaptures: number) => number)
    ): GoBoard
    isSquare(): boolean
    isEmpty(): boolean
    isValid(): boolean
    getDistance([x1, y1]: Vertex, [x2, y2]: Vertex): number
    getNeighbors(vertex: Vertex): Vertex[]
    getConnectedComponent(
        vertex: Vertex,
        predicate: (vertex: Vertex) => boolean
    ): Vertex[]
    getChain(vertex: Vertex): Vertex[]
    getRelatedChains(vertex: Vertex): Vertex[]
    getLiberties(vertex: Vertex): Vertex[]
    hasLiberties(vertex: Vertex): boolean
    clone(): GoBoard
    diff(board: GoBoard): Vertex[] | null
    stringifyVertex(vertex: Vertex): string
    parseVertex(coord: string): Vertex
    getHandicapPlacement(count: number): Vertex[]
}

export default GoBoard
