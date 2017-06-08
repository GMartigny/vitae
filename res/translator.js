/**
 * A class for handling translation
 * @param {String} jsonDataURL - An URL to the data
 * @param {Object} options - Additional options<br/>
 * @param {Boolean} options.persists - save selected language into localstorage
 * @param {String} options.lang - starting language
 * @param {String} options.switchesClass - the CSS class of switches
 * @param {String} options.activeSwitchClass - a CSS class apply to current selected switch
 * @param {Function} options.onDOMReady - called when DOM is ready
 * @param {Function} options.onDataError - called when something is wrong with data
 * @param {Function} options.onSwitchLang - called when language is fully changed
 * @constructor
 */
function Translator (jsonDataURL, options) {
    if (typeof jsonDataURL != "string" || !jsonDataURL.length) {
        throw new TypeError("First parameter should be a non empty string");
    }
    this.jsonDataURL = jsonDataURL;

    this.options = options || {};
    if (!this.options.activeSwitchClass) {
        this.options.activeSwitchClass = "translator-active";
    }

    // get lang from options, localStorage then from navigator
    this.lang = this.options.lang || (this.options.persists && localStorage.getItem("lang")) || navigator.language.split("-")[0] || "";

    this.switches = this.options.switchesClass ? this.activateSwitches(this.options.switchesClass) : {};

    // prepare DOM for translation
    this._recursiveReplaceDoubleBrace(document.documentElement);
    if (this.options.onDOMReady) {
        this.options.onDOMReady.call(this);
    }

    // formated i18n data
    this.data = {};
    this._retrieveData(this.jsonDataURL);

}
Translator.DOUBLE_BRACE_REGEXP = /{{(.+?)}}/g;
Translator.DATA_WRAPPER = '<span class="translator" data-translator-key="$1"></span>';
Translator.UNREACHABLE_DATA = "Can't reach data";
Translator.UNPARSABLE_DATA = "Can't parse data";
Translator.prototype = {
    /**
     * Browse DOM and replace double-brace with HTML tag
     * @param {HTMLElement} element - The base element
     * @returns {Translator} Itself for chaining
     */
    _recursiveReplaceDoubleBrace: function(element) {
        var content = element.textContent;
        // text node, replace content
        if (element.nodeType === 3 && content.trim() != "" && Translator.DOUBLE_BRACE_REGEXP.test(content)) {
            var tempHolder = document.createElement("div");
            tempHolder.innerHTML = content.replace(Translator.DOUBLE_BRACE_REGEXP, Translator.DATA_WRAPPER);
            while (tempHolder.childNodes.length) {
                element.parentNode.insertBefore(tempHolder.firstChild, element);
            }
            element.remove();
        }
        // element node, finds children and recursive call
        else if (element.nodeType === 1) {
            var children = element.childNodes,
                i = children.length;
            while (children[--i]) {
                this._recursiveReplaceDoubleBrace.call(this, children[i]);
            }
        }
        return this;
    },
    /**
     * Async get json data from server
     * @returns {Translator} Itself for chaining
     */
    _retrieveData: function(jsonDataURL) {
        var request = new XMLHttpRequest();
        request.onload = function() {
            try {
                this.data = JSON.parse(request.responseText);
                this.translateTo(this.lang);
            }
            catch (e) {
                if (this.options.onDataError) {
                    this.options.onDataError.call(this, Translator.UNPARSABLE_DATA);
                } else {
                    console.log(Translator.UNPARSABLE_DATA);
                }
            }
        }.bind(this);
        request.onerror = function() {
            if (this.options.onDataError) {
                this.options.onDataError.call(this, Translator.UNREACHABLE_DATA);
            } else {
                console.log(Translator.UNREACHABLE_DATA);
            }
        }.bind(this);
        request.open("GET", jsonDataURL, true);
        request.send();
    },
    /**
     * Add click listener to change language
     * @param {String} CSSClass - A className for switch elements
     * @returns {Object}
     */
    activateSwitches: function(CSSClass) {
        var switches = document.getElementsByClassName(CSSClass),
            i = switches.length,
            el,
            map = {};
        while (el = switches[--i]) {
            el.addEventListener("click", function(event) {
                var element = event.target;
                this.translateTo(element.dataset.lang);
            }.bind(this));
            map[el.dataset.lang] = el;
        }
        return map;
    },
    /**
     * Change selected switch
     * @param {HTMLElement} element - A switch element to select
     * @returns {Translator} Itself for chaining
     */
    selectSwitch: function(element) {
        var activeSwitch = document.getElementsByClassName(this.options.activeSwitchClass)[0];
        if (activeSwitch) {
            activeSwitch.classList.remove(this.options.activeSwitchClass);
        }
        if (element) {
            element.classList.add(this.options.activeSwitchClass);
        }
        return this;
    },
    /**
     * Update page to new language
     * @param {String} [lang] - The selected language, if unknown fallback to first known language
     * @returns {Translator} Itself for chaining
     */
    translateTo: function(lang) {
        lang = lang || this.lang;
        if (!this.data[lang]) {
            var fallback = Object.keys(this.data)[0];
            console.warn("Can't use [" + lang + "] fallback to [" + fallback + "]");
            lang = fallback;
        }

        document.body.classList.remove("translator-ready");

        this.selectSwitch(this.switches[lang]);

        this.lang = lang;
        document.documentElement.lang = lang;
        if (this.options.persists) {
            localStorage.setItem("lang", lang);
        }

        var target = document.getElementsByClassName("translator"),
            i = target.length,
            data = this.data[lang],
            el,
            str;

        // crawl page
        while (el = target[--i]) {
            str = data[el.dataset.translatorKey];

            if (str instanceof Array) {
                str = str.join("<br/>");
            }
            el.innerHTML = str ? str : el.dataset.translatorKey;
        }

        if (this.options.onSwitchLang) {
            this.options.onSwitchLang.call(this, this.lang);
        }

        document.body.classList.add("translator-ready");
        return this;
    }
};
