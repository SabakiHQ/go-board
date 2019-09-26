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

    t.throws(() => new Board([[0, 0, 0], [0, 0], [0, 0, 0]]))
})

t.test('fromDimensions', async t => {
    let board = Board.fromDimensions(5, 4)

    t.equal(board.width, 5)
    t.equal(board.height, 4)
})

t.test('has', async t => {
    t.test('should return true when vertex is on board', async t => {
        let board = Board.fromDimensions(19)
        t.assert(board.has([0, 0]))
        t.assert(board.has([13, 18]))
        t.assert(board.has([5, 4]))
    })

    t.test('should return false when vertex is not on board', async t => {
        let board = Board.fromDimensions(19)
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

t.test('makeMove', async t => {
    t.test('should not mutate board', async t => {
        let board = Board.fromDimensions(19)
        board.makeMove(1, [5, 5])

        t.deepEqual(board.signMap, Board.fromDimensions(19).signMap)
    })

    t.test('should make a move', async t => {
        let board = Board.fromDimensions(19)
        let move = board.makeMove(1, [5, 5])
        board.set([5, 5], 1)

        t.deepEqual(board.signMap, move.signMap)
    })

    t.test('should remove captured stones', async t => {
        let board = Board.fromDimensions(19)
        let black = [[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]]
        let white = [[1, 1], [2, 1]]

        black.forEach(x => board.set(x, 1))
        white.forEach(x => board.set(x, -1))

        let move = board.makeMove(1, [3, 1])

        t.equal(move.get([3, 1]), 1)
        black.forEach(x => t.equal(move.get(x), 1))
        white.forEach(x => t.equal(move.get(x), 0))

        // Edge capture

        board = Board.fromDimensions(19)
        board.set([0, 1], 1).set([0, 0], -1)
        move = board.makeMove(1, [1, 0])

        t.equal(move.get([0, 0]), 0)
        t.equal(move.get([1, 0]), 1)
        t.equal(move.get([0, 1]), 1)
    })

    t.test('should count captures correctly', async t => {
        let board = Board.fromDimensions(19)
        let black = [[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]]
        let white = [[1, 1], [2, 1]]

        black.forEach(x => board.set(x, 1))
        white.forEach(x => board.set(x, -1))

        let move = board.makeMove(1, [3, 1])
        t.equal(move.getCaptures(-1), 0)
        t.equal(move.getCaptures(1), white.length)

        board = Board.fromDimensions(19)
        board.set([0, 1], 1).set([0, 0], -1)

        move = board.makeMove(1, [1, 0])

        t.equal(move.getCaptures(-1), 0)
        t.equal(move.getCaptures(1), 1)
    })

    t.test('should handle suicide correctly', async t => {
        let board = Board.fromDimensions(19)
        ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2], [3, 1]].forEach(x => board.set(x, 1))
        ;[[1, 1]].forEach(x => board.set(x, -1))
        let move = board.makeMove(-1, [2, 1])

        t.equal(move.get([1, 1]), 0)
        t.equal(move.get([2, 1]), 0)
        t.equal(move.get([3, 1]), 1)
        t.equal(move.get([1, 2]), 1)
    })

    t.test('should prevent suicide if desired', async t => {
        let board = Board.fromDimensions(19)
        ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2], [3, 1]].forEach(x => board.set(x, 1))
        ;[[1, 1]].forEach(x => board.set(x, -1))

        t.throws(() => board.makeMove(-1, [2, 1], {preventSuicide: true}))
    })

    t.test('should handle stone overwrites correctly', async t => {
        let board = Board.fromDimensions(19)
        ;[[10, 9], [10, 10], [10, 11]].forEach(x => board.set(x, 1))
        ;[[10, 8], [9, 9], [11, 9]].forEach(x => board.set(x, -1))
        let move = board.makeMove(-1, [10, 10])

        t.equal(move.get([10, 10]), -1)
        t.equal(move.get([10, 9]), 0)
        t.equal(move.get([10, 11]), 1)
    })

    t.test('should prevent stone overwrites if desired', async t => {
        let board = Board.fromDimensions(19)
        ;[[10, 9], [10, 10], [10, 11]].forEach(x => board.set(x, 1))
        ;[[10, 8], [9, 9], [11, 9]].forEach(x => board.set(x, -1))

        t.throws(() => board.makeMove(-1, [10, 10], {preventOverwrite: true}))
    })

    t.test('should make a pass', async t => {
        let board = Board.fromDimensions(19)
        t.deepEqual(board.makeMove(1, [-1, -1]).signMap, board.signMap)
        t.deepEqual(board.makeMove(0, [1, 1]).signMap, board.signMap)

        board.set([1, 1], -1)
        t.deepEqual(board.makeMove(1, [-1, -1]).signMap, board.signMap)
        t.deepEqual(board.makeMove(0, [1, 1]).signMap, board.signMap)
    })

    t.test('should prevent ko if desired', async t => {
        let board = Board.fromDimensions(19)
        let black = [[0, 1], [1, 0], [1, 2], [2, 1]]
        let white = [[2, 0], [2, 2], [3, 1]]

        black.forEach(x => board.set(x, 1))
        white.forEach(x => board.set(x, -1))

        let move = board.makeMove(-1, [1, 1])
        t.throws(() => move.makeMove(1, [2, 1], {preventKo: true}))
    })
})

