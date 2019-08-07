# @sabaki/go-board [![Build Status](https://travis-ci.org/SabakiHQ/go-board.svg?branch=master)](https://travis-ci.org/SabakiHQ/go-board)

A Go board data type.

## Installation

Use npm to install:

~~~
$ npm install @sabaki/go-board
~~~

## Usage

~~~js
const Board = require('@sabaki/go-board')

let board = new Board([
    [ 0, 0, 0,-1,-1,-1, 1, 0, 1, 1,-1,-1, 0,-1, 0,-1,-1, 1, 0],
    [ 0, 0,-1, 0,-1, 1, 1, 1, 0, 1,-1, 0,-1,-1,-1,-1, 1, 1, 0],
    [ 0, 0,-1,-1,-1, 1, 1, 0, 0, 1, 1,-1,-1, 1,-1, 1, 0, 1, 0],
    [ 0, 0, 0, 0,-1,-1, 1, 0, 1,-1, 1, 1, 1, 1, 1, 0, 1, 0, 0],
    [ 0, 0, 0, 0,-1, 0,-1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0],
    [ 0, 0,-1, 0, 0,-1,-1, 1, 0,-1,-1, 1,-1,-1, 0, 1, 0, 0, 1],
    [ 0, 0, 0,-1,-1, 1, 1, 1, 1, 1, 1, 1, 1,-1,-1,-1, 1, 1, 1],
    [ 0, 0,-1, 1, 1, 0, 1,-1,-1, 1, 0, 1,-1, 0, 1,-1,-1,-1, 1],
    [ 0, 0,-1,-1, 1, 1, 1, 0,-1, 1,-1,-1, 0,-1,-1, 1, 1, 1, 1],
    [ 0, 0,-1, 1, 1,-1,-1,-1,-1, 1, 1, 1,-1,-1,-1,-1, 1,-1,-1],
    [-1,-1,-1,-1, 1, 1, 1,-1, 0,-1, 1,-1,-1, 0,-1, 1, 1,-1, 0],
    [-1, 1,-1, 0,-1,-1,-1,-1,-1,-1, 1,-1, 0,-1,-1, 1,-1, 0,-1],
    [ 1, 1, 1, 1,-1, 1, 1, 1,-1, 1, 0, 1,-1, 0,-1, 1,-1,-1, 0],
    [ 0, 1,-1, 1, 1,-1,-1, 1,-1, 1, 1, 1,-1, 1,-1, 1, 1,-1, 1],
    [ 0, 0,-1, 1, 0, 0, 1, 1,-1,-1, 0, 1,-1, 1,-1, 1,-1, 0,-1],
    [ 0, 0, 1, 0, 1, 0, 1, 1, 1,-1,-1, 1,-1,-1, 1,-1,-1,-1, 0],
    [ 0, 0, 0, 0, 1, 1, 0, 1,-1, 0,-1,-1, 1, 1, 1, 1,-1,-1,-1],
    [ 0, 0, 1, 1,-1, 1, 1,-1, 0,-1,-1, 1, 1, 1, 1, 0, 1,-1, 1],
    [ 0, 0, 0, 1,-1,-1,-1,-1,-1, 0,-1,-1, 1, 1, 0, 1, 1, 1, 0]
])

let move = board.makeMove(1, [9, 4])
~~~

## API

### Sign Map

The board arrangement is represented by an array of arrays. Each of those subarrays represent one row, all containing the same number of integers. `-1` denotes a white stone, `1` a black stone, and `0` represents an empty vertex.

#### Example

~~~js
[[ 0, 0, 1, 0,-1,-1, 1, 0, 0],
 [ 1, 0, 1,-1,-1, 1, 1, 1, 0],
 [ 0, 0, 1,-1, 0, 1,-1,-1, 0],
 [ 1, 1, 1,-1,-1,-1, 1,-1, 0],
 [ 1,-1, 1, 1,-1, 1, 1, 1, 0],
 [-1,-1,-1,-1,-1, 1, 0, 0, 0],
 [ 0,-1,-1, 0,-1, 1, 1, 1, 1],
 [ 0, 0, 0, 0, 0,-1,-1,-1, 1],
 [ 0, 0, 0, 0, 0, 0, 0,-1, 0]]
~~~

### Vertex

Board positions are represented by a vertex, i.e. an array of the form `[x, y]` where `x` and `y` are non-negative integers, zero-based coordinates. `[0, 0]` denotes the upper left position of the board.

---

### `class Board`

#### Constructors

##### `new Board([signMap])`

