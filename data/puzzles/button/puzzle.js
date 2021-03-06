;(function puzzleLoaded(puzzle){
  // puzzle = { map: { <hash>: <object>, ... }, hash: <string> }
  
  function Puzzle() {
    this.name = "Button"
  }

  Puzzle.prototype.initialize = function initialize() {
    var svg = document.querySelector("svg.circle")
    var panic = document.querySelector("#panic")
    var div = document.querySelector("div")
    var red = document.querySelector("div#red")

    panic.classList.remove("panic")
    div.classList.remove("show")
    div.classList.remove("fade")
    red.classList.remove("show")
    
    svg.onmouseup = svg.ontouchstart = pressButton
    div.addEventListener("transitionend", puzzleComplete, false)
   
    function pressButton(event) {
      var rect = svg.getBoundingClientRect()
      var cX = (rect.left + rect.right) / 2
      var cY = (rect.top + rect.bottom) / 2
      var r = (rect.width / 2)
      var dX = cX - event.pageX
      var dY = cY - event.pageY
      if ((dX * dX + dY * dY) > r * r) {
        return
      }

      svg.onmouseup = svg.ontouchstart = null
      svg.parentNode.removeChild(svg)
      panic.classList.add("panic")
      div.classList.add("show")
      div.classList.add("fade")
      red.classList.add("show")
      
      setTimeout(function () {
        red.classList.remove("show")
      }, 40)
    }

    function puzzleComplete(event) {
      puzzle.completed(puzzle.hash)
    }
  }

  Puzzle.prototype.kill = function kill() {
    // Clean up when puzzle is about to be replaced
  }

  if (typeof puzzle.hash === "string") {
    if (typeof puzzle.map === "object") {
      var object = puzzle.map[puzzle.hash] = new Puzzle()
    }
  }
})(window.puzzle) // <HARD-CODED global object>