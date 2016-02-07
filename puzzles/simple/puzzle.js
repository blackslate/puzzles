
;(function puzzleLoaded(puzzle){
  // puzzle = { map: { <hash>: <object>, ... }, hash: <string> }
  
  function Puzzle() {
    this.name = "Simple"
  }

  Puzzle.prototype.initialize = function initialize() {
    var xlinkNS = "http://www.w3.org/1999/xlink"
    var body = document.body // querySelector("p")
    var article = document.querySelector("article")
    var SI = document.querySelector("#SI")
    var SICell = document.querySelector("#cell_CO")
    var SIOn = false
    var dots = []
    var dotLUT = {}
    var transforms = []
    var corners = []
    var cells = [] // 0-5 for 1st cell; 6-11 for second cell
    var current
      , cell
      , transforms

    article.onmousedown = article.ontouchstart = checkTarget

    ;(function placeText(){
      var p = document.querySelector("p")
      document.addEventListener("windowResized", windowResized, false)

      function windowResized(event) {
        var rect = p.getBoundingClientRect()
        var width = rect.width
        p.style.fontSize = (width * 0.24) + "px"
        p.style.marginTop = (width * 0.36) + "px"
      }

      windowResized()
    })()

    ;(function initializeDraggableDots() {
      var collection = document.querySelectorAll("svg#cell_CO use")
      var cell
      for (var ii = 0, dot; dot = collection[ii]; ii += 1) {
        dots.push(dot)
        dotLUT[ii] = ii
        transforms.push ({ x: 0, y: 0})
        corners.push({ x: dot.x.animVal.value, y: dot.y.animVal.value })
        cells.push(hrefIsFill(dot))
      } 
    })()

    function checkTarget(event) {
      event.preventDefault()
      var target = event.target

      if (target.correspondingUseElement) {
        // This is SVG, and we're in Internet Explorer
        target = target.correspondingUseElement
        startDrag(event)
      } else {
        var nodeName = target.nodeName.toLowerCase()
        if (nodeName === "span") {
          treatLetterClick(event)
        } else if (nodeName === "use") {
          startDrag(event)
        }
      }

      function treatLetterClick(event) {
        if (target !== SI && SIOn) {
          hideSI()
          // SIOn may be true if: co is showing, click on SI
          // Otherwise SIOn is false
        }

        rolloverLetter(event, true)

        function rolloverLetter(event, isClick) {
          var target = event.target
          if (target.correspondingUseElement) {
            // This is SVG, and we're in Internet Explorer
            return
          } else if (target.nodeName.toLowerCase() !== "span") {
            return
          } 

          if (!isClick && target === current) {
            // We're just moving over the same letter (group)
            return
          } else if (cell) {
            // We've rolled to a new letter (group)
            hideCell(event, true)
          }

          showCell(target)
          
          function showCell(target) {
            current = target

            if (target === SI) {
              SICell.className.baseVal = ""
              cell = SICell
            } else {
              var text = target.innerHTML
              var id ="#"+text
              cell = document.querySelector("#cell_" + text)
              cell.setAttributeNS(xlinkNS, "xlink:href", id)
            }
        
            body.onmousemove = body.ontouchmove = rolloverLetter
            body.onmouseup = body.ontouchend = hideCell
          }

          function hideCell(event, isRollover) {
             if (cell === SICell && isRollover) {
               hideSI()
             } else {
               cell.setAttributeNS(xlinkNS, "xlink:href", "#*")
             } 

             if (target === SI) {
              toggleSI(isRollover)

            } else {
              SIOn = false
              current = null
              cell = null
            }

            body.onmouseup = body.ontouchend = body.onmousemove = body.ontouchmove = null
          }

          function toggleSI(isRollover) {
            if (SIOn) {
              if (isRollover) {
                // Called immediately after click
              } else {
                // Only true if co was already showing, the click was on
                // SI and it hasn't moved off, and the mouse has just been
                // released
                hideSI()
                current = null
                cell = null
              }
              return
            } else {
              SICell.className.baseVal = ""

              if (!isRollover) {
                SIOn = true
                cell = false
              }
            }
          }
        }

        function hideSI() {
          SIOn = false
          SICell.className.baseVal = "hidden"
        }
      }

      function startDrag(event) {
        if (!hrefIsFill(target)) {
          return
        }

        var index = dots.indexOf(target)
        var dotTransform = transforms[index]
        var transformX = dotTransform.x
        var transformY = dotTransform.y

        var clickX = event.pageX
        var clickY = event.pageY
        var rect = SICell.getBoundingClientRect()
        var width = SICell.viewBox.animVal.width
        var scale = width / rect.width
        var deltaX
          , deltaY


        article.onmousemove = article.ontouchmove = drag
        article.onmouseup = article.ontouchend = stopDrag

        function drag(event) {
          deltaX = (event.pageX - clickX) * scale + transformX
          deltaY = (event.pageY - clickY) * scale + transformY
          transform = "translate(" + deltaX + " " + deltaY + ")"
          target.setAttributeNS(null, "transform", transform)
        }

        function stopDrag() {
          var home = corners[index]
          var x = home.x + deltaX
          var y = home.y + deltaY

          var dropIndex = getDropCornerIndex(x, y)
          if (dropIndex < 0) {
            // Return the dot to where it came frome
            deltaX = transformX
            deltaY = transformY
          } else {
            // Move the dot to the empty location
            cells[dotLUT[index]] = false
            cells[dropIndex] = true
            dotLUT[index] = dropIndex
            deltaX = corners[dropIndex].x - corners[index].x
            deltaY = corners[dropIndex].y - corners[index].y
            updateLetters()
          }

          transform = "translate(" + deltaX + " " + deltaY + ")"
          target.setAttributeNS(null, "transform", transform)
          
          article.onmousemove = article.ontouchmove = article.onmouseup = article.ontouchend = null
          dotTransform.x = deltaX
          dotTransform.y = deltaY

          function getDropCornerIndex(x, y) {
            var max2 = 10000000
            var cornerIndex = -1
            var deltaX
              , deltaY
              , delta2
              , filled

            corners.forEach(function (corner, index) {
              deltaX = corner.x - x
              deltaY = corner.y - y
              delta2 = deltaX * deltaX + deltaY * deltaY
              if (max2 > delta2) {
                max2 = delta2
                cornerIndex = index
              }
            })

            filled = cells[cornerIndex]
            if (max2 > 400 || filled) {
              cornerIndex = -1
            }

            return cornerIndex
          }

          // function set(svgItem, domain, key, value) {
          //   if (svgItem.setAttributeNS) {
          //     svgItem.setAttributeNS(domain, key, value)
          //   } else {
          //     // Internet Explorer
              
          //   }
          // }

          function updateLetters() {
            var si = getLetter(0) + getLetter(6)
            SI.innerHTML = si

            if (si === "SI") {
              showSolution()
            }

            function getLetter(n) {
              if (!cells[n + 5]) {
                if (!cells[n + 4]) {
                  if (!cells[n + 3]) {
                    if (!cells[n + 2]) {       
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 0
                          return "&nbsp;"
                        } else { // 1
                          return "A"
                        }
                      } else {
                        if (!cells[n + 0]) { // 2
                          return "1"
                        } else { // 3
                          return "B"
                        }
                      }
                    } else {
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 4
                          return "'"
                        } else { // 5
                          return "K"
                        }
                      } else {
                        if (!cells[n + 0]) { // 6
                          return "2"
                        } else { // 7
                          return "L"
                        }
                      }
                    }
                  } else {
                    if (!cells[n + 2]) {       
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 8
                          return "@"
                        } else { // 9
                          return "C"
                        }
                      } else {
                        if (!cells[n + 0]) { // 10
                          return "I"
                        } else { // 11
                          return "F"
                        }
                      }
                    } else {
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 12
                          return "/"
                        } else { // 13
                          return "M"
                        }
                      } else {
                        if (!cells[n + 0]) { // 14
                          return "S"
                        } else { // 15
                          return "P"
                        }
                      }
                    }
                  }
                } else {               
                  if (!cells[n + 3]) { 
                    if (!cells[n + 2]) {       
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 16
                          return '"'
                        } else { // 17
                          return "E"
                        }
                      } else {
                        if (!cells[n + 0]) { // 18
                          return "3"
                        } else { // 19
                          return "H"
                        }
                      }
                    } else {
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 20
                          return "9"
                        } else { // 21
                          return "O"
                        }
                      } else {
                        if (!cells[n + 0]) { // 22
                          return "6"
                        } else { // 23
                          return "R"
                        }
                      }
                    }
                  } else {
                    if (!cells[n + 2]) {       
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 24
                          return "^"
                        } else { // 25
                          return "D"
                        }
                      } else {
                        if (!cells[n + 0]) { // 26
                          return "J"
                        } else { // 27
                          return "G"
                        }
                      }
                    } else {
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 28
                          return ">"
                        } else { // 29
                          return "N"
                        }
                      } else {
                        if (!cells[n + 0]) { // 30
                          return "T"
                        } else { // 31
                          return "Q"
                        }
                      }
                    }
                  }
                }
              } else {         
                if (!cells[n + 4]) {
                  if (!cells[n + 3]) {
                    if (!cells[n + 2]) {       
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 32
                          return ","
                        } else { // 33
                          return "*"
                        }
                      } else {
                        if (!cells[n + 0]) { // 34
                          return "5"
                        } else { // 35
                          return "<"
                        }
                      }
                    } else {
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 36
                          return "-"
                        } else { // 37
                          return "U"
                        }
                      } else {
                        if (!cells[n + 0]) { // 38
                          return "8"
                        } else { // 39
                          return "V"
                        }
                      }
                    }
                  } else {
                    if (!cells[n + 2]) {       
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 40
                          return "."
                        } else { // 41
                          return "%"
                        }
                      } else {
                        if (!cells[n + 0]) { // 42
                          return "["
                        } else { // 43
                          return "$"
                        }
                      }
                    } else {
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 44
                          return "+"
                        } else { // 45
                          return "X"
                        }
                      } else {
                        if (!cells[n + 0]) { // 46
                          return "!"
                        } else { // 47
                          return "&"
                        }
                      }
                    }
                  }
                } else {               
                  if (!cells[n + 3]) { 
                    if (!cells[n + 2]) {       
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 48
                          return ';'
                        } else { // 49
                          return ":"
                        }
                      } else {
                        if (!cells[n + 0]) { // 50
                          return "4"
                        } else { // 51
                          return "\\"
                        }
                      }
                    } else {
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 52
                          return "0"
                        } else { // 53
                          return "Z"
                        }
                      } else {
                        if (!cells[n + 0]) { // 54
                          return "7"
                        } else { // 55
                          return "("
                        }
                      }
                    }
                  } else {
                    if (!cells[n + 2]) {       
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 56
                          return "_"
                        } else { // 57
                          return "?"
                        }
                      } else {
                        if (!cells[n + 0]) { // 58
                          return "W"
                        } else { // 59
                          return "]"
                        }
                      }
                    } else {
                      if (!cells[n + 1]) {
                        if (!cells[n + 0]) { // 60
                          return "#"
                        } else { // 61
                          return "Y"
                        }
                      } else {
                        if (!cells[n + 0]) { // 62
                          return ")"
                        } else { // 63
                          return "="
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          function showSolution() {
            article.onmousedown = article.ontouchstart = body.onmousemove = body.ontouchmove = body.onmouseup = body.ontouchend = null

            document.querySelector(".red").innerHTML = "&nbsp;"

            document.querySelector("#cell_M").setAttributeNS(xlinkNS, "xlink:href", "#M")
            document.querySelector("#cell_P").setAttributeNS(xlinkNS, "xlink:href", "#P")
            document.querySelector("#cell_L").setAttributeNS(xlinkNS, "xlink:href", "#L")
            document.querySelector("#cell_E").setAttributeNS(xlinkNS, "xlink:href", "#E")
            document.querySelector("#cell_X").setAttributeNS(xlinkNS, "xlink:href", "")

            var decay = document.querySelector("#decay")
            decay.style.display = "block"
            var animations=document.querySelectorAll("#decay animate")
            for (var ii=0,animation;animation=animations[ii];ii+=1) {
              if (animation.beginElement){
                animation.beginElement()
              } else {
                decay.style.display = "none"
              }
            }

          setTimeout(function () {
            document.body.style.backgroundColor = "#000"
            document.querySelector("rect").setAttributeNS(null, "opacity", "0")
          }, 1000)
          }
        }
      }
    }

    function hrefIsFill(target) {
      if (target.getAttributeNS) {
        return (target.getAttributeNS(xlinkNS,"href") === "#fill")
      } else {
        // Internet Explorer
        var item=target.attributes.getNamedItemNS(xlinkNS,"href")
        return item.nodeValue === "#fill"
      }
    }
  }

  Puzzle.prototype.kill = function kill() {
    // Clean up when puzzle is about to be replaced
    console.log("Puzzle '" + this.name + "' killed")
  }

  if (typeof puzzle.hash === "string") {
    if (typeof puzzle.map === "object") {
      var object = puzzle.map[puzzle.hash] = new Puzzle()
    }
  }
})(window.puzzle) // <HARD-CODED global object>
