(function(){

    var DEFAULT_LANGUAGE = "en";

    var self = this;

    var html = document.body.innerHTML;
    document.body.innerHTML = html.replace(/{{(.+?)}}/g, '<span class="translator" data-translator-key="$1"></span>');

    this.data = {};
    this.lang = DEFAULT_LANGUAGE;

    var request = new XMLHttpRequest();
    request.onload = function(){
        try{
            self.data = JSON.parse(this.responseText);
            self.translate();
        }
        catch(e){
            console.log("Impossible to get i18n data");
        }
    };
    request.open("GET", "data.min.json", true);
    request.send();

    var switchs = document.getElementsByClassName("translator-switch"),
    i = switchs.length, el;

    while(el = switchs[--i]){
        el.addEventListener("click", function(){
            self.lang = this.dataset.lang;
            self.translate();
            self.activeSwitch.classList.remove("active");
            self.activeSwitch = this;
            this.classList.add("active");
        });
        if(el.dataset.lang == DEFAULT_LANGUAGE){
            el.classList.add("active");
            self.activeSwitch = el;
        }
    }

    this.translate = function(){
        document.body.classList.remove("translator-ready");

        var strings = document.getElementsByClassName("translator"),
        i = strings.length, el, str;

        while(el = strings[--i]){
            str = this.data[this.lang][el.dataset.translatorKey];
            if(str){
                if(str instanceof Array)
                    str = str.join("<br/>");
                el.innerHTML = str;
            }
            else{
                el.innerHTML = el.dataset.translatorKey;
            }
        }

        document.body.classList.add("translator-ready");
    };
})();