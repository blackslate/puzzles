;(function puzzleManager(window){
  var STORAGE_NAME = "goMap"
  var CLASSES = { started: "started", todo: "todo" }

  document.querySelector("nav").addEventListener(
    "mouseup"
  , showGame
  , false)
  document.querySelector("nav").addEventListener(
    "touchstart"
  , prepareForDrag
  , false)
  document.querySelector("nav").addEventListener(
    "touchend"
  , checkForDrag
  , false)

  window.puzzle = {
    map: {}
  , hash: ""
  , completed: puzzleCompleted
  }

  var puzzleObject

  var puzzle_css = document.querySelector(".puzzle_css")
  var puzzle_js = document.querySelector(".puzzle_js")
  var $main = $("body>main")
  var isIPhone =navigator.userAgent.toLowerCase().indexOf("iphone")>-1
  var isIE = (navigator.userAgent.indexOf('MSIE') > -1
           || navigator.appVersion.indexOf('Trident/') > -1)
  // Does this also also detect Android?
  var links = [].slice.call(document.querySelectorAll("nav a"))
  var dragStart
  var link
  var playedMap

  try {
    playedMap = JSON.parse(localStorage[STORAGE_NAME])
  } catch(error) {}

  if (!playedMap) {
    playedMap = {}
  }

  // Prevent the user from moving and resizing by mistake on a mobile
  $main.on("touchstart", function(event) {
    event.preventDefault
      ? event.preventDefault()
      : (event.returnValue = false)
  })

  ;(function disableByPlatform(){
    var disabled = []
    var link

    if (isIPhone) {
      disabled.push("#simple")
    } else if (isIE) {
      disabled.push("#dot")
    }

    for (var ii in disabled) {
      link = document.querySelector("li a[href='"+ disabled[ii]+"']")
      if (link) {
        link.style.display = "none"
      }
    }
  })()

  // Check which puzzles the user has already solved
  ;(function showPlayedGames(){
    if (!window.localStorage) {
      return
    }

    // { button: 0, dials: 1 } // started = 0, done = 1
    var hash
      , status

    links.forEach(function checkStatus(link) {
      hash = getHash(link)
      status = playedMap[hash] // undefined | 0 | 1
      showStatus(link, status)
    })
  })()

  function showStatus(link, status) {
    if (isNaN (status)) {
        link.classList.add(CLASSES.todo)
    } else if (status) {
      link.classList.remove(CLASSES.todo)
      link.classList.remove(CLASSES.started)
    } else {
      link.classList.remove(CLASSES.todo)
      link.classList.add(CLASSES.started)
    }
  }

  function prepareForDrag(event) {
    dragStart = getClientLoc(event)  
  }

  function checkForDrag(event) {
    var dragEnd = getClientLoc(event)
    var dragX = dragEnd.x - dragStart.x
    var dragY = dragEnd.y - dragStart.y
    var drag2 = (dragX * dragX) + (dragY * dragY)

    if (drag2 < 9) {
      showGame(event)
    }
  }

  // Load the chosen game
  function showGame(event) {
    link = event.target // becomes <a> element or undefined

    /**
     * Extracts "puzzleName" from the link the user clicked, e.g.
     *   "http://example.com/folder/index.html#puzzleName"
     * @return {string or false}
     */
    var hash = getHash()

    if (!hash) {
      // The click was on a nav sub-element above the <a> element
      return
    }

    var status = updatePlayedStatus(hash, 0) // 0 | 1
    showStatus(link, status)

    // CLEAN UP EXISTING PUZZLE IF THERE IS ONE
    if (puzzleObject && puzzleObject.kill) {
      puzzleObject.kill()
    }
    $main.empty() // ensure no CSS conflict between puzzles

    // PREPARE PATHs FOR NEW PUZZLE
    var path = "data/puzzles/" + hash + "/puzzle."
    
    // CHECK IF THIS PUZZLE HAS ALREADY BEEN LOADED
    puzzleObject = puzzle.map[hash]
    if (puzzleObject) {
      // Set the CSS and HTML for this puzzle from cache
      puzzle_css.setAttribute("href", path + "css")
      $main.load( path + "html", reloadPuzzle )
    } else {
      loadPuzzle()
    }

    function loadPuzzle() {
      puzzle.hash = hash

      // GET AJAX AND CALL preparePuzzle() ON SUCCESS
      var remaining = 3

      $main.load( path+"html", loaded)
      puzzle_css = swapFile(puzzle_css, "link", "href", path + "css")
      puzzle_js = swapFile(puzzle_js, "script", "src", path + "js")

      function loaded (mainElement) {
        checkIfAllIsLoaded()
      }

      function elementLoaded(event) {
        var element = event.target
        element.removeEventListener("load", elementLoaded, false)
        checkIfAllIsLoaded()
      }

      function checkIfAllIsLoaded() {
        if (!--remaining) {
          // HTML and CSS are ready, and the IIFE in the JS file will
          // have 
          puzzleObject = puzzle.map[hash]
          if (puzzleObject && puzzleObject.initialize) {
            puzzleObject.initialize()
          } else {
            console.log("Unable to initialize puzzle " + hash)
          }
        }
      }

      function swapFile(current, type, attribute, path) {
        var element = document.createElement(type)
        current.parentNode.replaceChild(element, current)
        element.addEventListener("load", elementLoaded, false)
        if (type === "link") {
          element.setAttribute("rel", "stylesheet")
          element.setAttribute("type", "text/css")
        }
        element.setAttribute(attribute, path)

        return element
      }
    }

    function reloadPuzzle() {
      puzzleObject.initialize()
    }
  }

  function updatePlayedStatus(hash, newStatus) {
    var currentStatus = playedMap[hash]
    if (currentStatus) {
      // Ignore a newStatus of 0
      return currentStatus
    }

    if (currentStatus !== newStatus) {
      playedMap[hash] = newStatus
    }

    localStorage[STORAGE_NAME] = JSON.stringify(playedMap)

    return newStatus
  }

  function getHash(externalLink) {
    // Uses link from closure, and modifies it
    var notLink = true
    var index

    if (externalLink) {
      link = externalLink
    }

    // Find <a> element in hierarchy
    while (link // not undefined
        && link.tagName // not body
        && (notLink = link.tagName.toLowerCase() !== "a") // not <a>
      ) {
      link = link.parentNode // may now be <a>
    }

    if (notLink) {
      hash = false
    } else {
      index = link.href.indexOf("#") + 1
      hash = link.href.substring(index)
    }

    return hash
  }

  function getLink(hash) {
    var link

    links.every(function showMatchingGame(testLink) {
      if (hash === getHash(testLink)) {
        link = testLink
        return false
      }

      return true
    })

    return link
  }

  function puzzleCompleted(hash) {
    var link = getLink(hash)

    updatePlayedStatus(hash, 1)
    showStatus(link, 1)
  }

  // Lead the game defined by the window.location.hash, if it exists
  function openGame(hash) {
    var link

    while (hash.charAt(0) === "#") {
      hash = hash.substring(1)
    }

    link = getLink(hash)

    if (link) {
      showGame({ target: link })
    }
  }

  openGame(window.location.hash)
})(window)

