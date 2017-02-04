;(function puzzleLoaded(puzzle){

  function Puzzle() {
    this.name = "Lock"
  }

  Puzzle.prototype.initialize = function initialize() {
    var quest = "fear"
    var grail = "hope"
    var finalSequence = [
      ["home", 2000]
    , ["come", 2000]
    , ["cove", 100]
    , ["love", 2000]
    , ["live", 2000]
    ]
    var alphabetLength = 26
    var scrollDuration = 1000
    var scrollDelay = 250
    var grailDelay = 3000
    var step = 24
    var asciiRoot = 97

    var up = [].slice.call(document.querySelectorAll(".up svg"))
    var down = [].slice.call(document.querySelectorAll(".down svg"))
    var complete = document.querySelector(".complete")

    var changes = {}
    var strips = []
    var indexArray = []
    var possibleArray = []
    var current // = quest

    ;(function createChangesMap(){
      var words = getWordArray()
      var queue = [quest]
      var treated = []
      var avatar
      var length
      var derivatives

      while (queue.length) {
        avatar = queue.shift()
        length = avatar.length
        changes[avatar] = derivatives = changes[avatar] || []

        words.forEach(findChanges)
      }
   
      erdos(changes, grail)
      erdos(changes, quest)

      function findChanges(word) {
        var diff = 0
        var length
        var ii
        
        if ((length = word.length) !== avatar.length) {
          return
        } else if (word === avatar) {
          return
        }
        
        for (ii = 0; ii < length; ii += 1) {
          diff += (word.charAt(ii) !== avatar.charAt(ii))
          if (diff > 1) {
            return
          }
        }

        if (treated.indexOf(word) < 0) {
          treated.push(word)
          queue.push(word)
        }

        if (derivatives.indexOf(word) < 0) {
          derivatives.push(word)
        }
      }

      function erdos(changes, start) {
        var max = 0
        var distance
        var nextWords = changes[start] // [ 'cope', 'hole', ... ]
        nextWords[start] = 0

        words = Object.keys(changes)
        words.splice(words.indexOf(start), 1)
        queue = [nextWords]

        while (queue.length) {
          nextWords = queue.shift()
          distance = nextWords[start]
          nextWords.forEach(calculateErdos)
        }

        function calculateErdos(word) {
          var index = words.indexOf(word)
          if (index < 0) {
            // A shorter distance has already been calculated
            return
          }

          words.splice(index, 1)
          derivatives = changes[word]
          derivatives[start] = distance + 1

          if (max < distance) {
            max = distance
          }

          queue.push(derivatives)
        }
      }
    })()

    ;(function createLockStrips(){
      var viewport = document.querySelector("#viewport")

      ;(function createStrips(){
         var length = quest.length
         var ii
           , char
           , strip
           , column

         for (var ii = 0; ii < length; ii += 1) {
           char = grail.charAt(ii)
           strip = createStrip(char)
           strips.push(strip)

           column =  document.createElement("div")
           column.classList.add("column")
           column.appendChild(strip)

           viewport.appendChild(column)
         }

        function createStrip(char){
          var strip = document.createElement("div")
          var p = document.createElement("p")
          var ii

          strip.classList.add("strip")

          for (ii = 0; ii < alphabetLength; ii += 1){
            addLetterToAlphabet(ii + asciiRoot)
          }
          addLetterToAlphabet(asciiRoot) // "xyza" for looping
          return strip

          function addLetterToAlphabet(charCode) {
            var container = p.cloneNode()
            var letter = String.fromCharCode(charCode)
            var index = grail.indexOf(letter) 

            container.textContent = letter

            if (index > -1) {
              container.classList.add("sought")
              if (letter === char) {
                container.classList.add("found")
              }
            }

            strip.appendChild(container)
          }
        }
      })()
    })()

    displayWord(quest)
    toggleButtons(true)

    function toggleButtons(active){
      var arrows = document.querySelector(".arrows")
      if (active) {
        arrows.onmousedown = arrows.ontouchstart = activateButton
      } else {
        arrows.onmousedown = arrows.ontouchstart = null
      }
      
      function activateButton(event) {
        var action = getAction(event)
        if (action) {
          action.target.classList.add("pressed")

          startScroll(action)

          document.body.onmouseup = function() {
            action.target.classList.remove("pressed")
          }
        } 
      }

      function getAction(event) {
        var target = event.target
        var action

        if (target.tagName.toLowerCase() === "use") {
          target = target.parentNode
          action = {}
          action.direction = target.parentNode.className
          action.index = getNodeIndex(target)
          action.target = target
        }

        return action
      }
    }

    /**
     * Starts a scroll.
     *
     * @param {object}}  action { direction: <"up", "down">
     *                          , index: <0-3>
     *                          , target: div.arrow.hilite
     *                          , nextIndex: <undefined | integer>
     *                          , nextWord: <undefined | string>
     *                          , delay: <undefined | integer ms>
     *                          }
     */
    function startScroll(action) {      
      var strip = strips[action.index]
      var currentIndex = indexArray[action.index]
      var alternatives = possibleArray[action.index]
      var presentIndex = alternatives.indexOf(currentIndex)
      var lastIndex = alternatives.length - 1
      var top = -alternatives[presentIndex] * step
      var up = action.direction === "up"
      var duration = scrollDuration
      var loop = false
      var nextIndex = action.nextIndex
      var nextWord = action.nextWord
      var nextChar
        , nextTop
        , finalTop
        , finalDuration

      if (nextIndex === undefined) {
        if (up) {
          nextIndex = presentIndex - 1
          if (nextIndex < 0) {
            nextIndex = alternatives.length - 1
            loop = true
          }
        } else {
          nextIndex = presentIndex + 1
          if (nextIndex > lastIndex) {
            nextIndex = 0
            loop = true
          }
        } 

        nextIndex = alternatives[nextIndex]
        nextChar = String.fromCharCode(nextIndex + asciiRoot)
        nextWord = replaceAt(current, action.index, nextChar)
        nextTop = -nextIndex * step

      } else {
        // find if shortest route needs to loop, and if so, does it go
        // up or down
        if (currentIndex > nextIndex) {
          loop = true
          up = false
        }
      }

      nextTop = -nextIndex * step

      if (loop) {
        prepareLoop()
      }

      doScroll()

      function doScroll() {
        var increment = (nextTop - top) / duration
        var startTime = + new Date()

        toggleButtons(false)

        ;(function scrollToNext(){
          var elapsed = + new Date() - startTime

          if (elapsed > duration) {
            if (loop) {
              completeLoop()

            } else {
              displayWord(nextWord)
              if (action.delay) {
                setTimeout(goLive, action.delay)
              } else {
                toggleButtons(true)
              }
            }           

          } else {
            nextTop = (top + elapsed * increment)
            strip.style.top = nextTop + "%"
            setTimeout(scrollToNext, 16)
          }
        })()
      }
      
      function prepareLoop() {
        duration = up
                 ? currentIndex /
                      (currentIndex + alphabetLength - nextIndex)
                 : (alphabetLength - currentIndex)/
                      (alphabetLength - currentIndex + nextIndex)
        duration *= scrollDuration
        finalDuration = scrollDuration - duration

        finalTop = nextTop
        nextTop = up ? 0 : -alphabetLength * step
      }

      function completeLoop() {
        top = up ? -alphabetLength * step : 0
        nextTop = finalTop
        duration = finalDuration
        loop = false
        doScroll()
      }
    }

    function displayWord(word) {
      var derivatives = changes[word]
      var index
      var alternatives
      var percentage

      for (var ii = 0, total = word.length; ii < total; ii += 1) {
        // indexArray
        index = getCharIndex(word, ii)
        indexArray[ii] = index

        // alternatives
        alternatives = getAlternatives(ii)
        possibleArray[ii] = alternatives
        setButtonState(ii, alternatives.length > 1)

        // position
        percentage = index * step
        strips[ii].style.top = -percentage + "%"
      }

      setProgress(derivatives)
      current = word

      if (word === grail) {
        showOver()
      }

      ;(function setPossibles() {
        var total = word.length
        var count = alphabetLength + 1
        var ii
          , indexArray
          , index
          , letters
          , modify
        
        for (ii = 0; ii < total; ii += 1) {
          indexArray = [getCharIndex(word, ii)]
          letters = strips[ii].children

          derivatives.forEach(function addToIndexArray(word) {
            index = getCharIndex(word, ii)
            if (indexArray.indexOf(index) < 0) {
              indexArray.push(index)
              if (!index) {
                // Exception for second a
                indexArray.push(alphabetLength)
              }
            }
          })

          
          for (var jj = 0; jj < count; jj += 1) {
            modify = (indexArray.indexOf(jj) < 0)
                   ? "remove"
                   : "add"
            letters[jj].classList[modify]("possible")
          }
        }
      })()

      function getAlternatives(charPos) {
        var alternatives = [index]
        var code

        for (var ii=0, total=derivatives.length; ii<total; ii += 1) {
          code = derivatives[ii].charCodeAt(charPos) - asciiRoot

          if (alternatives.indexOf(code) < 0) {
            alternatives.push(code)
          }
        }

        alternatives.sort(numeric)

        return alternatives

        function numeric(a, b) {
          return a - b
        }
      }
    }

    function getCharIndex(word, ii){
      return word.charCodeAt(ii) - asciiRoot
    }

    function setButtonState(index, state) {
      var modify = state ? "remove" : "add"
      up[index].classList[modify]("disabled")
      down[index].classList[modify]("disabled")
    }

    function setProgress(derivatives) {
      var completed = derivatives[quest]
      var remaining = derivatives[grail]
      var ratio = completed * 100 / (completed + remaining)
      complete.style.width = ratio + "%"
    }

    function showOver() {
      document.querySelector("article").classList.add("found")
      setTimeout(goLive, grailDelay)
      scrollDuration *= 2
    }

    function goLive(){
      var nextWord = finalSequence.shift()
      if (!nextWord) {
        return console.log("Done")
      }

      var delay = nextWord[1]
      nextWord = nextWord[0]

      var total = current.length
      var action = {}
      var ii
        , nextIndex
      
      for (ii = 0; ii < total; ii += 1) {
        nextIndex = getCharIndex(nextWord, ii)
        if (nextIndex !== getCharIndex(current, ii)) {
          action.index = ii
          action.nextIndex = nextIndex
          action.nextWord = nextWord
          action.delay = delay
          startScroll(action)
          break
        }
      }
    }
    
    //puzzle.completed(puzzle.hash)
    
    function getWordArray() {
      // Array of all the most common 4-letter words accessible from 
      // "fear" + "cove" - "dome" - "code", as a stepping stone from
      // hope to love
    return ["aunt","away","back","bail","bake","ball","band","bang","bank","bare","barn","base","bass","beam","bean","bear","beat","beef","beer","bell","belt","bend","best","bike","bile","bill","bind","bird","bite","blow","boat","boil","bold","bolt","bond","bone","book","boom","boot","boss","bowl","brow","bulb","bulk","bull","burn","bury","bush","busy","cafe","cage","cake","calf","call","calm","cape","card","care","cart","case","cash","cast","cave","cell","chap","chat","chin","chip","chop","cite","city","clay","coal","coat","coin","cold","come","cove","cook","cool","cope","copy","cord","core","corn","cost","coup","crop","cure","curl","dare","dark","dash","data","date","dead","deaf","deal","dear","deck","deed","deem","deep","deer","desk","dine","disc","dish","disk","dive","dock","doll","door","dose","drop","dual","duck","dull","duly","dust","duty","earl","earn","ease","east","easy","else","face","fact","fade","fail","fair","fall","fame","fare","farm","fast","fate","fear","feed","feel","file","fill","film","find","fine","fire","firm","fish","fist","flow","fold","folk","fond","food","fool","foot","fork","form","fuck","fuel","full","fund","fury","gain","gall","game","gang","gate","gaze","gear","gift","give","glow","goal","goat","gold","golf","good","grey","grid","grim","grin","grip","grow","hair","half","hall","halt","hand","hang","hard","harm","hate","haul","have","head","heal","heap","hear","heat","heel","heir","hell","help","herb","herd","here","hero","hers","hide","hill","hint","hire","hold","hole","holy","home","hook","hope","horn","host","hour","hunt","hurt","item","jail","join","jury","just","keen","keep","kick","kill","kind","king","kiss","kite","knit","knot","know","lace","lack","lake","land","lane","last","late","lead","leaf","leak","lean","leap","left","lend","less","lick","life","lift","like","line","link","list","live","load","loan","lock","lone","long","look","loop","lord","lose","loss","lost","loud","love","luck","lung","maid","mail","main","make","male","mark","mask","mass","mate","meal","mean","meat","meet","melt","mere","mess","mild","mile","milk","mill","mind","mine","miss","mist","moan","mode","mole","mood","moon","moor","more","most","move","much","must","nail","name","near","neat","neck","need","nest","next","nice","node","none","norm","nose","note","pace","pack","page","paid","pain","pair","pale","palm","park","part","pass","past","peak","peer","pest","pick","pier","pile","pill","pine","pink","pint","pipe","pity","plan","play","plot","poem","poet","pole","poll","pond","pony","pool","poor","pope","port","pose","post","pour","pray","prey","prop","pull","pure","push","quid","quit","race","rack","rage","raid","rail","rain","rank","rare","rate","read","real","rear","rent","rest","rice","rich","ride","ring","riot","rise","risk","road","roar","rock","role","roll","roof","room","root","rope","rose","rude","ruin","rule","rush","sack","safe","sail","sake","sale","salt","same","sand","save","scan","scar","seal","seat","seed","seek","seem","self","sell","send","shed","ship","shit","shoe","shop","shot","show","shut","sick","side","silk","sing","sink","site","size","skin","slab","slam","slap","slim","slip","slot","slow","snap","snow","soak","soap","soar","sock","sofa","soft","soil","sole","solo","some","song","soon","sore","sort","soul","soup","spin","spit","spot","stab","stag","star","stay","stem","step","stir","stop","such","suck","suit","sure","swap","sway","swim","tail","take","tale","talk","tall","tank","tape","task","team","tear","tell","tend","tent","term","test","text","than","that","them","then","they","thin","this","thus","tick","tide","tile","till","time","tire","toll","tone","tool","toss","tour","trap","tray","trip","tube","tuck","tune","turn","twin","type","unit","vary","vast","verb","very","vote","wage","wake","walk","wall","ward","warm","warn","wary","wash","wave","weak","wear","weed","week","weep","well","west","what","when","whip","wide","wife","wild","will","wind","wine","wing","wipe","wire","wise","wish","with","wolf","wood","wool","word","work","worm","wrap","yard","yarn","yeah","year","yell","your","zone"]
    }
  }

  Puzzle.prototype.kill = function kill() {
    // Clean up when puzzle is about to be replaced
  }

  if (typeof puzzle.hash === "string") {
    if (typeof puzzle.map === "object") {
      var object = puzzle.map[puzzle.hash] = new Puzzle()
    }
  }

  // UTILITIES

  // http://stackoverflow.com/a/11762728/1927589
  function getNodeIndex(node) {
    var index = 0;
    while ( (node = node.previousSibling) ) {
      if (node.nodeType != 3 || !/^\s*$/.test(node.data)) {
        index++;
      }
    }
    return index;
  }

  // http://stackoverflow.com/a/1431113/1927589
  function replaceAt(string, index, replacement) {
    return string.substring(0, index) 
         + replacement
         + string.substring(index + replacement.length);
  }

})(window.puzzle) // <HARD-CODED global object>