// ◊ arrange pieces in puzzle area
// resize pieces to fit area:
// => Make them a standard size and use vw and vh units for their
//    onscreen size
// => detect distance in window units
// detect correct piece, regardless of area size
// snap even when it is not adjacent piece that is dragged
// don't snap corners

;(function puzzleLoaded(puzzle){
  // puzzle = { map: { <hash>: <object>, ... }, hash: <string> }
  
  function Puzzle() {
    this.name = "Jigsaw"
  }

  Puzzle.prototype.initialize = function initialize() {
    console.log("Puzzle '" + this.name + "' initialized")
    var body = document.body
    var article = document.querySelector("article")

    var rowCount = 4
    var colCount = 6
    var pieceCount = rowCount * colCount
    var edgeList = [] // Ensures that no two edges are identical
    var topsList = [] // Ensures that pieces fit with the row above
    var piecesList = []
    var blankList = []
    var imageList = []
    var groups = {}
    var layer = 1
    var threshold = 400
    var complete = false
    var stillLoading = 2
   
    var width
    var height
    var neck
    var imgWidth
    var imgHeight

    var white = new Image()
    var source = new Image()

    white.onload = source.onload = function checkIfBothAreLoaded() {
      stillLoading -= 1
      if (!stillLoading) {
        createPuzzle()
      }
    }

    function createPuzzle() {
      imgWidth = source.width
      imgHeight = source.height
      width = imgWidth / colCount
      height = imgHeight / rowCount
      neck = width / 6

      createPuzzlePieces()
      setTimeout(placePiecesRandomly, 1)
    };

    function createPuzzlePieces(me) {   
      var edge
        
      for(var row = 0; row < rowCount; row += 1) {
        for(var col = 0; col < colCount; col += 1) {
          createPuzzlePiece(row, col)
        }
      }

      function createPuzzlePiece(row, col) {
        var canvas = document.createElement('canvas')
        var context = canvas.getContext('2d');

        canvas.width = width + neck * 2.5
        canvas.height = height + neck * 2.5

        context.beginPath()
        context.moveTo(neck, height + neck)
        
        // LEFT
        if (!col) {
          // The left edge is flat
          context.lineTo(neck, neck)
        } else {
          // Use previous right edge
          upwardEdge(neck, height + neck, edge)
        }

        // TOP
        if (!row) {
          context.lineTo(width + neck, neck)
        } else {
         // Use previous bottom edge
          rightwardEdge(width + neck, neck, topsList[col])
        }

        // RIGHT
        if ((col + 1) === colCount) {
          context.lineTo(width + neck, height + neck)
        } else {
          // Create a new right edge
          edge = randomEdge()
          downwardEdge(width + neck, height + neck, edge)
        }

        // BOTTOM    
        if (row + 1 === rowCount) {
          context.lineTo(neck, height + neck)
        } else {
          // Create a new bottom edge       
          topsList[col] = randomEdge()
          leftwardEdge(width + neck, height + neck, topsList[col])
        }
        context.clip()

        createImage()

        function downwardEdge(x0, height, edge) {
          // {
          //   tilt: tilt
          // , slant: slant
          // , angle: angle
          // , curve: curve
          // }
          var x1 = x0 - edge.curve     // shoulder
          var x2 = x0 + edge.curve / 5 // chin
          var x3 = x0 + neck * 1.2     // crown

          var y0 = neck
          var ym = y0 + (height - y0) / 2 // adjusted with tilt
          var y1 = ym - neck / 2      // top of neck
          var y2 = ym + neck / 2      // bottom of neck
          var y3 = ym - neck * 2      // top of slant
          var y4 = ym + neck * 2      // foot of slant

          context.bezierCurveTo(
            x0, y0                   // no handle on corner
          , x1, y1 - edge.angle     // base of neck
          , x0, y1                  // upper neck point
          )
          context.bezierCurveTo(
            x2, y1 + edge.angle / 5 // chin side of neck
          , x3 - edge.slant, y3     // upper slant
          , x3, ym + edge.tilt      // top of head
          )
          context.bezierCurveTo(
            x3 + edge.slant, y4     // lower slant
          , x2, y2 + edge.angle / 5 // chin side of neck
          , x0, y2                  // lower neck point
          )
          context.bezierCurveTo(
            x1, y2 - edge.angle     // base of neck
          , x0, height              // no handle on corner
          , x0, height              // corner
          )
        }

        function upwardEdge(x0, height, edge) {
          var x1 = x0 - edge.curve     // shoulder
          var x2 = x0 + edge.curve / 5 // chin
          var x3 = x0 + neck * 1.2     // crown

          var y0 = neck
          var ym = y0 + (height - y0) / 2 // adjusted with tilt
          var y1 = ym - neck / 2   // top of neck
          var y2 = ym + neck / 2   // bottom of neck
          var y3 = ym - neck * 2      // top of slant
          var y4 = ym + neck * 2     // foot of slant

          //context.lineTo(x0, neck)

          context.bezierCurveTo(
            x0, height              // no handle on corner
          , x1, y2 - edge.angle     // base of neck
          , x0, y2                  // upper neck point
          )
          context.bezierCurveTo(
            x2, y2 + edge.angle / 5 // chin side of neck
          , x3 + edge.slant, y4     // lower slant
          , x3, ym + edge.tilt      // top of head
          )
          context.bezierCurveTo(
            x3 - edge.slant, y3     // upper slant
          , x2, y1 + edge.angle / 5 // chin side of neck
          , x0, y1                  // lower neck point
          )
          context.bezierCurveTo(
            x1, y1 - edge.angle     // base of neck
          , x0, y0                   // no handle on corner
          , x0, y0                   // corner
          )
        }
     
        function leftwardEdge(width, y0, edge) {
          var y1 = y0 - edge.curve     // shoulder
          var y2 = y0 + edge.curve / 5 // chin
          var y3 = y0 + neck * 1.2     // crown

          var x0 = neck
          var xm = x0 + (width - x0) / 2 // adjusted with tilt
          var x1 = xm - neck / 2   // top of neck
          var x2 = xm + neck / 2   // bottom of neck
          var x3 = xm - neck * 2      // top of slant
          var x4 = xm + neck * 2     // foot of slant

          context.bezierCurveTo(
            width, y0              // no handle on corner
          , x2 - edge.angle, y1     // base of neck
          , x2, y0                  // upper neck point
          )
          context.bezierCurveTo(
            x2 + edge.angle / 5, y2 // chin side of neck
          , x4, y3 + edge.slant     // lower slant
          , xm + edge.tilt, y3      // top of head
          )
          context.bezierCurveTo(
            x3, y3 - edge.slant     // upper slant
          , x1 + edge.angle / 5, y2 // chin side of neck
          , x1, y0                  // lower neck point
          )
          context.bezierCurveTo(
            x1 - edge.angle, y1     // base of neck
          , x0, y0                   // no handle on corner
          , x0, y0                  // corner
          )
        }

        function rightwardEdge(width, y0, edge) {
          var y1 = y0 - edge.curve     // shoulder
          var y2 = y0 + edge.curve / 5 // chin
          var y3 = y0 + neck * 1.2     // crown

          var x0 = neck
          var xm = x0 + (width - x0) / 2 // adjusted with tilt
          var x1 = xm - neck / 2      // top of neck
          var x2 = xm + neck / 2      // bottom of neck
          var x3 = xm - neck * 2      // top of slant
          var x4 = xm + neck * 2      // foot of slant

          context.bezierCurveTo(
            x0, y0                  // no handle on corner
          , x1 - edge.angle, y1     // base of neck
          , x1, y0                  // upper neck point
          )
          context.bezierCurveTo(
            x1 + edge.angle / 5, y2 // chin side of neck
          , x3, y3 - edge.slant     // lower slant
          , xm + edge.tilt, y3      // top of head
          )
          context.bezierCurveTo(
            x4, y3 + edge.slant     // upper slant
          , x2 + edge.angle / 5, y2 // chin side of neck
          , x2, y0                  // lower neck point
          )
          context.bezierCurveTo(
            x2 - edge.angle, y1     // base of neck
          , width, y0                  // no handle on corner
          , width, y0               // corner
          )
        }
     
        function createImage() {
          var blank = new Image()
          var piece = new Image()
          var image = new Image()
          blankList.push(blank)
          piecesList.push(piece)
          imageList.push(image)

          context.drawImage(
            white
          , 0, 0, 1, 1
          , -col*width + neck, -row*height + neck, imgWidth, imgHeight
          )

          piece.onload = function(){
            // append the new image to the page
            article.appendChild(piece)
            piece.locX = -col*width
            piece.locY = -row*height
            piece.id = row+"_"+col
            groups[piece.id] = [piece]
            

            context.drawImage(source, -col*width + neck, -row*height + neck)

            image.onload = function(){
              context = null
              canvas = null    
              image.onload = null  
              piece.onload = null
              blank.onload = null 
            }

            image.src = canvas.toDataURL()
          }

          blank.src = canvas.toDataURL()
          piece.src = canvas.toDataURL()
        }
      }
    }

    function randomEdge(topsList, column) {   
      var tilt
        , slant
        , angle
        , curve
        , edge

      do {
        tilt  =  6 - Math.floor(Math.random() * 11)
        slant =  6 - Math.floor(Math.random() * 11)
        angle =  6 - Math.floor(Math.random() * 11)
        curve = 14 + Math.floor(Math.random() * 11)
      } while (edgeExists())

      function edgeExists() {
        var unique = edgeList.every(function (edge) {
          if (edge.tilt !== tilt) {
            return true
          } else if (edge.slant !== slant) {
            return true
          } else if (edge.angle !== angle) {
            return true
          } else if (edge.curve !== curve) {
            return true
          }
          return false
        })

        return !unique
      }

      edge  = {
        tilt: tilt
      , slant: slant
      , angle: angle
      , curve: curve
      }

      edgeList.push(edge)

      if (topsList) {
        topsList[column] = edge
      }

      return edge
    }

    function placePiecesRandomly() {
      var width = article.offsetWidth
      var height = article.offsetHeight
      var ratio = width / height
      var across
        , down
        , extra
        , space
        , random
        , index
        , piece

      if (ratio > 2) {
        across = 7; down = 3; extra = 4
      } else if (ratio > 1.33) {
        across = 6; down = 4; extra = 1
      } else if (ratio > 0.75) {
        across = 5; down = 5; extra = 0
      } else if (ratio > 0.5) {
        across = 4; down = 6; extra = 1
      } else {
        across = 3; down = 7; extra = 4
      }

      space = Math.min(width / (across + 2), height / (down + 2))
      random = getRandomIndexArray()

      for ( var row = 0; row < down; row += 1 ) {
        for ( var col = 0; col < across; col += 1 ) {
          placePiece()
        }
      }

      for (var ii = 0; ii < extra; ii += 1) {
        placePiece()
      }

      function placePiece() {
        index = random.pop()
        piece = piecesList[index]
        piece.style.top = (row + Math.random()) * space + "px"
        piece.style.left = (col + Math.random()) * space + "px"
      }

      function getRandomIndexArray() {
        var array = []
        for (var ii = 0; ii < pieceCount; ii += 1) {
          array.push(ii)
        }

        var current = pieceCount
          , swap
          , random

        while (current) {
          random = Math.floor(Math.random() * current--);
          swap = array[current];
          array[current] = array[random];
          array[random] = swap;
        }

        return array
      }
    }
    
    ;(function play(){
      body.ontouchstart = function (event) {
        event.preventDefault()
      }

      article.onmousedown = article.ontouchstart = startDrag
        
      function startDrag(event) {
        event.preventDefault()

        var target = event.target
        if (target.nodeName.toLowerCase() !== "img") {
          return
        }

        body.onmousemove = body.ontouchmove = drag
        body.onmouseup = body.ontouchend = stopDrag

        var pieces = groups[target.id]
        var clickX = event.pageX
        var clickY = event.pageY
        var startXs = {}
        var startYs = {}


        ;(function setStartXAndY(){
          var id
          layer++
          pieces.forEach(function (piece) {
            id = piece.id
            startXs[id] = piece.offsetLeft - clickX
            startYs[id] = piece.offsetTop - clickY
            piece.style.zIndex = layer
          })
        })()
      
        function drag(event) {      
          var id
          pieces.forEach(function (piece) {
            id = piece.id
            piece.style.left = startXs[id] + event.pageX + "px"
            piece.style.top = startYs[id] + event.pageY + "px"
          })
        }
      
        function stopDrag(event) {
          var targetRect = target.getBoundingClientRect()
          var x = targetRect.left + target.locX
          var y = targetRect.top + target.locY
          var deltaX
            , deltaY
            , delta2

          piecesList.forEach(function (piece) {
            if (!complete) {
              if (piece !== target) {
                rect = piece.getBoundingClientRect()

                if (intersects(rect, targetRect)) {
                  deltaX = rect.left + piece.locX - x
                  deltaY = rect.top + piece.locY - y
                  delta2 = deltaX * deltaX + deltaY * deltaY

                  if (delta2 < threshold) {
                    addToGroup(target, piece, deltaX, deltaY)
                  }
                }
              }
            }

            //piece.style.zIndex = 0
          })

          body.onmousemove = body.ontouchmove = null
          body.onmouseup = body.ontouchend = null

          function intersects(r1, r2) {
            return !(r2.left > r1.right || 
                     r2.right < r1.left || 
                     r2.top > r1.bottom ||
                     r2.bottom < r1.top)
          }

          function addToGroup(target, piece, deltaX, deltaY) {
            var group1 = groups[piece.id]
            var group2 = groups[target.id]
            var left
              , top
              , groupCount
              , opacity

            // Copy everything into group1, which becomes the shared array
            // and snap the pieces to those of group1
            group2.forEach(snapToGroup)
            snapToGroup(target)

            groupCount = group1.length
            opacity = groupCount / pieceCount / 5
            
            group1.forEach(refreshImage)

            // The target has moved, but there may be more matches
            targetRect = target.getBoundingClientRect()
            x = targetRect.left + target.locX
            y = targetRect.top + target.locY

            if (groupCount === pieceCount && !complete) {
              // The puzzle is complete
              complete = true
              opacity = 1
              group1.forEach(refreshImage)
              // article.style.backgroundColor = "#fff"
              article.classList.add("complete")
            }     

            function snapToGroup(piece) {
              if (group1.indexOf(piece) < 0) {
                group1.push(piece)
                groups[piece.id] = group1

                piece.style.left = piece.offsetLeft + deltaX + "px"
                piece.style.top = piece.offsetTop + deltaY + "px"
              }
            }

            function refreshImage(piece) {
              var canvas = document.createElement('canvas')
              var context = canvas.getContext('2d');
              var index = piecesList.indexOf(piece)
              var blank = blankList[index]
              var image = imageList[index]
              var width = piece.width
              var height = piece.height

              canvas.width = width
              canvas.height = height

              context.globalAlpha = 1
              context.drawImage(blank, 0, 0, width, height)
              context.globalAlpha = opacity
              context.drawImage(image, 0, 0, width, height)

              piece.src = canvas.toDataURL()
            }
          }
        }
      }
    })() 

    white.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQAQMAAAC6caSPAAAAA3NCSVQICAjb4U/gAAAABlBMVEX///////9VfPVsAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMC8xNC8xNQkEnNcAAAAqSURBVHic7cExAQAAAMKg9U/tbwagAAAAAAAAAAAAAAAAAAAAAAAAAIA3T7AAATkWl3gAAAAASUVORK5CYII="
    source.src = "puzzles/jigsaw/img/castle6x4@80.jpg"
  }

  Puzzle.prototype.kill = function kill() {
    // Clean up when puzzle is about to be replaced
    console.log("Puzzle '" + this.name + "' killed")
  }

  if (typeof puzzle.hash === "string") {
    if (typeof puzzle.map === "object") {
      var object = puzzle.map[puzzle.hash] = new Puzzle()
    }
  }
})(window.puzzle) // <HARD-CODED global object>