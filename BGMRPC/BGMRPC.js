var T_CONNECT    = 0x01;
var T_DISCONNECT = 0x02;
var T_JRMETHOD   = 0x03;
var T_RMETHOD    = 0x04;
var T_FLOW       = 0x05;
var T_END        = 0x06;

function RPC (host,port,path)
{
    this.host = host;
    this.port = port;
    this.path = path;
    this.calling = [];
    this.mID = 0;
    this.ws = undefined;

    this.status = {};

    this.hasConnected = function () {
        if (this.ws === undefined || this.ws.readyState !== 1)
            return false;
        else
            return true;
    };
    this.messageListener = [];
    this.onMessage = function (cb) {
        this.messageListener.push (cb);
    };
    this.removeMessageListener = function (cb) {
        for (var x = this.messageListener.indexOf (cb); x < this.messageListener.length; x++)
            this.messageListener[x] = this.messageListener[x+1];
        this.messageListener.pop ();
    };
    this.reviceData = function (evt) {
        var data = JSON.parse (evt.data);
        if (data.type === "signal") {
            if (this.RPC.status.onMessage)
                this.RPC.status.onMessage (data.object, data.signal, data.args);

            for (var x in this.RPC.messageListener)
                this.RPC.messageListener[x].call (this.RPC, data.object, data.signal, data.args);
            /*if (this.RPC.onMessage)
                this.RPC.onMessage (data.object, data.signal, data.args)*/
        } else if (data.type === "return") {
            var mID = data.mID;
            var calling = this.RPC.calling [mID];
            if (this.RPC.status.onReturn)
                this.RPC.status.onReturn (calling, data.values, mID);
            if (calling.t & 0x08) {
                var next = calling.next;
                if (next && (next.t & 0x07) === T_FLOW)
                    next.call (data.values/*, mID*/);
            } else if (calling.onReturn)
                calling.onReturn ();

            delete this.RPC.calling [mID];
        }
    };
    this.connectToHost = function () {
        if (this.status.onConnecting)
            this.status.onConnecting ();

        var url = "ws://" + this.host + ":" + this.port;
        if (this.path)
            url += this.path;
        this.ws = new WebSocket(url);
        this.ws.RPC = this;
        this.ws.onopen = function () {
            if (this.RPC.status.onConnected)
                this.RPC.status.onConnected ();

            if (this.RPC.onConnected)
                this.RPC.onConnected ();

            var cb;
            while ((cb = this.RPC.onConnected_step.pop ()))
                cb.onConnected.call (cb.step);
        };
        this.ws.onclose = function () {
            if (this.RPC.status.onDisconnected)
                this.RPC.status.onDisconnected ();

            if (this.RPC.onDisconnected)
                this.RPC.onDisconnected ();

            var cb;
            while ((cb = this.RPC.onDisconnected_step.pop ()))
                cb.onDisconnected.call (cb.step);
        };
        this.ws.onerror = function () {
            if (this.RPC.status.onError)
                this.RPC.status.onError ();
            if (this.RPC.onError)
                this.RPC.onError ();
        };
        this.ws.onmessage = this.reviceData;
    };
    this.close = function () {
        if (this.status.onDisconnecting)
            this.status.onDisconnecting ();
        this.ws.close ();
    };
    this.onConnected_step = [];
    this.onDisconnected_step = [];

    this.call = function (call, object, method, args) {
        if (this.ws.readyState !== 1)
            return;

        var mID = object + '_' + method + this.mID;
        this.mID++;
        this.calling [mID] = call;

        var callJson = {};
        callJson.object = object;
        callJson.method = method;
        callJson.args = args;
        callJson.mID = mID;

        this.ws.send (JSON.stringify(callJson));
        //console.log (JSON.stringify(callJson));

        return mID;
    };
}