t.test('analyzeMove', async t => {
    t.test('should detect passes', async t => {
        let board = Board.fromDimensions(19)
        let analysis = board.analyzeMove(1, [19, 19])

        t.deepEqual(analysis, {
            pass: true,
            overwrite: false,
            capturing: false,
            suicide: false,
            ko: false
        })

        analysis = board.analyzeMove(0, [5, 5])

        t.deepEqual(analysis, {
            pass: true,
            overwrite: false,
            capturing: false,
            suicide: false,
            ko: false
        })
    })

    t.test('should detect overwrites', async t => {
        let board = Board.fromDimensions(19)
        board.set([5, 5], -1)
        let analysis = board.analyzeMove(1, [5, 5])

        t.deepEqual(analysis, {
            pass: false,
            overwrite: true,
            capturing: false,
            suicide: false,
            ko: false
        })

        analysis = board.analyzeMove(1, [5, 6])

        t.deepEqual(analysis, {
            pass: false,
            overwrite: false,
            capturing: false,
            suicide: false,
            ko: false
        })
    })

    t.test('should detect captures', async t => {
        let board = Board.fromDimensions(19)
        let black = [[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]]
        let white = [[1, 1], [2, 1]]

        black.forEach(x => board.set(x, 1))
        white.forEach(x => board.set(x, -1))

        let analysis = board.analyzeMove(1, [3, 1])

        t.deepEqual(analysis, {
            pass: false,
            overwrite: false,
            capturing: true,
            suicide: false,
            ko: false
        })

        // Edge capture

        board = Board.fromDimensions(19)
        board.set([0, 1], 1).set([0, 0], -1)
        analysis = board.analyzeMove(1, [1, 0])

        t.deepEqual(analysis, {
            pass: false,
            overwrite: false,
            capturing: true,
            suicide: false,
            ko: false
        })
    })

    t.test('should detect kos', async t => {
        let board = Board.fromDimensions(19)
        let black = [[0, 1], [1, 0], [1, 2], [2, 1]]
        let white = [[2, 0], [2, 2], [3, 1]]

        black.forEach(x => board.set(x, 1))
        white.forEach(x => board.set(x, -1))

        let analysis = board.analyzeMove(-1, [1, 1])

        t.deepEqual(analysis, {
            pass: false,
            overwrite: false,
            capturing: true,
            suicide: false,
            ko: false
        })

        let move = board.makeMove(-1, [1, 1])
        analysis = move.analyzeMove(1, [2, 1])

        t.deepEqual(analysis, {
            pass: false,
            overwrite: false,
            capturing: true,
            suicide: false,
            ko: true
        })
    })
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
        let board = Board.fromDimensions(19)
        t.assert(board.isValid())

        board.set([1, 1], 1).set([1, 2], -1)
        t.assert(board.isValid())
    })

    t.test('should return false for non-valid board arrangements', async t => {
        let board = Board.fromDimensions(19)
        ;[[1, 0], [0, 1]].forEach(x => board.set(x, 1))
        ;[[0, 0]].forEach(x => board.set(x, -1))
        t.assert(!board.isValid())

        board = Board.fromDimensions(19)
        ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2], [3, 1]].forEach(x => board.set(x, 1))
        ;[[1, 1], [2, 1]].forEach(x => board.set(x, -1))
        t.assert(!board.isValid())
    })
})

t.test('getDistance', async t => {
    let board = Board.fromDimensions(19)
    t.equal(board.getDistance([1, 2], [8, 4]), 9)
    t.equal(board.getDistance([-1, -2], [8, 4]), 15)
})

t.test('getNeighbors', async t => {
    t.test('should return neighbors for vertices in the middle', async t => {
        let board = Board.fromDimensions(19)
        t.deepEqual(board.getNeighbors([1, 1]), [[0, 1], [2, 1], [1, 0], [1, 2]])
    })

    t.test('should return neighbors for vertices on the side', async t => {
        let board = Board.fromDimensions(19)
        t.deepEqual(board.getNeighbors([1, 0]), [[0, 0], [2, 0], [1, 1]])
    })

    t.test('should return neighbors for vertices in the corner', async t => {
        let board = Board.fromDimensions(19)
        t.deepEqual(board.getNeighbors([0, 0]), [[1, 0], [0, 1]])
    })

    t.test('should return empty list for vertices not on board', async t => {
        let board = Board.fromDimensions(19)
        t.deepEqual(board.getNeighbors([-1, -1]), [])
    })
})

