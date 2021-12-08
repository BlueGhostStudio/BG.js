function RPC(host, port) {
    this.host = host;
    this.port = port;
    this.ws = undefined;

    this.onConnecting = undefined;
    this.onConnected = undefined;
    this.onDisconnecting = undefined;
    this.onDisconnected = undefined;
    this.onError = undefined;
    this.remoteSignalListener = [];
    this.onCalling = undefined;
    this.onReturn = undefined;
    this.onReviceData = (function (evt) {
        var data = JSON.parse(evt.data);
        if (data.type === "signal") {
            if (this.onRemoteSignal)
                this.onRemoteSignal(data.object, data.signal, data.args);

            if (this.remoteSignalListener[data.object] && this.remoteSignalListener[data.object][data.signal]) {
                var remoteSignal
                    = this.remoteSignalListener[data.object][data.signal];
                for (var x in remoteSignal)
                    remoteSignal[x].call(this, data.args);
            }
        } else if (data.type === "return") {
            var mID = data.mID;

            if (this.onReturn)
                this.onReturn(mID);

            if (this.calling[mID]) {
                this.calling[mID].call(this, data.values.length > 1
                    ? data.values : data.values[0]);

                delete this.calling[mID];
            }
        }
    }).bind(this);

    this.state_connecting = function () {
        return this.ws && this.ws.readyState === 0 ? true : false;
    };
    this.state_connected = function () {
        return this.ws && this.ws.readyState === 1 ? true : false;
    };
    this.state_disconnecting = function () {
        return this.ws && this.ws.readyState === 2 ? true : false;
    };
    this.state_disconnected = function () {
        return !this.ws || this.ws.readyState === 3 ? true : false;
    };
    this.connectToHost = function () {
        this.ws = new WebSocket("wss://" + this.host + ":" + this.port);

        if (this.onConnecting)
            this.onConnecting();

        this.ws.onopen = (function () {
            if (this.onConnected)
                this.onConnected();
        }).bind(this);
        this.ws.onclose = (function () {
            if (this.onDisconnected)
                this.onDisconnected();
        }).bind(this);
        this.ws.onerror = (function () {
            if (this.onError)
                this.onError();
        });
        this.ws.onmessage = this.onReviceData;
    };
    this.close = function () {
        if (this.onDisconnecting)
            this.onDisconnecting();
        this.ws.close();
    };

    this.calling = [];
    this.mID = 0;


    this.call = function (obj, method) {
        var args = [];

        for (var i = 2; i < arguments.length; i++)
            args[i - 2] = arguments[i];
        var currentMID = "#" + this.mID;
        this.mID++;

        var request = JSON.stringify({
            object: obj,
            method: method,
            args: args,
            mID: currentMID
        });
        if (this.onCalling)
            this.onCalling(obj, method, args, currentMID);

        this.ws.send(request);

        return {
            onReturn: (function (cb) {
                this.calling[currentMID] = cb;
            }).bind(this)
        };
    };
    this.asyncCall = function () {
        // console.log (this, arguments);
        var args = arguments;
        return new Promise((function (resolve) {
            this.call.apply(this, args).onReturn(function (ret) {
                resolve(ret);
            });
        }).bind(this));
        /*return new Promise (resolve => {
            this.call.apply (this, arguments).onReturn (ret => {
                resolve (ret);
            });
        });*/
    }
    this.remoteSignal = function (obj, sig, cb) {
        if (!this.remoteSignalListener[obj])
            this.remoteSignalListener[obj] = [];

        // if (this.remoteSignalListener[obj]) {
        var _sig = this.remoteSignalListener[obj][sig];
        if (!_sig)
            this.remoteSignalListener[obj][sig] = [];

        this.remoteSignalListener[obj][sig].push(cb);
        // }
        console.log(this.remoteSignalListener);
    };
}

