;(function puzzleLoaded(puzzle){
  // puzzle = { map: { <hash>: <object>, ... }, hash: <string> }
  
  function Puzzle() {
    this.name = "Fractal"
  }

  Puzzle.prototype.initialize = function initialize() {
    var ratio = (Math.sqrt(5) + 1) / 2 - 1 // 0.6180339887498948482
    var piOver5 = Math.PI / 5 // 36°
    var radius = 1 / (2 * Math.sin(piOver5))
    var raise  = 1 / (2 * Math.tan(piOver5))
    var topTweak = (radius / (radius + raise)) * (1 - ratio)
    var leftTweak = (1 - ratio) / 2
    var centres = []    // [{ left: <float>, top: <float>}, ...]
    var scales = []     // ["scale("+scaling+" "+scaling+")", ...]
    var translates = [] // [{ left: <float>, top: <float>}, ...]
    var container = document.querySelector("svg.container")

    ;(function setup(){
      // Create 8 nested pentagons
      var svgNS = "http://www.w3.org/2000/svg"
      var xlinkNS = "http://www.w3.org/1999/xlink"
     
      var parent = container
      var width = 600 
      var height = 600
      var viewbox = "0 0 " + width + " " + height
      var colors = [1, 2, 3, 4 ,5 ,6 ,7 ,8]
      var index = 0
      var sWidth = String(width)
      var sHeight = String(height)
      var scaling = 2.5
      var side = 100 * scaling
      var pWidth = 161.8033988750 * scaling
      var pHeight = 153.8841768588 * scaling
      var rWidth = pWidth
      var rHeight = pHeight
      var topOffset = height - pHeight
      var leftOffset = 160 // (width - pWidth) / 2
      var topDelta = 0
      var leftDelta = 0
      var hexBit
        , left
        , top
        , translate
        , scale
        , transform
        , svg
        , use

      left = leftOffset
      top = topOffset
      centres.push({ left: left, top: top })
      // id_1
      side *= ratio
      left = left + rWidth * (0.5 - ratio)
      top = top - Math.sin(piOver5) * side
      centres.push({ left: left, top: top })
      // id_2
      rWidth *= ratio * ratio // now width of pentagon id_2
      rHeight *= ratio * ratio
      side *= ratio
      left -= rWidth / 2
      top = topOffset
      centres.push({ left: left, top: top })
      // id_3
      left += 0.5 *(rWidth - (rWidth *= ratio))
      top += rHeight - Math.sin(piOver5) * (side *= ratio)
      centres.push({ left: left, top: top })
      // id_4
      left += rWidth - (rWidth *= ratio) / 2
      top += Math.sin(piOver5) * side // side of pentagon id_3
      centres.push({ left: left, top: top })
      // id_5
      left += rWidth / 2 // width of pentagon id_4
      top -= Math.sin(piOver5) * (side *= ratio * ratio) // side of id_5
      centres.push({ left: left, top: top })
      // id_6
      left += ((rWidth *= ratio)) / 2 - (rWidth *= ratio)
      top -= Math.sin(piOver5) * (side *= ratio ) // side of pentagon id_6
      centres.push({ left: left, top: top })
      // id_7
      left -= ((rWidth *= ratio)) / 2
      top += Math.sin(piOver5) * side // side of pentagon id_6
      centres.push({ left: left, top: top })

      for(var ii = 0; ii < 8; ii += 1) {
        hexBit = colors[ii]
        left = leftOffset + leftDelta
        top = topOffset + topDelta
        translate = "translate("+left+" "+top+")"
        translates[ii] = { left: left, top: top }
        scale = "scale("+scaling+" "+scaling+")"
        scales[ii] = scale
        transform = translate+" "+scale

        svg = document.createElementNS(svgNS,"svg")
        use = document.createElementNS(svgNS,"use")

        svg.setAttributeNS(null,"style","fill:#"+hexBit+hexBit+hexBit);
        svg.setAttributeNS(null,"viewBox", viewbox)
        svg.setAttributeNS(null,"width", sWidth);
        svg.setAttributeNS(null,"height", sHeight);

        use.setAttributeNS(xlinkNS,"xlink:href", "#pentagon");
        use.setAttributeNS(null,"transform", transform);
        use.setAttributeNS(null,"id", "id_"+ii)
     
        svg.appendChild(use)
        parent.appendChild(svg)

        // Prepare for the next level of nesting
        leftDelta += pWidth * leftTweak
        topDelta += pHeight * topTweak

        pWidth *= ratio
        pHeight *= ratio
        scaling *= ratio
        parent = svg
      }
      
      // Activate the second biggest pentagon, and colour it
      svg = document.querySelector("use#id_1").parentNode
      svg.style.fill = "#422"
      svg.onmousedown = dragSVGs
      svg.ontouchstart = dragSVGs
    })()

    ;(function resizeHeader(){
      var header = document.querySelector("h1")
      document.addEventListener("windowResized", windowResized, false)

      function windowResized(event) {
        var rect = header.getBoundingClientRect()
        var width = rect.width
        header.style.fontSize = (width * 0.05) + "px"
      }

      windowResized()
    })()

    function dragSVGs(event) {
      var svg = event.currentTarget
      var use = svg.childNodes[0]
      var x = event.pageX
      var y = event.pageY
      var hit

      // Fix for FireFox 40.0.3, which has no svg.checkIntersection()
      var boundingRect = container.getBoundingClientRect()
      var rect = svg.createSVGRect()
      rect.x = x - boundingRect.left
      rect.y = y - boundingRect.top
      rect.width = rect.height = 1

      rect = use.getBoundingClientRect()
      hit = x < rect.left
          ? false
          : x > rect.right
            ? false
            : y < rect.top
              ? false
              : y > rect.bottom
                ? false
                : true

      if (!hit) {
        // The click was on a nested pentagon, outside the rect of the
        // target svg
        return
      }

      var theta = Math.PI / 2.5
      
      // Prepare to move this pentagon and all its children
      var startX = [0]
      var startY = [0]
      var child = use
      var index = 1
      var translate
        , svg

      do {
        translate = translates[index] // { left: <>, top: <> }
        startX.push(translate.left)
        startY.push(translate.top)
        index += 1

      } while (child = 
         (svg = child.parentNode.childNodes[1]) 
        ? svg.childNodes[0]
        : false)

      document.body.onmousemove = movePentagon
      document.body.ontouchmove = movePentagon

      function movePentagon(event) {
        // Move the clicked pentagon with the mouse, and all its children
        // relatively
        var offsetX = event.pageX - x
        var offsetY = event.pageY - y
        var deltaX = 0
        var deltaY = 0
        var delta = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
        var angle = Math.atan2(offsetY, offsetX)
        var index = 1
        var level = parseInt(use.id.substring(3), 10) - 1
        var child = use
        var match = true
        var translate
          , scale
          , svg
          , left
          , top

       
        do {
          left = offsetX + startX[index] + deltaX
          top = offsetY + startY[index] + deltaY
          translate = translates[index] 
          translate.left = left
          translate.top = top
          scale = scales[index]
          transform = "translate(" + left + " " + top + ") " + scale
          child.setAttributeNS(null, "transform", transform)

          // Prepare for next child
          offsetX += deltaX
          offsetY += deltaY
          index += 1
          angle -= theta
          delta *= ratio
          deltaX = Math.cos(angle) * delta
          deltaY = Math.sin(angle) * delta
        } while (child = 
            (svg = child.parentNode.childNodes[1]) 
          ? svg.childNodes[0]
          : false)

        // Check if the user is about to solve the puzzle
        match = checkForMatch()

        if (match) {
          showSolution()
        }
      }

      document.body.onmouseup = stop
      document.body.ontouchend = stop

      function stop(event) {
        document.body.onmouseup = null
        document.body.onmousemove = null
        document.body.ontouchend = null
        document.body.ontouchmove = null
      }

      function checkForMatch() {
        var translate = translates[1]
        var centre = centres[1]
        var deltaX = centre.left - translate.left
        var deltaY = centre.top - translate.top
        return ((deltaX * deltaX + deltaY * deltaY) < 100)
      }

      function showSolution () {
        // Use the original green background from 
        // https://commons.wikimedia.org/wiki/File:Fractaliphants.pdf
        document.querySelector("rect").style.fill = "#c6d85b"

        var use = document.querySelector("use#id_1")
        var parent = use.parentNode 
        var index = 1
        var translate
          , scale
          , left
          , top
          , transform
          , svg
       
        // Reset the colour of the draggable pentagon
        parent.style.fill = "#222"

        // Put everything exactly in position
        do {
          translate = centres[index] 
          left = translate.left
          top = translate.top
          scale = scales[index]
          transform = "translate(" + left + " " + top + ") " + scale
          use.setAttributeNS(null, "transform", transform)

          index += 1
        } while (use = 
              (svg = use.parentNode.childNodes[1]) 
            ? svg.childNodes[0]
            : false)

        // Prevent the user from making any further changes
        parent.onmousedown = null
        document.body.onmouseup = null
        document.body.onmousemove = null
        parent.ontouchstart = null
        document.body.ontouchmove = null
        document.body.ontouchend = null
      }
    }
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