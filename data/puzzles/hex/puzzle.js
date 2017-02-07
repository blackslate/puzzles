"use strict"

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
    var context = canvas.getContext("2d")

    var img = document.createElement("img")
    var sqrt3 = Math.sqrt(3)
    var width = sqrt3 * 2
    var hexLocs = [
                                [8, 0]
    , [8-sqrt3*3, 3], [8-sqrt3, 3], [8+sqrt3, 3], [8+sqrt3*3, 3]
    ,          [8-width, 6],    [8, 6],   [8+width, 6]
    , [8-sqrt3*3, 9], [8-sqrt3, 9], [8+sqrt3, 9], [8+sqrt3*3, 9]
    ,                           [8, 12]
    ]
    var hexPieces = []
    var imgSize
      , unit
      , hexWidth
      , source

    img.onload = function cookieCutter() {
      imgSize = img.width
      unit = imgSize / 16
      hexWidth = unit * width

      ;(function createPolygonHole() {
        canvas.width = imgSize
        canvas.height = imgSize

        context.globalAlpha = 0.5
        context.drawImage(img, 0, 0)

        context.globalCompositeOperation='destination-out';
        context.fillStyle='#fff'
        context.globalAlpha = 1

        context.beginPath();
        context.moveTo(unit * 8, 0)
        context.lineTo(unit * 8 + hexWidth/2, unit)
        context.lineTo(unit * 8 + hexWidth/2, unit * 3)

        context.lineTo(unit * 8 + hexWidth, unit * 4)
        context.lineTo(unit * 8 + hexWidth*1.5, unit * 3)
        context.lineTo(unit * 8 + hexWidth*2, unit * 4)
        context.lineTo(unit * 8 + hexWidth*2, unit * 6)
        context.lineTo(unit * 8 + hexWidth*1.5, unit * 7)
        context.lineTo(unit * 8 + hexWidth*1.5, unit * 9)
        context.lineTo(unit * 8 + hexWidth*2, unit * 10)
        context.lineTo(unit * 8 + hexWidth*2, unit * 12)
        context.lineTo(unit * 8 + hexWidth*1.5, unit * 13)
        context.lineTo(unit * 8 + hexWidth, unit * 12)
        context.lineTo(unit * 8 + hexWidth/2, unit * 13)
        context.lineTo(unit * 8 + hexWidth/2, unit * 15)
        context.lineTo(unit * 8, unit * 16)

        context.lineTo(unit * 8 - hexWidth/2, unit * 15)
        context.lineTo(unit * 8 - hexWidth/2, unit * 13)
        context.lineTo(unit * 8 - hexWidth, unit * 12)
        context.lineTo(unit * 8 - hexWidth*1.5, unit * 13)
        context.lineTo(unit * 8 - hexWidth*2, unit * 12)
        context.lineTo(unit * 8 - hexWidth*2, unit * 10)
        context.lineTo(unit * 8 - hexWidth*1.5, unit * 9)
        context.lineTo(unit * 8 - hexWidth*1.5, unit * 7)
        context.lineTo(unit * 8 - hexWidth*2, unit * 6)
        context.lineTo(unit * 8 - hexWidth*2, unit * 4)
        context.lineTo(unit * 8 - hexWidth*1.5, unit * 3)
        context.lineTo(unit * 8 - hexWidth, unit * 4)

        context.lineTo(unit * 8 - hexWidth/2, unit * 3)
        context.lineTo(unit * 8 - hexWidth/2, unit * 1)
        context.closePath()
        context.fill()

        // Set compositing back to its default
        context.globalCompositeOperation='source-over';
      })()

      ;(function createHexes() {
        var hexCount = hexLocs.length
        var ii
          , hexPoint

        for (ii=0; ii < hexCount; ii+=1) {
          createHex(hexLocs[ii])
        }

        function createHex(loc) {
          var canvas = document.createElement("canvas")
          var context = canvas.getContext("2d")
          var left = loc[0] * unit
          var top = loc[1] * unit
          var image

          canvas.width = hexWidth
          canvas.height = unit * 4

          context.beginPath()
          context.moveTo(hexWidth / 2, 0)
          context.lineTo(hexWidth, unit)
          context.lineTo(hexWidth, unit * 3)
          context.lineTo(hexWidth / 2, unit * 4)
          context.lineTo(0, unit * 3)
          context.lineTo(0, unit * 1)
          context.closePath()
          context.clip()
          context.drawImage(
            img
          , left
          , top
          , hexWidth
          , unit * 4
          , 0
          , 0
          , hexWidth
          , unit * 4
          )

          image = document.createElement("img")
          image.src = canvas.toDataURL()

          article.appendChild(image)

          hexPieces.push(image)
        }

      }())

      // var context = canvas.getContext("2d")
      // context.beginPath()
      // context.moveTo(hexWidth / 2, 0)
      // context.lineTo(hexWidth, unit)
      // context.lineTo(hexWidth, unit * 3)
      // context.lineTo(hexWidth / 2, unit * 4)
      // context.lineTo(0, unit * 3)
      // context.lineTo(0, unit * 1)
      // context.closePath()
      // context.globalCompositeOperation = 'destination-out';
      // context.clip()
      // context.drawImage(img, -trim, -trim)
      //
    source = canvas.toDataURL()

    img.src = source
    img.onload = null
  }
    //
    // img.onload = function cookieCutter() {
    //   var unit = img.width / 16
    //   var hexWidth = unit * width
    //
    //   canvas.width = unit * width
    //   canvas.height = unit * 4
    //
    //   var context = canvas.getContext("2d")
    //   context.beginPath()
    //   context.moveTo(hexWidth / 2, 0)
    //   context.lineTo(hexWidth, unit)
    //   context.lineTo(hexWidth, unit * 3)
    //   context.lineTo(hexWidth / 2, unit * 4)
    //   context.lineTo(0, unit * 3)
    //   context.lineTo(0, unit * 1)
    //   context.closePath()
    //   context.clip()
    //   context.drawImage(img, -trim, -trim)
    //
    //   source = canvas.toDataURL()
    //
    //   img.src = source
    //   img.onload = null
    // }

    // img.onload = function cookieCutter() {
    //   var width = img.width
    //   canvas.width = width
    //   canvas.height = img.height
    //   var trim = 2
    //   var radius = width / 2 - trim
    //
    //   context = canvas.getContext("2d")
    //   context.beginPath()
    //   context.arc(radius,radius, radius,0,2*Math.PI);
    //   context.clip()
    //   context.drawImage(img, -trim, -trim)
    //
    //   source = canvas.toDataURL()
    //
    //   img.src = source
    //   img.onload = null
    // }

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