function Proc (RPC, steps) {
    this.RPC = RPC;
    this.steps = steps;
    this.args = [];
    this.data = {};

    function initialStep (step, proc, next) {
        step.t |= 0x08;
        step.proc = proc;
        if (next)
            step.next = next;

        step.nextStep = function (n) {
            var targetStep = this;
            for (var x = 0; x < n; x++)
                targetStep = targetStep.next;

            return targetStep;
        };
        step.call = function () {
            var mID = -1;
            var RPC = this.proc.RPC;
            switch (this.t & 0x07) {
            case T_CONNECT:
                if (this.c) {
                    if (RPC.hasConnected ()) {
                        if (this.c1)
                            this.c1.call (this);
                        else
                            this.c.call (this);
                    } else {
                        RPC.onConnected_step.push ({step:this, onConnected:this.c});
                        RPC.connectToHost ();
                    }
                }
                break;
            case T_DISCONNECT:
                if (RPC.hasConnected) {
                    if (this.c) {
                        RPC.onDisconnected_step.push ({step:this, onDisconnected:this.c});
                        RPC.close ();
                    }
                }
                break;
            case T_FLOW:
                if (this.proc.RPC.status.onCall)
                    this.proc.RPC.status.onCall ('F', 'none', 'none', arguments, mID);

                    if (this.c) {
                        var args = Array.prototype.slice.call(arguments);
                        args.push (this.proc.data,this.proc.args,this.proc.obj);
                        this.c.apply (this, args/*arguments*/);
                    }
                break;
            case T_JRMETHOD:
                var args = [];

                args[0] = this.m;
                for (var x = 0; x < arguments.length; x++)
                    args[x + 1] = arguments[x];

                mID = this.proc.RPC.call (this, this.o, 'js', args);
                if (this.proc.RPC.status.onCall)
                    this.proc.RPC.status.onCall ('JRM', this.o, args[0], args.slice (1), mID);

                break;
            case T_RMETHOD:
                var args = [];

                for (var x = 0; x < arguments.length; x++)
                    args[x] = arguments[x];

                mID = this.proc.RPC.call (this, this.o, this.m, args);
                if (this.proc.RPC.status.onCall)
                    this.proc.RPC.status.onCall ('RM', this.o, this.m, args, mID);

                break;
            case T_END:
                delete this.proc;
                break;
            }

            return mID;
        };
    }
    for (var x = 0; x < steps.length; x++)
        initialStep (this.steps[x], this, this.steps[x+1]);

    this.stepsSplice = function () {
        var index = arguments [0];
        for (var x = 2; x < arguments.length; x++)
            initialStep (arguments[x], this, arguments[x+1]);

        if (index > 0)
            this.steps[index - 1].next = arguments[2];
        if (this.steps[index])
            arguments[arguments.length - 1].next = this.steps[index];

        this.steps.splice.apply (this.steps, arguments);
    };

    this.call = function () {
        for (var x in arguments)
            this.args [x] = arguments [x];
        this.steps[0].call ();
    };
}

function connectToRPC (RPC, cb1, cb2) {
    var proc = new Proc (RPC, [{ t: T_CONNECT, c: cb1, c1:cb2 }]);

    proc.call ();
}

function RMethod (RPC, obj, method, data, type) {
    if (type === undefined)
        type = T_RMETHOD;

    this.proc = {
        steps: [],
        RPC: RPC,
        obj: obj,
        data: data,
        onReturn: function (cb) {
            this.steps [2] = {
                t: T_FLOW,
                c: cb
            };
            return this;
        },
        exec: function () {
            var proc = new Proc (this.RPC, this.steps);
            proc.data = this.data;
            proc.obj = this.obj;
            proc.call.apply (proc, arguments);
        }
    };

    proc.steps [0] = {
        t: T_FLOW,
        c: function () {
            this.next.call.apply (this.next, this.proc.args);
        }
    };
    proc.steps[1] = { t: type, o: obj, m: method };

    return proc;
}

function JRMethod (RPC, obj, method, data) {
    return RMethod (RPC, obj, method, data, T_JRMETHOD);
}
