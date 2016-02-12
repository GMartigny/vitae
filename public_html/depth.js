window.onload = function(){
    "use strict";
    var main = document.getElementById("main"),
        articles = main.getElementsByTagName("article"),
        afix = document.getElementById("afix"),
        afix_active = null,
        depth = 0;

//    document.body.classList.add("ready");

    window.addEventListener("wheel", function(e){
        if(!loopTimer){
            depth = parseFloat((depth + e.deltaY / 500).toFixed(3));
            if(depth < 0)
                depth = 0;
            else if(depth > articles.length - 1)
                depth = articles.length - 1;
//            updateAfix();
        }
    });


    var loopTimer = 0;
    function jumpTo(dest){
        if(loopTimer)
            clearTimeout(loopTimer);

        var diff = parseFloat(((dest - depth) / 10).toFixed(3));
        depth += diff;

        if(diff){
            loopTimer = setTimeout(function(){
                loopTimer = 0;
                jumpTo(dest);
            }, 16);
        }
//        updateAfix();
    }

//    function updateAfix(){
//        var lis = afix.getElementsByTagName("li");
//        if(afix_active)
//            afix_active.classList.remove("active");
//        afix_active = lis[(depth + 0.5) << 0];
//        lis[(depth + 0.5) << 0].classList.add("active");
//    }
};