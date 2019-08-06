const t = require('tap')
const Board = require('..')
const data = require('./data')

t.test('constructor', async t => {
    let board = new Board([[0, 0, 0], [0, 0, 0]])

    t.equal(board.width, 3)
    t.equal(board.height, 2)

    for (let x = 0; x < board.width; x++) {
        for (let y = 0; y < board.height; y++) {
            t.equal(board.get([x, y]), 0)
        }
    }

    t.equal(board.getCaptures(1), 0)
    t.equal(board.getCaptures(-1), 0)
})

t.test('clone', async t => {
    let board = Board.fromDimensions(19, 19)
    ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]].forEach(x => board.set(x, 1))
    ;[[1, 1], [2, 1]].forEach(x => board.set(x, -1))
    let clone = board.clone()

    t.notEqual(board.signMap, clone.signMap)
    t.deepEqual(board.signMap, clone.signMap)
})

t.test('has', async t => {
    t.test('should return true when vertex is on board', async t => {
        let board = Board.fromDimensions(19, 19)
        t.assert(board.has([0, 0]))
        t.assert(board.has([13, 18]))
        t.assert(board.has([5, 4]))
    })
    t.test('should return false when vertex is not on board', async t => {
        let board = Board.fromDimensions(19, 19)
        t.assert(!board.has([-1, -1]))
        t.assert(!board.has([5, -1]))
        t.assert(!board.has([board.width, 0]))
        t.assert(!board.has([board.width, board.height]))
    })
})

t.test('clear', async t => {
    let board = Board.fromDimensions(9, 9)
    board.set([0, 0], 1).set([1, 1], -1).set([3, 5], 1)
    board.clear()

    t.deepEqual(board.signMap, Board.fromDimensions(9, 9).signMap)
})

t.test('diff', async t => {
    let board1 = Board.fromDimensions(9, 9)
    let board2 = board1.makeMove(1, [3, 3]).set([4, 4], 1).set([3, 4], 1)

    t.deepEqual(board1.diff(board2), board2.diff(board1))
    t.deepEqual(board1.diff(board2).sort(), [[3, 3], [3, 4], [4, 4]])

    let board3 = Board.fromDimensions(8, 9)

    t.equal(board1.diff(board3), board3.diff(board1))
    t.equal(board1.diff(board3), null)
})

t.test('isSquare', async t => {
    let board = Board.fromDimensions(15, 16)
    t.assert(!board.isSquare())

    board = data.board
    t.assert(board.isSquare())
})

t.test('isEmpty', async t => {
    let board = Board.fromDimensions(15, 16)
    t.assert(board.isEmpty())

    board = data.board
    t.assert(!board.isEmpty())
})

t.test('isValid', async t => {
    t.test('should return true for valid board arrangements', async t => {
        let board = Board.fromDimensions(19, 19)
        t.assert(board.isValid())

        board.set([1, 1], 1).set([1, 2], -1)
        t.assert(board.isValid())
    })
    t.test('should return false for non-valid board arrangements', async t => {
        let board = Board.fromDimensions(19, 19)
        ;[[1, 0], [0, 1]].forEach(x => board.set(x, 1))
        ;[[0, 0]].forEach(x => board.set(x, -1))
        t.assert(!board.isValid())

        board = Board.fromDimensions(19, 19)
        ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2], [3, 1]].forEach(x => board.set(x, 1))
        ;[[1, 1], [2, 1]].forEach(x => board.set(x, -1))
        t.assert(!board.isValid())
    })
})

t.test('getDistance', async t => {
    let board = Board.fromDimensions(19, 19)
    t.equal(board.getDistance([1, 2], [8, 4]), 9)
    t.equal(board.getDistance([-1, -2], [8, 4]), 15)
})

t.test('getNeighbors', async t => {
    t.test('should return neighbors for vertices in the middle', async t => {
        let board = Board.fromDimensions(19, 19)
        t.deepEqual(board.getNeighbors([1, 1]), [[0, 1], [2, 1], [1, 0], [1, 2]])
    })
    t.test('should return neighbors for vertices on the side', async t => {
        let board = Board.fromDimensions(19, 19)
        t.deepEqual(board.getNeighbors([1, 0]), [[0, 0], [2, 0], [1, 1]])
    })
    t.test('should return neighbors for vertices in the corner', async t => {
        let board = Board.fromDimensions(19, 19)
        t.deepEqual(board.getNeighbors([0, 0]), [[1, 0], [0, 1]])
    })
    t.test('should return empty list for vertices not on board', async t => {
        let board = Board.fromDimensions(19, 19)
        t.deepEqual(board.getNeighbors([-1, -1]), [])
    })
})

t.test('getConnectedComponent', async t => {
    t.test('should be able to return the chain of a vertex', async t => {
        let board = Board.fromDimensions(19, 19)
        ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]].forEach(x => board.set(x, 1))
        ;[[1, 1], [2, 1]].forEach(x => board.set(x, -1))

        t.deepEqual(
            board.getConnectedComponent([1, 1], v => board.get(v) === -1).sort(),
            [[1, 1], [2, 1]]
        )
    })
    t.test('should be able to return the stone connected component of a vertex', async t => {
        let board = Board.fromDimensions(19, 19)
        ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]].forEach(x => board.set(x, 1))
        ;[[1, 1], [2, 1]].forEach(x => board.set(x, -1))

        t.deepEqual(
            board.getConnectedComponent([1, 1], v => board.get(v) !== 0).sort(),
            [[0, 1], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]
        )
    })
})

