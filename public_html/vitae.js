
var app = angular.module("vitae", []);

app.controller("LangController", function($locale, $scope, $sce, $http, $timeout){

    this.lang = $locale.id.substr(0, 2);
    this.content = {};
    this.ready = false;

    var self = this;
    $http.get("data.json").then(function(response){
        self.content = response.data;
        // fallback
        if(!self.content[self.lang])
            self.lang = 'en';
        self.setContent(self.lang);
        self.setReady();
    });
    this.content = {};
    this.localContent = {};

    this.getContent = function(lg){
        return this.content[lg];
    };
    this.setContent = function(lg){
        this.lang = lg;
        this.localContent = this.getContent(lg);
    };
    this.setReady = function(){
        var self = this;
        $timeout(function(){
            self.ready = true;
        }, 0);
    };

    $scope.toHTML = function(html){
        return $sce.trustAsHtml(html);
    };
});

app.controller("ScrollController", function($scope){

    this.depth = 0;
    this.scrollSpeed = 0.2;
    this.loopTimer = 0;

    this.scroll = function(dir){
        this.depth += this.scrollSpeed * dir;
        if(this.depth < 0)
            this.depth = 0;
        console.log(this.depth);
    };

    this.jumpTo = function(dest){
        if(this.loopTimer)
            clearTimeout(this.loopTimer);

        var diff = parseFloat(((dest - this.depth) / 10).toFixed(3));
        this.depth += diff;

        if(diff){
            var self = this;
            this.loopTimer = setTimeout(function(){
                self.loopTimer = 0;
                self.jumpTo(dest);
            }, 16);
        }
    };
});

// thanks to : http://blog.sodhanalibrary.com/2015/04/angularjs-directive-for-mouse-wheel.html
app.directive("ngWheelUp", function(){
    return function(scope, element, attrs){
        element.bind("DOMMouseScroll mousewheel onmousewheel", function(e){
            e.preventDefault();

            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

            if(delta > 0){
                console.log(attrs.ngWheelUp);
                scope.$apply(attrs.ngWheelUp);
            }
        });
    };
});
app.directive("ngWheelDown", function(){
    return function(scope, element, attrs){
        element.bind("DOMMouseScroll mousewheel wheel onmousewheel", function(e){
            e.preventDefault();

            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

            if(delta < 0){
                scope.$apply(function(){
                    scope.$eval(attrs.ngWheelDown);
                });
            }
        });
    };
});
app.directive("ngWheel", function(){
    return function(scope, element, attrs){
        element.bind("DOMMouseScroll mousewheel wheel onmousewheel", function(e){
            e.preventDefault();

            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))),
                func = scope.$eval(attrs.ngWheel);

            // TODO: shouldn't call scope.scroller staticly
            func.call(scope.scroller, delta);
        });
    };
});