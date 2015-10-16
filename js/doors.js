
;(function () {
  var body = document.body
  var svgNS = "http://www.w3.org/2000/svg"
  var xlinkNS = "http://www.w3.org/1999/xlink"
  var svg = document.querySelector("svg"); 
  var g = document.querySelector("svg>g")
  var open = -1
  var doors = []
  var locked = [7,8,9,10,11,12,13,14,15]
  var readyToPlay = false

  ;(function initializeDoors(){
    var collection = document.querySelectorAll("svg>g>use")
    var ratio = getSVGRatio()
    var gRect = g.getBoundingClientRect()
    var rect
      , left
      , top
      , lock

    for (var ii = 0, door; door = collection[ii]; ii += 1) {
      doors.push(door)
      
      // TODO: add icon for open door

      if (locked.indexOf(ii) > -1) {
        rect = door.getBoundingClientRect()
        left = String((rect.left - gRect.left) / ratio)
        top = String((rect.top - gRect.top) / ratio)

        lock = document.createElementNS(svgNS,"use")
        lock.setAttributeNS(xlinkNS,"xlink:href", "#lock")
        lock.setAttributeNS(null,"x", left)
        lock.setAttributeNS(null,"y", top)
        lock.setAttributeNS(null,"class", door.classList[0])
   
        g.appendChild(lock)
      }
    }
  })()

  body.onmouseup = body.ontouchend = openDoor

  function openDoor(event) {
    var target = event.target
    var index

    while (target.parentNode
       && target.parentNode.nodeName.toLowerCase() !== "g") {
      target = target.parentNode
    }

    if (!target) {
      return
    }

    index = doors.indexOf(target)
    if (locked.indexOf(index) < 0) {
      if (index === open) {
        enterRoom(target)
      } else {
        (doors[open]) 
          ? doors[open].setAttributeNS(xlinkNS, "xlink:href", "#shut")
          : null
        target.setAttributeNS(xlinkNS, "xlink:href", "#open")
        open = index
      }
    }
  }

  function enterRoom(target) {
    var ratio = getSVGRatio()
    var scale = 1
    var scaleFactor = 1.1 // zooms to over 100x in 49, 300x in 60 frames
    var gRect = g.getBoundingClientRect()
    var rect = target.getBoundingClientRect() 

    // Scale from centre
    var adjustX = rect.width / (2 * ratio)
    var adjustY = rect.height / (2 * ratio)
    var centreX = (rect.left - gRect.left) / ratio + adjustX
    var centreY = (rect.top - gRect.top) / ratio + adjustY
    var start = + new Date()

    var left
      , top
      , transform

    // Stop tracking the user's input for this activity
    body.onmouseup = body.ontouchend = null

    g.removeChild(target)
    target.setAttributeNS(null, "x", "0")
    target.setAttributeNS(null, "y", "0")
    g.appendChild(target)

    loadPuzzle(target.getAttribute("data-hash"))

    ;(function zoom(){
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
    })()
  }

  function getSVGRatio() {
    var rect = svg.getBoundingClientRect()
    var box = svg.viewBox.animVal

    var widthRatio = rect.width / box.width
    var heightRatio = rect.height / box.height
    var ratio = Math.min(widthRatio, heightRatio)

    return ratio
  }

  function loadPuzzle(hash) {
    // GET AJAX AND CALL preparePuzzle() ON SUCCESS
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

  }
})()