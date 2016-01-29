;(function (){
  document.querySelector("nav").addEventListener(
    "click"
  , showGame
  , false)

  var puzzle_css = document.querySelector("#puzzle_css")
  var puzzle_js = document.querySelector("#puzzle_js")
  var $article = $("body>article")

  function showGame(event) {
    var hash = (function getHash(link) {
      var notLink = true
      var index

      // Find <a> element in hierarchy
      while (link 
          && link.tagName
          && (notLink = link.tagName.toLowerCase() !== "a")
        ) {
        link = link.parentNode
      }

      if (notLink) {
        link = false
      } else {
        index = link.href.indexOf("#") + 1
        link = link.href.substring(index)
        //link += "/puzzle.html"
      }

      return link
    })(event.target)

    if (!hash) {
      // The click was on a nav sub-element above the <a> element
      return
    }

    (function loadPuzzle() {
      // hash is "puzzlename"
      // GET AJAX AND CALL preparePuzzle() ON SUCCESS
      var path = "puzzles/" + hash + "/puzzle."
      var remaining = 3

      puzzle_js.addEventListener("load", done, false)
      puzzle_css.addEventListener("load", done, false)

      $article.load( path+"html", loaded)
      puzzle_js.setAttribute("src", path + "js")
      puzzle_css.setAttribute("href", path + "css") 

      function loaded (mainElement) { 
        checkIfAllIsLoaded()
      }

      function done(event) {
        event.target.removeEventListener("load", done, false)
        checkIfAllIsLoaded()
      }

      function checkIfAllIsLoaded() {}
        if (!--remaining) {
          puzzleLoaded(hash) // in the newly loaded puzzle.js script
        }
      
    })()
  }
})()


// ;(function createSquareArea() {
//   var main = document.querySelector("main")
//   var nav = document.querySelector("nav")
//   var navWidth = nav.getBoundingClientRect().width
//   var debounceDelay = 100
//   var timeout

//   window.onresize = windowResized
//   maintainRatio()

//   function windowResized() {
//     if (timeout) {
//       window.clearTimeout(timeout)
//     }
//     timeout = window.setTimeout(maintainRatio, debounceDelay)
//   }

//   function maintainRatio() {
//     timeout = 0

//     var windowHeight = window.innerHeight
//     var mainWidth = window.innerWidth - navWidth
//     var minDimension = Math.min(windowHeight, mainWidth)
    
//     var left = (mainWidth - minDimension) / 2 + navWidth
//     var top = (windowHeight - minDimension) / 2

//     main.style.left = left + "px"
//     main.style.top = top + "px"
//     main.style.width = minDimension + "px"
//     main.style.height = minDimension + "px"
//   }
// })()