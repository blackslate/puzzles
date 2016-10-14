window.puzzle = {
  map: {}
, hash: "test"
, completed: function () { console.log("Puzzle completed") }
}

setTimeout(function () {
  window.puzzle.map.test.initialize()
}, 0)

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

/*********** REMOVE ALL CODE ABOVE THIS LINE IN PRODUCTION **********/

;(function puzzleLoaded(puzzle){

  function Puzzle() {
    this.name = "Lock"
  }

  Puzzle.prototype.initialize = function initialize() {
    var changes = {}
    var quest = "fear"
    var grail = "hope"
    var strips = []

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

      console.log(changes[Object.keys(changes)[Math.floor(Math.random() * 568)]])

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

          for (ii = 0; ii < 3; ii += 1) {
            addAlphabetToStrip()
          }

          return strip

          function addAlphabetToStrip() {
            var ii

            for (ii = 0; ii < 26; ii += 1){
              addLetterToAlphabet(ii + 97)
            }
          }

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

    function displayWord(word) {

    }
    
    //puzzle.completed(puzzle.hash)
    
    function getWordArray() {
    return ["aunt","away","back","bail","bake","ball","band","bang","bank","bare","barn","base","bass","beam","bean","bear","beat","beef","beer","bell","belt","bend","best","bike","bile","bill","bind","bird","bite","blow","boat","boil","bold","bolt","bond","bone","book","boom","boot","boss","bowl","brow","bulb","bulk","bull","burn","bury","bush","busy","cafe","cage","cake","calf","call","calm","card","care","cart","case","cash","cast","cave","cell","chap","chat","chin","chip","chop","cite","city","clay","coal","coat","code","coin","cold","come","cook","cool","cope","copy","cord","core","corn","cost","coup","crop","cure","curl","dare","dark","dash","data","date","dead","deaf","deal","dear","deck","deed","deem","deep","deer","desk","dine","disc","dish","disk","dive","dock","doll","dome","door","dose","drop","dual","duck","dull","duly","dust","duty","earl","earn","ease","east","easy","else","face","fact","fade","fail","fair","fall","fame","fare","farm","fast","fate","fear","feed","feel","file","fill","film","find","fine","fire","firm","fish","fist","flow","fold","folk","fond","food","fool","foot","fork","form","fuck","fuel","full","fund","fury","gain","gall","game","gang","gate","gaze","gear","gift","give","glow","goal","goat","gold","golf","good","grey","grid","grim","grin","grip","grow","hair","half","hall","halt","hand","hang","hard","harm","hate","haul","have","head","heal","heap","hear","heat","heel","heir","hell","help","herb","herd","here","hero","hers","hide","hill","hint","hire","hold","hole","holy","home","hook","hope","horn","host","hour","hove","hunt","hurt","item","jail","join","jury","just","keen","keep","kick","kill","kind","king","kiss","kite","knit","knot","know","lace","lack","lake","land","lane","last","late","lead","leaf","leak","lean","leap","left","lend","less","lick","life","lift","like","line","link","list","live","load","loan","lock","lone","long","look","loop","lord","lose","loss","lost","loud","love","luck","lung","maid","mail","main","make","male","mark","mask","mass","mate","meal","mean","meat","meet","melt","mere","mess","mild","mile","milk","mill","mind","mine","miss","mist","moan","mode","mole","mood","moon","moor","more","most","move","much","must","nail","name","near","neat","neck","need","nest","next","nice","node","none","norm","nose","note","pace","pack","page","paid","pain","pair","pale","palm","park","part","pass","past","peak","peer","pest","pick","pier","pile","pill","pine","pink","pint","pipe","pity","plan","play","plot","poem","poet","pole","poll","pond","pony","pool","poor","pope","port","pose","post","pour","pray","prey","prop","pull","pure","push","quid","quit","race","rack","rage","raid","rail","rain","rank","rape","rare","rate","read","real","rear","rent","rest","rice","rich","ride","ring","riot","rise","risk","road","roar","rock","role","roll","roof","room","root","rope","rose","rude","ruin","rule","rush","sack","safe","sail","sake","sale","salt","same","sand","save","scan","scar","seal","seat","seed","seek","seem","self","sell","send","shed","ship","shit","shoe","shop","shot","show","shut","sick","side","silk","sing","sink","site","size","skin","slab","slam","slap","slim","slip","slot","slow","snap","snow","soak","soap","soar","sock","sofa","soft","soil","sole","solo","some","song","soon","sore","sort","soul","soup","spin","spit","spot","stab","stag","star","stay","stem","step","stir","stop","such","suck","suit","sure","swap","sway","swim","tail","take","tale","talk","tall","tank","tape","task","team","tear","tell","tend","tent","term","test","text","than","that","them","then","they","thin","this","thus","tick","tide","tile","till","time","tire","toll","tone","tool","toss","tour","trap","tray","trip","tube","tuck","tune","turn","twin","type","unit","vary","vast","verb","very","vote","wage","wake","walk","wall","ward","warm","warn","wary","wash","wave","weak","wear","weed","week","weep","well","west","what","when","whip","wide","wife","wild","will","wind","wine","wing","wipe","wire","wise","wish","with","wolf","wood","wool","word","work","worm","wrap","yard","yarn","yeah","year","yell","your","zone"]
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
})(window.puzzle) // <HARD-CODED global object>