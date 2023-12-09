function __import(js, autoLoad) {
    function _getFile(js) {
        this.js = js;
        this._next_js = undefined;
        this._after_get = undefined;
        this.then = function (js, __this__) {
            if (typeof js === 'function') {
                this._after_get = js;
                this.__this__ = __this__;
                return this;
            } else {
                this._next_js = new _getFile(js);
                return this._next_js;
            }
        };
        this.get = function (endCallback) {
            var _this = this;
            $.get(this.js, function (response, status) {
                if (_this._after_get) {
                    _this._after_get.call(_this.__this__, response, status);
                }
                if (_this._next_js) {
                    _this._next_js.get(endCallback);
                } else {
                    if (endCallback)
                        endCallback();
                    else
                        console.log("import end");
                }
            });
        };
    }
    var the_loader = new _getFile(js);
    if (autoLoad)
        the_loader.get();
    return the_loader;
}

function traversePrototypes(obj, cb) {
    var curProto = obj;
    while (curProto instanceof __PF_BASE_CLASS__) {
        cb.bind(obj)(curProto);

        curProto = Object.getPrototypeOf(curProto);
    }
}

var lastUnname = 0;
/*function __NAME__(src) {  // 取得html elem的对应的名字
    var fn = src.attr('data-fn');
    var ft = src.attr('data-ft');
    var idn = src.attr('id');
    var cln = src.attr('class');

    if (fn) //若有data-fn属性
        return fn;
    else if (idn) //或若有id
        return idn;
    else if (cln && cln.indexOf(' ') === -1) // 或有class名(单一的class)
        return cln;
    else // tagName
        return src.prop("tagName").toLowerCase();
}*/

function __PF_BASE_CLASS__() { }

__PF_BASE_CLASS__.prototype.create = function (className, name, args) {
    var __CLASS__ = __CLASS_TABLE__[className];
    if (__CLASS__)
        return new __CLASS__(this, name, args);
}

__PF_BASE_CLASS__.prototype.__extend__constructors__ = [];
__PF_BASE_CLASS__.prototype.__extend__preconstructors__ = [];
//__PF_BASE_CLASS__.prototype.__extend__DATA_src__ = [];

__PF_BASE_CLASS__.prototype.root = function () {
    var p = this._;
    while (1) {
        if (!p || !p._)
            break;
        p = p._;
    }
    return p;
}
__PF_BASE_CLASS__.prototype.toNS = function (ns) {
    var n = this.NS;
    if (n && n.__NS_name__ !== ns) {
        while ((n = n._NS) && n.__NS_name__ !== ns);
    }

    return n;
}
__PF_BASE_CLASS__.prototype.toString = function () { return 'PAGEFRAMEWORK' }
__PF_BASE_CLASS__.prototype.prop = function (p, v) {
    if (v !== undefined)
        this.$.attr(p, v);
    else
        return this.$.attr(p);
}
__PF_BASE_CLASS__.prototype.removeProp = function (p) { this.$.removeAttr(p) }
__PF_BASE_CLASS__.prototype.text = function (t) {
    if (t !== undefined)
        this.$.text(t);
    return this.$.text();
}
__PF_BASE_CLASS__.prototype.html = function (h) {
    if (h !== undefined)
        this.$.html(h);
    return this.$.html();
}
__PF_BASE_CLASS__.prototype.show = function () { this.$.show() }
__PF_BASE_CLASS__.prototype.hide = function () { this.$.hide() }

/*function randomName(obj) {
    let name = "";
    let i = 0;

    while (name.length === 0 || obj[name] !== undefined) {
        while (i < 6) {
            let code = Math.round(Math.random() * 57) + 65;
            if (code <= 90 || code >= 97) {
                name += String.fromCharCode(code);
                i++;
            }
        }
    }

    return name;
}*/

