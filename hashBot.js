class Bot {
    // for a given coefficient, the bot weights the moves that have occured previously based on certain patterns

    constructor() {
        this.score = [0,0]
        this.oppoDynamiteCount = 100 // can be used to analysis how to force the opponent to use the dynamite
        this.dynamiteCount = 100
        this.history = ""
        this.currentTurn = 1
        this.hashHistory = {}
    }

    recordGame(move){
        this.history += (move['p1']+move['p2']);
        if(move['p1'] == move['p2']) {
            this.currentTurn += 1
        }
        else{
            
            let counter = this.counterMove(move['p1'])
            if(counter[0].includes(move['p2'])) {
                this.score[0] += this.currentTurn
            }
            else {this.score[1] += this.currentTurn}
            this.currentTurn = 1
        }
        if(move['p1'] == 'D') { this.dynamiteCount -= 1}
        if(move['p2'] == 'D') { this.oppoDynamiteCount -= 1}
    }


    counterMove(move) {
        let moves = { "R": [["S", "W"], ["D", "P"]], "S": [["P", "W"], ["D", "R"]], "P": [["R", "W"], ["D", "S"]], "W": [["D"], ["S", "P", "R"]], "D": [["S", "P", "R"], ["W"]] }
        return moves[move]
    }

    randomCounterMove(gamestate) {
        // console.log(gamestate)
        let move = gamestate['rounds'][gamestate['rounds'].length -3]['p2']
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

    // RPSDW
    randomMove(num) {
        let n = Math.floor((Math.random() * num * 19980811)) % num
        //console.log("RPSDW"[n])
        return "RPSDW"[n]
    }

    hashGame(coefficient) {
        if(this.history.length >= 4) {
            let prediction = this.history[this.history.length-1]
            let weight = 1
            for(let i = (this.history.length-4)/2; i >= Math.max(0,(this.history.length-104)/2);  i --) {
                let str = this.history.slice(2*i, this.history.length -2)
                if(this.hashHistory[str] === undefined) {
                    this.hashHistory[str] = {prediction: weight}
                }
                else if(this.hashHistory[str][prediction] === undefined) {
                    this.hashHistory[str][prediction] = weight
                }
                else {
                    this.hashHistory[str][prediction] += weight
                }
                weight *= coefficient
            }
        }
    }

    probability() {
        let weigh = {}
        let totalWeigh = 0
        for(let move of "RPSDW") {
            let weight = 0
            for(let i = (this.history.length-2)/2; i >= Math.max(0, (this.history.length-102)/2);  i --) {
                let str = this.history.slice(2*i, this.history.length)
                if(this.hashHistory[str] !== undefined && this.hashHistory[str][move] !== undefined) {
                    weight += this.hashHistory[str][move] // it might be a better idea to use Math.max or consider different segments separatedly
                }
            }
            weigh[move] = weight
            totalWeigh += weight
        }
        let prob = {}
        for(let move of "RPSDW") {
            prob[move] = weigh[move] / totalWeigh
        }
        return prob
    }

    // consider different equivalent classes: one is to win, the other is to draw
    move(prob) {
        let moveChance = {}
        for(let move of "RPSDW") {
            let chance = 0
            for(let counter of this.counterMove(move)[0]) {
                chance += prob[counter]
            }
            moveChance[move] = chance
        }
        let rand = Math.floor(Math.random()) * 0.75 + 0.25
        moveChance["D"] = moveChance["D"] * rand * this.distributeDynamite()
        let maxMove = "R"
        let likelihood = 0
        for( let move of "RPSDW") {
            if(moveChance[move] > likelihood) {
                likelihood = moveChance[move]
                maxMove = move
            }
        }
        return maxMove
    }

    distributeDynamite() {
        let max = Math.max(this.score[0], this.score[1])
        let remainingGames = (this.score[0] + this.score[1]) * (1000 / max - 1) 
        let dynamiteProb = 1 / (remainingGames / this.dynamiteCount)
        return dynamiteProb
    }

    makeMove(gamestate) {
        if(gamestate['rounds'].length < 5) { return this.randomMove(3)}
        // console.log(gamestate['rounds'])
        this.recordGame(gamestate['rounds'][gamestate['rounds'].length -1])
        this.hashGame(1)
        let prob = this.probability()
        return this.move(prob)
    }
}

module.exports = new Bot();