t.test('getConnectedComponent', async t => {
    t.test('should be able to return the chain of a vertex', async t => {
        let board = Board.fromDimensions(19)
        ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]].forEach(x => board.set(x, 1))
        ;[[1, 1], [2, 1]].forEach(x => board.set(x, -1))

        t.deepEqual(
            board.getConnectedComponent([1, 1], v => board.get(v) === -1).sort(),
            [[1, 1], [2, 1]]
        )
    })

    t.test('should be able to return the stone connected component of a vertex', async t => {
        let board = Board.fromDimensions(19)
        ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]].forEach(x => board.set(x, 1))
        ;[[1, 1], [2, 1]].forEach(x => board.set(x, -1))

        t.deepEqual(
            board.getConnectedComponent([1, 1], v => board.get(v) !== 0).sort(),
            [[0, 1], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]
        )
    })
})

t.test('getRelatedChains', async t => {
    t.deepEqual(data.board.getRelatedChains([0, 0]), [])
    t.deepEqual(data.board.getRelatedChains([3, 0]).sort(), [
        [3, 0], [2, 1], [4, 1], [4, 0], [5, 0], [4, 2], [3, 2], [2, 2], [4, 3],
        [5, 3], [4, 4], [2, 5], [5, 5], [6, 5], [6, 4], [4, 6], [3, 6], [2, 7], [2, 8], [2, 9],
        [2, 10], [1, 10], [0, 10], [0, 11], [3, 10], [2, 11], [4, 11], [5, 11], [6, 11], [7, 11],
        [8, 11], [9, 11], [9, 10], [7, 10], [7, 9], [6, 9], [5, 9], [8, 9], [8, 8], [7, 7], [8, 7],
        [8, 12], [8, 13], [8, 14], [9, 14], [10, 15], [9, 15], [8, 16], [7, 17], [7, 18], [6, 18], [5, 18], [4, 18],
        [4, 17], [8, 18], [10, 18], [11, 18], [10, 17], [9, 17], [10, 16], [11, 16], [4, 12], [3, 8]
    ].sort())
})

t.test('(has|get)Liberties', async t => {
    t.test('should return the liberties of the chain of the given vertex', async t => {
        let board = Board.fromDimensions(19)
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
        let board = Board.fromDimensions(19)

        t.deepEqual(board.getLiberties([-1, -1]), [])
        t.assert(!board.hasLiberties([-1, -1]))
    })
})

t.test('clone', async t => {
    let board = Board.fromDimensions(19)
    ;[[0, 1], [1, 0], [1, 2], [2, 0], [2, 2]].forEach(x => board.set(x, 1))
    ;[[1, 1], [2, 1]].forEach(x => board.set(x, -1))
    let clone = board.clone()

    t.notEqual(board.signMap, clone.signMap)
    t.deepEqual(board.signMap, clone.signMap)
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

t.test('stringifyVertex', async t => {
    t.equal(data.board.stringifyVertex([3, 3]), 'D16')
    t.equal(data.board.stringifyVertex([16, 14]), 'R5')
    t.equal(data.board.stringifyVertex([-1, 14]), '')
    t.equal(data.board.stringifyVertex([0, 19]), '')
})

t.test('parseVertex', async t => {
    t.deepEqual(data.board.parseVertex('d16'), [3, 3])
    t.deepEqual(data.board.parseVertex('R5'), [16, 14])
    t.deepEqual(data.board.parseVertex('R'), [-1, -1])
    t.deepEqual(data.board.parseVertex('Z3'), [-1, -1])
    t.deepEqual(data.board.parseVertex('pass'), [-1, -1])
    t.deepEqual(data.board.parseVertex(''), [-1, -1])
})

t.test('getHandicapPlacement', async t => {
    t.test('should return empty array for small boards', async t => {
        t.deepEqual(Board.fromDimensions(6, 19).getHandicapPlacement(9), [])
        t.deepEqual(Board.fromDimensions(6, 6).getHandicapPlacement(9), [])
    })

    t.test('should not return tengen for even dimensions', async t => {
        let square = Board.fromDimensions(8, 8).getHandicapPlacement(9)
        let portrait = Board.fromDimensions(8, 11).getHandicapPlacement(9)
        let landscape = Board.fromDimensions(11, 8).getHandicapPlacement(9)

        t.assert(!square.some(v => v[0] === 4 && v[1] === 4))
        t.assert(!portrait.some(v => v[0] === 4 && v[1] === 5))
        t.assert(!landscape.some(v => v[0] === 5 && v[1] === 4))
    })

    t.test('should return tengen for odd dimensions', async t => {
        let square = Board.fromDimensions(9, 9).getHandicapPlacement(9)
        let portrait = Board.fromDimensions(9, 11).getHandicapPlacement(9)
        let landscape = Board.fromDimensions(11, 9).getHandicapPlacement(9)

        t.assert(square.some(v => v[0] === 4 && v[1] === 4))
        t.assert(portrait.some(v => v[0] === 4 && v[1] === 5))
        t.assert(landscape.some(v => v[0] === 5 && v[1] === 4))
    })
})
