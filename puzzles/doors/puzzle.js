;(function puzzleLoaded(puzzle){
  // puzzle = { map: { <hash>: <object>, ... }, hash: <string> }
  
  function Puzzle() {
    this.name = "Doors"
  }

  Puzzle.prototype.initialize = function initialize() {
    console.log("Puzzle '" + this.name + "' initialized")

    var article = document.querySelector("article")
    var xlinkNS = "http://www.w3.org/1999/xlink"
    var states = [
      0, 0, 0, 0
    , 0, 0, 0, 0
    , 0, 0, 0, 0
    , 0, 0, 0, 0
    ]
    // var corners = [0, 3, 12, 15]
    // var edges = [1, 2, 4, 7, 8, 11, 13, 14]
    // var centres = [ 5, 6, 9, 10]
    var effects = {
      0: [     1,  2,  3
         , 4,  5
         , 8,     10
         ,12,         15]
    , 1: [ 0,      2,  3
         ,     5
         ,     9
         ,    13        ]
    , 2: [ 0,  1,      3
         ,         6
         ,        10
         ,        14    ]
    , 3: [ 0,  1,  2
         ,         6,  7
         ,     9,     11
         ,12,         15]
    , 4: [ 0
         ,     5,  6,  7
         , 8
         ,12             ]
    , 5: [ 0,  1,  2
         , 4,      6
         , 8,  9, 10
                     ]
    , 6: [     1,  2,  3
         ,     5,      7
         ,     9, 10, 11
                        ]
    , 7: [             3
         , 4,  5,  6
         ,            11
         ,            15]
    , 8: [ 0
         , 4
         ,     9, 10, 11
         ,12            ]
    , 9: [
         , 4,  5,  6
         , 8,     10
         ,12, 13, 14]
    , 10:[ 
         ,     5,  6,  7
         ,     9,     11
         ,    13, 14, 15]
    , 11:[             3
         ,             7
         , 8,  9, 10
         ,            15]
    , 12:[ 0,          3
         , 4,      6
         , 8,  9
         ,    13, 14, 15]
    , 13:[     1
         ,     5
         ,     9
         ,12,     14, 15]
    , 14:[         2
         ,         6
         ,        10
         ,12, 13,     15]
    , 15:[ 0,          3
         ,     5,      7
         ,        10, 11
         ,12, 13, 14    ]
    }
    var doors = []

    ;(function resizeHeader(){
      var header = document.querySelector("h1")
      document.addEventListener("windowResized", windowResized, false)

      function windowResized(event) {
        var rect = header.getBoundingClientRect()
        var width = rect.width
        header.style.fontSize = (width * 0.035) + "px"
      }

      windowResized()
    })()

    ;(function (){
      var use = document.querySelectorAll("svg>use")
      for (var ii = 0, door; door = use[ii]; ii += 1) {
        doors.push(door)
      }
    })()

    article.onmouseup = article.ontouchend = openDoors

    function openDoors(event) {
      var target = event.target
      var index
      var effect

      if (target.correspondingUseElement) {
        // This is SVG, and we're in Internet Explorer
        target = target.correspondingUseElement
      } else {
        while (target && target.nodeName.toLowerCase() !== "use") {
          target = target.parentNode
        }

        if (!target) {
          return
        }
      }

      index = doors.indexOf(target)
      effect = effects[index]
      effect.forEach(function (index) {
        var door = doors[index]
        var state = !states[index]
        states[index] = state
        var element
        if (state) {
          element = "#open"
        } else {
          element = "#shut"
        }

        door.setAttributeNS(xlinkNS, "xlink:href", element)
      })

      if (states.every(function (value) {
        return value
      })) {
        showResult()
      }
    }

    function showResult() {
      article.onmouseup = article.ontouchend = null
      <!-- body.style.backgroundColor = "#fff" -->

      var svgNS = "http://www.w3.org/2000/svg"
      var svg = document.querySelector("svg")
      var opacity = 1

      var text = document.createElementNS(svgNS,"use")
      text.setAttributeNS(xlinkNS, "xlink:href", "#text")
      text.setAttribute("fill", "currentColor")
      svg.appendChild(text)

      var doors = document.querySelectorAll("use[id]")

      ;(function fadeToWhite(){
        opacity -= 0.01

        for (var ii = 0, door; door = doors[ii]; ii += 1 ) {
          door.style.opacity = String(opacity)
        }

        if (opacity > 0) {
          setTimeout(fadeToWhite, 20)
        }
      })()
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
