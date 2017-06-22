import QtQuick 2.0
import QtWebSockets 1.0

WebSocket {
    property var connectedCallBack
    property var calling: []
    property int mID: 0
    property var signalsCallback: new Object

    function rpcMethod(obj, method, retCB, isJS) {
        var caller = {
            object: obj,
            mID: "#" + mID
        }
        if (isJS) {
            caller.method = "js"
            caller.exec = function () {
                this.args = [method]
                for (var x in arguments)
                    this.args.push(arguments[x])
                console.log (JSON.stringify(this))
                socket.sendTextMessage(JSON.stringify(this))
            }
        } else {
            caller.method = method
            caller.exec = function () {
                if (arguments.length > 0) {
                    this.args = []
                    for (var x in arguments)
                        this.args.push (arguments[x])
                }
                console.log (JSON.stringify(this))
                socket.sendTextMessage(JSON.stringify(this))
            }
        }

        if (retCB)
            calling[caller.mID] = retCB

        mID++

        return caller;
    }
    function rpcJsMethod (obj, method, retCB) {
        return socket.rpcMethod (obj, method, retCB, true)
    }
    function onSignal (obj, sig, cb) {
        var _obj = signalsCallback[obj];
        if (_obj === undefined)
            _obj = signalsCallback[obj] = new Object
        var _sig = _obj[sig]
        if (_sig === undefined)
            _sig = _obj[sig] = new Array

        _sig.push (cb)
    }
    onStatusChanged: {
        if (connectedCallBack)
            connectedCallBack(status)
        else
            console.log("no callback")
    }
    onTextMessageReceived: {
        console.log (message)
        var resp = JSON.parse(message)
        if (resp.type === "return") {
            var retCB = calling[resp.mID]
            if (retCB) {
                if (resp.values.length > 1)
                    retCB (resp.values, resp)
                else
                    retCB (resp.values[0], resp)

                delete calling[resp.mID]
            } else
                console.log ("no retCB", resp.mID)
        } else if (resp.type === "signal"
                   && signalsCallback[resp.object] !== undefined
                   && signalsCallback[resp.object][resp.signal] !== undefined) {
            var cbs = signalsCallback[resp.object][resp.signal];
            for (var x in cbs)
                cbs[x] (resp.args)
        }
    }

    active: false
}
