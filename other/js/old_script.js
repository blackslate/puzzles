;(function (){
  document.querySelector("nav").addEventListener(
    "click"
  , showGame
  , false)

  var puzzle_css = document.querySelector("#puzzle_css")
  var puzzle_js = document.querySelector("#puzzle_js")
  var $main = $("body>main")

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
        // HACK: change class to show that it's been visited
        // Mozilla doesn't allow modifications to sub-elements for
        // privacy reasons:
        // https://developer.mozilla.org/en-US/docs/Web/CSS/Privacy_and_the_:visited_selector
        link.classList.add("done")

        index = link.href.indexOf("#") + 1
        link = link.href.substring(index)
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

      $main.empty() // ensure no CSS conflict between puzzles
      puzzleLoaded = function() { console.log("placeholder") }
      $main.load( path+"html", loaded)
      puzzle_js.setAttribute("src", path + "js")
      puzzle_css.setAttribute("href", path + "css") 

      function loaded (mainElement) {
        checkIfAllIsLoaded()
      }

      function done(event) {
        event.target.removeEventListener("load", done, false)
        checkIfAllIsLoaded()
      }

      function checkIfAllIsLoaded() {
        if (!--remaining) {
          puzzleLoaded(hash) // in the newly loaded puzzle.js script
        }
      }
    })()
  }
})()