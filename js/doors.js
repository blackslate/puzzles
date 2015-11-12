
;(function () {
  var body = document.body
  var $section = $("section")
  var $article = $("article")
  var svgNS = "http://www.w3.org/2000/svg"
  var xlinkNS = "http://www.w3.org/1999/xlink"
  var svg = document.querySelector("svg"); 
  var g = document.querySelector("svg>g")
  var doors = [].slice.call(document.querySelectorAll("svg.doors>g"))
  var open = -1
  var readyToPlay = false
  var svgRect
    , hash

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

    var selector = "g[data-hash='" + hash + "']"
    selector += " image animate.fade"
    var animation = document.querySelector(selector)
    var duration = parseInt(animation.getAttribute("dur"), 10)
    animation.beginElement()
    setTimeout(zoom, duration)

    function zoom(){
      scale *= scaleFactor
      left = centreX - adjustX * scale
      top = centreY - adjustY * scale

      transform = "translate(" + left + " " + top + ") "
      transform += "scale(" + scale + ")"
      target.setAttributeNS(null, "transform", transform)
      
      if ((+ new Date() - start) < 1000) {
        setTimeout(zoom, 16)
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
})()