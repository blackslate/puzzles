window.puzzle = {
  map: {}
, hash: "test"
, completed: function () { console.log("Puzzle completed") }
}

setTimeout(function () {
  window.puzzle.map.test.initialize()
}, 0)

function getClientLoc(event) {
  var clientLoc = {}
  if (isNaN(event.clientX)) {
    clientLoc.x = event.targetTouches[0].clientX
    clientLoc.y = event.targetTouches[0].clientY
  } else {
    clientLoc.x = event.clientX
    clientLoc.y = event.clientY
  }

  return clientLoc
}

/*********** REMOVE ALL CODE ABOVE THIS LINE IN PRODUCTION **********/

;(function puzzleLoaded(puzzle){

  function Puzzle() {
    this.name = "Hexagons"
  }

  Puzzle.prototype.initialize = function initialize() {
    console.log("Puzzle '" + this.name + "' initialized")
    // Code goes here
    var article = document.querySelector("article")
    var canvas = document.createElement("canvas")
    var img = document.createElement("img")
    var sqrt3 = Math.sqrt(3)
    var width = sqrt3 * 2
    var hexagons = [
                                [8.0]
    , [8-sqrt3*3, 3], [8-sqrt3, 3], [8+sqrt3, 3], [8+sqrt3*3, 3]
    ,          [8-width, 6],    [8, 6],   [8+width, 6]
    , [8-sqrt3*3, 9], [8-sqrt3, 9], [8+sqrt3, 9], [8+sqrt3*3, 9]
    ,                           [8, 12]
    var source

    img.onload = function cookieCutter() {
      var width = img.width
      canvas.width = width
      canvas.height = img.height
      var trim = 2
      var radius = width / 2 - trim

      context = canvas.getContext("2d")
      context.beginPath()
      context.arc(radius,radius, radius,0,2*Math.PI);
      context.clip()
      context.drawImage(img, -trim, -trim)

      source = canvas.toDataURL()

      img.src = source
      img.onload = null
    }

    img.src = "img/image.jpg"
    //img.src = "data/puzzles/hex/img/image.jpg"

    article.replaceChild(img, article.children[0])

    puzzle.completed(puzzle.hash)
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
