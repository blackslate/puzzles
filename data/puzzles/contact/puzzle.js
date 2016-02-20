;(function puzzleLoaded(puzzle){

  function Puzzle() {
    this.name = "Contact"
  }

  Puzzle.prototype.initialize = function initialize() {
    var body = document.body
    var article = document.querySelector("article")
    var contact = document.querySelector("article a")
    var phone = document.querySelector("article span.can-select")
    var egg = "*qg3&j~5kD2wV6B_"

    contact.onmouseup = contact.ontouchend = openMailApp
    if (isMobile()) {
      phone.ontouchend = callPhone
    } else {
      phone.onmouseup = phone.ontouchend = selectAll
    }
 
    function openMailApp(event) {
      var chicken = "TSFxQIFeVsUK/nTcha+fnlxGMYypfFR88xZrLTJBY2H1ldyFO0v0oKEpctc="
      
      event.preventDefault()
      window.location = hatch(chicken, egg)
      puzzle.completed(puzzle.hash)
    }

    function isMobile() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    }

    function callPhone(event) {
      event.preventDefault()
      window.location = "tel:613-695-0816"
      puzzle.completed(puzzle.hash)
    }

    function selectAll() {
      var selection
      var range

      if (window.getSelection) {
        selection = window.getSelection()
        if (selection.setBaseAndExtent) {
          selection.setBaseAndExtent(phone, 0, phone, 1)
        } else {
          range = document.createRange()
          range.selectNodeContents(phone)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      } else {
        range = document.body.createTextRange()
        range.moveToElementText(phone)
        range.select()
      }
    }

    ;(function resizeText(){
      var a = document.querySelector("article a")
      var div = document.querySelector("article div")
      document.addEventListener("windowResized", windowResized, false)

      function windowResized(event) {
        var rect = article.getBoundingClientRect()
        var width = rect.width
        a.style.fontSize = (width * 0.098) + "px"
        div.style.fontSize = (width * 0.0565) + "px"
      }

      windowResized()
    })()

    function hatch(e,t){if("undefined"==typeof String.prototype.utf8Encode&&(String.prototype.utf8Encode=function(){return unescape(encodeURIComponent(this))}),"undefined"==typeof String.prototype.utf8Decode&&(String.prototype.utf8Decode=function(){try{return decodeURIComponent(escape(this))}catch(e){return this}}),"undefined"==typeof String.prototype.base64Decode&&(String.prototype.base64Decode=function(){if("undefined"!=typeof atob)return atob(this);if("undefined"!=typeof Buffer)return new Buffer(this,"base64").toString("utf8");throw new Error("No Base64 Decode")}),e=String(e),t=String(t),0==e.length)return"";var n=strToLongs(e.base64Decode()),r=strToLongs(t.utf8Encode().slice(0,16));n.length;n=unscramble(n,r);var o=longsToStr(n);return o=o.replace(/\0+$/,""),o.utf8Decode()}function unscramble(e,t){for(var n,r,o=e.length,f=e[o-1],u=e[0],c=2654435769,i=Math.floor(6+52/o),a=i*c;0!=a;){r=a>>>2&3;for(var d=o-1;d>=0;d--)f=e[d>0?d-1:o-1],n=(f>>>5^u<<2)+(u>>>3^f<<4)^(a^u)+(t[3&d^r]^f),u=e[d]-=n;a-=c}return e}function strToLongs(e){for(var t=new Array(Math.ceil(e.length/4)),n=0;n<t.length;n++)t[n]=e.charCodeAt(4*n)+(e.charCodeAt(4*n+1)<<8)+(e.charCodeAt(4*n+2)<<16)+(e.charCodeAt(4*n+3)<<24);return t}function longsToStr(e){for(var t=new Array(e.length),n=0;n<e.length;n++)t[n]=String.fromCharCode(255&e[n],e[n]>>>8&255,e[n]>>>16&255,e[n]>>>24&255);return t.join("")
    }

    function removeFormat() {
      if (/mozilla/.test(navigator.userAgent.toLowerCase())
       && !/webkit/.test(navigator.userAgent.toLowerCase())) {
        // Firefox already does it better
        return;
      }

      var body = document.body;
      var selection = window.getSelection();
      var copyDiv = document.createElement('div');

      copyDiv.innerHTML = "http://puzzles.lexogram.com " + selection
      copyDiv.className = "can-select copy"

      body.appendChild(copyDiv);
      selection.selectAllChildren(copyDiv);
      window.setTimeout(function() {
        body.removeChild(copyDiv);
      },1);
    }
    document.oncopy = removeFormat;
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