;(function puzzleLoaded(puzzle){
  // puzzle = { map: { <hash>: <object>, ... }, hash: <string> }
  
  function Puzzle() {
    this.name = "Safe"
  }

  Puzzle.prototype.initialize = function initialize() {
    var body = document.body
    var safe = document.querySelector("div.safe")
    var canvas = document.querySelector("canvas")
    var context = canvas.getContext("2d")
    var pad = document.querySelector("div.keypad")
    var hot = document.querySelector(".hot")
    var dot = new Image()
    // Expected to be twice the size of a keypad button
    var glow = new Image()  // becomes src of image
    // Expected to be 3x2 x the size of a keypad button for 2x1 reset
    var reset = new Image() // becomes src of image
    // <HARD-CODED>
    var FRAMES = 9
    var SOURCE = "data/puzzles/safe/img/safe.jpg"
    var DELAY = 100
    // </HARD-CODED>
    var frame = 0
    var remaining = 4
    var OVERLAP = 2
    var COLUMNS = 53
    var ROWS = 7
    var FILL_COLOUR = "#000"
    var dotArray = []
    var plainText = ""
    var animationImages = []
    var offset
      , width
      , height
      , timeout
      , glowOffset
      , resetOffset

    var letterMap = {
      a: [124, 18, 17, 18,124]
    , b: [ 65,127, 73, 73, 54]
    , c: [ 62, 65, 65, 65, 65]
    , d: [ 65,127, 65, 65, 62]
    , e: [127, 73, 73, 73, 65]
    , f: [126,  9,  9,  1,  1]
    , g: [ 62, 65, 73, 73,121]
    , h: [127,  8,  8,  8,127]
    , i: [  0, 65,127, 65,  0]
    , j: [ 32, 64, 65, 63,  1]
    , k: [127,  8, 12, 18, 97]
    , l: [127, 64, 64, 64, 64]
    , m: [127,  2, 12,  2,127]
    , n: [127,  4,  8, 16,127]
    , o: [ 62, 65, 65, 65, 62]
    , p: [127,  9,  9,  9,  6]
    , q: [ 62, 65, 81, 33, 94]
    , r: [127,  9, 25, 41, 70]
    , s: [ 38, 73, 73, 73, 50]
    , t: [  1,  1,127,  1,  1]
    , u: [ 63, 64, 64, 64, 63]
    , v: [ 31, 32, 64, 32, 31]
    , w: [127, 16, 14, 16,127]
    , x: [ 99, 20,  8, 20, 99]
    , y: [  3,  4,120,  4,  3]
    , z: [ 97, 81, 73, 69, 67]
    , "?": [6,  1, 81,  9,  6]
    , " ": [0, 0] // + 0 after previous, + 0 after space 
    }

    ;(function prepareAnimation(){
      var image = new Image()
      var width
        , height
      image.onload = imageLoaded
      image.src = SOURCE

      function imageLoaded() {
        width = image.width
        height = image.height
        safe.style.backgroundImage = "url(" + SOURCE + ")"
        refreshSafe()
        safe.style.opacity = "1"
        checkIfAllAreLoaded()
      }

      window.addEventListener("resize", refreshSafe, false)
      window.addEventListener("orientationchange", updateSafe, false)
    })()

    function refreshSafe() {
      var rect = safe.getBoundingClientRect()
      var width = rect.width
      var offset = (-width * frame) + "px 0px"
      safe.style.backgroundSize = (width * FRAMES) + "px "
                                + (rect.height) + "px "
      safe.style.backgroundPosition = offset
    }

    function updateSafe () {
      setTimeout(refreshSafe, 100)
    }

    function startAnimation() {
      hot.classList.add("hidden")
      animateDoor()
    }

    function animateDoor() {
      if (++frame < FRAMES - 1) {
        setTimeout(animateDoor, DELAY)
      } else {
        puzzle.completed(puzzle.hash) 
      }
      refreshSafe()
    }

    function checkIfAllAreLoaded() {
      remaining -= 1
      if (!remaining) {
        prepareGlow()
        setupDotMatrix()
      }
    }

    function prepareGlow() {
      glowOffset = { x: glow.width >> 1, y: glow.height >> 1 }
      resetOffset = { x: reset.width >> 1, y: reset.height >> 1 }
      glow = glow.src
      reset = reset.src
    }

    function setupDotMatrix() {
      var diameter = dot.width
      offset = diameter - OVERLAP
      
      width = ((diameter-OVERLAP) * COLUMNS) + (2 * OVERLAP)
      height = ((diameter-OVERLAP) * ROWS) + (2 * OVERLAP)
      canvas.width = width
      canvas.height = height

      clearCanvas()
      startScrolling(false)
    }

    function clearCanvas() {
      context.beginPath()
      context.rect(0, 0, width, height)
      context.fillStyle = FILL_COLOUR
      context.fill()
    }

    function startScrolling(clear) {
      loadDotArray ("       Do you know the password?", clear)
      var minLength = 53

      ;(function scroll(){
        if (dotArray.length > minLength) {
          timeout = setTimeout(scroll, 50)
        } else {
          timeout = setTimeout(startScrolling, 5000)
        }

        displayArray()
        dotArray.shift()
      })()
    }

    function stopScrolling() {
      if (timeout) {
        clearTimeout(timeout)
        timeout = 0
      }
    }

    function loadDotArray(string, clear) {
      if (clear) {
        dotArray.length = 0
      }
      var ii
        , total
        , char
        , letterArray

      string = string.toLowerCase()
      for (ii = 0; char = string.charAt(ii); ii += 1) {
        letterArray = letterMap[char]
        if (letterArray) {
          letterArray.forEach(function (column) {
            dotArray.push(column)
          })
          dotArray.push(0) // gap between letters
        }
      }

      dotArray.pop() // last 0
    }

    function displayArray() {
      var count = Math.min(COLUMNS, dotArray.length)
      var left = -offset
      var top 
        , ii
        , column

      clearCanvas()

      for (ii = 0; ii < count; ii += 1) {
        left += offset
        top = 0

        column = dotArray[ii] // integer 0-127
        while (column) {
          if (column % 2) {
            context.drawImage(dot, left, top);
          }
          column >>= 1
          top += offset
        }
      } 
    }

    function typeInLED(event) {
      var keyCode = event.keyCode
      var letter

      stopScrolling()

      if (keyCode === 13) {
        plainText = ""
        return startScrolling(true)
      }

      letter = String.fromCharCode(keyCode).toLowerCase()

      if (letterMap[letter]) {
        loadDotArray(letter, !plainText.length)
        dotArray.push(0)
        plainText += letter

        while (dotArray.length > 54) {
          dotArray.shift()
        }
        displayArray()

        if (checkPassword()) {
          showSolution()
        }
      }
    }

    function typeOnPad(event) {
      var rect = event.target.getBoundingClientRect()
      // <HARD-CODED pad size>
      var COLUMNS = 7
      var ROWS = 4

      var columnWidth = rect.width / COLUMNS
      var rowHeight = rect.height / ROWS
      var clientLoc = getClientLoc(event)
      var column = Math.floor((clientLoc.x-rect.left) / columnWidth)
      var row = Math.floor((clientLoc.y - rect.top) / rowHeight)
      var keyCode = row * COLUMNS + column // A=0 ... Z=25

      row = 100 * (row - 0.5) / ROWS
      column = 100 * (column - 0.5) / COLUMNS

      if (keyCode > 25) {
        typeInLED({ keyCode: 13 })
        showGlow(reset, 450 / COLUMNS, row, true) // is reset
      } else {
        keyCode += 97
        typeInLED({ keyCode: keyCode })      
        showGlow(glow, column, row)
      }

      body.onmouseup = body.ontouchend = body.ontouchcancel = hideGlow
    }

    function showGlow(src, left, top, reset) {
      hot.src = src
      hot.style.left = left + "%"
      hot.style.top = top + "%"

      hot.classList.remove("hidden")

      if (reset) {
        hot.classList.add("reset")
      } else {
        hot.classList.remove("reset")
      }
    }

    function hideGlow() {
      hot.classList.add("hidden")
      body.onmouseup = body.ontouchend = body.ontouchcancel = null
    }

    function showSolution() {
      pad.onmousedown = pad.ontouchstart = null
      pad.parentNode.removeChild(pad)
      canvas.parentNode.removeChild(canvas)
      setTimeout(startAnimation, 1000)
    }

    function checkPassword () {
      // Hi there! There is a much easier way to find the answer :)
      // If you still want to do it the hard way, here's a clue:
      // https://www.google.com/webhp#q=encrypt+0x9E3779B9
      return (encrypt(plainText, "salt") === "ÕÄAì`M")
    }

    function encrypt(n,t){if(0==n.length)return"";var r=strToLongs(n.utf8Encode()),o=strToLongs(t.utf8Encode().slice(0,16));r.length;r=encode(r,o);var e=longsToStr(r);return e}function encode(n,t){n.length<2&&(n[1]=0);for(var r,o,e=n.length,c=n[e-1],f=n[0],u=0x9E3779B9,a=Math.floor(6+52/e),g=0;a-- >0;){g+=u,o=g>>>2&3;for(var h=0;e>h;h++)f=n[(h+1)%e],r=(c>>>5^f<<2)+(f>>>3^c<<4)^(g^f)+(t[3&h^o]^c),c=n[h]+=r}return n}function strToLongs(n){for(var t=new Array(Math.ceil(n.length/4)),r=0;r<t.length;r++)t[r]=n.charCodeAt(4*r)+(n.charCodeAt(4*r+1)<<8)+(n.charCodeAt(4*r+2)<<16)+(n.charCodeAt(4*r+3)<<24);return t}function longsToStr(n){for(var t=new Array(n.length),r=0;r<n.length;r++)t[r]=String.fromCharCode(255&n[r],n[r]>>>8&255,n[r]>>>16&255,n[r]>>>24&255);return t.join("")}"function"!=typeof String.prototype.utf8Encode&&(String.prototype.utf8Encode=function(){return unescape(encodeURIComponent(this))});

    // Initialize when all images have been loaded
    dot.onload = glow.onload = reset.onload = checkIfAllAreLoaded
    dot.src = "data/puzzles/safe/img/dot.png" // expected to be square
    glow.src = "data/puzzles/safe/img/glow.png"
    reset.src = "data/puzzles/safe/img/reset.png"
    
    // Allow user input
    document.body.addEventListener("keypress", typeInLED, false)
    pad.onmousedown = pad.ontouchstart = typeOnPad
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