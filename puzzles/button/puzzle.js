function puzzleLoaded(reloaded){
  var svg = document.querySelector("svg.puzzle")
  var panic = document.querySelector("#panic")
  var div = document.querySelector("div")
  var red = document.querySelector("div#red")

  if (reloaded) {
    panic.classList.remove("panic")
    div.classList.remove("show")
    div.classList.remove("fade")
    red.classList.remove("show")
  }

  svg.onmouseup = svg.ontouchstart = pressButton

  function pressButton(event) {
    var rect = svg.getBoundingClientRect()
    var cX = (rect.left + rect.right) / 2
    var cY = (rect.top + rect.bottom) / 2
    var r = (rect.width / 2)
    var dX = cX - event.pageX
    var dY = cY - event.pageY
    if ((dX * dX + dY * dY) > r * r) {
      return
    }

    svg.onmouseup = svg.ontouchstart = null
    panic.classList.add("panic")
    div.classList.add("show")
    div.classList.add("fade")
    red.classList.add("show")
    
    setTimeout(function () {
      red.classList.remove("show")
    }, 40)
  }
}