- `signMap` [`<SignMap>`](#sign-map) *(optional)* - Default: `[]`

##### `Board.fromDimensions(width, height)`

- `width` `<Integer>`
- `height` `<Integer>`

Returns a new `Board` instance with a [sign map](#sign-map) of the given dimensions that is filled with `0`.

#### Properties

##### `board.signMap`

[`<SignMap>`](#sign-map) - The underlying sign map of the board.

##### `board.width`

`<Integer>` - The board width.

##### `board.height`

`<Integer>` - The board height.

#### Stone Arrangement Functions

##### `board.get(vertex)`

- `vertex` [`<Vertex>`](#vertex)

Returns the sign at the given `vertex`.

##### `board.set(vertex, sign)`

- `vertex` [`<Vertex>`](#vertex)
- `sign` `<Integer>` - One of `-1`, `0`, or `1`

Sets the sign at the given `vertex`. No validity checks will be made. This function mutates the board and returns `this` to enable chaining.

##### `board.has(vertex)`

- `vertex` [`<Vertex>`](#vertex)

Returns a boolean whether the given `vertex` is valid or can be found on the board.

##### `board.clear()`

Sets the sign of all vertices to `0`. This function mutates the board and returns `this` to enable chaining.

##### `board.makeMove(sign, vertex[, options])`

- `sign` `<Integer>` - One of `-1`, `0`, or `1`
- `vertex` [`<Vertex>`](#vertex)
- `options` `<Object>` *(optional)*
    - `preventSuicide` `<Boolean>` - Default: `false`

Returns a new board instance that represents the board state after the player who corresponds to the given `sign` makes a move at `vertex`. The capture count will also be updated correctly. If `board` is [valid](#boardisvalid) then the new returned board instance will also be valid. This function will not mutate `board`. If `sign` is `0` or `vertex` not valid, this function will be equivalent to [`clone()`](#boardclone).

If `preventSuicide` is set to `true`, this function will throw an error if the attempted move is a suicide.

#### Capture Count Functions

##### `board.getCaptures(sign)`

- `sign` `<Integer>` - One of `-1` or `1`

Returns the number of stones that the player, who corresponds to the given `sign`, captured.

##### `board.setCaptures(sign, mutator)`

- `sign` `<Integer>` - One of `-1` or `1`
- `mutator` `<Function | Integer>`

If `mutator` is a function of the following form

~~~js
(prevCaptures: <Integer>) -> <Integer>
~~~

we will update the capture count of the player who corresponds to the given `sign` according to the `mutator` function. If `mutator` is an integer, we will directly set the capture count to `mutator` instead. This function mutates the board and returns `this` to enable chaining.

#### Board Property Functions

##### `board.isSquare()`

Equivalent to `board.width === board.height`.

##### `board.isEmpty()`

Returns `true` if [`signMap`](#boardsignmap) contains `0` only, otherwise `false`.

##### `board.isValid()`

Returns `true` if all [chains](#boardgetchainvertex) have at least one liberty, otherwise `false`.

#### Topology Functions

##### `board.getDistance(vertex1, vertex2)`

- `vertex1` [`<Vertex>`](#vertex)
- `vertex2` [`<Vertex>`](#vertex)

Returns the [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry) between the given vertices.

##### `board.getNeighbors(vertex)`

- `vertex` [`<Vertex>`](#vertex)

Returns an array of [vertices](#vertex) on the board that are exactly [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry) `1` away from the given `vertex`.

##### `board.getConnectedComponent(vertex, predicate)`

- `vertex` [`<Vertex>`](#vertex)
- `predicate` `<Function>`

`predicate` is a function of the following form:

~~~js
(vertex: <Vertex>) -> <Boolean>
~~~

Returns a list of [vertices](#vertex) that fulfill `predicate` and connect to `vertex` through a string of vertices that all fulfill `predicate`.

##### `board.getChain(vertex)`

- `vertex` [`<Vertex>`](#vertex)

Equivalent to `board.getConnectedComponent(vertex, v => board.get(v) === board.get(vertex))`.

##### `board.getRelatedChains(vertex)`

- `vertex` [`<Vertex>`](#vertex)

Returns an array of [chains](#boardgetchainvertex) of the same sign as `vertex` that belong to the same enemy area as `vertex`.

##### `board.getLiberties(vertex)`

- `vertex` [`<Vertex>`](#vertex)

Returns an array of [vertices](#vertex) that represents the liberties of the chain that `vertex` belongs to.

##### `board.hasLiberties(vertex)`

- `vertex` [`<Vertex>`](#vertex)

Equivalent to `board.getLiberties(vertex).length > 0`, but faster.

#### Helper Functions

##### `board.clone()`

Returns a new `Board` instance that is equivalent to `board`, but mutations to either of them will not affect one another.

##### `board.diff(otherBoard)`

- `board` [`<Board>`](#class-board)

Returns an array of [vertices](#vertex) whose signs are identical in `board` and `otherBoard`. If `otherBoard` has different dimensions from `board`, this will return `null`.

##### `board.stringifyVertex(vertex)`

- `vertex` [`<Vertex>`](#vertex)

Returns a string that represents the given `vertex`.

##### `board.parseVertex(coord)`

- `coord` `<String>`

Returns a [vertex](#vertex) that the given `coord` represents.

##### `board.getHandicapPlacement(count)`

- `count` `<Integer>`

Returns a list of [vertices](#vertex) that represent the positions of black handicap stones.
