(function () {
    const BOX_SIZE = 100, MIN_BLAST_RADIUS = 100;

    var style = document.createElement("style"),
        fragments = [];
    style.textContent = ".boom { text-decoration:inherit; display:inline-block; } .boom > span { text-decoration:inherit; -webkit-transition-property: -webkit-transform; -webkit-transition-duration: 0.8s;  -webkit-transition-timing-function: ease-in-out; -moz-transition-property: -moz-transform; -moz-transition-duration: 0.7s;  -moz-transition-timing-function: ease-in-out; display:inline-block;}";
    document.documentElement.appendChild(style);

    Node.prototype.remove = function() {
        this.parentNode.removeChild(this);
    }
    Element.prototype.__defineGetter__("totalOffsetLeft", function () {
        var total = 0;
        for (var element = this; element; element = element.offsetParent)
            total += element.offsetLeft + (this !== element ? element.clientLeft : 0);
        return total;
    });
    Element.prototype.__defineGetter__("totalOffsetTop", function () {
        var total = 0;
        for (var element = this; element; element = element.offsetParent)
            total += element.offsetTop + (this !== element ? element.clientTop : 0);
        return total;
    });

    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) || 0;
    };



    var explode = function (x, y) {
        // explosive is used to store the elements
        // as the styles for each letter are created
        // the styles are then applied later all at once
        var explosive = [];
        for (var i = 0, len = fragments.length; i < len; i++) {
            var letter = fragments[i];
            letter.offsetX = letter.totalOffsetLeft;
            letter.offsetY = letter.totalOffsetTop;
            if (distance(x, y, letter.offsetX + letter.x, letter.offsetY + letter.y) < MIN_BLAST_RADIUS) {
                var xOffset = letter.offsetX - x,
                    yOffset = letter.offsetY - y,
                    radians = Math.atan2(yOffset + letter.y, xOffset + letter.x),
                    blastRadius = MIN_BLAST_RADIUS + (MIN_BLAST_RADIUS * Math.random()),
                    targetX = (blastRadius * Math.cos(radians)) - xOffset,
                    targetY = (blastRadius * Math.sin(radians)) - yOffset;

                letter.x = Math.floor(targetX);
                letter.y = Math.floor(targetY);
                var transform = "translate(" + targetX + "px," + targetY + "px) rotate(" + Math.random() * 360 + "deg)";
                letter.tempCSS = ";-webkit-transition-delay: 0s; -moz-transition-delay: 0s; -webkit-transform:" + transform + "; -moz-transform:" + transform + ";";
                letter.reset = true;
                explosive.push(letter);
            }
        }
        while(letter = explosive.pop()) {letter.style.cssText = letter.tempCSS};
    };



    document.addEventListener("mousedown", function (e) {
            explode(e.clientX, e.clientY + window.pageYOffset);
    }, false);

    window.boom = function(element) {
        var lettersGoBoom = this;
        
        var reset = function () {
            if (this.reset) {
                this.style.WebkitTransitionDelay = this.style.MozTransitionDelay = (Math.random() + 1) + "s";
                this.style.WebkitTransform = this.style.MozTransform  = "translate(0px,0px) rotate(0deg)";
                this.reset = false;
            }
            else {
                this.x = this.y = 0;
                this.style.WebkitTransitionDelay = this.style.MozTransitionDelay = "0s";
            }
        };

        var addLetterToBox = function(letterSpan) {
            var box = Math.floor(letterSpan.offsetX / BOX_SIZE) + ":" + Math.floor(letterSpan.offsetY / BOX_SIZE);

            if (!fragments[box]) {
                fragments[box] = [];
            }
            fragments[box].push(letterSpan);
        };

        var split = function (element) {
            var words = element.textContent.trim().split(" ");
            if (words.length) {
                for (var q = 0; q < words.length; q++) {
                    var letters = words[q].split("");
                    if (letters.length > 0) {
                        var wordSpan = document.createElement("span");
                        wordSpan.className = "boom";

                        // preserve spaces at the start of the node
                        element.textContent[0] == " " && element.parentNode.insertBefore(document.createTextNode(" "), element);
                        for (var p = 0; p < letters.length; p++) {
                            var letterSpan = document.createElement("span");
                            letterSpan.textContent = letters[p];
                            letterSpan.x = letterSpan.y = 0;
                            wordSpan.appendChild(letterSpan);

                            fragments.push(letterSpan);

                            letterSpan.addEventListener("webkitTransitionEnd", reset,false);
                            letterSpan.addEventListener("transitionend", reset,false);
                        }
                        element.parentNode.insertBefore(wordSpan, element);
                        if (q < words.length - 1 || element.textContent[element.textContent.length - 1] == " ") 
                            element.parentNode.insertBefore(document.createTextNode(" "), element);
                    }
                }
                element.remove();
            }
        };

        var recurse = function (element) {
            if (element.nodeName == "STYLE" || element.nodeName == "SCRIPT") return;
            var el = element.firstChild;
            while (el) {
                if (el instanceof Text) {
                    split(el);
                }
                else {
                    recurse(el);
                }
                el = el.nextSibling;
            }
        };
        recurse(element);
    };
})();