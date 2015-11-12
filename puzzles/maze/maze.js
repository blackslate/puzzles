;(function (){
  var body = document.body
  body.ontouchstart = function(event) {
    event.preventDefault()
  }

  var svgNS = "http://www.w3.org/2000/svg"
  var xlinkNS = "http://www.w3.org/1999/xlink"
  var svg = document.querySelector("svg")
  var mouse = document.querySelector("img#mouse")
  var width = svg.viewBox.animVal.width
  var counter = 0
  var win = false
  var maze = [
    // Top row
    [ { row: [1,2,3,4,5,6,7,8,9]
      , column: [1,2,3,4,5,6,7,8,9]
      }
    , { row: [0,2,3,4,5,6,7,8,9]
      , column: []
      }
    , { row: [0,1,3,4,5,6,7,8,9]
      , column: []
      }
    , { row: [0,1,2,4,5,6,7,8,9]
      , column: []
      }
    , { row: [0,1,2,3,5,6,7,8,9]
      , column: []
      }
    , { row: [0,1,2,3,4,6,7,8,9]
      , column: []
      }
    , { row: [0,1,2,3,4,5,7,8,9]
      , column: []
      }
    , { row: [0,1,2,3,4,5,6,8,9]
      , column: []
      }
    , { row: [0,1,2,3,4,5,6,7,9]
      , column: []
      }
    , { row: [0,1,2,3,4,5,6,7,8]
      , column: [1,2,3,4,5,6,7,8,9]      
      , rotation: 0
      }
    ]

  // Row 1
  , [ { row: [1,2,3,4,5,6,7,8]
      , column: [0,2,3,4,5,6,7,8,9]
      }
    , { row: [0,2,3,4,5,6,7,8]
      , column: [2,3,4,5,6,7,8]
      }
    , { row: [0,1,3,4,5,6,7,8]
      , column: [2]
      }
    , { row: [0,1,2,4,5,6,7,8]
      , column: []
      }
    , { row: [0,1,2,3,5,6,7,8]
      , column: []
      }
    , { row: [0,1,2,3,4,6,7,8]
      , column: [2]
      }
    , { row: [0,1,2,3,4,5,7,8]
      , column: []
      }
    , { row: [0,1,2,3,4,5,6,8]
      , column: []
      }
    , { row: [0,1,2,3,4,5,6,7]
      , column: [2]
      }
    , { row: []
      , column: [0,2,3,4,5,6,7,8,9]
      }
    ]

  // Row 2
  , [ { row: []
      , column: [0,1,3,4,5,6,7,8,9]
      }
    , { row: [2]
      , column: [1,3,4,5,6,7,8]
      }
    , { row: [1]
      , column: [1]
      }
    , { row: [4,5]
      , column: [3,4]
      }
    , { row: [3,5]
      , column: []
      }
    , { row: [3,4]
      , column: [1]
      }
    , { row: [7,8]
      , column: [3]
      }
    , { row: [6,8]
      , column: []
      }
    , { row: [6,7]
      , column: [1]
      }
    , { row: []
      , column: [0,1,3,4,5,6,7,8,9]
      }
    ]

  // Row 3
  , [ { row: []
      , column: [0,1,2,4,5,6,7,8,9]
      }
    , { row: []
      , column: [1,2,4,5,6,7,8]
      }
    , { row: [3]
      , column: [4,5,6,7,8]
      }
    , { row: [2]
      , column: [2,4]
      }
    , { row: [5]
      , column: [4]
      }
    , { row: [4]
      , column: [4]
      }
    , { row: [7,8]
      , column: [2]
      }
    , { row: [6,8]
      , column: []
      }
    , { row: [6,7]
      , column: [4]
      }
    , { row: []
      , column: [0,1,2,4,5,6,7,8,9]
      }
    ]

  // Row 4
  , [ { row: []
      , column: [0,1,2,3,5,6,7,8,9]
      }
    , { row: []
      , column: [1,2,3,5,6,7,8]
      }
    , { row: []
      , column: [3,5,6,7,8]
      }
    , { row: [4]
      , column: [2,3]
      }
    , { row: [3]
      , column: [3]
      }
    , { row: [6]
      , column: [3]
      }
    , { row: [5]
      , column: [5]
      }
    , { row: [8]
      , column: [5]
      }
    , { row: [7]
      , column: [3]
      }
    , { row: []
      , column: [0,1,2,3,5,6,7,8,9]
      }
    ]

  // Row 5
  , [ { row: []
      , column: [0,1,2,3,4,6,7,8,9]
      }
    , { row: []
      , column: [1,2,3,4,5,6,7,8]
      }
    , { row: [3]
      , column: [3,4,6,7,8]
      }
    , { row: [2]
      , column: [6,7,8]
      }
    , { row: []
      , column: [6,7,8]
      }
    , { row: [6]
      , column: [6,7,8]
      }
    , { row: [5]
      , column: [4]
      }
    , { row: [8]
      , column: [4]
      }
    , { row: [7]
      , column: [6]
      }
    , { row: []
      , column: [0,1,2,3,4,6,7,8,9]
      }
    ]

  // Row 6
  , [ { row: []
      , column: [0,1,2,3,4,5,7,8,9]
      }
    , { row: []
      , column: [1,2,3,4,5,7,8]
      }
    , { row: []
      , column: [3,4,5,7,8]
      }
    , { row: []
      , column: [5,7,8]
      }
    , { row: []
      , column: [5,7,8]
      }
    , { row: []
      , column: [5,7,8]
      }
    , { row: [7,8]
      , column: [7,8]
      }
    , { row: [6,8]
      , column: []
      }
    , { row: [6,7]
      , column: [5]
      }
    , { row: []
      , column: [0,1,2,3,4,5,7,8,9]
      }
    ]

  // Row 7
  , [ { row: []
      , column: [0,1,2,3,4,5,6,8,9]
      }
    , { row: []
      , column: [1,2,3,4,5,6,8]
      }
    , { row: []
      , column: [3,4,5,6,8]
      }
    , { row: []
      , column: [5,6,8]
      }
    , { row: [5]
      , column: [5,6,8]
      }
    , { row: [4]
      , column: [5,6,8]
      }
    , { row: [7,8]
      , column: [6,8]
      }
    , { row: [6,8]
      , column: [8]
      }
    , { row: [6,7]
      , column: [8]
      }
    , { row: []
      , column: [0,1,2,3,4,5,6,8,9]
      }
    ]

  // Row 8
  , [ { row: []
      , column: [0,1,2,3,4,5,6,7,9]
      }
    , { row: [2]
      , column: [1,2,3,4,5,6,7,8]
      }
    , { row: [1]
      , column: [3,4,5,6,7,8]
      }
    , { row: [4]
      , column: [5,6,7]
      }
    , { row: [3]
      , column: [5,6,7]
      }
    , { row: [6]
      , column: [5,6,7]
      }
    , { row: [5]
      , column: [6,7]
      }
    , { row: [8]
      , column: [7]
      }
    , { row: [7]
      , column: [7]
      }
    , { row: [7,8]
      , column: [0,1,2,3,4,5,6,7,9]
      }
    ]

  // Row  9
  , [ { row: [1,2,3,4,5,6,7,8,9]
      , column: [0,1,2,3,4,5,6,7,8]
      }
    , { row: [0,2,3,4,5,6,7,8,9]
      , column: []
      }
    , { row: [0,1,3,4,5,6,7,8,9]
      , column: []
      }
    , { row: [0,1,2,4,5,6,7,8,9]
      , column: []
      }
    , { row: [0,1,2,3,5,6,7,8,9]
      , column: []
      }
    , { row: [0,1,2,3,4,6,7,8,9]
      , column: []
      }
    , { row: [0,1,2,3,4,5,7,8,9]
      , column: []
      }
    , { row: [0,1,2,3,4,5,6,8,9]
      , column: []
      }
    , { row: [0,1,2,3,4,5,6,7,9]
      , column: []
      }
    , { row: [0,1,2,3,4,5,6,7,8]
      , column: [0,1,2,3,4,5,6,7,8]
      }
    ]
  ]
  var row = 1
  var column = 1
  var cellData = maze[row][column]
  var scale
    , xAdjust
    , yAdjust

  ;(function createTextElements (){
    var cell
      , text
      , x
      , y
      , transform
    for(var row = 0; row < 10; row += 1) {
      for (var column = 0; column < 10; column += 1) {
        cell = maze[row][column]
        text = document.createElementNS(svgNS,"text")
        x =  column * 10 + 4.25
        y =  (row + 1) * 10 - 4.5
        text.setAttribute("x", String(x))
        text.setAttribute("y", String(y))
        text.setAttribute("fill", "#666")
        text.setAttribute("text-anchor", "middle")

        cell.text = text
        svg.appendChild(text)     
      }
    }
  })()
  
  setScale()
  restart()

  function setScale () {
    var rect = svg.getBoundingClientRect()
    xAdjust = rect.left
    yAdjust = rect.top
    scale = width / rect.width
  }

  function restart() {
    var x = 10 / scale
    var y = 10 / scale
    mouse.style.left = x + "px"
    mouse.style.top = y + "px"
    mouse.style.width = "8%"
    mouse.style["-webkit-transform"] = "rotate(0)"
    mouse.style.transform = "rotate(0)"

    row = 1
    column = 1
    cellData = maze[row][column]

    counter = 0
    setTextColor("#999", "")

    svg.style.cursor = "pointer"
    svg.onmousedown = svg.ontouchstart = moveMouse
  }

  function setTextColor(color, textContent) {
    var collection = document.querySelectorAll("svg text")
    var total = collection.length
    var text

    for (var ii = 0; ii < total; ii += 1) {
      text = collection[ii]
      text.setAttribute("fill", color)
      if (textContent !== undefined) {
        text.textContent = textContent
      }
    }
  }

  function moveMouse(event) {
    body.onmousemove = body.ontouchmove = moveMouse
    body.onmouseup = function () {
      body.onmousemove = body.onmouseup = body.ontouchmove = body.ontouchend = null
    }
  
    setScale()
    var x = (event.pageX - xAdjust) * scale
    var y = (event.pageY - yAdjust) * scale
    var r = Math.floor(y / 10)
    var c = Math.floor(x / 10)

    if (r === row && c === column) {
      return
    }

    if ( r === row  ) {
      if (cellData.row.indexOf(c) < 0) {
        // Can't move along the row
      } else {
        moveToColumn(c)
      }
    } else if ( c === column) {
      if (cellData.column.indexOf(r) < 0) {
        // Can't move within column
      } else {       
        moveToRow(r)
      }
    }

    function moveToColumn(c) {
      var step = c - column
      step = step / Math.abs(step) // ± 1

      for (ii = column; ii !== c; ii += step) {
        showStep(row, ii)
      }

      moveMouseTo(row, c)
    }

    function moveToRow(r) {
      var done
      var step = r - row
      step = step / Math.abs(step) // ± 1

      for (ii = row; ii !== r; ii += step) {
        showStep(ii, column)
      }

      moveMouseTo(r, column)
    }
    
    function showStep(row, column) {
      if (counter) {
        cellData = maze[row][column]
        cellData.text.textContent = String(counter)
      }    

      counter += 1
    }

    function moveMouseTo(r, c) {  
      if (r === 8 && (c === 8 || c === 7)) {
        return winningPosition()

      } else if (counter > 20) {
        lose()
      }

      var rotation = 0
      if (row === r) {
        if (column < c) {
          rotation = -90
        } else {
          rotation = +90
        }
      } else if (row > r) {
        rotation = 180
      }

      column = c
      row = r
        
      cellData = maze[row][column]

      var x = (c * 10) / scale
      var y = (r * 10) / scale

      mouse.style.left = x + "px"
      mouse.style.top = y + "px"
      mouse.style["-webkit-transform"] = "rotate(" + rotation + "deg)"
      mouse.style.transform = "rotate(" + rotation + "deg)"
    }

    function winningPosition() {
      var x = 70 / scale
      var y = 70 / scale
      var color = "#060"

      mouse.style.left = x + "px"
      mouse.style.top = y + "px"
      mouse.style.width = "18%"
      mouse.style["-webkit-transform"] = "rotate(90deg)"
      mouse.style.transform = "rotate(90deg)"

      setTextColor(color)
      document.querySelector("#walls").setAttribute("fill", color)

      svg.onmousedown = body.onmousemove = body.onmouseup = body.ontouchmove = body.ontouchend = null
    }

    function lose() {
      svg.onmousedown = body.onmousemove = body.onmouseup = body.ontouchmove = body.ontouchend = null
      svg.style.cursor = "not-allowed"
      setTextColor("#f00")
      setTimeout(restart, 1500)
    }
  }
})()