__PF_BASE_CLASS__.prototype.putInto = function (p, name, opt) {
    p.$.append(this.$);
    /*if (name === true)
        p[this.__NAME__] = this;
    else if (name !== undefined)
        p[name] = this;
    else
        p[randomName(p)] = this;*/
    if (name !== undefined) {
        this.__NAME__ = name;
        p[this.__NAME__] = this;
    }

    this._ = p;
    if (this/*.__proto__*/.nonauto) {
        var args;
        if (opt) args = opt.args;
        this.constructor(args);
    }
}
__PF_BASE_CLASS__.prototype.prepend = function (p, name, opt) {
    /*p.$.prepend(this.$);
    if (name === true)
        p[this.__NAME__] = this;
    else if (name !== undefined)
        p[name] = this;
    else
        p[randomName(p)] = this;*/
    if (name !== undefined) {
        this.__NAME__ = name;
        p[this.__NAME__] = this;
    }

    this._ = p;
    if (this/*.__proto__*/.nonauto) {
        var args;
        if (opt) args = opt.args;
        this.constructor(args);
    }
}
/*__PF_BASE_CLASS__.prototype.__NAME__ = function () {
    return __NAME__(this.$);
}*/
__PF_BASE_CLASS__.prototype.__CLASSNAME__ = function () {
    return this.toString();
}
__PF_BASE_CLASS__.prototype.each = function (cb) {
    for (var x in this) {
        if (!this[x] || typeof this[x] !== 'object' || !("$" in this[x]) || x === 'NS' || x === '_NS' || x === '_')
            continue;

        cb.call(this, x, this[x]);
    }
}
__PF_BASE_CLASS__.prototype.empty = function () {
    /*this.$.empty();
    this.each(function (name, value) {
        delete this[name];
    });*/
    this.each((name, value) => {
        if (this[name] !== this)
            this[name].removeSelf();
    });
    this.$.empty();
}
__PF_BASE_CLASS__.prototype.remove = function (name) {
    if (this[name] && typeof this[name] == 'object' && this[name].removeSelf)
        this[name].removeSelf();
}
__PF_BASE_CLASS__.prototype.removeSelf = function () {
    this.deleting = true;

    for (let x in this.__autoCleanup__) {
        if (this.__autoCleanup__[x] instanceof __PF_BASE_CLASS__)
            this.__autoCleanup__[x].removeSelf();
        else if (this.__autoCleanup__[x] !== undefined)
            delete this.__autoCleanup__[x];
    }

    traversePrototypes(this, (proto) => {
        if (proto.hasOwnProperty("destructor"))
            proto.destructor.call(this);
        if (proto.hasOwnProperty("__extend_destructors__")) {
            for (let x in proto.__extend_destructors__)
                proto.__extend_destructors__[x].call(this);
        }
    });

    var keys = Object.keys(this);
    for (let x in keys) {
        var k = keys[x];
        /*if (k != '_' && k != 'NS' && k != '_NS' && k != '$' && typeof this[k] == "object" && this[k].$ != undefined) {
            this[k].removeSelf();
        }*/
        if (k != '_' && k != 'NS' && k != '_NS' && k != '$' && this[k] !== undefined && this[k] !== null && this[k] !== this) {
            if (this[k] instanceof __PF_BASE_CLASS__ && !this[k].deleting)
                this[k].removeSelf();
            else
                delete this[k];
        }
    }

    for (let x in this.events) {
        this.$.off(this.events[x].event, this.events[x].callback);
    }
    /*for (let x in this) {
        if (typeof this[x] == "object" && this[x].$ != undefined && x != 'NS' && x != '_NS' && x != '_')
            this[x].$.remove();
    }*/

    this.$.remove();

    var deleted = false;
    if (this._) {
        for (let x in this._) {
            if (this._[x] === undefined || this._[x] === null ||
                x === 'NS' || x === '_NS' || x === '_' ||
                /^PF./.test(this._[x].toString()) == false)
                continue;
            if (this._[x] === this) {
                delete this._[x];
                deleted = true;
                break;
            }
        }
    }

    if (!deleted)
        delete this;

    this.destroy = true;
}

__PF_BASE_CLASS__.prototype.superTmpl = function (tmpl) {
    //return __CLASS_TABLE__[this.__superTmpl__].prototype;
    var currentSuperTmpl = this;

    do {
        var currentSuperTmplName = currentSuperTmpl.__superTmpl__;
        currentSuperTmpl = __CLASS_TABLE__[currentSuperTmplName].prototype;
    } while (currentSuperTmplName !== tmpl && currentSuperTmpl !== undefined);

    return currentSuperTmpl;
}

