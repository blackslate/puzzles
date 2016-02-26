/*
TO DO
* Swap cards if they don't match before turning the next one
* - Show them for a moment in the new position
* Decide on final image when puzzle is complete
* Decide what to do when two images match
* - Fade out instead of swapping places?
* 
* tea
* 3D
* 5 platonic solids
* 7th heaven
* 11 a side
* 13 = king
* 17 = 4^2 + 1^2
* 19 frets
* 23 = dice
* 29 = February = phoenix
*
* Why these connections?
*/

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
    this.name = "Memory"
  }

  Puzzle.prototype.initialize = function initialize() {
    var game   = document.querySelector("article div")
    var selector = "article div img, article div span"
    var elements = [].slice.call(document.querySelectorAll(selector))
    var turned = []
    var path = "img/"
    var back = "bk.jpg"
    var cards = [
      "2.jpg"
    ,  "3.jpg"
    ,  "5.png"
    ,  "7.jpg"
    , "11.jpg"
    , "13.png"
    , "17.jpg"
    , "19.jpg"
    , "23.jpg"
    , "29.jpg"
    , back
    ]

    ;(function loadImages(){
      var remaining = cards.length
      var image
        , span

      cards.forEach(function (name, index) {
        image = new Image()
        image.onload = checkForCompletion
        image.onerror = cancelPuzzle
        image.src = path + name
        name = parseInt(name, 10)

        function checkForCompletion(event) {
          var image = event.target
          remaining -= 1

          if (image.src.split("/").pop() === back) {
            back = image
            cards.pop()
          } else {            
            cards[index] = { content: image, value: name }
            span = document.createElement("span")
            span.innerHTML = name
            cards.push({ content: span, value: name })       
          }

          if (!remaining) { 
            startGame()
          }
        }

        function cancelPuzzle() {
          alert("Images haven't loaded. Try again.")
        }

      })
    })()

    function startGame() {
      shuffle(cards)
      // cards.forEach(function (card) {
      //   game.appendChild(card.content)
      // })
      game.onmousedown = game.ontouchstart = checkCard
    }

    function checkCard(event) {
      var card = event.target
      switch (card.tagName) {
        default: 
          return
        case "IMG":
        case "SPAN":
          // continue
      }

      var data
      elements.every(function (element, index) {
        if (element === card) {
          turnCard(element, index)
          return false
        }

        return true
      })

      switch (turned.length) {
        case 1:
          // do nothing
        break
        case 2:
          if (data.value === turned[0].value) {
            turned.length = 0
          } else {
            console.log("No match")
          }
        break
        default:
          turnFaceDown()
      }

      function turnCard(element, index) {
        elements[index] = element
        data = cards[index]
        data.index = index
        data.back = element
        turned.push(data)

        game.replaceChild(data.content, element)
      }

      function turnFaceDown() {
        var data = turned.shift()
        game.replaceChild(data.back, data.content)
        elements[data.index] = data.back
        var data = turned.shift()
        game.replaceChild(data.back, data.content)
        elements[data.index] = data.back
      }
    }

    function shuffle(array) {
      var current = array.length
        , swap
        , random
    
      while (current) {
        random = Math.floor(Math.random() * current--)
        swap = array[current];
        array[current] = array[random];
        array[random] = swap;
      }
    }
    
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