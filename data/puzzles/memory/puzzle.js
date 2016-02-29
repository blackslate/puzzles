"use strict"

;(function puzzleLoaded(puzzle){

  function Puzzle() {
    this.name = "Memory"
  }

  Puzzle.prototype.initialize = function initialize() {
    var game   = document.querySelector("article div")
    var flash  = document.querySelector("div.flash")
    var random = getShuffleOrder(20)
    var selector = "article div img, article div span"
    var backs = [].slice.call(document.querySelectorAll(selector))
    var swapTime = 1000 // <HARD-CODED>
    var turned = []
    var path = "data/puzzles/memory/img/"
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
    var reshuffle

    ;(function loadImages(){
      var remaining = cards.length
      var image
        , span

      document.addEventListener("windowResized", windowResized, false)
     
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
            cards[index] = {content:image, type:"image", value:name}
            span = document.createElement("span")
            span.innerHTML = name
            cards.push({ content: span, type: "span", value: name })       
          }

          if (!remaining) {
            windowResized() 
            startGame()
          }
        }

        function cancelPuzzle() {
          alert("Images haven't loaded. Try again.")
        }
      })

      function windowResized(event) {
        var rect = game.getBoundingClientRect()
        var width = rect.width
        var cardData
          , card

        for (var ii in cards) {
          cardData = cards[ii]
          if (cardData.type === "span") {
            card = cardData.content
            card.style.fontSize = (width * 0.18) + "px"
          }
        }
      }
    })()

    function startGame() {
      var ii
        , element

      turnAllCards(backs)
      applyShuffle(cards, random)
      pairs = {}
      turned.length = 0

      for (var ii in cards) {
        element = cards[ii].content
        element.classList.remove("dimmed")
        element.classList.remove("found")
      }

      enableAction(checkCard)
    }

    function checkCard(event) {
      var back = event.target
      if (!back.classList.contains("back")) {
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
        var match = pairs[data.value]
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
          disableActions()
          setTimeout(showGameComplete, 1000)
        }
      }

      function prepareToTurnCard(back, index) {
        data = cards[index]
        data.index = index
        data.back = back
        turned.push(data)
      }

      function turnCard() {
        logCard(data)
        game.replaceChild(data.content, data.back)
      }

      function logCard(data) {
        var match = pairs[data.value]
        if (!match) {
          match = []
          pairs[data.value] = match
        }
        if (match.indexOf(data.type) < 0) {
          match.push(data.type)
        }
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
        var value = source.value

        if (pairs[value].length === 2) {
          // The matching card has already been seen
          return showError()
        }

        source.content.classList.add("swap")
        target.content.classList.add("swap")

        disableActions()

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
          source.content.style.removeProperty("left")
          source.content.style.removeProperty("top")
          target.content.classList.remove("swap")
          target.content.style.removeProperty("left")
          target.content.style.removeProperty("top")
          turnCard()

          enableAction(checkCard)
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
            flash.classList.add("hidden")
            // Wait for click
            enableAction(reshuffle)
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

          reshuffle = function reshuffle() {
            var startTime = + new Date()
            var offsets
            var elapsed
              , done
              , back
              , ii
              , style

            disableActions()
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

            random = getShuffleOrder(20)

            offsets = positions.map(function(startPosition, index) {
              index = random[index]
              position = { 
                x: positions[index].x - startPosition.x
              , y: positions[index].y - startPosition.y
              }
              
              return position
            })

            return offsets
          }
        }
      }
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

    function getShuffleOrder(count) {
      var array = []
      for (var ii = 0; ii < count; ii += 1) {
        array.push(ii)
      }
      return shuffle(array)
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

      return array
    }

    function applyShuffle(array, random) {
      var offset = random.length
      random.forEach(function(randomIndex) {
        offset -= 1
        array[randomIndex + offset] = array.shift()
      })
    }

    function showGameComplete() {
      door.classList.add("hidden")
      game.appendChild(door)

      setTimeout(function () {
        door.classList.remove("hidden")
      }, 100)
      puzzle.completed(puzzle.hash)
    }

    function disableActions() {
      game.onmousedown = game.ontouchstart = null
      game.classList.add("disabled")
    }

    function enableAction(action) {
      game.onmousedown = game.ontouchstart = action
      game.classList.remove("disabled")
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