// <div data-fi></div>
// <div data-fw></div>
// <div data-ft="class" data-fn></div>
// <div data-fr="class" data-fn></div>
// <div data-fn></div>
var __REF_ALIAS__ = {};


var __CLASS_TABLE__ = []; // 类表,以供之后定义对象
function compile(src, parent, tmplFile, __text__, attachData) {
    var __text__ = "";
    src.contents().filter(function() {
        return this.nodeType == 3;
    }).each(function() {
        __text__ += $(this).text();
    });
    //var className = src.attr ('data-fc');
    src.find('script').each(function () {
        var PFScript = $('<pf-script></pf-script>');
        PFScript.attr("data-fn", $(this).attr("data-fn"));
        PFScript.attr("data-fe", $(this).attr("data-fe"));
        PFScript.attr("data-args", $(this).attr("data-args"));
        PFScript.text($(this).text());
        $(this).replaceWith(PFScript);
    });

    try {
        if (src.length === 0)
            return false;
        var className = src.attr('data-ft');
    } catch (e) {
        if (e instanceof TypeError)
            console.log("Some error", src);
        return false;
    }
    // if (className === undefined)
    //     className = src.attr ('data-fr');
    if (className === undefined) {
        className = src.attr("data-fn") || src.attr("id");
        if (!className) {
            var classList = src.attr("class");
            className = classList ? classList.split(' ')[0] : undefined;
        }
        if (!className)
            className = src.prop("tagName").toLowerCase();

        if (parent)
            className = parent.toString().replace(/^PF\::/, '') + '::' + className;
    }

    var __CLASS__;// = __CLASS_TABLE__[className];

    if (__CLASS__ === undefined) {
        __CLASS__ = function (parent, name, args) {
            if (name === undefined) {
                if (parent)
                    this.__NAME__ = src.prop("tagName").toLowerCase();
                else {
                    this.__NAME__ = "unname_" + lastUnname;
                    lastUnname++;
                }
            } else
                this.__NAME__ = name;

            if (parent) {
                if (parent[this.__NAME__]) {
                    let i = 0;
                    while(parent[this.__NAME__ + '_' + i]) {
                        i++;
                    }
                    this.__NAME__ = this.__NAME__ + '_' + i;
                }
                parent[this.__NAME__] = this;
            }

            // if the obj is tmpl or not
            if (this/*.__proto__*/.tmpl) {
                this.$ = this/*.__proto__*/.src.clone();
                this["__TEXT__"] = undefined;
            } else {
                this.$ = this/*.__proto__*/.src;
                this["__TEXT__"] = __text__;
            }

            if (attachData && typeof attachData === "object") {
                for (let x in attachData)
                    this[x] = attachData[x];
            }

            // process the obj in which namespace
            var pN = parent ? parent.NS : undefined;
            if (this/*.__proto__*/.__NS_name__) {
                this.NS = this;
                if (pN)
                    this._NS = pN;
            } else if (pN) {
                this.NS = pN;
                if (pN._NS)
                    this._NS = pN._NS;
            }

            // the parent obj
            this._ = parent;
            if (parent === undefined && this/*.__proto__*/.tmpl) // when no give parent and the obj is tmpl
                this._ = this/*.__proto__*/.parent;

            this.__autoCleanup__ = [];

            traversePrototypes(this, (proto) => {
                if (proto.hasOwnProperty("__extend__preconstructors__"))
                    for (let x in proto.__extend__preconstructors__)
                        proto.__extend__preconstructors__[x].call(this);
            });

            if (this.preconstructor !== undefined)
                this.preconstructor.call(this, args);

            var __this__ = this;
            // 编译类属性对象
            (function iteratorChildren(e) {
                var children = e.children('[data-ft]');
                children.each(function () {
                    if (compile($(this), __this__, tmplFile) === false)
                        return;
                    $(this).remove();
                });

                children = e.children()
                    .not('[data-fw]')
                    .not('[data-fi]')
                    .not('pf-script')
                    .not('[data-ft]')
                    .not('pf-extend')
                    .not('pf-data');
                children.each(function () {
                    // __this__[__NAME__ ($(this))] = compile ($(this), __this__, tmplFile);

                    /*var __text__ = "";
                    $(this).contents().filter(function () {
                        return this.nodeType == 3;
                    }).each(function () {
                        __text__ += $(this).text();
                    });*/

                    var obj = compile($(this), __this__, tmplFile, __text__);
                    if (obj === false)
                        return;
                    //__this__[__NAME__($(this))] = obj;
                    //__this__[obj.__NAME__] = obj;
                });

                children = e.children('[data-fw]');
                children.each(function () {
                    iteratorChildren($(this));
                });

                children = e.children('[data-putInto],[data-append],[data-prepend]');
                children.each(function () {
                    var objElem = $(this);
                    if (objElem.attr("data-append") !== undefined)
                        __this__.$.append(objElem);
                    else if (objElem.attr("data-prepend") !== undefined)
                        __this__.$.prepend(objElem);
                    else if (objElem.attr("data-putInto") !== undefined) {
                        var targetInto = objElem.attr("data-putInto");
                        if (targetInto.length > 0 && __this__[targetInto])
                            __this__[targetInto].$.append(objElem);
                    }
                });

                /*children.each(function () {
                    var objElem = $(this).remove();
                    var name = objElem.attr('data-fn');
                    if (name) {
                        var dataObj = compile(objElem, undefined, tmplFile);
                        $.each(objElem[0].attributes, function () {
                            if (this.name !== "data-fn")
                                dataObj[this.name.replace(/^data-/, '')] = this.value;
                        });

                        if (!(name in __this__['__data__']))
                            __this__['__data__'][name] = [];

                        var dataArray = __this__['__data__'][name];
                        dataArray.push(dataObj);
                    }
                });*/
                function assignData(data, name, elem) {
                    /* data-stal: standalone
                     * data-fplc: followsParentLifecycle */
                    if (elem.attr("data-str") !== undefined)
                        data[name] = elem.text() || "";
                    else if (elem.attr("data-html") !== undefined)
                        data[name] = elem.html() || "";
                    else if (elem.attr("data-number") !== undefined)
                        data[name] = Number(elem.text()) || 0;
                    else if (elem.attr("data-bool") !== undefined) {
                        let v = elem.text().toLowerCase();
                        data[name] = v === "true" || v > 0 || v === "t";
                    } else if (elem.attr("data-js") !== undefined)
                        data[name] = Function(elem.text()).call(__this__);
                    else if (elem.attr("data-cmp") !== undefined) {
                        let p = elem.attr('data-stal') !== undefined ? undefined : __this__; 
                        let cmpElem = elem.children().first();
                        cmpElem.attr('data-fn', name);
                        data[name] = compile(cmpElem, p, tmplFile);

                        if (!p && elem.attr('data-fplc') !== undefined)
                            __this__.__autoCleanup__.push(data[name]);
                    } else if (elem.attr("data-array") !== undefined) {
                        // let data = [];
                        data[name] = [];
                        elem.children().each(function () {
                            assignData(data[name], data[name].length, $(this));
                        });
                    } else if (elem.attr("data-object") !== undefined) {
                        if (elem.attr("data-modified") === undefined || !(name in data))
                            data[name] = {};

                        $.each(elem[0].attributes, function () {
                            let reg = /data-(?<t>s|n|b)-(?<n>.+)/.exec(this.name);
                            if (reg) {
                                let v = this.value;
                                let objName = reg.groups.n;
                                let t = reg.groups.t;
                                if (t == 's')
                                    data[name][objName] = v || "";
                                else if (t == 'n')
                                    data[name][objName] = Number(v) || 0;
                                else if (t == 'b') {
                                    v = v.toLowerCase();
                                    data[name][objName] = v === "true" || v > 0 || v === "t" || v === "";
                                }
                            }
                        });
                        elem.children().each(function () {
                            let objName = $(this).attr("id") || $(this).attr("data-fn");
                            if (objName !== undefined)
                                assignData(data[name], objName, $(this));
                        });
                    } else {
                        if (elem.prop("tagName").toLowerCase() === "pf-data"
                            && elem.children().length === 0) {
                            if (elem.attr("data-deleted") !== undefined) {
                                if (data[name] instanceof __PF_BASE_CLASS__)
                                    data[name].removeSelf();

                                delete data[name];
                            } else
                                data[name] = undefined;
                        } else {
                            let p = elem.attr('data-stal') !== undefined ? undefined : __this__;
                            let fplc = elem.attr('data-fplc') !== undefined;
                            data[name] = compile(elem, p, tmplFile);

                            if (!p && fplc)
                                __this__.__autoCleanup__.push(data[name]);
                        }
                    }
                }

                var dataElems = [];
                /*var curProto = Object.getPrototypeOf(__this__);
                while (curProto instanceof __PF_BASE_CLASS__) {
                    if (curProto.hasOwnProperty("__extend__DATA_src__"))
                        dataElems = curProto.__extend__DATA_src__.concat(dataElems);

                    curProto = Object.getPrototypeOf(curProto);
                }*/
                traversePrototypes(__this__, (proto) => {
                    if (proto.hasOwnProperty("__extend__DATA_src__"))
                        dataElems = proto.__extend__DATA_src__.concat(dataElems);
                });
                dataElems.push(e.children('pf-data'));

                __this__['__DATA__'] = {};
                for (let x in dataElems) {
                    dataElems[x].each(function () {
                        var dataElem = $(this).remove();
                        var name = dataElem.attr('data-fn');
                        if (name)
                            assignData(__this__.__DATA__, name, dataElem);
                    });
                }
            })(__this__.$);


            /*for (var x in __this__.__extend__constructors__)
                __this__.__extend__constructors__[x].call(this);*/
            traversePrototypes(__this__, (proto) => {
                if (proto.hasOwnProperty("__extend__constructors__"))
                    for (let x in proto.__extend__constructors__)
                        proto.__extend__constructors__[x].call(this);
            });

            if (__this__/*.__proto__*/.constructor !== undefined
                && __this__/*.__proto__*/.nonauto === false)
                __this__.constructor.call(__this__, args);

            for (var x in __this__/*.__proto__*/.events) {
                __this__.$.on(__this__.events[x].event, __this__/*.__proto__*/.events[x].callback.bind(this));
            }
            //__this__.$.find('*').removeAttr('data-fi data-fr data-fw data-ft data-args data-fn data-fns data-putInto data-append data-prepend data-custom-place data-overloaded-prefix');
            this.$.removeAttr('data-fi data-fr data-fw data-ft data-args data-fn data-fns data-putInto data-append data-prepend data-custom-place data-overloaded-prefix data-fplc data-stal');
            __this__.$.find('pf-script').remove();
        }


        var overloaded_prefix = src.attr('data-overloaded-prefix');

        var fr = src.attr('data-fr');
        var isTmpl = src.attr('data-ft');

        if (!fr)
            fr = __REF_ALIAS__[src.prop("tagName")];

        var frArgs = src.attr('data-args');
        var baseClass = __PF_BASE_CLASS__;
        if (fr !== undefined)
            baseClass = __CLASS_TABLE__[fr];

        try {
            __CLASS__.prototype = Object.create(baseClass.prototype);
        } catch (e) {
            if (e instanceof TypeError) {
                console.log("[TypeError] ClassName: " + className + ", Reference: " + fr);
            }
            return false;
        }


        __CLASS__.prototype.toString = function () {
            if (fr !== undefined)
                return 'PF::' + fr + "::" + className;
            else
                return 'PF::' + className;
        }
        __CLASS__.prototype.events = [];
        __CLASS__.prototype.__superTmpl__ = fr;

        // var extend = src.attr("data-extend");
        var ext_cstr = [];
        var ext_pcstr = [];
        var ext_destr = [];

        var ext_dataSrc = [];
        src.find('> pf-extend').each(function () {
            try {
                var extendClass = __CLASS_TABLE__[$(this).attr("data-fr")].prototype;
            } catch (e) {
                if (e instanceof TypeError) {
                    console.log("[TypeError](extend)Reference:" + $(this).attr("data-fr"));
                }
                return false;
            }

            for (var x in extendClass) {
                var ext_var = extendClass[x];
                if (x === 'constructor')
                    ext_cstr.push(ext_var);
                else if (x === 'preconstructor')
                    ext_pcstr.push(ext_var);
                else if (x === 'destructor')
                    ext_destr.push(ext_var);
                else if (typeof ext_var == 'function' && !(x in __CLASS__.prototype))
                    __CLASS__.prototype[x] = ext_var;
            }

            __CLASS__.prototype.events = __CLASS__.prototype.events.concat(extendClass.events);

            let dataElems = extendClass.src.children("pf-data");
            if (dataElems.length > 0)
                ext_dataSrc.push(dataElems);

            $(this).remove();
        });

        src.find('> pf-script').each(function () {
            var funSrc = $(this).text();
            var ev = $(this).attr('data-fe');
            var args = $(this).attr('data-args');
            if (args)
                args = args.split(/,\s*/);
            else
                args = [];
            if (ev) {
                // __CLASS__.prototype.events[ev] = eval('(function (event) {' + funSrc + '})');
                //__CLASS__.prototype.events[ev] = Function("event", args, funSrc);
                args.unshift('event');
                __CLASS__.prototype.events.push({
                    event: ev,
                    callback: Function(args, funSrc)
                });
            } else {
                var funName = $(this).attr('data-fn'); //__NAME__($(this));
                /*__CLASS__.prototype[funName]
                    = eval('(function (' + args + ') {' + funSrc + '})');*/
                __CLASS__.prototype[funName] = Function(args, funSrc);
            }
            $(this).remove();
        });

        /*__CLASS__.prototype.__extend__constructors__ = baseClass.prototype.__extend__constructors__.concat(ext_cstr);
        __CLASS__.prototype.__extend__preconstructors__ = baseClass.prototype.__extend__preconstructors__.concat(ext_pcstr);*/
        if (ext_cstr.length > 0)
            __CLASS__.prototype.__extend__constructors__ = ext_cstr;
        if (ext_pcstr.length > 0)
            __CLASS__.prototype.__extend__preconstructors__ = ext_pcstr;
        if (ext_destr.length > 0)
            __CLASS__.prototype.__extend_destructors__ = ext_destr;
        if (ext_dataSrc.length > 0)
            __CLASS__.prototype.__extend__DATA_src__ = ext_dataSrc;

        if (fr !== undefined) {
            var subElems = src.find('>[data-putInto],>[data-append],>[data-prepend],>[data-custom-place]').clone();
            var elemDatas = src.find('>pf-data').clone();

            var tagName = baseClass.prototype.tagName;
            if (tagName) {
                var newSrc = $('<' + tagName + '></' + tagName + '>');
                $.each(src[0].attributes, function () {
                    newSrc.attr(this.name, this.value);
                });
                src.replaceWith(newSrc);
                src = newSrc;
            } else
                src.empty();
            src.append(baseClass.prototype.src.html());
            src.append(subElems);
            src.append(elemDatas);

            // var tmpNS = baseClass.prototype.src.attr ('data-fns');
            // if (tmpNS !== undefined)
            //     src.attr ('data-fns', tmpNS);
            var tmpAttrs = baseClass.prototype.src[0].attributes;
            var additionAttr = {};
            for (var x = 0; x < tmpAttrs.length; x++) {
                var attrName = tmpAttrs[x].name;
                var attrValue = tmpAttrs[x].value;
                if (attrName !== 'class' && attrName !== 'data-fr' && attrName !== 'data-args' && attrName !== 'data-fn' && src.attr(attrName) === undefined)
                    additionAttr[attrName] = attrValue;
            }
            src.attr(additionAttr);
            var tClass = baseClass.prototype.src.attr('class');
            var sClass = src.attr('class');
            if (tClass)
                src.attr('class', tClass);
            if (sClass)
                src.addClass(sClass);
        }


        __CLASS__.prototype.nonauto = src.attr('data-nonauto') !== undefined;

        var nsName = src.attr('data-fns');
        if (nsName)
            __CLASS__.prototype.__NS_name__ = nsName;


        if (isTmpl && isTmpl.length > 0) {
            var alias = src.attr('data-fra');
            if (alias && alias.length > 0) {
                __REF_ALIAS__[alias.toUpperCase()] = className;
            }

            var tagName = src.attr('data-tagName');
            if (tagName && tagName.length > 0)
                __CLASS__.prototype.tagName = tagName;
            else if (!tagName)
                tagName = __CLASS__.prototype.tagName;

            var newSrc = src;
            if (tagName && tagName.length > 0) {
                newSrc = $("<" + tagName + ">" + "</" + tagName + ">");
                newSrc.append(src.html());
                $.each(src[0].attributes, function () {
                    newSrc.attr(this.name, this.value);
                });
            }

            var styleElem = newSrc.find("style");
            $("head").prepend(styleElem);

            __CLASS__.prototype.parent = parent;
            __CLASS__.prototype.src = newSrc.clone();
            __CLASS__.prototype.src.removeAttr('data-ft');
            __CLASS__.prototype.src.removeAttr('data-fra');
            __CLASS__.prototype.src.removeAttr('data-tagName');
            __CLASS__.prototype.src.removeAttr('data-fr');
            __CLASS__.prototype.src.removeAttr('data-overloaded-prefix');
            __CLASS__.prototype.tmpl = true;
            __CLASS_TABLE__[className] = __CLASS__;
            src.remove();
        } else {
            __CLASS__.prototype.src = src;
            __CLASS__.prototype.tmpl = false;
        }

        __CLASS__.prototype.tmplFile = tmplFile;

        if (src.prop("tagName").toLowerCase() === "pf-package") {
            $("head").prepend(src.find("> style"));
            // $("head").prepend (src.find ('link[rel="stylesheet"]'));
            src.find('link[rel="stylesheet"]').each(function () {
                $(this).attr("href", tmplFile.replace(/[^\/]*$/, "") + $(this).attr("href"));
                $("head").prepend($(this));
            });
        }
    }

    var obj;
    if (!__CLASS__.prototype.tmpl) {
        var objName = src.attr("data-fn") || src.attr("id");

        if (fr !== undefined && frArgs !== undefined) {
            obj = new __CLASS__(parent, objName, frArgs ? frArgs.split(/,\s*/) : []/*eval('[' + frArgs + ']')*/);
        } else
            obj = new __CLASS__(parent, objName);
    }

    return obj;
}

