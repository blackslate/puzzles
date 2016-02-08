
;(function () {

})()
;(function puzzleLoaded(puzzle){
  // puzzle = { map: { <hash>: <object>, ... }, hash: <string> }
  
  function Puzzle() {
    this.name = "Spot"
  }

  Puzzle.prototype.initialize = function initialize() {
    var body = document.body
    var article = document.querySelector("article")
    var h1 = document.querySelector("h1")
    var container = document.querySelector(".container")
    var svgNS = "http://www.w3.org/2000/svg"
    var xlinkNS = "http://www.w3.org/1999/xlink"
    var twoPI = Math.PI * 2
    var width = container.viewBox.animVal.width
   
    var spotRadius = 200
    var ratio = 0.609383

    var discRadius = spotRadius * ratio // 121.8766
    var realRadius = Math.ceil(discRadius) // 122 HARDCODED #disc radius
    var inner2 = discRadius * discRadius
    var outer2 =  spotRadius * spotRadius - inner2
    var outerRadius = Math.sqrt(outer2)
    var alpha = Math.acos(spotRadius / (discRadius * 2))
    var beta = Math.asin(ratio)
    var theta = alpha + beta // angle between outer and inner discs
    // angle between inner discs = ±2 * alpha or π ± alpha

    // PAGE COORDINATES
    var centreX
      , centreY
      , xAdjust
      , yAdjust
      , scale // page coordinates * scale = SVG coordinates

    // <HARD-CODED starting positions for discs>
    var translates = [
      { x: -400, y:  156 }
    , { x: -400, y:  017 }
    , { x: -400, y: -122 }
    , { x: -400, y: -261 }
    , { x: -400, y: -400 }
    ]

    // <HARD-CODED snap distance (as a square of the hypothenuse)
    var snapDelta = 25 // unscaled = fixed distance
    var discPositions = [] // { x: <>, y: <>, more: {...} }
    var snapLocs = []
    var combinations = []
    var positions = []

    var lastRect
      , disc
      , id
      , combinations

    container.onmousedown = container.ontouchstart = startDrag

    ;(function resizeHeader(){
      document.addEventListener("windowResized", windowResized, false)

      function windowResized(event) {
        var rect = h1.getBoundingClientRect()
        var width = rect.width
        h1.style.fontSize = (width * 0.05) + "px"
      }

      windowResized()
    })()

    ;(function createDiscs(){    
      for (var ii=0; ii<5; ii+=1) {
        addDisc(ii)
      }

      function addDisc(index) {
        var id = "disc_" + ii
        var exists = document.querySelector("#" + id)

        if (exists) {
          // console.log("Disc already exists: #" + id)
          return
        }

        var disc = document.createElementNS(svgNS,"circle")
        var translate = translates[ii]
        var transform = "translate("+ translate.x + " " + translate.y +")"

        // <circle cx="122" cy="122" r="122" fill="url(#radial)"/>
        disc.setAttribute("cx", 122)
        disc.setAttribute("cy", 122)
        disc.setAttribute("r", 122)
        disc.setAttribute("fill", "url(#radial)")

        disc.setAttribute("transform", transform)
        disc.setAttribute("id", id)
        disc.setAttribute("opacity", "0.9")

        container.appendChild(disc)
      }
    })()

    function startDrag(event) {
      // event.preventDefault()
      var pageLoc = getPageLoc(event)
      disc = event.target
      id = disc.id

      // Workaround for Internet Explorer 11
      if (!id) {
        disc = disc.correspondingUseElement
        if (!disc) {
          return
        }
        id = disc.id
      }

      if (!id || !/disc/.test(id)) {
        return
      }

      setScaleAndCentre()

      // Bring this disc to the top
      container.removeChild(disc)
      container.appendChild(disc)

      var snapIndex = -1
      var index = getDiscIndex(id)
      var clickX = pageLoc.x
      var clickY = pageLoc.y

      // PAGE COORDINATES
      // Get centre of spot with current page scroll
      var rect = disc.getBoundingClientRect() 
      var radius = realRadius / scale // Firefox has odd rect value
      var radius2 = radius * radius
      // Get offset from click point to centre of disc
      var offsetX = rect.left + radius - clickX
      var offsetY = rect.top + radius - clickY

      // SVG COORDINATES
      var translate = translates[index]
      var startX = translate.x
      var startY = translate.y
      var translateX
        , translateY

      body.onmousemove = body.ontouchmove = dragDisc
      body.onmouseup = body.ontouchend = stopDrag

      function dragDisc(event) {
        var snapIndex = -1
        var pageLoc = getPageLoc(event)
        if (!snapLocs.length) {
          snapFirst(pageLoc)
        } else {
          snapToKnownPositions(pageLoc)
        }

        translateX = (pageLoc.x - clickX) * scale + startX
        translateY = (pageLoc.y - clickY) * scale + startY

        transform = "translate("+ translateX + " " + translateY +")"
        disc.setAttribute("transform", transform)
      }

      function snapFirst(pageLoc) {
        var dX = ( pageLoc.x + offsetX - centreX )
        var dY = ( pageLoc.y + offsetY - centreY )
        var d2 = ( dX * dX + dY * dY )

        var SVGd = Math.sqrt(d2 * scale * scale)
        var snap = Math.sqrt(snapDelta)
        var radius2
          , radius
          , d

        if (Math.abs(SVGd - discRadius) < snap) {
          // Can snap edge to centre of spot
          radius2 = inner2
        } else if (Math.abs(SVGd - outerRadius) < snap) {
          // Can snap to outer ring
          radius2 = outer2
        }

        if (radius2) {
          radius = Math.sqrt(radius2) / scale
          d = Math.sqrt(d2)

          pageLoc.x += radius * dX / d - dX
          pageLoc.y += radius * dY / d - dY

          snapIndex = 1
        } else {
          snapIndex = -1
        }
      }

      function snapToKnownPositions(pageLoc) {
        var total = snapLocs.length
        var dX
          , dY
          , d2
          , snapLoc

        for (var ii = 0; ii < total; ii += 1) {
          snapLoc = snapLocs[ii]
          if (snapLoc) {
            dX = snapLoc.x - (pageLoc.x + offsetX)
            dY = snapLoc.y - (pageLoc.y + offsetY)
            d2 = (dX * dX + dY * dY)

            if (Math.abs(d2) < snapDelta) {
              // Snap to this location
              pageLoc.x = snapLoc.x - offsetX
              pageLoc.y = snapLoc.y - offsetY
              snapIndex = ii
              // Stop looking for a match
              return
            }
          }
        }

        snapIndex = -1
      }

      function stopDrag(event) {
        body.onmousemove = body.ontouchmove = body.onmouseup = body.ontouchend = null

        if (!translateX) {
          // Click and release: No ...move() event was triggered
          return
        }
        
        translate.x = translateX
        translate.y = translateY

        if (snapIndex > -1) {
          if (!discPositions.length) {
            defineDiscPositions()
          } else {
            refineDiscPositions()
            positions.push(translate)
          }

          // PREVENT SUBSEQUENT DRAGGING
          disc.setAttribute("opacity", "1")
          disc.id = "fixed_"+index
          
          if (positions.length === 5) {
            healWound()
          }
        }
      }

      function defineDiscPositions() {
        var dX = translateX + realRadius
        var dY = translateY + realRadius
        var d2 = dX * dX + dY * dY
        var radians = Math.atan2(dX, -dY) // 0 at 12 o'clock > ± π

        // Difference set to 100 for Internet Explorer 11
        if (Math.abs(d2 - outer2) < 100) { // typically < 0.01
          defineOuterPositions()
        } else if (Math.abs(d2 - inner2) < 100){
          defineInnerPositions()
        } else {
          // This should never happen
          console.log("Bad snap:", d2 - outer2, d2 - inner2)
          return
        }
    
        positions.push(translate)
        lastRect = 0 // force snapLocs to be updated on next setScale...

        function defineOuterPositions() {
         // 2 known inner positions ±theta
          angle = radians + theta
          x = Math.sin(angle) * discRadius
          y = -Math.cos(angle) * discRadius
          position = { x: x, y: y }
          discPositions.push(position)

          angle = radians - theta
          x = Math.sin(angle) * discRadius
          y = -Math.cos(angle) * discRadius
          position = { x: x, y: y }
          discPositions.push(position)

          // 2 alternative outer positions ±2 * theta
          var angle = radians + (2 * theta)
          var x = Math.sin(angle) * outerRadius
          var y = -Math.cos(angle) * outerRadius
          var position = { x: x, y: y }
          discPositions.push(position)

          angle = radians - (2 * theta)
          x = Math.sin(angle) * outerRadius
          y = -Math.cos(angle) * outerRadius
          position = { x: x, y: y }
          discPositions.push(position)

           // 2 alternative inner positions (π ± alpha)
          angle = radians + Math.PI + beta
          x = Math.sin(angle) * discRadius
          y = -Math.cos(angle) * discRadius
          position = { x: x, y: y }
          discPositions.push(position)

          angle = radians + Math.PI - beta
          x = Math.sin(angle) * discRadius
          y = -Math.cos(angle) * discRadius
          position = { x: x, y: y }
          discPositions.push(position)

          combinations = [
            [0,1,2,4]
          , [0,1,3,5]
          ]
        }

        function defineInnerPositions() {
          // 4 possible outer positions (of which 2 will be used)
          // Adjacent: 2 chances out of 3
          var angle = radians + theta
          var x = Math.sin(angle) * outerRadius
          var y = -Math.cos(angle) * outerRadius
          var position = { x: x, y: y }
          discPositions.push(position)
          
          angle = radians - theta
          x = Math.sin(angle) * outerRadius
          y = -Math.cos(angle) * outerRadius
          position = { x: x, y: y }
          discPositions.push(position)

          // Opposite: 1 chance each out of 3...
          angle = radians + Math.PI + beta
          x = Math.sin(angle) * outerRadius
          y = -Math.cos(angle) * outerRadius
          position = { x: x, y: y }
          discPositions.push(position)

          angle = radians + Math.PI - beta
          x = Math.sin(angle) * outerRadius
          y = -Math.cos(angle) * outerRadius
          position = { x: x, y: y }
          discPositions.push(position)

          // 4 possible inner positions (of which 2 will be used)
          // Adjacent
          angle = radians + 2 * alpha
          x = Math.sin(angle) * discRadius
          y = -Math.cos(angle) * discRadius
          position = { x: x, y: y }
          discPositions.push(position)

          angle = radians - 2 * alpha
          x = Math.sin(angle) * discRadius
          y = -Math.cos(angle) * discRadius
          position = { x: x, y: y }
          discPositions.push(position)

          // Opposite
          angle = radians + Math.PI + alpha
          x = Math.sin(angle) * discRadius
          y = -Math.cos(angle) * discRadius
          position = { x: x, y: y }
          discPositions.push(position)

          angle = radians + Math.PI - alpha
          x = Math.sin(angle) * discRadius
          y = -Math.cos(angle) * discRadius
          position = { x: x, y: y }
          discPositions.push(position)

          combinations = [
            [0,1,6,7]
          , [0,2,5,7]
          , [1,3,4,6]
          ]
        }
      }

      function refineDiscPositions() {
        // snapIndex indicates where the most recent disc has been
        // dropped. Only those combinations that contain this index
        // can be retained.
         
        combinations = combinations.filter(function (combination) {
          return (combination.indexOf(snapIndex) > -1)
        })

        var allowed = []

        combinations.forEach(function (combination) {
          combination.forEach(function (index) {
            if (allowed.indexOf(index) < 0) {
              allowed.push(index)
            }
          })
        })

        snapLocs.forEach(function (snapLoc, index) {
          if (allowed.indexOf(index) < 0) {
            snapLocs[index] = 0
            discPositions[index] = 0
          }
        })

        snapLocs[snapIndex] = 0
        discPositions[snapIndex] = 0
      }

      function getDiscIndex(id) {
        // "disc_0" => 0
        var result = /disc_(\d)/.exec(id)

        if (result) {
          result = parseInt(result[1], 10)
        }

        return result
      }

      function setScaleAndCentre () {
        var rect = container.getBoundingClientRect()
        if (lastRect === rect) {
          // The window size has not changed
          return
        }

        lastRect = rect

        xAdjust = rect.left
        yAdjust = rect.top
        centreX = (rect.left + rect.right) / 2
        centreY  = (rect.top + rect.bottom) / 2
        scale = width / rect.width

        if (discPositions.length) {
          updateSnapLocs()
        }

        function updateSnapLocs() {
          snapLocs.length = 0
          var radius = 0 // realRadius / scale
          var loc
          var img

          discPositions.forEach(function (position) {
            // position.x and .y are defined relative to (0, 0) in SVG
            // space. Convert to points relative to (centerX, centreY)
            // in page space

            if (position) {
              loc = {}
              loc.x = centreX + position.x / scale - radius
              loc.y = centreY + position.y / scale - radius
            } else {
              loc = 0
            }

            snapLocs.push(loc)
          })
        }
      }
    }

    function healWound() {
      var img
        , translate
        , left
        , top
        , size

      // console.log(positions)

      // <image xlink:href="firefox.jpg" x="0" y="0" height="50px" width="50px"/>
      for (var ii = 0; ii < 5; ii += 1){
        var img = document.createElement("img")
        img.src = source
        var translate = positions[ii]
        var left = (translate.x + width / 2) / width * 100 + "%"
        var top = (translate.y + width / 2) / width * 100 + "%"
        var size = "31%" // <HARD-CODED for simplicity>

        img.style.left = left
        img.style.top = top
        img.style.width = size

        article.appendChild(img)
      }

      h1.innerHTML = "Time heals all wounds"
      article.removeChild(container)
    }

    var canvas = document.createElement("canvas")
    var img = document.createElement("img")
    var source

    img.onload = function cookieCutter() {
      var width = img.width
      canvas.width = width
      canvas.height = img.height
      var trim = 2
      var radius = width / 2 - trim
      context = canvas.getContext("2d")
      context.beginPath()
      context.arc(radius,radius, radius,0,2*Math.PI);
      context.clip()
      context.drawImage(img, -trim, -trim)

      source = canvas.toDataURL()
    }

    img.src = "puzzles/spot/img/bandaid.jpg"
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