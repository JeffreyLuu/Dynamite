class Bot {
    // a bot that copies the opponent's moves 

    constructor() {
        this.dynamiteCount = 100
    }

    counterMove(move) {
        let moves = { "R": [["S", "W"], ["D", "P"]], "S": [["P", "W"], ["D", "R"]], "P": [["R", "W"], ["D", "S"]], "W": [["D"], ["S", "P", "R"]], "D": [["S", "P", "R"], ["W"]] }
        return moves[move]
    }

    randomCounterMove(gamestate) {
        // console.log(gamestate)
        let move = gamestate['rounds'][gamestate['rounds'].length - 2]['p2']
        let counterMoves = this.counterMove(move)[1]
        if(counterMoves.length == 1) {return counterMoves[0]}
        else if(counterMoves.length == 3) {
            return this.randomMove(3)
        }
        else {
            let n = Math.floor((Math.random)*600);
            if(n < this.dynamiteCount) {
                this.dynamiteCount -= 1
                return "D"
            }
            else { return counterMoves[1]}
        }
    } 

    randomMove(num) {
        let n = Math.floor((Math.random() * num))
        //console.log("RPSDW"[n])
        return "RPSDW"[n]
    }

    makeMove(gamestate) {
        if(gamestate['rounds'].length < 3) {return this.randomMove(3)}
        else {
            return this.randomCounterMove(gamestate)
        }
    }
}

module.exports = new Bot();
