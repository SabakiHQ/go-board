const alpha = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'

class GoBoard {
    constructor(signMap = []) {
        this.signMap = signMap.map(row => [...row])
        this._players = [1, -1]
        this._captures = [0, 0]
    }

    get height() {
        return this.signMap.length
    }

    get width() {
        return this.height === 0 ? 0 : this.signMap[0].length
    }

    get([x, y]) {
        return this.signMap[y] != null ? this.signMap[y][x] : null
    }

    set([x, y], sign) {
        if (this.signMap[y] != null) {
            this.signMap[y][x] = sign
        }

        return this
    }

    getCaptures(sign) {
        let index = this._players.indexOf(sign)
        if (index < 0) return null

        return this._captures[index]
    }

    setCaptures(sign, mutator) {
        let index = this._players.indexOf(sign)

        if (index >= 0) {
            this._captures[index] = typeof mutator === 'function'
                ? mutator(this._captures[index])
                : mutator
        }

        return this
    }

    clone() {
        let result = new GoBoard(this.signMap)
        result._captures = [...this._captures]

        return result
    }

    hasVertex([x, y]) {
        return 0 <= x && x < this.width && 0 <= y && y < this.height
    }

    clear() {
        this.signMap = this.signMap.map(row => row.map(_ => 0))
    }

    diff(board) {
        if (board.width !== this.width || board.height !== this.height) {
            return null
        }

        let result = []

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let sign = board.get([x, y])
                if (this.get([x, y]) === sign) continue

                result.push([x, y])
            }
        }

        return result
    }

    isSquare() {
        return this.width === this.height
    }

    isEmpty() {
        return this.signMap.every(row => row.every(x => x === 0))
    }

    isValid() {
        let liberties = {}

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let vertex = [x, y]
                if (this.get(vertex) === 0 || vertex in liberties) continue
                if (!this.hasLiberties(vertex)) return false

                this.getChain(vertex).forEach(v => liberties[v] = true)
            }
        }

        return true
    }

    getDistance(v, w) {
        return Math.abs(v[0] - w[0]) + Math.abs(v[1] - w[1])
    }

    getNeighbors(vertex, ignoreBoard = false) {
        if (!ignoreBoard && !this.hasVertex(vertex)) return []

        let [x, y] = vertex
        let allNeighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]

        return ignoreBoard ? allNeighbors : allNeighbors.filter(v => this.hasVertex(v))
    }

    getConnectedComponent(vertex, predicate, result = null) {
        if (!this.hasVertex(vertex)) return []
        if (!result) result = [vertex]

        // Recursive depth-first search

        for (let v of this.getNeighbors(vertex)) {
            if (!predicate(v)) continue
            if (result.some(w => w[0] === v[0] && w[1] === v[1])) continue

            result.push(v)
            this.getConnectedComponent(v, predicate, result)
        }

        return result
    }

    getChain(vertex) {
        let sign = this.get(vertex)
        return this.getConnectedComponent(vertex, v => this.get(v) === sign)
    }

    hasLiberties(vertex, visited = {}) {
        let sign = this.get(vertex)
        if (!this.hasVertex(vertex) || sign === 0) return false

        if (vertex in visited) return false
        let neighbors = this.getNeighbors(vertex)

        if (neighbors.some(n => this.get(n) === 0))
            return true

        visited[vertex] = true

        return neighbors
            .filter(n => this.get(n) === sign)
            .some(n => this.hasLiberties(n, visited))
    }

    getLiberties(vertex) {
        if (!this.hasVertex(vertex) || this.get(vertex) === 0) return []

        let chain = this.getChain(vertex)
        let liberties = []
        let added = {}

        for (let c of chain) {
            let freeNeighbors = this.getNeighbors(c).filter(n => this.get(n) === 0)

            liberties.push(...freeNeighbors.filter(n => !(n in added)))
            freeNeighbors.forEach(n => added[n] = true)
        }

        return liberties
    }

    getRelatedChains(vertex) {
        if (!this.hasVertex(vertex) || this.get(vertex) === 0) return []

        let signs = [this.get(vertex), 0]
        let area = this.getConnectedComponent(vertex, v => signs.includes(this.get(v)))

        return area.filter(v => this.get(v) === this.get(vertex))
    }

    stringifyVertex(vertex) {
        if (!this.hasVertex(vertex)) return null
        return alpha[vertex[0]] + (this.height - vertex[1])
    }

    parseVertex(coord) {
        if (coord.length < 2) return null

        let x = alpha.indexOf(coord[0].toUpperCase())
        let y = this.height - +coord.slice(1)
        let v = [x, y]

        return this.hasVertex(v) ? v : null
    }

    makeMove(sign, vertex, {preventSuicide = false} = {}) {
        let move = this.clone()
        if (sign === 0 || !this.hasVertex(vertex)) return move

        sign = sign > 0 ? 1 : -1
        move.set(vertex, sign)

        // Remove captured stones

        let deadNeighbors = move.getNeighbors(vertex)
            .filter(n => move.get(n) === -sign && !move.hasLiberties(n))

        for (let n of deadNeighbors) {
            if (move.get(n) === 0) continue

            for (let c of move.getChain(n)) {
                move.set(c, 0).setCaptures(sign, x => x + 1)
            }
        }

        move.set(vertex, sign)

        // Detect suicide

        if (deadNeighbors.length === 0 && !move.hasLiberties(vertex)) {
            if (preventSuicide) {
                throw new Error('Suicide prevented.')
            }

            for (let c of move.getChain(vertex)) {
                move.set(c, 0).setCaptures(-sign, x => x + 1)
            }
        }

        return move
    }

    getHandicapPlacement(count, {tygem = false} = {}) {
        if (Math.min(this.width, this.height) <= 6 || count < 2) return []

        let [nearX, nearY] = [this.width, this.height].map(x => x >= 13 ? 3 : 2)
        let [farX, farY] = [this.width - nearX - 1, this.height - nearY - 1]
        let [middleX, middleY] = [this.width, this.height].map(x => (x - 1) / 2)

        let result = !tygem
            ? [[nearX, farY], [farX, nearY], [farX, farY], [nearX, nearY]]
            : [[nearX, farY], [farX, nearY], [nearX, nearY], [farX, farY]]

        if (this.width % 2 !== 0 && this.height % 2 !== 0 && this.width !== 7 && this.height !== 7) {
            if (count === 5) result.push([middleX, middleY])
            result.push([nearX, middleY], [farX, middleY])

            if (count === 7) result.push([middleX, middleY])
            result.push([middleX, nearY], [middleX, farY], [middleX, middleY])
        } else if (this.width % 2 !== 0 && this.width !== 7) {
            result.push([middleX, nearY], [middleX, farY])
        } else if (this.height % 2 !== 0 && this.height !== 7) {
            result.push([nearX, middleY], [farX, middleY])
        }

        return result.slice(0, count)
    }
}

GoBoard.fromDimensions = (width, height) => {
    let signMap = [...Array(height)].map(_ => Array(width).fill(0))
    let result = new GoBoard()

    return Object.assign(result, {signMap})
}

module.exports = GoBoard
