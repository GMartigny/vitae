(function(){
    "use strict";
    var articles = document.body.getElementsByClassName("article"),
        affix = document.getElementById("affix-list"),
        depth = 0;

    function allArticles (action) {
        for (var i = 0, l = articles.length; i < l; ++i) {
            action(articles[i], i, l);
        }
    }

    allArticles(function (article, i, l) {
        var li = document.createElement("li");

        li.innerHTML = article.getElementsByTagName("h1")[0].innerHTML;
        li.addEventListener("click", (function(dest){
            return function(){
                updateAffix(dest);
                jumpTo(dest);
            };
        })(i));

        affix.appendChild(li);

        article.style.zIndex = l - i;
        article.style.transitionDelay = "0s, 0." + (l - i) + "s";
    });

    window.addEventListener("wheel", function(e){
        if(!loopTimer){
            var dir = (e.deltaY<0 ? -1 : 1);
            depth = parseFloat((depth + dir*0.2).toFixed(3));
            if(depth < 0)
                depth = 0;
            else if(depth > articles.length - 1)
                depth = articles.length - 1;
            simulateDepth();
            updateAffix(depth);
        }
    }, {
        capture: true,
        passive: true,
    });

    updateAffix(depth);
    simulateDepth();
    setTimeout(function(){
        document.body.classList.add("ready");
    }, 0);

    function simulateDepth(){
        allArticles(function (article, i) {
            var scale = 1 / Math.pow(2, (i - depth)),
                blur = Math.max((i - depth) * 2.5 - 1, 0);
            article.style.transform = "scale3d(" + scale + ", " + scale + ", " + scale + ")";
            article.style.filter = "blur(" + blur + "px)";

            if(depth-0.5 > i)
                article.classList.add("overflow");
            else
                article.classList.remove("overflow");
        });
    }

    var loopTimer = 0;
    function jumpTo(dest){
        var time = (dest - depth) * 300;
        if (time) {
            allArticles(function (article) {
                article.style.transitionDuration = ".3s, 0s, " + time + "ms";
            });
            depth = dest;
            simulateDepth();
            setTimeout(function () {
                allArticles(function (article) {
                    article.style.transitionDuration = "";
                });
            }, time);
        }
    }

    function updateAffix(dest){
        affix.className = "sel-" + (dest + 0.5 <<0);
    }
})();
