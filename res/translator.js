function Translator(jsonDataURL, options){
    if(typeof jsonDataURL != "string" || !jsonDataURL.length)
        throw new TypeError("First parameter should be a non empty string");
    this.jsonDataURL = jsonDataURL;

    this.options = options || {};
    if(!this.options.activeSwitchClass)
        this.options.activeSwitchClass = "translator-active";

    // get lang from localStorage then from navigator and fallback to "en"
    this.lang = (this.options.persists && localStorage.getItem("lang")) || navigator.language.split("-")[0] || "en";

    if(this.options.switchesClass)
        this.activateSwitches(this.options.switchesClass);

    // prepare DOM for translation
    this._recursiveReplaceDoubleBrace(document.documentElement);
    if(this.options.onDOMReady)
        this.options.onDOMReady.call(this);

    // formated i18n data
    this.data = {};
    this._retreiveData(this.jsonDataURL);

}
Translator.DOUBLE_BRACE_REGEXP = /{{(.+?)}}/g;
Translator.DATA_WRAPPER = '<span class="translator" data-translator-key="$1"></span>';
Translator.UNREACHABLE_DATA = "Can't reach data";
Translator.UNPARSABLE_DATA = "Can't parse data";
Translator.prototype = {
    /**
     * Browse DOM and replace double-brace with HTML tag
     * @param {HTMLElement} element The base element
     * @returns {Translator} Itself for chainning
     */
    _recursiveReplaceDoubleBrace: function(element){
        var content = element.textContent;
        // text node, replace content
        if(element.nodeType === 3 && content.trim() != "" && Translator.DOUBLE_BRACE_REGEXP.test(content)){
            var tempHolder = document.createElement("div");
            tempHolder.innerHTML = content.replace(Translator.DOUBLE_BRACE_REGEXP, Translator.DATA_WRAPPER);
            while(tempHolder.childNodes.length){
                element.parentNode.insertBefore(tempHolder.firstChild, element);
            }
            element.remove();
        }
        // element node, finds children and recursive call
        else if(element.nodeType === 1){
            var children = element.childNodes,
                i = children.length;
            while(children[--i])
                this._recursiveReplaceDoubleBrace.call(this, children[i]);
        }
        return this;
    },
    /**
     * Async get json data from server
     * @returns {Translator} Itself for chainning
     */
    _retreiveData: function(jsonDataURL){
        var request = new XMLHttpRequest();
        request.onload = proxy(function(){
            try{
                this.data = JSON.parse(request.responseText);
                this.translateTo(this.lang);
            }
            catch(e){
                if(this.options.onDataError)
                    this.options.onDataError.call(this, Translator.UNPARSABLE_DATA);
                else
                    console.log(Translator.UNPARSABLE_DATA);
            }
        }, this);
        request.onerror = proxy(function(){
            if(this.options.onDataError)
                this.options.onDataError.call(this, Translator.UNREACHABLE_DATA);
            else
                console.log(Translator.UNREACHABLE_DATA);
        }, this);
        request.open("GET", jsonDataURL, true);
        request.send();
    },
    /**
     * Add click listener to change lang
     * @param {String} classe A className for switch elements
     * @returns {Translator} Itself for chainning
     */
    activateSwitches: function(classe){
        var switchs = document.getElementsByClassName(classe),
            i = switchs.length,
            el;
        while(el = switchs[--i]){
            el.addEventListener("click", proxy(function(event){
                var element = event.target;
                this.translateTo(element.dataset.lang);
                var activeSwitch = document.getElementsByClassName(classe + " " + this.options.activeSwitchClass)[0];
                if(activeSwitch)
                    activeSwitch.classList.remove(this.options.activeSwitchClass);
                element.classList.add(this.options.activeSwitchClass);
            }, this));
            if(el.dataset.lang == this.lang){
                el.classList.add(this.options.activeSwitchClass);
            }
        }
        return this;
    },
    /**
     * Update page to new language
     * @param {String} [] lang The selected language
     * @returns {Translator} Itself for chainning
     */
    translateTo: function(lang){
        lang = lang || this.lang;
        document.body.classList.remove("translator-ready");

        this.lang = lang;
        document.documentElement.lang = lang;
        if(this.options.persists)
            localStorage.setItem("lang", lang);

        var target = document.getElementsByClassName("translator"),
            i = target.length,
            data = this.data[lang],
            el,
            str;

        // crawl page
        while(el = target[--i]){
            str = data[el.dataset.translatorKey];

            if(str instanceof Array)
                str = str.join("<br/>");
            el.innerHTML = str? str: el.dataset.translatorKey;
        }

        if(this.options.onSwitchLang)
            this.options.onSwitchLang.call(this, this.lang);

        document.body.classList.add("translator-ready");
        return this;
    }
};

function proxy(func, self){
    return function(){
        func.apply(self, arguments);
    };
}
