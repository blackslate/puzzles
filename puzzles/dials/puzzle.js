function puzzleLoaded(reloaded) {}

;(function puzzleLoaded(puzzle){
  // puzzle = { map: { <hash>: <object>, ... }, hash: <string> }
  
  function Puzzle() {
    this.name = "Template"
  }

  Puzzle.prototype.initialize = function initialize() {
    var body = document.body
    var svg = document.querySelector("svg.puzzle")
    var main = svg.parentNode

    var svgNS = "http://www.w3.org/2000/svg"
    var xlinkNS = "http://www.w3.org/1999/xlink"

    // Creation constants
    var degreesPerRadian = 180 / Math.PI
    var piOver5 = Math.PI / 5 // 36°
    var twoPI = Math.PI * 2
    var cX = 650
    var cY = 650
    var width = 100
    var radius = width / 2

    // Rotation properties 
    var pX // centre of page
    var pY
    var scale

    // Start dials and rotations with central point
    var dials = [0]
    var rotations = [0]
    var openings = [0]
    var gapDegrees = [[0]]
    var free = [0, 0, false, false, true, true, 0]
    // Barl
    var bars = []
    var barPoints = []

    var selector = "svg.puzzle path"
    var paths = [].slice.call(document.querySelectorAll(selector))
    paths.forEach(function (path) {
      path.parentNode.removeChild(path)
    })

    ;(function createDials(){
      var radius = width
      var gaps = [ 0 ]
      var options = { fill: "#333" }
      createGapRing(cX, cY, radius, width, gaps, options)

      radius = 200
      gaps = [ 0, 144 ]
      options = { fill: "#fcc", drag: "rotate" }
      createGapRing(cX, cY, radius, width, gaps, options)

      radius = 300
      gaps = [ 0, 144 ]
      options = { fill: "#ffc", drag: "rotate" }
      createGapRing(cX, cY, radius, width, gaps, options)

      radius = 400
      gaps = [ 72, 288 ]
      options = { fill: "#cfc", drag: "rotate" }
      createGapRing(cX, cY, radius, width, gaps, options)

      radius = 500
      gaps = [ 72, 216 ]
      options = { fill: "#ccf", drag: "rotate" }
      createGapRing(cX, cY, radius, width, gaps, options)

      radius = 600
      gaps = [ 72 ]
      options = { fill: "#333" }
      createGapRing(cX, cY, radius, width, gaps, options)
    })()

    ;(function createBars(){
      var options = {
        top: 600
      , left: 600
      , length: 1
      , degrees: 0
      , ring: 0
      , range: [ 0, 6 ]
      , fill: "#900"
      }
      createBar( options )
      
      options.length = 3
      options.ring = 1
      options.range = [ 0, 3 ]
      options.fill = "#999"
      createBar( options )
     
      options.length = 2
      options.degrees = 144
      options.ring = 2
      options.range = [ 2, 4 ]
      createBar( options )
    })()

    function createGapRing(cX, cY, radius, width, gaps, options) {
      // gaps must be an array with at least one numerical entry
      var path = document.createElementNS(svgNS,"path")

      width /= 2 // that's the value we'll be using everywhere
      var outerRadius = radius + width
      var innerRadius = radius - width
      var outerTweak = Math.asin(width/outerRadius)
      var innerTweak = Math.asin(width/innerRadius)
      var arcAngle
      var largeArc // 0 | 1

      gaps.sort(function (a, b) {
        return a - b
      })

      var data = getGapData(gaps[0])
      // Imagine that gap | is widened to look like XXXp|qXXX, turning 
      // clockwise. q is the leading edge of the gap is it turns. Each
      // arc will be defined by the Xs in qXXXXXp
      var q = data.leading
      var p // data for trailing edge
      // Put the first gap at the end of the list, so its trailing
      // edge will be treated last
      var outArc
        , inArc
      gaps.push(gaps.splice(0, 1)[0])

      var d = ""
      gaps.forEach(function(gapAngle) {
        data = getGapData(gapAngle)
        p = data.trailing
        // { angle: <float degrees to edge of trailing edge of gap>
        // , outX:  <float x position of outer point on trailing edge>
        // , outY:  <float y position of outer point on trailing edge>
        // , inX:   <float x position of inner point on trailing edge>
        // , inY:   <float y position of inner point on trailing edge>
        // }
        
        arcAngle = (p.outAngle - q.outAngle) % 360
        while ( arcAngle < 0 ) {
          arcAngle += 360
        }
        outArc = (arcAngle < 180) ? 0 : 1
        arcAngle = (p.inAngle - q.inAngle) % 360
        while ( arcAngle < 0 ) {
          arcAngle += 360
        }
        inArc = (arcAngle < 180) ? 0 : 1

        // arcAngle = Math.abs(p.outAngle - q.outAngle) % 360
        // outArc = (arcAngle < 180) ? 0 : 1
        // arcAngle = Math.abs(p.inAngle - q.inAngle) % 360
        // inArc = (arcAngle < 180) ? 0 : 1

        d +="M "+q.outX+" "+ q.outY + "\n"
        // Clockwise round the outside
        d += "A "+outerRadius+" "+outerRadius+" 0 "
        d += outArc+" 1 "+p.outX+" "+p.outY+"\n"
        d += "L "+p.inX+","+p.inY+"\n"
        // Anti-clockwise round the inside
        d += "A "+innerRadius+" "+innerRadius+" 0 "
        d += inArc+" 0 "+q.inX+" "+q.inY+"\n"
        d += "L "+q.outX+","+q.outY+"\n"
        d += "Z\n"
      
        q = data.leading
      })
        
      path.setAttributeNS(null,"d",d)
      path.setAttributeNS(null,"style","fill:"+options.fill)

      dials.push(path)
      rotations.push(0)
      openings.push(0)
      gapDegrees.push(gaps)
      if (options.drag) {
        // Use workaround for IE 11
        addToClassList(path, options.drag)
      }
    
      svg.appendChild(path)


      function getGapData(gapAngle) {
        // { leading: {
        //     angle: <float degrees>
        //   , outX: <float>
        //   , outY: <float>
        //   , inX:  <float>
        //   , inY:  <float>
        //   }
        // , trailing: {ditto}
        // }
        
        var leading = {}
        var trailing = {}
        var data = { leading: leading, trailing: trailing }
       
        var radians = gapAngle / degreesPerRadian

        // Centre of gap, relative to centre
        var leadOutAngle  = radians + outerTweak
        var leadInAngle   = radians + innerTweak
        var trailOutAngle = radians - outerTweak
        var trailInAngle  = radians - innerTweak

        leading.outAngle = leadOutAngle * degreesPerRadian
        leading.inAngle = leadInAngle * degreesPerRadian
        leading.outX  = cX + outerRadius * Math.sin(leadOutAngle)
        leading.outY  = cY - outerRadius * Math.cos(leadOutAngle)
        leading.inX   = cX + innerRadius * Math.sin(leadInAngle)
        leading.inY   = cY - innerRadius * Math.cos(leadInAngle)

        trailing.outAngle = trailOutAngle * degreesPerRadian
        trailing.inAngle = trailInAngle * degreesPerRadian
        trailing.outX  = cX + outerRadius * Math.sin(trailOutAngle)
        trailing.outY  = cY - outerRadius * Math.cos(trailOutAngle)
        trailing.inX   = cX + innerRadius * Math.sin(trailInAngle)
        trailing.inY   = cY - innerRadius * Math.cos(trailInAngle)

        return data
      }
    }
    
    function createBar(options) {
      // { radius: width / 2
      // , top: 600
      // , left: 600
      // , length: 1
      // , degrees: 0
      // , ring: 0
      // , range: [ 0, 6 ]
      // , fill: "#900"
      // }
      var path = document.createElementNS(svgNS,"path")
      var length = options.length
      var right = length * width - radius
      var d = ""

      d += "M " + radius+ " 0\n"
      d += "L " + right + " 0\n"
      // Far end
      d += "A "+radius+" "+radius+" 0 0 1 "+right+" "+width+"\n"
      d += "L "+radius+" "+width+"\n"
      // Near end
      d += "A "+radius+" "+radius+" 0 0 1 "+radius+" 0\n"
      d += "Z\n"

      var left = options.left
      var top = options.top
      var degrees = options.degrees
      var rotation = degrees - 90 // 0° at 3 p.m. => 12 o'clock
      var range = options.range
      var ring = options.ring // Assume this is in range
      var offset = ring * width
      var fill = options.fill
      var barPoint

      var rotation = " rotate("+rotation+" "+radius+" "+radius+")"
      var transform = "translate("+left+" "+top+")" + rotation
      var offset = " translate("+offset+" "+0+")"

      path.setAttributeNS(null,"d",d)
      path.setAttributeNS(null,"transform", transform + offset)
      path.setAttributeNS(null,"style","fill:"+fill)
      // Use workaround for IE 11
      addToClassList(path, "slide")

      barPoint = {
        transform: transform
      , range: range
      , degrees: degrees
      , ring: ring
      , length: length
      }

      bars.push(path)
      barPoints.push(barPoint)

      svg.appendChild(path)
    }

    function addToClassList(svgElement, className) {
      if (svgElement.classList) {
        svgElement.classList.add(className)
      } else {
        // Workaround for IE 11: classList not defined on SVG elements
        var baseVal = " " + svgElement.className.baseVal + " "
        if (baseVal.indexOf(" " + className + " ") < 0) {
          baseVal = (baseVal + className).trim()
          svgElement.setAttribute("class", baseVal)
        }
      }
    }
        
        

    svg.onmousedown = svg.ontouchstart = startDrag
      
    function startDrag(event) {
      var target = event.target
      setScale()

      // Use workaround for IE 11
      if (classListContains(target, "rotate")) {
        return startRotate(event, target)
      }

      if (classListContains(target, "slide")) {
        return startSlide(event, target)
      }
    }

    function classListContains(svgElement, className) {
      // if (svgElement.classList) {
      //   return svgElement.classList.contains(className)
      // } else {
        var baseVal = " " + svgElement.className.baseVal + " "
        return (baseVal.indexOf(" " + className + " ") > -1)
      // }
    }

    function startRotate(event, target) {
      var index = dials.indexOf(target)
      if (!free[index]) {
        return
      }

      rect = svg.getBoundingClientRect()
      pX = rect.left + rect.width / 2
      pY = rect.top + rect.height / 2
      scale = cX / pX
   
      var turnBallWithRing = (barPoints[0].ring === index)
      var deltaX = event.pageX - pX
      var deltaY = event.pageY - pY  
      var startRadians = rotations[index] // current value
      var startDegrees = startRadians * degreesPerRadian
      // Adjust for angle with click position
      startRadians = getRadians(deltaX,deltaY, -startRadians, 1)
      var currentDegrees
        , currentRadians
    
      body.onmousemove = body.ontouchmove = drag
      body.onmouseup = body.ontouchend = stopDrag
    
      function drag(event) {
        deltaX = event.pageX - pX
        deltaY = event.pageY - pY

        currentRadians = getRadians(deltaX, deltaY, startRadians)
        rotations[index] = currentRadians
        currentDegrees = currentRadians * degreesPerRadian

        transform = "rotate("+currentDegrees+" "+cX+" "+cY+")"
        target.setAttributeNS(null, "transform", transform)

        if (turnBallWithRing) {
          turnBall()
        }

        function turnBall() {
          var radians = barPoints[0].degrees / degreesPerRadian
          currentDegrees += radians * degreesPerRadian - startDegrees

          transform = barPoints[0].transform
          transform += " rotate("+currentDegrees+" "+radius+" "+radius+")"
          transform += " translate(" + index * width + " 0)"
          //console.log(transform)
          bars[0].setAttributeNS(null, "transform", transform)
        }
      }
    
      function stopDrag(event) {
        body.onmousemove = body.ontouchmove = null
        body.onmouseup = body.ontouchend = null

        var targetRadians = rotations[index]
        var modulus = targetRadians % (piOver5 * 2)
        var degrees

        targetRadians -= modulus
        if (modulus > piOver5) {     
          targetRadians += piOver5 * 2
        }

        rotations[index] = targetRadians
        openings[index] = targetRadians * degreesPerRadian
        degrees = targetRadians * degreesPerRadian

        transform = "rotate(" + degrees + " " + cX + " " + cY + ")"
        target.setAttributeNS(null, "transform", transform)
        // Animate to nearest multiple of 72° = 1.256637 rad

        if (turnBallWithRing) {
          turnBall()
        }

        function turnBall() {
          transform = barPoints[0].transform
          degrees += barPoints[0].degrees - startDegrees
          transform += " rotate("+degrees+" "+radius+" "+radius+")"
          transform += " translate(" + index * width + " 0)"
          bars[0].setAttributeNS(null, "transform", transform)

          barPoints[0].degrees = degrees % 360
        }
      }
    }

    function getRadians(deltaX, deltaY, startRadians, invert) {
      isNaN(startRadians) ? startRadians = 0 : false // nothing to do
      var radians = Math.atan2(deltaY, deltaX) + startRadians
      if (invert) {
        radians = -radians
      }
      while (radians < 0) {
        radians += twoPI
      }
      return radians
    }

    function startSlide(event, target) {
      var clickX = event.pageX
      var clickY = event.pageY
      var index = bars.indexOf(target)

      var barPoint = barPoints[index]
      var transform = barPoint.transform
      var ring = barPoint.ring
      var newRing = ring
      var length = barPoint.length
      var range = barPoint.range
      var degrees = barPoint.degrees
      var radians = degrees / degreesPerRadian
      var deltaX
        , deltaY
        , delta
        , deltaAngle
        , out
        , min
        , max
        , translate

      if (!index) {
        // Point the ball in the right direction 
        transform += " rotate ("+barPoint.degrees+" "+radius+" "+radius+")"
      }
    
      body.onmousemove = body.ontouchmove = drag
      body.onmouseup = body.ontouchend = stopDrag

      ;(function setMinAndMax(){
        // Choose widest range by default
        var inmost = range[0]
        var outmost = range[1]
        // Limit if blocked
        var blocked = getBlocked(index, degrees % 360)
        var ii

        for (ii = ring; ii > 0; ii -= 1) {
          if (blocked[ii - 1]) {
            inmost = ii
            break
          }
        }
        for (ii = ring; ii < outmost; ii += 1) {
          if (blocked[ii + length]) {
            outmost = ii
            break
          }
        }

        min = (inmost - ring) * width
        max = (outmost - ring) * width
      })()
    
      function drag(event) {
        deltaX = (event.pageX - clickX) * scale
        deltaY = (clickY - event.pageY) * scale
        delta  = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        deltaAngle = Math.abs(Math.atan2(deltaX, deltaY) - radians)
        out = Math.cos(deltaAngle) * delta

        out = Math.max(min, Math.min(out, max))
        newRing = ring + Math.round(out / width)

        //newRing = Math.max(range[0], Math.min(newRing, range[1]))
    
        translate = " translate(" + (out + ring * width) + " 0)"
        target.setAttributeNS(null, "transform", transform + translate)
      }
    
      function stopDrag(event) {
        // Snap bar into position
        barPoint.ring = newRing
        translate = " translate(" + (newRing * width) + " 0)"
        target.setAttributeNS(null, "transform", transform + translate)

        // Check which rings are now free to rotate
        free = [0, 0, true, true, true, true, 0]
        ring = barPoints[1].ring
        free[ring] = false
        free[ring + 1] = false
        free[ring + 2] = false
        ring = barPoints[2].ring
        free[ring] = false
        free[ring + 1] = false

        body.onmousemove = body.ontouchmove = null
        body.onmouseup = body.ontouchend = null

        if (barPoints[0].ring === 6) {
          showDone()
        }
      }
    }
    
    function getBlocked(index, degrees) {
      var blocked = []
      var rotation
        , gaps
        , bar
        , ring
        , occupied

      for (var ii = 0; ii < 7; ii += 1) {
        blocked[ii] = true // until proved innocent

        rotation = openings[ii]
        gaps = gapDegrees[ii]
        gaps.every(function (gap) {
          if ((rotation + gap) % 360 === degrees) {
            blocked[ii] = false
            return false
          }
          return true
        })
      }

      // Check for bars
      switch (index) {
        case 0:
          if (degrees === 0) {
            bar = barPoints[1]
          } else if (degrees === 144) {
            bar = barPoints[2]
          }
        break
        default:
          bar = barPoints[0]
          ;(bar.degrees === degrees) ? blocked[bar.ring] = true : null
      }

      if (!index) {
        // We're checking the movement of the ball: bar may have a value
        if (bar) {
          ring = bar.ring
          for (ii = 0; ii < bar.length; ii += 1) {
            blocked[ring + ii] = true
          }
        }
      }

      return blocked
    }

    function showDone() {
      var green = "#232"
      svg.onmousedown = svg.ontouchdown = null

      dials.forEach(function(path) {
        if (path) {
          //path = dials[index]
          path.setAttributeNS(null,"style","fill:"+green)
        }
      })
      dials.pop().setAttributeNS(null,"style","fill:"+green)

      bars.forEach(function(bar) {
        bar.setAttributeNS(null,"style","fill:"+green)
      })
      bars[0].setAttributeNS(null,"style","fill:#090")
      document.querySelector("svg.puzzle circle").setAttributeNS(null,"style","fill:"+green)
    }

    function setScale() {
      var rect = svg.getBoundingClientRect()
      pX = rect.left + rect.width / 2
      pY = rect.top + rect.height / 2
      scale = cX / (pX - rect.left)
      console.log(pX, cX, scale)
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