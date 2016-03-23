(function(){

    var self = this;

    this.DOUBLE_BRACE_REGEXP = /{{(.+?)}}/g;
    this.DATA_WRAPPER = '<span class="translator" data-translator-key="$1"></span>';

    function recursiveReplaceDoubleBrace(element){
        // text node, replace content
        var content = element.textContent.trim();
        if(element.nodeType === 3 && content != "" && self.DOUBLE_BRACE_REGEXP.test(content)){
            var tempHolder = document.createElement("div");
            tempHolder.innerHTML = content.replace(self.DOUBLE_BRACE_REGEXP, self.DATA_WRAPPER);
            element.parentNode.insertBefore(tempHolder.firstChild, element);
            element.remove();
        }
        // element node, finds children and recursive call
        else if(element.nodeType === 1){
            var children = element.childNodes;
            [].forEach.call(children, recursiveReplaceDoubleBrace);
        }
    }

    // prepare html for translation
    recursiveReplaceDoubleBrace(document.documentElement);

    // get lang from localStorage then from navigator and fallback to "en"
    this.lang = localStorage.getItem("lang") || navigator.language.split("-")[0] || "en";

    this.data = {};

    // AJAX request for data
    var request = new XMLHttpRequest();
    request.onload = function(){
        try{
            self.data = JSON.parse(this.responseText);
            self.translateTo();
        }
        catch(e){
            console.log("Impossible to get i18n data");
        }
    };
    request.open("GET", "data.json", true);
    request.send();

    // activate switches
    var switchs = document.getElementsByClassName("translator-switch"),
    i = switchs.length, el;
    while(el = switchs[--i]){
        el.addEventListener("click", function(){
            self.translateTo(this.dataset.lang);
            document.getElementsByClassName("translator-switch active")[0].classList.remove("active");
            this.classList.add("active");
        });
        if(el.dataset.lang == this.lang){
            el.classList.add("active");
        }
    }

    /**
     * Update page to new language
     * @param {String} lang The selected language
     * @returns {Translator} Itself
     */
    this.translateTo = function(lang){
        var lang = lang || this.lang;
        document.body.classList.remove("translator-ready");

        this.lang = lang;
        document.documentElement.lang = lang;
        localStorage.setItem("lang", lang);

        var strings = document.getElementsByClassName("translator"),
            i = strings.length,
            data = this.data[lang], el, str;

        // crawl page
        while(el = strings[--i]){
            str = data[el.dataset.translatorKey];

            if(str instanceof Array)
                str = str.join("<br/>");
            el.innerHTML = str? str: el.dataset.translatorKey;
        }

        document.body.classList.add("translator-ready");
        return this;
    };
})();