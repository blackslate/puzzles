;(function (window){
  // var lx = window.lx =
  var $section = $("section")

  $("a").click(getAjaxPage)

  function getAjaxPage(event) {
    var target = event.target
    var result = /#(\w+)/.exec(target.href)
    if (!result) {
      // No hash: should we actually go to the URL?
      return
    }

    result = "puzzles/" + result[1] + ".html"
    console.log(result)

    $section.load( result );

    // $.ajax({
    //   url: result
    // , success: success
    // , error: error
    // , dataType: "html"
    // })

    // function error ( jqXHR, textStatus, errorThrown ) {
    //   console.log(jqXHR, textStatus, errorThrown)
    // }

    // function success ( data, textStatus, jqXHR ) {
    //   console.log(data)
    // }
  }
})(window)