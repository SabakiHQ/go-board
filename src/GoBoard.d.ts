export type Vertex = [number, number]
export type Sign = 0 | -1 | 1
export type SignMap = Sign[][]

declare class GoBoard {
    constructor(signMap?: SignMap)
    static fromDimensions(width: number, height?: number): GoBoard

    signMap: SignMap
    height: number
    width: number

    get(vertex: Vertex): number | null
    set(vertex: Vertex, sign: Sign): GoBoard
    has(vertex: Vertex): boolean
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
    getDistance(vertex1: Vertex, vertex2: Vertex): number
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
