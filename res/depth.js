(function(){
    "use strict";
    var articles = document.body.getElementsByClassName("article"),
        afix = document.getElementById("afix-list"),
        afix_active = null,
        depth = 0;

    for(var i=0, l=articles.length; i < l; ++i){
        var article = articles[i],
            li = document.createElement("li");

        li.innerHTML = article.getElementsByTagName("h1")[0].innerHTML;
        li.addEventListener("click", (function(dest){
            return function(){
                jumpTo(dest);
            };
        })(i));

        afix.appendChild(li);

        article.style.zIndex = l - i;
        article.style.transitionDelay = "0s, 0." + (l - i) + "s";
    }

    window.addEventListener("wheel", function(e){
        if(!loopTimer){
            var dir = (e.deltaY<0 ? -1 : 1);
            depth = parseFloat((depth + dir*0.2).toFixed(3));
            if(depth < 0)
                depth = 0;
            else if(depth > articles.length - 1)
                depth = articles.length - 1;
            simulateDepth();
            updateAfix();
        }
    });

    updateAfix();
    simulateDepth();
    setTimeout(function(){
        document.body.classList.add("ready");
    }, 0);

    function simulateDepth(){
        for(var i = 0, l = articles.length; i < l; ++i){
            var article = articles[i],
                scale = "scale(" + (1 / Math.pow(2, (i - depth))) + ")",
                blur = "blur(" + ((i - depth) * 2.5) + "px)";
            article.style.transform = scale;
            article.style.WebkitTransform = scale;
            article.style.filter = blur;
            article.style.WebkitFilter = blur;

            if(depth-0.5 > i)
                article.classList.add("overflow");
            else
                article.classList.remove("overflow");
        }
    }

    var loopTimer = 0;
    function jumpTo(dest){
        if(loopTimer)
            clearTimeout(loopTimer);

        var diff = parseFloat(((dest - depth) / 10).toFixed(3));

        if(diff){
            depth += diff;
            loopTimer = setTimeout(function(){
                loopTimer = 0;
                jumpTo(dest);
            }, 16);
        }
        else{
            depth = dest;
        }
        updateAfix();
        simulateDepth();
    }

    function updateAfix(){
        var lis = afix.getElementsByTagName("li");
        if(afix_active)
            afix_active.classList.remove("active");
        afix_active = lis[(depth + 0.5) << 0];
        lis[(depth + 0.5) << 0].classList.add("active");
    }
})();