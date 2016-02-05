
;(function () {
  var body = document.body
  var $section = $("section")
  var $article = $("article")
  var $script = $("script.puzzle")
  var $style = $("link.puzzle")
  var svgNS = "http://www.w3.org/2000/svg"
  var xlinkNS = "http://www.w3.org/1999/xlink"
  var svg = document.querySelector("svg"); 
  var doors = [].slice.call(document.querySelectorAll("svg>g"))
  var open = -1
  var readyToPlay = false
  var svgRect
    , hash

  var puzzles = [
    { className: "rrr", hash: "button",  x:   0, y:   0 }
  , { className: "rry", hash: "window",  x: 125, y:   0 }
  , { className: "ryy", hash: "jigsaw",  x: 250, y:   0 }
  , { className: "yg",  hash: "maze",    x:   0, y: 125 }
  , { className: "gg",  hash: "dials",   x: 125, y: 125 }
  , { className: "gc",  hash: "fractal", x: 250, y: 125 }
  , { className: "ccb", hash: "spot",    x:   0, y: 250 }
  , { className: "cbb", hash: "missing", x: 125, y: 250 }
  , { className: "bbb", hash: "trust",   x: 250, y: 250 }
  ]

  puzzles.forEach(createDoor)

  function createDoor(options, index) {
    var door = doors[index]
    var href = "puzzles/"+options.hash+"/icon.png"
    var transform = "translate(" + options.x + " " + options.y + ")"
    door.setAttribute("class", options.className)
    door.setAttribute("transform", transform)
    door.setAttribute("data-hash", "#"+options.hash)

    var children = [].slice.call(door.childNodes)
    children.every(function(child) {
      if (child.nodeName.toLowerCase() === "image") {
        child.setAttributeNS(xlinkNS,"xlink:href", href)
        return false
      }

      return true
    })
  }

  ;(function prepareReset(){
    var reset = document.querySelector("a[href='#reset']")

    reset.onclick = function reset (event) {
      event.preventDefault()
      //loadPuzzle()
      puzzleLoaded(true)
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
 
    var left
      , top
      , transform

    // Get the puzzle from the site
    loadPuzzle()

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
    setTimeout(startZoom, duration)

    function startZoom () {
      var zoomDuration = 1000
      var end = + new Date() + zoomDuration
      var selector = "g[data-hash='" + hash + "'] rect animate.black"
      var animation = document.querySelector(selector)
      animation.beginElement()

      ;(function zoom(){
        scale *= scaleFactor
        left = centreX - adjustX * scale
        top = centreY - adjustY * scale

        transform = "translate(" + left + " " + top + ") "
        transform += "scale(" + scale + ")"
        target.setAttributeNS(null, "transform", transform)
        
        if (+ new Date() < end) {
          setTimeout(zoom, 16)
        } else {
          preparePuzzle()
        }
      })()
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

  function loadPuzzle() {
    // hash is "#puzzlename"
    // GET AJAX AND CALL preparePuzzle() ON SUCCESS
    var path = "puzzles/" + hash.substring(1) + "/puzzle."
    var remaining = 3

    //puzzleLoaded = null
    $script.on("load", done)
    $style.on("load", done)

    $article.load( path+"html", done)
    $script.attr("src", path+"js")
    $style.attr("href", path+"css")

    function done() {
      if (!--remaining) {
        preparePuzzle()
      }
    }
  }

  function preparePuzzle() {
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
    puzzleLoaded(hash)
  }

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