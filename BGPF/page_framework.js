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
        this.get = function () {
            var _this = this;
            $.get (this.js, function (response,status) {
                if (_this._after_get) {
                    _this._after_get.call (_this.__this__, response,status);
                }
                if (_this._next_js) {
                    _this._next_js.get();
                }
            });
        };
    }
    var the_loader = new _getFile(js);
    if (autoLoad)
        the_loader.get();
    return the_loader;
}

function __NAME__ (src) {  // 取得html elem的对应的名字
    var fn = src.attr ('data-fn');
    var ft = src.attr ('data-ft');
    var idn = src.attr ('id');
    var cln = src.attr ('class');

    if (fn) //若有data-fn属性
        return fn;
    else if (idn) //或若有id
        return idn;
    else if (cln && cln.indexOf (' ') === -1) // 或有class名(单一的class)
        return cln;
    else // tagName
        return src.prop("tagName").toLowerCase();
}

function __PF_BASE_CLASS__ () {}
__PF_BASE_CLASS__.prototype.create = function (className, args) {
    var __CLASS__ = __CLASS_TABLE__[className];
    if (__CLASS__)
        return new __CLASS__ (this,args);
}
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
        this.$.attr (p, v);
    else
        return this.$.attr (p);
}
__PF_BASE_CLASS__.prototype.removeProp = function (p) { this.$.removeAttr (p) }
__PF_BASE_CLASS__.prototype.text = function (t) {
    if (t !== undefined)
        this.$.text (t);
    return this.$.text ();
}
__PF_BASE_CLASS__.prototype.html = function (h)
{
    if (h !== undefined)
        this.$.html (h);
    return this.$.html ();
}
__PF_BASE_CLASS__.prototype.show = function () { this.$.show () }
__PF_BASE_CLASS__.prototype.hide = function () { this.$.hide () }
__PF_BASE_CLASS__.prototype.putInto = function (p, name, opt) {
    p.$.append (this.$);
    if (name === true)
        p[this.__NAME__()] = this;
    else if (name !== undefined)
        p[name] = this;

    this._ = p;
    if (this.__proto__.nonauto) {
        var args;
        if (opt) args = opt.args;
        this.constructor (args);
    }
}
__PF_BASE_CLASS__.prototype.__NAME__ = function () {
    return __NAME__ (this.$);
}
__PF_BASE_CLASS__.prototype.__CLASSNAME__ = function () {
    return this.toString ();
}
__PF_BASE_CLASS__.prototype.each = function (cb) {
    for (var x in this) {
        if (/^PF./.test (this[x].toString ()) == false || x === 'NS' || x === '_NS' || x === '_')
            continue;

        cb.call (this, x, this[x]);
    }
}
__PF_BASE_CLASS__.prototype.empty = function () {
    this.$.empty ();
    this.each (function (name, value) {
        delete this[name];
    });
}
__PF_BASE_CLASS__.prototype.remove = function (name) {
    if (this[name]) {
        this[name].$.remove ();
        delete this[name];
    }
}
__PF_BASE_CLASS__.prototype.removeSelf = function () {
    this.$.remove ();
    var deleted = false;
    if (this._) {
        for (var x in this._) {
            if (this._[x] === undefined ||
                x === 'NS' || x === '_NS' || x === '_' ||
                /^PF./.test (this._[x].toString ()) == false)
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
}

// <div data-fi></div>
// <div data-fw></div>
// <div data-ft="class" data-fn></div>
// <div data-fr="class" data-fn></div>
// <div data-fn></div>
var __CLASS_TABLE__ = []; // 类表,以供之后定义对象
function compile (src, parent) {
    //var className = src.attr ('data-fc');
    var className = src.attr ('data-ft');
    // if (className === undefined)
    //     className = src.attr ('data-fr');
    if (className === undefined) {
        className = __NAME__ (src);
        if (parent)
            className = parent.toString ().replace(/^PF\./,'') + '.' + className;
    }

    var __CLASS__ = __CLASS_TABLE__[className];

    if (__CLASS__ === undefined) {
        __CLASS__ = function (parent, args) {
            // if the obj is tmpl or not
            if (this.__proto__.tmpl)
                this.$ = this.__proto__.src.clone ();
            else
                this.$ = this.__proto__.src;

            // process the obj in which namespace
            var pN = parent ? parent.NS : undefined;
            if (this.__proto__.__NS_name__) {
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
            if (parent === undefined && this.__proto__.tmpl) // when no give parent and the obj is tmpl
                this._ = this.__proto__.parent;

            var __this__ = this;

            // preconstructor
            if (__this__.__proto__.preconstructor !== undefined)
                __this__.preconstructor.call (__this__, args);

            // 编译类属性对象
            (function iteratorChildren (e) {
                var children = e.children ('[data-ft]');
                children.each (function () {
                    compile ($(this), __this__);
                    $(this).remove ();
                });

                children = e.children ()
                    .not ('[data-fw]')
                    .not ('[data-fi]')
                    .not ('script')
                    .not ('[data-ft]');
                children.each (function () {
                    __this__[__NAME__ ($(this))] = compile ($(this), __this__);
                });

                children = e.children ('[data-fw="true"]');
                children.each (function () {
                    iteratorChildren ($(this));
                });
            }) (__this__.$);

            if (__this__.__proto__.constructor !== undefined
                && __this__.__proto__.nonauto === false)
                __this__.constructor.call (__this__, args);

                for (var x in __this__.__proto__.events) {
                    __this__.$.on (x, __this__.__proto__.events[x].bind (this));
                }

            __this__.$.find ('*').removeAttr ('data-fi data-fr data-fw data-ft data-args data-fn data-fns');
            __this__.$.find ('script').remove ();
        }

        var fr = src.attr ('data-fr');
        var frArgs = src.attr ('data-args');
        var baseClass = __PF_BASE_CLASS__;
        if (fr !== undefined)
            baseClass = __CLASS_TABLE__[fr];

        __CLASS__.prototype = Object.create (baseClass.prototype);




        __CLASS__.prototype.toString = function () {
            if (fr !== undefined)
                return 'PF.' + fr + className;
            else
                return 'PF.' + className;
        }
        __CLASS__.prototype.events = [];
        src.find ('> script').each (function () {
            var funSrc = $(this).text ();
            var ev = $(this).attr ('data-fe');
            if (ev)
                __CLASS__.prototype.events[ev] = eval ('(function () {' + funSrc + '})');
            else {
                var funName = __NAME__ ($(this));
                var args = $(this).attr ('data-args');
                if (!args)
                    args = "";
                __CLASS__.prototype[funName]
                = eval ('(function (' + args + ') {' + funSrc + '})');
            }
            $(this).remove ();
        });

        if (fr !== undefined) {
            src.empty ();
            //src.append (baseClass.prototype.src.children ().clone ());
            src.append (baseClass.prototype.src.html ());

            // var tmpNS = baseClass.prototype.src.attr ('data-fns');
            // if (tmpNS !== undefined)
            //     src.attr ('data-fns', tmpNS);
            var tmpAttrs = baseClass.prototype.src[0].attributes;
            var additionAttr = {};
            for (var x = 0; x < tmpAttrs.length; x++) {
                var attrName = tmpAttrs[x].name;
                var attrValue = tmpAttrs[x].value;
                if (attrName !== 'class' && attrName !== 'data-fr' && attrName !== 'data-args' && attrName !== 'data-fn' && src.attr (attrName) === undefined)
                    additionAttr [attrName] = attrValue;
            }
            src.attr (additionAttr);
            var tClass = baseClass.prototype.src.attr ('class');
            var sClass = src.attr ('class');
            if (tClass)
                src.attr ('class', tClass);
            if (sClass)
                src.addClass (sClass);
        }



        if (src.attr ('data-nonauto') === 'true')
            __CLASS__.prototype.nonauto = true;
        else
            __CLASS__.prototype.nonauto = false;

        var nsName = src.attr ('data-fns');
        if (nsName)
            __CLASS__.prototype.__NS_name__ = nsName;

        var isTmpl = src.attr ('data-ft');
        if (isTmpl && isTmpl.length > 0) {
            __CLASS__.prototype.parent = parent;
            __CLASS__.prototype.src = src.clone ();
            __CLASS__.prototype.src.removeAttr ('data-ft');
            __CLASS__.prototype.tmpl = true;
            __CLASS_TABLE__[className] = __CLASS__;
            src.remove ();
        } else {
            __CLASS__.prototype.src = src;
            __CLASS__.prototype.tmpl = false;
        }
    }

    var obj;
    if (!__CLASS__.prototype.tmpl) {
        if (fr !== undefined && frArgs !== undefined) {
            obj = new __CLASS__ (parent, eval ('[' + frArgs + ']'));
        } else
            obj = new __CLASS__ (parent);
    }
    return obj;
}

function newObject (className, parent, args) {
    var __CLASS__ = __CLASS_TABLE__[className];
    if (__CLASS__)
        return new __CLASS__ (parent, args);
}

function loadTemplates (tmpls) {
    var start;
    var end;
    for (var x in tmpls) {
        if (x === '0') {
            start = __import (tmpls[x].file);
            end = start;
        } else
            end = end.then (tmpls[x].file);

        end = end.then ((function (tmpl, html) {
            var obj = compile ($(html));

            if (tmpl.name)
                this[tmpl.name] = obj;

            if (tmpl.into)
                $(tmpl.into).append (obj.$);
            else if (tmpl.replace)
                $(tmpl.replace).replaceWith (obj.$);
            else if (tmpl.childrenInto)
                $(tmpl.childrenInto).append (obj.$.find ('> *'));

            if (tmpl.callback)
                tmpl.callback (obj);
        }).bind (null, tmpls[x]));
    }

    start.get ();
}
