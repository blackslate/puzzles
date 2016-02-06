var openPuzzle

;(function puzzleManager(window){
  document.querySelector("nav").addEventListener(
    "click"
  , showGame
  , false)
  document.querySelector("nav").addEventListener(
    "touchend"
  , showGame
  , false)

  window.puzzle = {
    map: {}
  , hash: ""
  }

  var puzzleObject

  var puzzle_css = document.querySelector(".puzzle_css")
  var puzzle_js = document.querySelector(".puzzle_js")
  var $main = $("body>main")

  $main.on("touchstart", function(event) {
    event.preventDefault()
  })

  function showGame(event) {
    var link = event.target // becomes <a> element or undefined

    /**
     * Extracts "puzzleName" from the link the user clicked, e.g.
     *   "http://example.com/folder/index.html#puzzleName"
     * @return {string or false}
     */
    var hash = getHash(link)

    if (!hash) {
      // The click was on a nav sub-element above the <a> element
      return
    }

    // CHANGE APPEARANCE OF LINK IMAGE
    // HACK: change class to show that it's been visited
    // Mozilla doesn't allow modifications to sub-elements for
    // privacy reasons:
    // https://developer.mozilla.org/en-US/docs/Web/CSS/Privacy_and_the_:visited_selector
    link.classList.add("done")

    // CLEAN UP EXISTING PUZZLE IF THERE IS ONE
    if (puzzleObject && puzzleObject.kill) {
      puzzleObject.kill()
    }
    $main.empty() // ensure no CSS conflict between puzzles

    // PREPARE PATHs FOR NEW PUZZLE
    var path = "puzzles/" + hash + "/puzzle."
    
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

      function done(event) {
        var element = event.target
        element.removeEventListener("load", done, false)
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
            alert("Unable to initialize puzzle " + hash)
          }
        }
      }

      function swapFile(current, type, attribute, path) {
        var temp = document.createElement(type)
        current.parentNode.replaceChild(temp, current)
        temp.addEventListener("load", done, false)
        if (type === "link") {
          temp.setAttribute("rel", "stylesheet")
          temp.setAttribute("type", "text/css")
        }
        temp.setAttribute(attribute, path)
        return temp
      }
    }

    function reloadPuzzle() {
      puzzleObject.initialize()
    }
  }

  function getHash(link) {
    // Uses link from closure, and modifies it
    var notLink = true
    var index

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

  function openPuzzle(gameName) {
    var links = [].slice.call(document.querySelectorAll("nav a"))
    var hash
      , success

    while (gameName.charAt(0) === "#") {
      gameName = gameName.substring(1)
    }

    links.every(function (link) {
      hash = getHash(link)
      if (hash === gameName) {
        success = showGame({ target: link })
        return false
      }

      return true
    })
  }

  openPuzzle(window.location.hash)
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

    var windowHeight = window.innerHeight
    var mainWidth = window.innerWidth - navWidth
    var minDimension = Math.min(windowHeight, mainWidth)

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