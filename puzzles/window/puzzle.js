// ENsure pictures are loaded
// full.jpg is stretched and clipped 
// view.jpg, over.jpg and whole thing not placed 
// CSS may be applied before new images and js are loaded


function puzzleLoaded() {
  var body = document.body
  var article = document.querySelector("article")
  var wall = document.querySelector("#wall")
  var svg = document.querySelector("svg")
  var canvas = document.querySelector("canvas")
  var over = document.querySelector("#over")
  var context = canvas.getContext("2d") 

  var polygons = []
  var tops = [
    210
  , 222.5
  , 185
  , 160
  , 110
  , 110
  , 110
  , 110
  , 147.5
  , 185
  , 185
  ]
  var randomLeft = getRandomLeft()
  var translates = [
    { left: randomLeft[0], top: tops[0] }
  , { left: randomLeft[1], top: tops[1] }
  , { left: randomLeft[2], top: tops[2]}
  , { left: randomLeft[3], top: tops[3] }
  , { left: randomLeft[4], top: tops[4] }
  , { left: randomLeft[5], top: tops[5] }
  , { left: randomLeft[6], top: tops[6] }
  , { left: randomLeft[7], top: tops[7] }
  , { left: randomLeft[8], top: tops[8] }
  , { left: randomLeft[9], top: tops[9] }
  , { left: randomLeft[10], top: tops[10] }
  ]
  var gaps = translates.length

  body.ontouchstart = body.onmousedown = startDrag

  function getRandomLeft() {
    var randomLeft = []
    for (var ii = 0; ii < 11; ii += 1) {
      randomLeft.push(Math.random() * 300 - 150)
    }
    return randomLeft
  }

  function createCanvas() {
    wall.src = wallImg = "puzzles/window/img/wall.jpg"
    over.src = overImg = "puzzles/window/img/over.png"

    canvas.width = view.width
    canvas.height = view.height
    //context.drawImage(view, 0, 0)

    showView()
  }
  var view = new Image()
  view.onload = createCanvas

  ;(function initializeGlass(){
    var collection = document.querySelectorAll("polygon")
    // var stuck = [0,1,2,4,6,7,10]
    // var random = Math.floor(Math.random() * stuck.length)
    // translates[stuck[random]] = { left: 0, top: 0 }
    // gaps -= 1
    var translate
      , transform
    for (var ii = 0, polygon; polygon = collection[ii]; ii += 1) {
      translate = translates[ii]
      transform = "translate("+translate.left+" "+translate.top+")"
      polygon.setAttributeNS(null, "transform", transform)
      polygons.push(polygon)
    }
  })()

  function startDrag(event) {
    event.preventDefault()
    var ratio = getSVGRatio()
    var target = event.target
    if (target.nodeName.toLowerCase() !== "polygon") {
      return
    }
  
    var index = polygons.indexOf(target)
    var translate = translates[index]
    if (!translate.left && !translate.top) {
      // Already in place
      return
    }
    var clickX = event.pageX
    var clickY = event.pageY
    var startLeft = translate.left
    var startTop = translate.top

    body.onmousemove = body.ontouchmove = drag
    body.onmouseup = body.ontouchend = stopDrag

    function drag(event) {
      var x = event.pageX
      var y = event.pageY
      var deltaX = x - clickX
      var deltaY = y - clickY
      var left = startLeft + deltaX / ratio
      var top = startTop + deltaY / ratio
      var transform = "translate(" + left + " " + top + ")"
      target.setAttributeNS(null, "transform", transform)

      translate.left = left
      translate.top = top
      showView()
    }

    function stopDrag(event) {
      var index = polygons.indexOf(target)
      var delta2 = translate.left * translate.left
                 + translate.top * translate.top
      var left
        , top
        , transform

      if (delta2 < 100) {
        translate.left = 0
        translate.top = 0

        gaps -= 1
        if (!gaps) {
          wall.src = fullImg
          article.removeChild(svg)
          article.removeChild(canvas)
          article.removeChild(over)
          body.onmousedown = body.ontouchstart = null
        }
      } else {
        left = randomLeft[index]
        top = tops[index]
        translate.left = left
        translate.top = top
        transform = "translate(" + left + " " + top + ")"
        target.setAttributeNS(null, "transform", transform)
      }

      showView()

      body.onmousemove = body.ontouchmove = body.onmouseup = body.ontouchend = null
    }
  }

  function showView() {
    var translate
    var polygon
      , left
      , top
      , points
      , count
      , point
 
    context.beginPath()
    for (var ii = 0; ii < polygons.length; ii += 1) {
      translate = translates[ii]
      polygon = polygons[ii]
      left = translate.left
      top = translate.top
      if (!left && !top) {
        polygon.setAttributeNS(null, "stroke", "none")
        polygon.setAttributeNS(null, "fill", "none")
      }

      points = polygon.points
      count = points.length || points.numberOfItems
      point = points.getItem(0)
      context.moveTo(point.x + left, point.y + top)
      for(var jj = 1; jj < count; jj += 1) {
        point = polygon.points.getItem(jj)
        context.lineTo(point.x + left, point.y + top)
      }
    }

    context.save()
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.clip()
    context.drawImage(view, 0, 0)
    context.restore()
  }

  function getSVGRatio() {
    var rect = svg.getBoundingClientRect()
    var box = svg.viewBox.animVal

    var widthRatio = rect.width / box.width
    var heightRatio = rect.height / box.height
    var ratio = Math.min(widthRatio, heightRatio)

    return ratio
  }

<!-- https://pixabay.com/p-81928/?no_redirect -->
<!-- http://sesenke.deviantart.com/art/Dirty-Damaged-Brick-Wall-covered-with-cement-377366379 -->

view.src="puzzles/window/img/view.jpg"
var fullImg="puzzles/window/img/view.jpg"
}