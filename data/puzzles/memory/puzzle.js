/*
TO DO
* Swap cards if they don't match before turning the next one
* - Show them for a moment in the new position
    get current element in nth place
    get its x,y coordinates
    get element in pth place
    get its x,y coordinates

    calculate delta x,y
    start a timeout
    calculate elapsed time
    calculate distance travelled: nth.x + elapsed.x : nth.x + delta.x - elapsed.x
    Apply this to each element

    Prevent mouse events during this time
    When movement is complete:
    - Show back in new position
    - Swap backs so that they are back in their elements order
*
* Decide on final image when puzzle is complete
* - All fades to black and then...?
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
* Add more images so that it is different each time after the first
* play.
*
* Second version where you must make pairs of socks, but if you make
* too many errors or are too slow, one (or two) sock(s from a
* different pair) will fade out while face down.
*
* Limit the number of turns to 20: 10 errors and 10 right answers,
* then turn the cards face-down and reshuffle them. 15-16 seem to be 
* best chance results. 
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
    var swapTime = 1000 // <HARD-CODED>
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
      elements.every(function findCard(element, index) {
        if (element === card) {
          prepareToTurnCard(element, index)
          return false
        }

        return true
      })

      if (!data) {
        console.log("Click on face up card: " + (card.src || card.innerHTML).split("/").pop())
        return
      }

      switch (turned.length) {
        case 1:
          turnCard()
        break
        case 2:
          turnCard()
          if (data.value === turned[0].value) {
            // Fade the matching cards
            setTimeout(function () {
              data.content.classList.add("found")
              turned[0].content.classList.add("found")
              turned.length = 0
            }, 0)
          } else {
            console.log("No match")
          }
        break
        default:
          // The last two cards didn't match
          swapCards()
      }

      function prepareToTurnCard(element, index) {
        data = cards[index]
        data.index = index
        data.back = element
        elements[index] = data.content
        turned.push(data)
      }

      function turnCard() {
        game.replaceChild(data.content, data.back)
      }

      function swapCards() {
        var source = turned.shift()
        var target = turned.shift()
        var sourceRect = source.content.getBoundingClientRect()
        var targetRect = target.content.getBoundingClientRect()
        var deltaX = targetRect.left - sourceRect.left
        var deltaY = targetRect.top - sourceRect.top
        var startTime = + new Date()
        var done = false

        source.content.classList.add("swap")
        target.content.classList.add("swap")

        game.onmousedown = game.ontouchstart = null

        ;(function exchangePlaces(){
          var elapsed = (+ new Date() - startTime) / swapTime
          if (elapsed > 1) {
            elapsed = 1
            done = true
          }

          var moveX = deltaX * elapsed
          var moveY = deltaY * elapsed
          source.content.style.left = moveX + "px"
          source.content.style.top = moveY + "px"
          target.content.style.left = -moveX + "px"
          target.content.style.top = -moveY + "px"

          if (done) {
            setTimeout(completeSwap, swapTime)
          } else {
            setTimeout(exchangePlaces, 20)
          }
        })()

        function completeSwap() {
          var index = target.index
          cards[index] = source
          game.replaceChild(target.back, target.content)
          elements[index] = target.back

          index = source.index
          cards[index] = target
          game.replaceChild(source.back, source.content)
          elements[index] = source.back

          source.content.classList.remove("swap")
          source.content.style.cssText = ""
          target.content.classList.remove("swap")
          target.content.style.cssText = ""
          turnCard()

          game.onmousedown = game.ontouchstart = checkCard
        }
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