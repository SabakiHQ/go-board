type Vertex = [number, number];
type SignMap = number[][];

declare const alpha: string;

declare function vertexEquals([x1, y1]: Vertex, [x2, y2]: Vertex): boolean;

declare class GoBoard {
  public signMap: SignMap;
  public height: number;
  public width: number;
  private _players: [number, number];
  private _captures: [number, number];
  private _koInfo: { sign: number; vertex: Vertex };

  constructor(signMap?: SignMap);
  get([x, y]: Vertex): number | null;
  set([x, y]: Vertex, sign: number): GoBoard;
  has([x, y]: Vertex): boolean;
  clear(): GoBoard;
  makeMove(
    sign: number,
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
    sign: number,
    vertex: Vertex
  ): { pass: bool; overwrite: bool; capturing: bool; suicide: bool; ko: bool };
  getCaptures(sign: number): number;
  setCaptures(sign: number, mutator: number | ((m: number) => number)): GoBoard;
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
  
}
