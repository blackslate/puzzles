"use strict"

/*
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
* Limit the number of turns to 19: 9 errors and 10 right answers.
* This is the maximum number of errors consistent with a methodic
* approach.
* 
* If the user turns a card that has already been turned without making
* a pair then
* - turn the cards face-up, dimmed
* - highlight one pair that the user has not yet matched
* - wait for a click
* - turn the cards face dow
* - reshuffle them. 
*
* => remember which pairs have been matched in local storage
* => remember which cards have been turned in this game
* => when a matched pair is not found, check if either card has
*    already been turned. If so:
*    - count one error
* => If the match for the first card has already been seen:
*    - flash
*    - show all cards, dimmed
*    - show the correct position of the match for the first card
*    - if the match for the second card has already been seen
*      - wait for click; show the second match
*    - wait for a click
*    - reshuffle
*
* The user may not be aware of which cards form a pair. Showing the pair and then restarting the game means that the player could take a maximum of 10 turns to discover all the pairs.
*
* Interrupt the game if:
* - You have already seen a match for the first card but you
*   click on a different card.
*
* => Detect which cards have been seen in this game
* => Create pairs
* => Check if first card turned has a match
* => Interrupt game if second card is not that match
*/

var showGameComplete

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
    var flash  = document.querySelector("div.flash")
    var shadow = document.createElement("div")
    var selector = "article div img, article div span"
    var backs = [].slice.call(document.querySelectorAll(selector))
    var swapTime = 1000 // <HARD-CODED>
    var turned = []
    var path = "img/"
    var back = "bk.jpg"
    var door = "door.jpg"
    var cards = [ // becomes array of images and spans
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
    , door
    ]
    var pairs = {} // x.ext: 0, y: 0, z.ext: z

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
          var fileName = image.src.split("/").pop()
          remaining -= 1

          if (fileName === back) {
            cards.splice(cards.indexOf(back), 1)
            back = image
          } else if (fileName === door) {
            cards.splice(cards.indexOf(door), 1)
            door = image
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
      var ii
        , element

      shuffle(cards)
      pairs = {}
      turned.length = 0

      for (var ii in cards) {
        element = cards[ii].content
        element.classList.remove("dimmed")
        element.classList.remove("found")
      }

      game.onmousedown = game.ontouchstart = checkCard
    }

    function checkCard(event) {
      var back = event.target
      if (!back.src || back.src.split("/").pop() !== "bk.jpg") {
        // Click was not on a card with its back showing
        return
      }

      var data // set in the next line
      prepareToTurnCard(back, backs.indexOf(back))

      switch (turned.length) {
        case 1:
          turnCard()
        break
        case 2:
          turnCard()
          if (data.value === turned[0].value) {
            // Fade the matching cards
            setTimeout(cardsMatch, 0)
          } else {
            console.log("No match")
          }
        break
        default:
          // The last two cards didn't match
          swapCards()
      }

      function cardsMatch() {
        var keys = Object.keys(pairs)
        var complete = keys.length === 10
        var info = getCardInfo(data)
        var match = pairs[info.value]
        var key

        match.found = true
        data.content.classList.add("found")
        turned[0].content.classList.add("found")
        turned.length = 0
 
        if (complete) {
          for(key in pairs) {
            if (!pairs[key].found) {
              complete = false
            }
          }
        }

        if (complete) {
          game.onmousedown = game.ontouchstart = null
          setTimeout(showGameComplete, 1000)
        }
      }

      function prepareToTurnCard(back, index) {
        data = cards[index]
        data.index = index
        data.back = back
        //backs[index] = data.content
        turned.push(data)
      }

      function turnCard() {
        logCard(data)
        game.replaceChild(data.content, data.back)
      }

      function logCard(data) {
        var info = getCardInfo(data)
        // { type:  <"7" | "7.xxg"
        // , value: 7 }
        var match = pairs[info.value]
        if (!match) {
          match = []
          pairs[info.value] = match
        }
        if (match.indexOf(info.type) < 0) {
          match.push(info.type) // ["7"] | ["xxg"] | ["7", "xxg"]
        }
      }

      /**
       * getCardInfo called by logCard() and swapCards()
       * @param  {[type]} data [description]
       * @return {[type]}      [description]
       */
      function getCardInfo(data) {
        var content = data.content
        var type = (content.src || content.innerHTML).split("/").pop()
        // "7" | "7.jpg" | "7.png" || "17" | "17.jpg" | "17.png"
        var value = parseInt(type, 10)
        // 7
        return { type: type, value: value }
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
        var value = getCardInfo(source).value

        if (pairs[value].length === 2) {
          // The matching card has already been seen
          return showError()
        }

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
          //backs[index] = target.back

          index = source.index
          cards[index] = target
          game.replaceChild(source.back, source.content)
          //backs[index] = source.back

          source.content.classList.remove("swap")
          source.content.style.cssText = ""
          target.content.classList.remove("swap")
          target.content.style.cssText = ""
          turnCard()

          game.onmousedown = game.ontouchstart = checkCard
        }

        function showError() {
          var match = getMatch()
          var cardElement
            , offsets

          // Flash
          flash.classList.remove("hidden")
          turnAllCards(cards)

          source.content.classList.remove("dimmed")
          match.content.classList.remove("dimmed")

          setTimeout(hideFlash, 20)

          function hideFlash() {
            var elements = document.querySelectorAll(selector)
            var index
            elements = [].slice.call(elements)

            flash.classList.add("hidden")
            // Wait for click
            game.onmousedown = game.ontouchstart = reshuffle
          }
          
          function getMatch() {
            var value = source.value
            var match = cards.reduce(function(previous, current) {
              if (current.value === value && current !== source) {
                return current
              } else {
                return previous
              }
            })

            return match
          }

          function turnAllCards(elements) {
            var element

            while (game.firstChild) {
              game.removeChild(game.firstChild);
            }
            for(var ii in elements) {
              element = elements[ii]

              if (element.content) {
                // Cards will be face-up
                element = element.content
                element.classList.add("dimmed")
              }

              game.appendChild(element)
            }
            game.appendChild(flash)
          }

          function reshuffle () {
            var startTime = + new Date()
            var offsets
            var elapsed
              , done
              , back
              , ii
              , style

            game.onmousedown = game.ontouchstart = null
            // Turn all cards back over
            turnAllCards(backs)
            // Move all cards to a new position
            offsets = getShuffleOffsets()
            
            ;(function shuffleCards(){
              elapsed = (+ new Date() - startTime) / swapTime
              if (elapsed > 1) {
                elapsed = 1
                done = true
              }

              if (!done) {
                for (var ii in backs) {
                  back = backs[ii]
                  style = "left:" + offsets[ii].x * elapsed + "px;"
                  style += "top:" + offsets[ii].y * elapsed + "px"
                  back.style.cssText = style
                }

                setTimeout(shuffleCards, 20)
              } else {
                // Return cards to their original places (but they'll
                // look as if they are dropping into their target
                // position)       
                for (var ii in backs) {
                  backs[ii].style.cssText = ""
                }

                startGame()
              }
            })()        
          }

          function getShuffleOffsets() {
            var shuffled = []
            var rect
              , position
              , offsets

            var positions = backs.map(function(back) {
              rect = back.getBoundingClientRect()
              position = { x: rect.left, y: rect.top }
              shuffled.push(position)
              return position
            })

            shuffle(shuffled)

            offsets = positions.map(function(startPosition, index) {
              position = { 
                x: shuffled[index].x - startPosition.x 
              , y: shuffled[index].y - startPosition.y
              }
              
              return position
            })

            return offsets
          }
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

    function showGameComplete() {
      door.classList.add("hidden")
      game.appendChild(door)

      setTimeout(function () {
        door.classList.remove("hidden")
      }, 100)
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