/**
 * createSquareArea — workaround for the lack of vmin|vmax support
 *                    on iOS 7
 * @param  {object} window   creates minifiable copy of global
 * @param  {object} document creates minifiable copy of global
 */
;(function createSquareArea(window, document) {
  var main = document.querySelector("main")
  var nav = document.querySelector("nav")
  var navWidth = nav.getBoundingClientRect().width
  var debounceDelay = 100
  var timeout

  window.onresize = windowResized
  maintainRatio()

  function windowResized() {
    if (timeout) {
      window.clearTimeout(timeout)
    }
    timeout = window.setTimeout(maintainRatio, debounceDelay)
  }

  function maintainRatio() {
    timeout = 0
    var tweak = 6 // to avoid showing scrollbars unnecessarily

    var windowHeight = window.innerHeight
    var mainWidth = window.innerWidth - navWidth
    var minDimension = Math.min(windowHeight, mainWidth) - tweak

    var left = (mainWidth - minDimension) / 2 + navWidth
    var top = (windowHeight - minDimension) / 2

    main.style.left = left + "px"
    main.style.top = top + "px"
    main.style.width = minDimension + "px"
    main.style.height = minDimension + "px"

    broadcastEvent("windowResized") // so that puzzles can use it
  }

  function broadcastEvent(eventName) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent#Notes
    var event = document.createEvent('Event')
    event.initEvent(eventName, true, true) // bubbles, cancelable
    document.dispatchEvent(event)
  }
})(window, document)

/**
 * Utility method
 * @param  {mouse event|touch event} event [description]
 * @return {object}       { x: <...pageX>, y: <...pageY> }
 */
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