t.test('(has|get)Liberties', async t => {
    t.test('should return the liberties of the chain of the given vertex', async t => {
        let board = Board.fromDimensions(19, 19)
        ;[[1, 1], [2, 1]].forEach(x => board.set(x, -1))

        t.deepEqual(
            board.getLiberties([1, 1]).sort(),
            [[0, 1], [1, 0], [1, 2], [2, 0], [2, 2], [3, 1]]
        )
        t.assert(board.hasLiberties([1, 1]))
        t.deepEqual(board.getLiberties([1, 2]), [])
        t.assert(!board.hasLiberties([1, 2]))
    })
    t.test('should return empty list for a vertex not on the board', async t => {
        let board = Board.fromDimensions(19, 19)

        t.deepEqual(board.getLiberties([-1, -1]), [])
        t.assert(!board.hasLiberties([-1, -1]))
    })
})

t.test('stringifyVertex', async t => {
    t.equal(data.board.stringifyVertex([3, 3]), 'D16')
    t.equal(data.board.stringifyVertex([16, 14]), 'R5')
    t.equal(data.board.stringifyVertex([-1, 14]), null)
    t.equal(data.board.stringifyVertex([0, 19]), null)
})

t.test('parseVertex', async t => {
    t.deepEqual(data.board.parseVertex('d16'), [3, 3])
    t.deepEqual(data.board.parseVertex('R5'), [16, 14])
    t.deepEqual(data.board.parseVertex('R'), null)
    t.deepEqual(data.board.parseVertex('Z3'), null)
    t.deepEqual(data.board.parseVertex('pass'), null)
    t.deepEqual(data.board.parseVertex(''), null)
})

t.test('makeMove', async t => {
    t.test('should not mutate board', async t => {
        let board = Board.fromDimensions(19, 19)
        board.makeMove(1, [5, 5])

        t.deepEqual(board.signMap, Board.fromDimensions(19, 19).signMap)
    })
    t.test('should make a move', async t => {
        let board = Board.fromDimensions(19, 19)
        let move = board.makeMove(1, [5, 5])
        board.set([5, 5], 1)

        t.deepEqual(board.signMap, move.signMap)
    })
    t.test('should remove captured stones', async t => {
        let board = Board.fromDimensions(19, 19)
        let black = [[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]]
        let white = [[1, 1], [2, 1]]

        black.forEach(x => board.set(x, 1))
        white.forEach(x => board.set(x, -1))

        let move = board.makeMove(1, [3, 1])

        t.equal(move.get([3, 1]), 1)
        black.forEach(x => t.equal(move.get(x), 1))
        white.forEach(x => t.equal(move.get(x), 0))

        // Edge capture

        board = Board.fromDimensions(19, 19)
        board.set([0, 1], 1).set([0, 0], -1)
        move = board.makeMove(1, [1, 0])

        t.equal(move.get([0, 0]), 0)
        t.equal(move.get([1, 0]), 1)
        t.equal(move.get([0, 1]), 1)
    })
    t.test('should count captures correctly', async t => {
        let board = Board.fromDimensions(19, 19)
        let black = [[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]]
        let white = [[1, 1], [2, 1]]

        black.forEach(x => board.set(x, 1))
        white.forEach(x => board.set(x, -1))

        let move = board.makeMove(1, [3, 1])
        t.equal(move.getCaptures(-1), 0)
        t.equal(move.getCaptures(1), white.length)

        board = Board.fromDimensions(19, 19)
        board.set([0, 1], 1).set([0, 0], -1)

        move = board.makeMove(1, [1, 0])

        t.equal(move.getCaptures(-1), 0)
        t.equal(move.getCaptures(1), 1)
    })
    t.test('should handle suicide correctly', async t => {
        let board = Board.fromDimensions(19, 19)
        ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2], [3, 1]].forEach(x => board.set(x, 1))
        ;[[1, 1]].forEach(x => board.set(x, -1))
        let move = board.makeMove(-1, [2, 1])

        t.equal(move.get([1, 1]), 0)
        t.equal(move.get([2, 1]), 0)
        t.equal(move.get([3, 1]), 1)
        t.equal(move.get([1, 2]), 1)
    })
    t.test('should prevent suicide if desired', async t => {
        let board = Board.fromDimensions(19, 19)
        ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2], [3, 1]].forEach(x => board.set(x, 1))
        ;[[1, 1]].forEach(x => board.set(x, -1))

        t.throws(() => board.makeMove(-1, [2, 1], {preventSuicide: true}))
    })
    t.test('should handle stone overwrites correctly', async t => {
        let board = Board.fromDimensions(19, 19)
        ;[[10, 9], [10, 10], [10, 11]].forEach(x => board.set(x, 1))
        ;[[10, 8], [9, 9], [11, 9]].forEach(x => board.set(x, -1))
        let move = board.makeMove(-1, [10, 10])

        t.equal(move.get([10, 10]), -1)
        t.equal(move.get([10, 9]), 0)
        t.equal(move.get([10, 11]), 1)
    })
    t.test('should make a pass', async t => {
        let board = Board.fromDimensions(19, 19)
        t.deepEqual(board.makeMove(1, [-1, -1]).signMap, board.signMap)
        t.deepEqual(board.makeMove(0, [1, 1]).signMap, board.signMap)

        board.set([1, 1], -1)
        t.deepEqual(board.makeMove(1, [-1, -1]).signMap, board.signMap)
        t.deepEqual(board.makeMove(0, [1, 1]).signMap, board.signMap)
    })
})

t.test('fromDimensions', async t => {
    let board = Board.fromDimensions(5, 4)

    t.equal(board.width, 5)
    t.equal(board.height, 4)
})
