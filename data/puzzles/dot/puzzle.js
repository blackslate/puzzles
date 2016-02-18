;(function puzzleLoaded(puzzle){

  function Puzzle() {
    this.name = "Template"
  }

  var timeouts = []

  Puzzle.prototype.initialize = function initialize() {
    var password = "trust"
    var index = 0
    var counter = 0
    var body = document.body
    var article = document.querySelector("article")
    var lockArray = getCollection("path.lock")
    var floorArray = getCollection("path.floor")
    var keyArray = getCollection("g.keys rect")
    var lightArray = getCollection("g.lights circle")
    var shadowArray = getCollection("polygon.shadow")
    var rstuArray = getCollection("g.rstu path")
    var rstuMap = {}
    var floorMap = [41, 44, 46]
    var degToRad = Math.PI / 180
    var fadeDuration = 5000
    var lightOpacity = 0.5
    var animation = "eight"

    floorArray.sort(function (a, b) {
      return a.getBoundingClientRect().width
            - b.getBoundingClientRect().width
    })
    rstuArray.forEach(function (rstu) {
      rstu.setAttribute("opacity", "0")
      var letter = rstu.className.animVal
      rstuMap[letter] = rstu
    })

    article.onmousedown = article.ontouchstart = pressKey

    function pressKey(event) {
      event.preventDefault()
      var target = event.target
     
      if (keyArray.indexOf(target) < 0) {
        return
      }

      target.setAttribute("opacity", "0.1")

      var id = target.className.animVal
      var reset = id === "reset"
      var expected = password[index]
      var wrong = index !== counter || id.indexOf(expected) < 0
      var letter // set in loosen()

      if (!id || reset || wrong) {
        lightenLock(0)
        startEightAnimation()
        if (reset) {
          resetLighting()
        }

      } else {
        loosen()
      }

      body.onmouseup = body.ontouchend= releaseKey

      function releaseKey() {
        body.onmouseup = body.ontouchend = null

        target.setAttribute("opacity", "0")
        if (letter) {
          if (index < 2) {
            fadeOut(letter)
          } else {
            letter.setAttribute("opacity", "0")         
          }
        }

        if (!reset) {
          lightArray[counter++].setAttribute("opacity", String(lightOpacity))
        }

        if (counter === 5) {
          checkPassword()
        }
      }

      function fadeOut(letter) {
        var fullFadeTime = + new Date() + fadeDuration
        var remaining
          , opacity

        ;(function fade(){
          var remaining = fullFadeTime - new Date()
          if (remaining > 0) {
            opacity = (remaining / fadeDuration) * lightOpacity
            setTimeout(fade)
          } else {
            opacity = 0
          }

          letter.setAttribute("opacity", String(opacity))
        })()
      }

      function loosen(){
        if (!index) {
          document.querySelector(".eight").endElement()
          enclosedAnimation("beginElement")
        }
        
        letter = rstuMap[expected]
        letter.setAttribute("opacity", String(lightOpacity))
        lightenLock(index + 1)
      }

      function lightenLock(security) {
        index = security

        lockArray.forEach(function (lock, rank) {
          var value = Number(5 * index * (rank + 1))
          var color

          if (value < 16) {
            color = "0" + value.toString(16)
          } else {
            color = value.toString(16)
          }

          color = "#" + color  + color  + color
          lock.setAttribute("fill", color)
        })
      }

      function checkPassword() {
        if (index === 5) {
          openLock()
        } else {
          resetLighting()
        }
      }

      function resetLighting() {
        counter = 0

        lightArray.forEach(function (key) {
          key.setAttribute("opacity", "0")
        })
        
        lightenLock(0)
      }

      function openLock() {
        var startMS = + new Date()
        var duration = 10000
        var totalDegrees = 100
        var openDegrees = 48.5
        var elapsed
          , degrees
          , transform
          , floor
          , animations
          , total

        article.onmousedown = article.ontouchstart = body.onmouseup = body.ontouchend = null

        // Fade the keypad while the doors are opening
        document.querySelector("article img").classList.add("fade")
        document.querySelector("svg.keypad").classList.add("fade")

        activateDot()

        // When doors are open, start the zoom
        timeouts.push(setTimeout(function () {
          animations = document.querySelectorAll("animate.fade")
          total = animations.length
          for (var ii = 0; ii < total; ii += 1) {
            animations[ii].beginElement()
          }
          document.querySelector("path.white").setAttribute("opacity", "1")
          document.querySelector("article").classList.add("fade")

          animations = document.querySelectorAll(".escape")
          total = animations.length
          for (var ii = 0; ii < total; ii += 1) {
            animations[ii].beginElement()
          }

          animation = document.querySelector(".heartbeat")
          animation.setAttribute("dur", "1200ms")
          animation.setAttribute("values", "0.5;19;0.5")

          timeouts.push(setTimeout(function () {
            document.querySelector(".free").beginElement()
            puzzle.completed(puzzle.hash)
          }, 4000))
        }, 5000))

        function activateDot() {
          var dot = document.querySelector(".dot")

          enclosedAnimation("endElement")
          animation = document.querySelector(".heartbeat")
          animation.setAttribute("dur", "600ms")
          animation.setAttribute("values", "0.3;0.9;0.3")

          dot.setAttribute("transform", "translate(1400 2850)")
          document.querySelector(".wait").beginElement()
        }

        ;(function rotateLocks(){
          elapsed = new Date() - startMS
          degrees = totalDegrees

          if (elapsed < duration) {
            degrees *= elapsed / duration
            timeouts.push(setTimeout(rotateLocks, 16))
          }
        
          if (degrees > floorMap[0]) {
            floorMap.shift()
            floor = floorArray.shift()
            floor.setAttribute("opacity", "1")
          }

          if (degrees > openDegrees) {
            openShadow(degrees - openDegrees)
          }
          
          lockArray.forEach(function (lock, index) {
            if (index % 2) {
              transform = "rotate(" + -degrees + " 1030 -1060)"
            } else {
              transform = "rotate(" + degrees + " 1030 -1060)"
            }

            lock.setAttribute("transform", transform)
          })
        })()

        function openShadow(degrees) {
          var xRange = 12000
          var xAdjust = 290 // 1300 - 1030
          var sine = Math.sin(degrees * degToRad)
          var cosine = Math.cos(degrees * degToRad)
          // lower shadow, with point at radius 940
          var doorRadius = 940
          var x = doorRadius * cosine - xAdjust
          var y = doorRadius * sine
          y = Math.min(26500, 2500 + (xRange * y / x))
          var points = "1300,2500 13300,"+y+" 13300,26500"
          shadowArray[0].setAttribute("points", points)  

          doorRadius = 1030
          x = doorRadius * cosine - xAdjust   
          y = doorRadius * sine
          y = Math.max(-21500, 2500 - (xRange * y / x))
          points = "1300,2500 13300,"+y+" 13300,-21500"
          shadowArray[1].setAttribute("points", points)
        }
      }
    }

    function startEightAnimation() {
      if (animation === "eight") {
        return
      }
      enclosedAnimation("endElement")
      document.querySelector(".eight").beginElement()
    }

    function enclosedAnimation(state) {
      var animations = document.querySelectorAll(".enclosed")
      var total = animations.length
      for (var ii = 0; ii < total; ii += 1) {
        animations[ii][state]()
      }

      animation =  (state === "beginElement") ? "enclosed" : "eight"
    }

    function getCollection(selector) {
      var collection = document.querySelectorAll(selector)
      var total = collection.length
      var g
      var array = []

      for (var ii = 0; ii < total; ii += 1) {
        g = collection[ii]
        if (g.id !== "secrets") {
          array.push(g)
        }
      }

      return array
    }

    function rotateLocks(degrees){         
      lockArray.forEach(function (lock, index) {
        if (index % 2) {
          transform = "rotate(" + -degrees + " 1030 -1060)"
        } else {
          transform = "rotate(" + degrees + " 1030 -1060)"
        }

        lock.setAttribute("transform", transform)
      })
    }
  }

  Puzzle.prototype.kill = function kill() {
    // Clean up when puzzle is about to be replaced
    for (var ii in timeouts) {
      clearTimeout(timeouts[ii])
    }
  }

  if (typeof puzzle.hash === "string") {
    if (typeof puzzle.map === "object") {
      var object = puzzle.map[puzzle.hash] = new Puzzle()
    }
  }
})(window.puzzle) // <HARD-CODED global object>