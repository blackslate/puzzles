
.iconFade {
  -webkit-animation-name: fade;
  -webkit-animation-duration: 500ms;
  -webkit-animation-fill-mode: forwards;

  -moz-animation-name: fade;
  -moz-animation-duration: 500ms;
  -moz-animation-fill-mode: forwards;

  -ms-animation-name: fade;
  -ms-animation-duration: 500ms;
  -ms-animation-fill-mode: forwards;

  -o-animation-name: fade;
  -o-animation-duration: 500ms;
  -o-animation-fill-mode: forwards;

  animation-name: example;
  animation-duration: 500ms;
  animation-fill-mode: forwards;
}

@-webkit-keyframes example {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@-moz-keyframes example {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@-ms-keyframes example {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@-o-keyframes example {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes example {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

;(function () {
  var body = document.body
  var $section = $("section")
  var $article = $("article")
  var svgNS = "http://www.w3.org/2000/svg"
  var xlinkNS = "http://www.w3.org/1999/xlink"
  var svg = document.querySelector("svg"); 
  var doors = []
  var open = -1
  var readyToPlay = false
  var svgRect
    , hash

  var puzzles = [
    { className: "rrr", hash: "#button",  x:   0, y:   0 }
  , { className: "rry", hash: "#window",  x: 125, y:   0 }
  , { className: "ryy", hash: "#jigsaw",  x: 250, y:   0 }
  , { className: "yg",  hash: "#maze",    x:   0, y: 125 }
  , { className: "gg",  hash: "#dials",   x: 125, y: 125 }
  , { className: "gc",  hash: "#fractal", x: 250, y: 125 }
  , { className: "ccb", hash: "#spot",    x:   0, y: 250 }
  , { className: "cbb", hash: "#missing", x: 125, y: 250 }
  , { className: "bbb", hash: "#trust",   x: 250, y: 250 }
  ]

  puzzles.forEach(function (puzzle) {
    createDoor(puzzle)
  })

  function createDoor(options) {
    var href = "puzzles/"+hash+"/icon.png"
    var g
      , transform
      , rect
      , icon
      , door
      , open
      , shut

    g = document.createElementNS(svgNS, "g")
    transform = "translate(" + options.x + " " + options.y + ")"
    g.setAttribute("class", options.className)
    g.setAttribute("data-hash", options.hash)
    g.setAttribute("transform", transform)
    svg.appendChild(g)
    doors.push(g)
    // Wall
    var rect = document.createElementNS(svgNS, "rect")
    rect.setAttribute("x", "0")
    rect.setAttribute("y", "0")
    rect.setAttribute("width", "120")
    rect.setAttribute("height", "120")
    g.appendChild(rect)
    // Doorway
    rect = document.createElementNS(svgNS, "rect")
    rect.setAttribute("x", "30")
    rect.setAttribute("y", "20")
    rect.setAttribute("width", "60")
    rect.setAttribute("height", "100")
    rect.setAttribute("fill", "#000")
    rect.setAttribute("opacity", "0.8")
    g.appendChild(rect)
    // Icon
    icon = document.createElementNS(svgNS, "image")
    icon.setAttributeNS(xlinkNS,"xlink:href", href);
    icon.setAttribute("x", "40")
    icon.setAttribute("y", "80")
    icon.setAttribute("width", "40")
    icon.setAttribute("height", "40")
    g.appendChild(icon)
    // Door
    door = document.createElementNS(svgNS, "polygon")
    door.setAttribute("points", "30,120 90,120 90,20 30,20")
    door.setAttribute("fill", "currentColor")
    g.appendChild(door)
    // Animate shut
    shut = document.createElementNS(svgNS, "animate")
    shut.setAttribute("class", "shut")
    shut.setAttribute("attributeName", "points")
    shut.setAttribute("begin", "indefinite")
    shut.setAttribute("dur", "500ms")
    shut.setAttribute("from", "100,120 90,120 90,20 100,10")
    shut.setAttribute("to", "30,120 90,120 90,20 30,20")
    shut.setAttribute("fill", "freeze")
    door.appendChild(shut)
    // Animate open
    open = document.createElementNS(svgNS, "animate")
    open.setAttribute("class", "open")
    shut.setAttribute("attributeName", "points")
    open.setAttribute("begin", "indefinite")
    open.setAttribute("dur", "500ms")
    open.setAttribute("from", "30,120 90,120 90,20 30,20")
    open.setAttribute("to", "100,120 90,120 90,20 100,10")
    open.setAttribute("fill", "freeze")
    door.appendChild(open)
  }

  ;(function prepareReset(){
    var reset = document.querySelector("a[href='#reset']")

    reset.onclick = function reset (event) {
      event.preventDefault()
      loadPuzzle(hash)
    }
  })()

  body.onmouseup = body.ontouchend = openDoor

  function openDoor(event) {
    var target = event.target
    var index

    while (target = target.parentNode) {
      if ((target.nodeName.toLowerCase() === "g")
       && (hash = target.getAttribute("data-hash"))) {
        break
      }
    }

    if (!target) {
      return
    }

    index = doors.indexOf(target)
    if (index === open) {
      enterRoom(target)
    } else {
      animate("shut", doors[open]) 
      animate("open", target)      
      open = index
    }

    function animate(animName, g) {
      if (!g) {
        return
      }

      var selector = "g[data-hash='"+g.getAttribute("data-hash")+"']"
      selector += " polygon animate." + animName
      var animation = document.querySelector(selector)
      animation.beginElement()
    }
  }

  function enterRoom(target) {
    var ratio = getSVGRatio()
    var scale = 1
    var scaleFactor = 1.1 // zooms to over 100x in 49, 300x in 60 frames
    var rect = target.getBoundingClientRect() 

    // Scale from centre
    var adjustX = rect.width / (2 * ratio)
    var adjustY = rect.height / (2 * ratio)
    var centreX = (rect.left - svgRect.left) / ratio + adjustX
    var centreY = (rect.top - svgRect.top) / ratio + adjustY
    var start = + new Date()
    var zoomDuration = 1000

    var left
      , top
      , transform

    // Get the puzzle from the site
    loadPuzzle(hash)

    // Stop tracking the user's input for this activity
    body.onmouseup = body.ontouchend = null

    svg.removeChild(target)
    target.setAttributeNS(null, "x", "0")
    target.setAttributeNS(null, "y", "0")
    svg.appendChild(target)

    var selector = "g[data-hash='" + hash + "'] image"
    var image = document.querySelector(selector)
    image.classList.add("iconFade")
    var duration = getDuration(".iconFade", "animation-duration")
    setTimeout(zoom, duration)
    zoomDuration += duration

    function zoom(){
      scale *= scaleFactor
      left = centreX - adjustX * scale
      top = centreY - adjustY * scale

      transform = "translate(" + left + " " + top + ") "
      transform += "scale(" + scale + ")"
      target.setAttributeNS(null, "transform", transform)
      
      if ((+ new Date() - start) < zoomDuration) {
        setTimeout(zoom, 16)
        console.log(new Date() - start, zoomDuration)
      } else {
        preparePuzzle()
      }
    }
  }

  function getSVGRatio() {
    svgRect = svg.getBoundingClientRect()
    var box = svg.viewBox.animVal

    var widthRatio = svgRect.width / box.width
    var heightRatio = svgRect.height / box.height
    var ratio = Math.min(widthRatio, heightRatio)

    return ratio
  }

  function loadPuzzle(hash) {
    // hash is "#puzzlename"
    // GET AJAX AND CALL preparePuzzle() ON SUCCESS
    var result = "puzzles/" + hash.substring(1) + "/index.html"
    $article.load( result, done);

    function done() {
      preparePuzzle()
    }
  }

  function preparePuzzle(hash) {
    if (readyToPlay) {
      // The AJAX call has already returned successfully, or the zoom
      // animation is complete
      startPuzzle()
    } else {
      readyToPlay = true
    }
  }

  function startPuzzle() {
    $section.removeClass("hidden")
  }
  
  // function getTransitionDurationOfElement(el) {
  //   var s = parseFloat(getComputedStyle(el)['transitionDuration'])
  //   return s * 1000
  // }

  /** @return number 0 or calculated value */
  function getDuration(className, key) {
    var duration = 0
    var styleKey = getStyle(className, key)
    if (styleKey) {
      // all 0.5s linear
      var regex = /(\d*\.?\d+)(\w+)/
      var result = regex.exec(styleKey)
      var unit
      if (result) {
        duration = parseFloat(result[1], 10)
        unit = result[2]

        switch (unit) {
          case "s":
            duration *= 1000
          break
        }
      }
    }

    return duration
  }

  /** @return string rule or value | undefined **/
  function getStyle(className, key) {
    var classes = document.styleSheets[0].rules 
               || document.styleSheets[0].cssRules
    var rule
      , value
      , regex
      , result

    for (var x = 0; x < classes.length; x++) {
      if (classes[x].selectorText == className) {
        (classes[x].cssText)
          ? rule = classes[x].cssText
          : rule = classes[x].style.cssText
        // "image.fade { opacity: 0; transition: all 0.5s linear; }"
        
        rule = /\{(.*)\}/.exec(rule)[1].trim()

        if (key) {
          regex = new RegExp(key +"\s*:\s*([^;$]*)", "g")        
          while (result = regex.exec(rule)) {
            value = result.pop().trim()
          }
        } else {
          value = rule
        }

        return value
      }
    }
  }
})()