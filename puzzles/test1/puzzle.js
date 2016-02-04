;(function puzzleLoaded(puzzle){
  // puzzle = { map: { <hash>: <object>, ... }, hash: <string> }
  
  function Puzzle() {
    this.name = "First Test"
  }

  Puzzle.prototype.initialize = function initialize() {
    console.log("Puzzle '" + this.name + "' initialized")
  }

  Puzzle.prototype.kill = function kill() {
    // Clean up when puzzle is about to be replaced
    console.log("Puzzle '" + this.name + "' killed")
  }

  if (typeof puzzle.hash === "string") {
    puzzle.map[puzzle.hash] = new Puzzle()
  }
})(window.puzzle) // <HARD-CODED global object>