function newObject(className, parent, name, args) {
    var __CLASS__ = __CLASS_TABLE__[className];
    if (__CLASS__)
        return new __CLASS__(parent, name, args);
}

function loadTemplates(tmpls, endCallback) {
    var start;
    var end;
    for (var x in tmpls) {
        if (x === '0') {
            start = __import(tmpls[x].file);
            end = start;
        } else
            end = end.then(tmpls[x].file);

        end = end.then((function (tmpl, html) {
            var obj = compile($(html), null, tmpl.file);

            if (tmpl.name)
                this[tmpl.name] = obj;

            if (tmpl.into)
                $(tmpl.into).append(obj.$);
            else if (tmpl.replace)
                $(tmpl.replace).replaceWith(obj.$);
            else if (tmpl.childrenInto)
                $(tmpl.childrenInto).append(obj.$.find('> *'));

            if (tmpl.callback)
                tmpl.callback(obj);
        }).bind(null, tmpls[x]));
    }

    console.log(end);

    start.get(endCallback);
}




function loadModules(modules, compileBody) {
    var loader = {
        loading: 0,
        load: function () {
            if (compileBody)
                $("body").hide();

            if (this.loading >= modules.length) {
                if (compileBody) {
                    window.__body__ = compile($('body'));
                    window.__body__.show();
                }
                this.end();
                return;
            }
            loadTemplates([{
                file: modules[this.loading],
                callback: function (obj) {
                    var rlp = /.*\//.exec(this.file);
                    rlp = rlp ? rlp[0] : "";

                    obj.load(rlp, loader.nextLoad.bind(loader));
                }
            }]);
        },
        nextLoad: function () {
            this.loading++;
            this.load();
        },
        onEnd: function (cb) {
            this.end = cb;
        },
        end: function () { }
    }

    loader.load();

    return loader;
}
