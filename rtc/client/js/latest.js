! function(e) {
    if ("function" == typeof bootstrap) bootstrap("simplewebrtc", e);
    else if ("object" == typeof exports) module.exports = e();
    else if ("function" == typeof define && define.amd) define(e);
    else if ("undefined" != typeof ses) {
        if (!ses.ok()) return;
        ses.makeSimpleWebRTC = e
    } else "undefined" != typeof window ? window.SimpleWebRTC = e() : global.SimpleWebRTC = e()
}(function() {
    var define, ses, bootstrap, module, exports;
    return function(e, t, n) {
        function o(n, r) {
            if (!t[n]) {
                if (!e[n]) {
                    var a = "function" == typeof require && require;
                    if (!r && a) return a(n, !0);
                    if (i) return i(n, !0);
                    throw new Error("Cannot find module '" + n + "'")
                }
                var s = t[n] = {
                    exports: {}
                };
                e[n][0].call(s.exports, function(t) {
                    var i = e[n][1][t];
                    return o(i ? i : t)
                }, s, s.exports)
            }
            return t[n].exports
        }
        for (var i = "function" == typeof require && require, r = 0; r < n.length; r++) o(n[r]);
        return o
    }({
        1: [
            function(e, t) {
                function n(e) {
                    var t, n, u = this,
                        p = e || {}, l = this.config = {
                            //url: "https://"+document.location.hostname,
							url: "https://galv.world",
                            socketio: {},
                            connection: null,
                            debug: !1,
                            localVideoEl: "",
                            remoteVideosEl: "",
                            enableDataChannels: !0,
                            autoRequestMedia: !1,
                            autoRemoveVideos: !0,
                            adjustPeerVolume: !0,
                            peerVolumeWhenSpeaking: .25,
                            media: {
                                video: !0,
                                audio: !0
                            },
                            receiveMedia: {
                                mandatory: {
                                    OfferToReceiveAudio: !0,
                                    OfferToReceiveVideo: !0
                                }
                            },
                            localVideo: {
                                autoplay: !0,
                                mirror: !0,
                                muted: !0
                            }
                        };
                    this.logger = function() {
                        return e.debug ? e.logger || console : e.logger || s
                    }();
                    for (t in p) this.config[t] = p[t];
                    this.capabilities = r, i.call(this), n = this.connection = null === this.config.connection ? new c(this.config) : this.config.connection, n.on("connect", function() {
                        u.emit("connectionReady", n.getSessionid()), u.sessionReady = !0, u.testReadiness()
                    }), n.on("message", function(e) {
                        var t, n = u.webrtc.getPeers(e.from, e.roomType);
                        "offer" === e.type ? (n.length && n.forEach(function(n) {
                            n.sid == e.sid && (t = n)
                        }), t || (t = u.webrtc.createPeer({
                            id: e.from,
                            sid: e.sid,
                            type: e.roomType,
                            enableDataChannels: u.config.enableDataChannels && "screen" !== e.roomType,
                            sharemyscreen: "screen" === e.roomType && !e.broadcaster,
                            broadcaster: "screen" !== e.roomType || e.broadcaster ? null : u.connection.getSessionid()
                        }), u.emit("createdPeer", t)), t.handleMessage(e)) : n.length && n.forEach(function(t) {
                            e.sid ? t.sid === e.sid && t.handleMessage(e) : t.handleMessage(e)
                        })
                    }), n.on("remove", function(e) {
                        e.id !== u.connection.getSessionid() && u.webrtc.removePeers(e.id, e.type)
                    }), e.logger = this.logger, e.debug = !1, this.webrtc = new o(e), ["mute", "unmute", "pauseVideo", "resumeVideo", "pause", "resume", "sendToAll", "sendDirectlyToAll"].forEach(function(e) {
                        u[e] = u.webrtc[e].bind(u.webrtc)
                    }), this.webrtc.on("*", function() {
                        u.emit.apply(u, arguments)
                    }), l.debug && this.on("*", this.logger.log.bind(this.logger, "SimpleWebRTC event:")), this.webrtc.on("localStream", function() {
                        u.testReadiness()
                    }), this.webrtc.on("message", function(e) {
                        u.connection.emit("message", e)
                    }), this.webrtc.on("peerStreamAdded", this.handlePeerStreamAdded.bind(this)), this.webrtc.on("peerStreamRemoved", this.handlePeerStreamRemoved.bind(this)), this.config.adjustPeerVolume && (this.webrtc.on("speaking", this.setVolumeForAll.bind(this, this.config.peerVolumeWhenSpeaking)), this.webrtc.on("stoppedSpeaking", this.setVolumeForAll.bind(this, 1))), n.on("stunservers", function(e) {
                        u.webrtc.config.peerConnectionConfig.iceServers = e, u.emit("stunservers", e)
                    }), n.on("turnservers", function(e) {
                        u.webrtc.config.peerConnectionConfig.iceServers = u.webrtc.config.peerConnectionConfig.iceServers.concat(e), u.emit("turnservers", e)
                    }), this.webrtc.on("iceFailed", function() {}), this.webrtc.on("connectivityError", function() {}), this.webrtc.on("audioOn", function() {
                        u.webrtc.sendToAll("unmute", {
                            name: "audio"
                        })
                    }), this.webrtc.on("audioOff", function() {
                        u.webrtc.sendToAll("mute", {
                            name: "audio"
                        })
                    }), this.webrtc.on("videoOn", function() {
                        u.webrtc.sendToAll("unmute", {
                            name: "video"
                        })
                    }), this.webrtc.on("videoOff", function() {
                        u.webrtc.sendToAll("mute", {
                            name: "video"
                        })
                    }), this.webrtc.on("localScreen", function(e) {
                        var t = document.createElement("video"),
                            n = u.getRemoteVideoContainer();
                        t.oncontextmenu = function() {
                            return !1
                        }, t.id = "localScreen", a(e, t), n && n.appendChild(t), u.emit("localScreenAdded", t), u.connection.emit("shareScreen"), u.webrtc.peers.forEach(function(e) {
                            var t;
                            "video" === e.type && (t = u.webrtc.createPeer({
                                id: e.id,
                                type: "screen",
                                sharemyscreen: !0,
                                enableDataChannels: !1,
                                receiveMedia: {
                                    mandatory: {
                                        OfferToReceiveAudio: !1,
                                        OfferToReceiveVideo: !1
                                    }
                                },
                                broadcaster: u.connection.getSessionid()
                            }), u.emit("createdPeer", t), t.start())
                        })
                    }), this.webrtc.on("localScreenStopped", function() {
                        u.stopScreenShare()
                    }), this.webrtc.on("channelMessage", function(e, t, n) {
                        "volume" == n.type && u.emit("remoteVolumeChange", e, n.volume)
                    }), this.config.autoRequestMedia && this.startLocalVideo()
                }
                var o = e("webrtc"),
                    i = e("wildemitter"),
                    r = e("webrtcsupport"),
                    a = e("attachmediastream"),
                    s = e("mockconsole"),
                    c = e("./socketioconnection");
                n.prototype = Object.create(i.prototype, {
                    constructor: {
                        value: n
                    }
                }), n.prototype.leaveRoom = function() {
                    this.roomName && (this.connection.emit("leave"), this.webrtc.peers.forEach(function(e) {
                        e.end()
                    }), this.getLocalScreen() && this.stopScreenShare(), this.emit("leftRoom", this.roomName), this.roomName = void 0)
                }, n.prototype.disconnect = function() {
                    this.connection.disconnect(), delete this.connection
                }, n.prototype.handlePeerStreamAdded = function(e) {
                    var t = this,
                        n = this.getRemoteVideoContainer(),
                        o = a(e.stream);
                    e.videoEl = o, o.id = this.getDomId(e), n && n.appendChild(o), this.emit("videoAdded", o, e), window.setTimeout(function() {
                        t.webrtc.isAudioEnabled() || e.send("mute", {
                            name: "audio"
                        }), t.webrtc.isVideoEnabled() || e.send("mute", {
                            name: "video"
                        })
                    }, 250)
                }, n.prototype.handlePeerStreamRemoved = function(e) {
                    var t = this.getRemoteVideoContainer(),
                        n = e.videoEl;
                    this.config.autoRemoveVideos && t && n && t.removeChild(n), n && this.emit("videoRemoved", n, e)
                }, n.prototype.getDomId = function(e) {
                    return [e.id, e.type, e.broadcaster ? "broadcasting" : "incoming"].join("_")
                }, n.prototype.setVolumeForAll = function(e) {
                    this.webrtc.peers.forEach(function(t) {
                        t.videoEl && (t.videoEl.volume = e)
                    })
                }, n.prototype.joinRoom = function(e, t) {
                    var n = this;
                    this.roomName = e, this.connection.emit("join", e, function(o, i) {
                        if (o) n.emit("error", o);
                        else {
                            var r, a, s, c;
                            for (r in i.clients) {
                                a = i.clients[r];
                                for (s in a) a[s] && (c = n.webrtc.createPeer({
                                    id: r,
                                    type: s,
                                    enableDataChannels: n.config.enableDataChannels && "screen" !== s,
                                    receiveMedia: {
                                        mandatory: {
                                            OfferToReceiveAudio: "screen" !== s && n.config.receiveMedia.mandatory.OfferToReceiveAudio,
                                            OfferToReceiveVideo: n.config.receiveMedia.mandatory.OfferToReceiveVideo
                                        }
                                    }
                                }), n.emit("createdPeer", c), c.start())
                            }
                        }
                        t && t(o, i), n.emit("joinedRoom", e)
                    })
                }, n.prototype.getEl = function(e) {
                    return "string" == typeof e ? document.getElementById(e) : e
                }, n.prototype.startLocalVideo = function() {
                    var e = this;
                    this.webrtc.startLocalMedia(this.config.media, function(t, n) {
                        t ? e.emit("localMediaError", t) : a(n, e.getLocalVideoContainer(), e.config.localVideo)
                    })
                }, n.prototype.stopLocalVideo = function() {
                    this.webrtc.stopLocalMedia()
                }, n.prototype.getLocalVideoContainer = function() {
                    var e = this.getEl(this.config.localVideoEl);
                    if (e && "VIDEO" === e.tagName) return e.oncontextmenu = function() {
                        return !1
                    }, e;
                    if (e) {
                        var t = document.createElement("video");
                        return t.oncontextmenu = function() {
                            return !1
                        }, e.appendChild(t), t
                    }
                }, n.prototype.getRemoteVideoContainer = function() {
                    return this.getEl(this.config.remoteVideosEl)
                }, n.prototype.shareScreen = function(e) {
                    this.webrtc.startScreenShare(e)
                }, n.prototype.getLocalScreen = function() {
                    return this.webrtc.localScreen
                }, n.prototype.stopScreenShare = function() {
                    this.connection.emit("unshareScreen");
                    var e = document.getElementById("localScreen"),
                        t = this.getRemoteVideoContainer(),
                        n = this.getLocalScreen();
                    this.config.autoRemoveVideos && t && e && t.removeChild(e), e && this.emit("videoRemoved", e), n && n.stop(), this.webrtc.peers.forEach(function(e) {
                        e.broadcaster && e.end()
                    })
                }, n.prototype.testReadiness = function() {
                    var e = this;
                    this.webrtc.localStream && this.sessionReady && e.emit("readyToCall", e.connection.getSessionid())
                }, n.prototype.createRoom = function(e, t) {
                    2 === arguments.length ? this.connection.emit("create", e, t) : this.connection.emit("create", e)
                }, n.prototype.sendFile = function() {
                    return r.dataChannel ? void 0 : this.emit("error", new Error("DataChannelNotSupported"))
                }, t.exports = n
            }, {
                "./socketioconnection": 2,
                attachmediastream: 6,
                mockconsole: 7,
                webrtc: 4,
                webrtcsupport: 5,
                wildemitter: 3
            }
        ],
        3: [
            function(e, t) {
                function n() {
                    this.callbacks = {}
                }
                t.exports = n, n.prototype.on = function(e) {
                    var t = 3 === arguments.length,
                        n = t ? arguments[1] : void 0,
                        o = t ? arguments[2] : arguments[1];
                    return o._groupName = n, (this.callbacks[e] = this.callbacks[e] || []).push(o), this
                }, n.prototype.once = function(e) {
                    function t() {
                        n.off(e, t), r.apply(this, arguments)
                    }
                    var n = this,
                        o = 3 === arguments.length,
                        i = o ? arguments[1] : void 0,
                        r = o ? arguments[2] : arguments[1];
                    return this.on(e, i, t), this
                }, n.prototype.releaseGroup = function(e) {
                    var t, n, o, i;
                    for (t in this.callbacks)
                        for (i = this.callbacks[t], n = 0, o = i.length; o > n; n++) i[n]._groupName === e && (i.splice(n, 1), n--, o--);
                    return this
                }, n.prototype.off = function(e, t) {
                    var n, o = this.callbacks[e];
                    return o ? 1 === arguments.length ? (delete this.callbacks[e], this) : (n = o.indexOf(t), o.splice(n, 1), this) : this
                }, n.prototype.emit = function(e) {
                    var t, n, o, i = [].slice.call(arguments, 1),
                        r = this.callbacks[e],
                        a = this.getWildcardCallbacks(e);
                    if (r)
                        for (o = r.slice(), t = 0, n = o.length; n > t && o[t]; ++t) o[t].apply(this, i);
                    if (a)
                        for (n = a.length, o = a.slice(), t = 0, n = o.length; n > t && o[t]; ++t) o[t].apply(this, [e].concat(i));
                    return this
                }, n.prototype.getWildcardCallbacks = function(e) {
                    var t, n, o = [];
                    for (t in this.callbacks) n = t.split("*"), ("*" === t || 2 === n.length && e.slice(0, n[0].length) === n[0]) && (o = o.concat(this.callbacks[t]));
                    return o
                }
            }, {}
        ],
        5: [
            function(e, t) {
                var n;
                window.mozRTCPeerConnection || navigator.mozGetUserMedia ? n = "moz" : (window.webkitRTCPeerConnection || navigator.webkitGetUserMedia) && (n = "webkit");
                var o = window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
                    i = window.mozRTCIceCandidate || window.RTCIceCandidate,
                    r = window.mozRTCSessionDescription || window.RTCSessionDescription,
                    a = window.webkitMediaStream || window.MediaStream,
                    s = "https:" === window.location.protocol && (window.navigator.userAgent.match("Chrome") && parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10) >= 26 || window.navigator.userAgent.match("Firefox") && parseInt(window.navigator.userAgent.match(/Firefox\/(.*)/)[1], 10) >= 33),
                    c = window.AudioContext || window.webkitAudioContext,
                    u = document.createElement("video"),
                    p = u && u.canPlayType && "probably" === u.canPlayType('video/webm; codecs="vp8", vorbis'),
                    l = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia;
                t.exports = {
                    prefix: n,
                    support: !! o && p && !! l,
                    supportRTCPeerConnection: !! o,
                    supportVp8: p,
                    supportGetUserMedia: !! l,
                    supportDataChannel: !! (o && o.prototype && o.prototype.createDataChannel),
                    supportWebAudio: !(!c || !c.prototype.createMediaStreamSource),
                    supportMediaStream: !(!a || !a.prototype.removeTrack),
                    supportScreenSharing: !! s,
                    dataChannel: !! (o && o.prototype && o.prototype.createDataChannel),
                    webAudio: !(!c || !c.prototype.createMediaStreamSource),
                    mediaStream: !(!a || !a.prototype.removeTrack),
                    screenSharing: !! s,
                    AudioContext: c,
                    PeerConnection: o,
                    SessionDescription: r,
                    IceCandidate: i,
                    MediaStream: a,
                    getUserMedia: l
                }
            }, {}
        ],
        6: [
            function(e, t) {
                t.exports = function(e, t, n) {
                    var o, i = window.URL,
                        r = {
                            autoplay: !0,
                            mirror: !1,
                            muted: !1
                        }, a = t || document.createElement("video");
                    if (n)
                        for (o in n) r[o] = n[o];
                    if (r.autoplay && (a.autoplay = "autoplay"), r.muted && (a.muted = !0), r.mirror && ["", "moz", "webkit", "o", "ms"].forEach(function(e) {
                        var t = e ? e + "Transform" : "transform";
                        a.style[t] = "scaleX(-1)"
                    }), i && i.createObjectURL) a.src = i.createObjectURL(e);
                    else if (a.srcObject) a.srcObject = e;
                    else {
                        if (!a.mozSrcObject) return !1;
                        a.mozSrcObject = e
                    }
                    return a
                }
            }, {}
        ],
        7: [
            function(e, t) {
                for (var n = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), o = n.length, i = function() {}, r = {}; o--;) r[n[o]] = i;
                t.exports = r
            }, {}
        ],
        2: [
            function(e, t) {
                function n(e) {
                    this.connection = o.connect(e.url, e.socketio)
                }
                var o = e("socket.io-client");
                n.prototype.on = function(e, t) {
                    this.connection.on(e, t)
                }, n.prototype.emit = function() {
                    this.connection.emit.apply(this.connection, arguments)
                }, n.prototype.getSessionid = function() {
                    return this.connection.socket.sessionid
                }, n.prototype.disconnect = function() {
                    return this.connection.disconnect()
                }, t.exports = n
            }, {
                "socket.io-client": 8
            }
        ],
        8: [
            function(require, module, exports) {
                var io = "undefined" == typeof module ? {} : module.exports;
                ! function() {
                    if (function(e, t) {
                        var n = e;
                        n.version = "0.9.16", n.protocol = 1, n.transports = [], n.j = [], n.sockets = {}, n.connect = function(e, o) {
                            var i, r, a = n.util.parseUri(e);
                            t && t.location && (a.protocol = a.protocol || t.location.protocol.slice(0, -1), a.host = a.host || (t.document ? t.document.domain : t.location.hostname), a.port = a.port || t.location.port), i = n.util.uniqueUri(a);
                            var s = {
                                host: a.host,
                                secure: "https" == a.protocol,
                                port: a.port || ("https" == a.protocol ? 443 : 80),
                                query: a.query || ""
                            };
                            return n.util.merge(s, o), (s["force new connection"] || !n.sockets[i]) && (r = new n.Socket(s)), !s["force new connection"] && r && (n.sockets[i] = r), r = r || n.sockets[i], r.of(a.path.length > 1 ? a.path : "")
                        }
                    }("object" == typeof module ? module.exports : this.io = {}, this), function(e, t) {
                        var n = e.util = {}, o = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
                            i = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
                        n.parseUri = function(e) {
                            for (var t = o.exec(e || ""), n = {}, r = 14; r--;) n[i[r]] = t[r] || "";
                            return n
                        }, n.uniqueUri = function(e) {
                            var n = e.protocol,
                                o = e.host,
                                i = e.port;
                            return "document" in t ? (o = o || document.domain, i = i || ("https" == n && "https:" !== document.location.protocol ? 443 : document.location.port)) : (o = o || "localhost", i || "https" != n || (i = 443)), (n || "http") + "://" + o + ":" + (i || 80)
                        }, n.query = function(e, t) {
                            var o = n.chunkQuery(e || ""),
                                i = [];
                            n.merge(o, n.chunkQuery(t || ""));
                            for (var r in o) o.hasOwnProperty(r) && i.push(r + "=" + o[r]);
                            return i.length ? "?" + i.join("&") : ""
                        }, n.chunkQuery = function(e) {
                            for (var t, n = {}, o = e.split("&"), i = 0, r = o.length; r > i; ++i) t = o[i].split("="), t[0] && (n[t[0]] = t[1]);
                            return n
                        };
                        var r = !1;
                        n.load = function(e) {
                            return "document" in t && "complete" === document.readyState || r ? e() : (n.on(t, "load", e, !1), void 0)
                        }, n.on = function(e, t, n, o) {
                            e.attachEvent ? e.attachEvent("on" + t, n) : e.addEventListener && e.addEventListener(t, n, o)
                        }, n.request = function(e) {
                            if (e && "undefined" != typeof XDomainRequest && !n.ua.hasCORS) return new XDomainRequest;
                            if ("undefined" != typeof XMLHttpRequest && (!e || n.ua.hasCORS)) return new XMLHttpRequest;
                            if (!e) try {
                                return new(window[["Active"].concat("Object").join("X")])("Microsoft.XMLHTTP")
                            } catch (t) {}
                            return null
                        }, "undefined" != typeof window && n.load(function() {
                            r = !0
                        }), n.defer = function(e) {
                            return n.ua.webkit && "undefined" == typeof importScripts ? (n.load(function() {
                                setTimeout(e, 100)
                            }), void 0) : e()
                        }, n.merge = function(e, t, o, i) {
                            var r, a = i || [],
                                s = "undefined" == typeof o ? 2 : o;
                            for (r in t) t.hasOwnProperty(r) && n.indexOf(a, r) < 0 && ("object" == typeof e[r] && s ? n.merge(e[r], t[r], s - 1, a) : (e[r] = t[r], a.push(t[r])));
                            return e
                        }, n.mixin = function(e, t) {
                            n.merge(e.prototype, t.prototype)
                        }, n.inherit = function(e, t) {
                            function n() {}
                            n.prototype = t.prototype, e.prototype = new n
                        }, n.isArray = Array.isArray || function(e) {
                            return "[object Array]" === Object.prototype.toString.call(e)
                        }, n.intersect = function(e, t) {
                            for (var o = [], i = e.length > t.length ? e : t, r = e.length > t.length ? t : e, a = 0, s = r.length; s > a; a++)~ n.indexOf(i, r[a]) && o.push(r[a]);
                            return o
                        }, n.indexOf = function(e, t, n) {
                            for (var o = e.length, n = 0 > n ? 0 > n + o ? 0 : n + o : n || 0; o > n && e[n] !== t; n++);
                            return n >= o ? -1 : n
                        }, n.toArray = function(e) {
                            for (var t = [], n = 0, o = e.length; o > n; n++) t.push(e[n]);
                            return t
                        }, n.ua = {}, n.ua.hasCORS = "undefined" != typeof XMLHttpRequest && function() {
                            try {
                                var e = new XMLHttpRequest
                            } catch (t) {
                                return !1
                            }
                            return void 0 != e.withCredentials
                        }(), n.ua.webkit = "undefined" != typeof navigator && /webkit/i.test(navigator.userAgent), n.ua.iDevice = "undefined" != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent)
                    }("undefined" != typeof io ? io : module.exports, this), function(e, t) {
                        function n() {}
                        e.EventEmitter = n, n.prototype.on = function(e, n) {
                            return this.$events || (this.$events = {}), this.$events[e] ? t.util.isArray(this.$events[e]) ? this.$events[e].push(n) : this.$events[e] = [this.$events[e], n] : this.$events[e] = n, this
                        }, n.prototype.addListener = n.prototype.on, n.prototype.once = function(e, t) {
                            function n() {
                                o.removeListener(e, n), t.apply(this, arguments)
                            }
                            var o = this;
                            return n.listener = t, this.on(e, n), this
                        }, n.prototype.removeListener = function(e, n) {
                            if (this.$events && this.$events[e]) {
                                var o = this.$events[e];
                                if (t.util.isArray(o)) {
                                    for (var i = -1, r = 0, a = o.length; a > r; r++)
                                        if (o[r] === n || o[r].listener && o[r].listener === n) {
                                            i = r;
                                            break
                                        }
                                    if (0 > i) return this;
                                    o.splice(i, 1), o.length || delete this.$events[e]
                                } else(o === n || o.listener && o.listener === n) && delete this.$events[e]
                            }
                            return this
                        }, n.prototype.removeAllListeners = function(e) {
                            return void 0 === e ? (this.$events = {}, this) : (this.$events && this.$events[e] && (this.$events[e] = null), this)
                        }, n.prototype.listeners = function(e) {
                            return this.$events || (this.$events = {}), this.$events[e] || (this.$events[e] = []), t.util.isArray(this.$events[e]) || (this.$events[e] = [this.$events[e]]), this.$events[e]
                        }, n.prototype.emit = function(e) {
                            if (!this.$events) return !1;
                            var n = this.$events[e];
                            if (!n) return !1;
                            var o = Array.prototype.slice.call(arguments, 1);
                            if ("function" == typeof n) n.apply(this, o);
                            else {
                                if (!t.util.isArray(n)) return !1;
                                for (var i = n.slice(), r = 0, a = i.length; a > r; r++) i[r].apply(this, o)
                            }
                            return !0
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports), function(exports, nativeJSON) {
                        "use strict";

                        function f(e) {
                            return 10 > e ? "0" + e : e
                        }

                        function date(e) {
                            return isFinite(e.valueOf()) ? e.getUTCFullYear() + "-" + f(e.getUTCMonth() + 1) + "-" + f(e.getUTCDate()) + "T" + f(e.getUTCHours()) + ":" + f(e.getUTCMinutes()) + ":" + f(e.getUTCSeconds()) + "Z" : null
                        }

                        function quote(e) {
                            return escapable.lastIndex = 0, escapable.test(e) ? '"' + e.replace(escapable, function(e) {
                                var t = meta[e];
                                return "string" == typeof t ? t : "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
                            }) + '"' : '"' + e + '"'
                        }

                        function str(e, t) {
                            var n, o, i, r, a, s = gap,
                                c = t[e];
                            switch (c instanceof Date && (c = date(e)), "function" == typeof rep && (c = rep.call(t, e, c)), typeof c) {
                                case "string":
                                    return quote(c);
                                case "number":
                                    return isFinite(c) ? String(c) : "null";
                                case "boolean":
                                case "null":
                                    return String(c);
                                case "object":
                                    if (!c) return "null";
                                    if (gap += indent, a = [], "[object Array]" === Object.prototype.toString.apply(c)) {
                                        for (r = c.length, n = 0; r > n; n += 1) a[n] = str(n, c) || "null";
                                        return i = 0 === a.length ? "[]" : gap ? "[\n" + gap + a.join(",\n" + gap) + "\n" + s + "]" : "[" + a.join(",") + "]", gap = s, i
                                    }
                                    if (rep && "object" == typeof rep)
                                        for (r = rep.length, n = 0; r > n; n += 1) "string" == typeof rep[n] && (o = rep[n], i = str(o, c), i && a.push(quote(o) + (gap ? ": " : ":") + i));
                                    else
                                        for (o in c) Object.prototype.hasOwnProperty.call(c, o) && (i = str(o, c), i && a.push(quote(o) + (gap ? ": " : ":") + i));
                                    return i = 0 === a.length ? "{}" : gap ? "{\n" + gap + a.join(",\n" + gap) + "\n" + s + "}" : "{" + a.join(",") + "}", gap = s, i
                            }
                        }
                        if (nativeJSON && nativeJSON.parse) return exports.JSON = {
                            parse: nativeJSON.parse,
                            stringify: nativeJSON.stringify
                        };
                        var JSON = exports.JSON = {}, cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                            gap, indent, meta = {
                                "\b": "\\b",
                                "	": "\\t",
                                "\n": "\\n",
                                "\f": "\\f",
                                "\r": "\\r",
                                '"': '\\"',
                                "\\": "\\\\"
                            }, rep;
                        JSON.stringify = function(e, t, n) {
                            var o;
                            if (gap = "", indent = "", "number" == typeof n)
                                for (o = 0; n > o; o += 1) indent += " ";
                            else "string" == typeof n && (indent = n); if (rep = t, t && "function" != typeof t && ("object" != typeof t || "number" != typeof t.length)) throw new Error("JSON.stringify");
                            return str("", {
                                "": e
                            })
                        }, JSON.parse = function(text, reviver) {
                            function walk(e, t) {
                                var n, o, i = e[t];
                                if (i && "object" == typeof i)
                                    for (n in i) Object.prototype.hasOwnProperty.call(i, n) && (o = walk(i, n), void 0 !== o ? i[n] = o : delete i[n]);
                                return reviver.call(e, t, i)
                            }
                            var j;
                            if (text = String(text), cx.lastIndex = 0, cx.test(text) && (text = text.replace(cx, function(e) {
                                return "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
                            })), /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({
                                "": j
                            }, "") : j;
                            throw new SyntaxError("JSON.parse")
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof JSON ? JSON : void 0), function(e, t) {
                        var n = e.parser = {}, o = n.packets = ["disconnect", "connect", "heartbeat", "message", "json", "event", "ack", "error", "noop"],
                            i = n.reasons = ["transport not supported", "client not handshaken", "unauthorized"],
                            r = n.advice = ["reconnect"],
                            a = t.JSON,
                            s = t.util.indexOf;
                        n.encodePacket = function(e) {
                            var t = s(o, e.type),
                                n = e.id || "",
                                c = e.endpoint || "",
                                u = e.ack,
                                p = null;
                            switch (e.type) {
                                case "error":
                                    var l = e.reason ? s(i, e.reason) : "",
                                        d = e.advice ? s(r, e.advice) : "";
                                    ("" !== l || "" !== d) && (p = l + ("" !== d ? "+" + d : ""));
                                    break;
                                case "message":
                                    "" !== e.data && (p = e.data);
                                    break;
                                case "event":
                                    var f = {
                                        name: e.name
                                    };
                                    e.args && e.args.length && (f.args = e.args), p = a.stringify(f);
                                    break;
                                case "json":
                                    p = a.stringify(e.data);
                                    break;
                                case "connect":
                                    e.qs && (p = e.qs);
                                    break;
                                case "ack":
                                    p = e.ackId + (e.args && e.args.length ? "+" + a.stringify(e.args) : "")
                            }
                            var h = [t, n + ("data" == u ? "+" : ""), c];
                            return null !== p && void 0 !== p && h.push(p), h.join(":")
                        }, n.encodePayload = function(e) {
                            var t = "";
                            if (1 == e.length) return e[0];
                            for (var n = 0, o = e.length; o > n; n++) {
                                var i = e[n];
                                t += "?" + i.length + "?" + e[n]
                            }
                            return t
                        };
                        var c = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;
                        n.decodePacket = function(e) {
                            var t = e.match(c);
                            if (!t) return {};
                            var n = t[2] || "",
                                e = t[5] || "",
                                s = {
                                    type: o[t[1]],
                                    endpoint: t[4] || ""
                                };
                            switch (n && (s.id = n, s.ack = t[3] ? "data" : !0), s.type) {
                                case "error":
                                    var t = e.split("+");
                                    s.reason = i[t[0]] || "", s.advice = r[t[1]] || "";
                                    break;
                                case "message":
                                    s.data = e || "";
                                    break;
                                case "event":
                                    try {
                                        var u = a.parse(e);
                                        s.name = u.name, s.args = u.args
                                    } catch (p) {}
                                    s.args = s.args || [];
                                    break;
                                case "json":
                                    try {
                                        s.data = a.parse(e)
                                    } catch (p) {}
                                    break;
                                case "connect":
                                    s.qs = e || "";
                                    break;
                                case "ack":
                                    var t = e.match(/^([0-9]+)(\+)?(.*)/);
                                    if (t && (s.ackId = t[1], s.args = [], t[3])) try {
                                        s.args = t[3] ? a.parse(t[3]) : []
                                    } catch (p) {}
                                    break;
                                case "disconnect":
                                case "heartbeat":
                            }
                            return s
                        }, n.decodePayload = function(e) {
                            if ("?" == e.charAt(0)) {
                                for (var t = [], o = 1, i = ""; o < e.length; o++) "?" == e.charAt(o) ? (t.push(n.decodePacket(e.substr(o + 1).substr(0, i))), o += Number(i) + 1, i = "") : i += e.charAt(o);
                                return t
                            }
                            return [n.decodePacket(e)]
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports), function(e, t) {
                        function n(e, t) {
                            this.socket = e, this.sessid = t
                        }
                        e.Transport = n, t.util.mixin(n, t.EventEmitter), n.prototype.heartbeats = function() {
                            return !0
                        }, n.prototype.onData = function(e) {
                            if (this.clearCloseTimeout(), (this.socket.connected || this.socket.connecting || this.socket.reconnecting) && this.setCloseTimeout(), "" !== e) {
                                var n = t.parser.decodePayload(e);
                                if (n && n.length)
                                    for (var o = 0, i = n.length; i > o; o++) this.onPacket(n[o])
                            }
                            return this
                        }, n.prototype.onPacket = function(e) {
                            return this.socket.setHeartbeatTimeout(), "heartbeat" == e.type ? this.onHeartbeat() : ("connect" == e.type && "" == e.endpoint && this.onConnect(), "error" == e.type && "reconnect" == e.advice && (this.isOpen = !1), this.socket.onPacket(e), this)
                        }, n.prototype.setCloseTimeout = function() {
                            if (!this.closeTimeout) {
                                var e = this;
                                this.closeTimeout = setTimeout(function() {
                                    e.onDisconnect()
                                }, this.socket.closeTimeout)
                            }
                        }, n.prototype.onDisconnect = function() {
                            return this.isOpen && this.close(), this.clearTimeouts(), this.socket.onDisconnect(), this
                        }, n.prototype.onConnect = function() {
                            return this.socket.onConnect(), this
                        }, n.prototype.clearCloseTimeout = function() {
                            this.closeTimeout && (clearTimeout(this.closeTimeout), this.closeTimeout = null)
                        }, n.prototype.clearTimeouts = function() {
                            this.clearCloseTimeout(), this.reopenTimeout && clearTimeout(this.reopenTimeout)
                        }, n.prototype.packet = function(e) {
                            this.send(t.parser.encodePacket(e))
                        }, n.prototype.onHeartbeat = function() {
                            this.packet({
                                type: "heartbeat"
                            })
                        }, n.prototype.onOpen = function() {
                            this.isOpen = !0, this.clearCloseTimeout(), this.socket.onOpen()
                        }, n.prototype.onClose = function() {
                            this.isOpen = !1, this.socket.onClose(), this.onDisconnect()
                        }, n.prototype.prepareUrl = function() {
                            var e = this.socket.options;
                            return this.scheme() + "://" + e.host + ":" + e.port + "/" + e.resource + "/" + t.protocol + "/" + this.name + "/" + this.sessid
                        }, n.prototype.ready = function(e, t) {
                            t.call(this)
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports), function(e, t, n) {
                        function o(e) {
                            if (this.options = {
                                port: 80,
                                secure: !1,
                                document: "document" in n ? document : !1,
                                resource: "socket.io",
                                transports: t.transports,
                                "connect timeout": 1e4,
                                "try multiple transports": !0,
                                reconnect: !0,
                                "reconnection delay": 500,
                                "reconnection limit": 1 / 0,
                                "reopen delay": 3e3,
                                "max reconnection attempts": 10,
                                "sync disconnect on unload": !1,
                                "auto connect": !0,
                                "flash policy port": 10843,
                                manualFlush: !1
                            }, t.util.merge(this.options, e), this.connected = !1, this.open = !1, this.connecting = !1, this.reconnecting = !1, this.namespaces = {}, this.buffer = [], this.doBuffer = !1, this.options["sync disconnect on unload"] && (!this.isXDomain() || t.util.ua.hasCORS)) {
                                var o = this;
                                t.util.on(n, "beforeunload", function() {
                                    o.disconnectSync()
                                }, !1)
                            }
                            this.options["auto connect"] && this.connect()
                        }

                        function i() {}
                        e.Socket = o, t.util.mixin(o, t.EventEmitter), o.prototype.of = function(e) {
                            return this.namespaces[e] || (this.namespaces[e] = new t.SocketNamespace(this, e), "" !== e && this.namespaces[e].packet({
                                type: "connect"
                            })), this.namespaces[e]
                        }, o.prototype.publish = function() {
                            this.emit.apply(this, arguments);
                            var e;
                            for (var t in this.namespaces) this.namespaces.hasOwnProperty(t) && (e = this.of(t), e.$emit.apply(e, arguments))
                        }, o.prototype.handshake = function(e) {
                            function n(t) {
                                t instanceof Error ? (o.connecting = !1, o.onError(t.message)) : e.apply(null, t.split(":"))
                            }
                            var o = this,
                                r = this.options,
                                a = ["http" + (r.secure ? "s" : "") + ":/", r.host + ":" + r.port, r.resource, t.protocol, t.util.query(this.options.query, "t=" + +new Date)].join("/");
                            if (this.isXDomain() && !t.util.ua.hasCORS) {
                                var s = document.getElementsByTagName("script")[0],
                                    c = document.createElement("script");
                                c.src = a + "&jsonp=" + t.j.length, s.parentNode.insertBefore(c, s), t.j.push(function(e) {
                                    n(e), c.parentNode.removeChild(c)
                                })
                            } else {
                                var u = t.util.request();
                                u.open("GET", a, !0), this.isXDomain() && (u.withCredentials = !0), u.onreadystatechange = function() {
                                    4 == u.readyState && (u.onreadystatechange = i, 200 == u.status ? n(u.responseText) : 403 == u.status ? o.onError(u.responseText) : (o.connecting = !1, !o.reconnecting && o.onError(u.responseText)))
                                }, u.send(null)
                            }
                        }, o.prototype.getTransport = function(e) {
                            for (var n, o = e || this.transports, i = 0; n = o[i]; i++)
                                if (t.Transport[n] && t.Transport[n].check(this) && (!this.isXDomain() || t.Transport[n].xdomainCheck(this))) return new t.Transport[n](this, this.sessionid);
                            return null
                        }, o.prototype.connect = function(e) {
                            if (this.connecting) return this;
                            var n = this;
                            return n.connecting = !0, this.handshake(function(o, i, r, a) {
                                function s(e) {
                                    return n.transport && n.transport.clearTimeouts(), n.transport = n.getTransport(e), n.transport ? (n.transport.ready(n, function() {
                                        n.connecting = !0, n.publish("connecting", n.transport.name), n.transport.open(), n.options["connect timeout"] && (n.connectTimeoutTimer = setTimeout(function() {
                                            if (!n.connected && (n.connecting = !1, n.options["try multiple transports"])) {
                                                for (var e = n.transports; e.length > 0 && e.splice(0, 1)[0] != n.transport.name;);
                                                e.length ? s(e) : n.publish("connect_failed")
                                            }
                                        }, n.options["connect timeout"]))
                                    }), void 0) : n.publish("connect_failed")
                                }
                                n.sessionid = o, n.closeTimeout = 1e3 * r, n.heartbeatTimeout = 1e3 * i, n.transports || (n.transports = n.origTransports = a ? t.util.intersect(a.split(","), n.options.transports) : n.options.transports), n.setHeartbeatTimeout(), s(n.transports), n.once("connect", function() {
                                    clearTimeout(n.connectTimeoutTimer), e && "function" == typeof e && e()
                                })
                            }), this
                        }, o.prototype.setHeartbeatTimeout = function() {
                            if (clearTimeout(this.heartbeatTimeoutTimer), !this.transport || this.transport.heartbeats()) {
                                var e = this;
                                this.heartbeatTimeoutTimer = setTimeout(function() {
                                    e.transport.onClose()
                                }, this.heartbeatTimeout)
                            }
                        }, o.prototype.packet = function(e) {
                            return this.connected && !this.doBuffer ? this.transport.packet(e) : this.buffer.push(e), this
                        }, o.prototype.setBuffer = function(e) {
                            this.doBuffer = e, !e && this.connected && this.buffer.length && (this.options.manualFlush || this.flushBuffer())
                        }, o.prototype.flushBuffer = function() {
                            this.transport.payload(this.buffer), this.buffer = []
                        }, o.prototype.disconnect = function() {
                            return (this.connected || this.connecting) && (this.open && this.of("").packet({
                                type: "disconnect"
                            }), this.onDisconnect("booted")), this
                        }, o.prototype.disconnectSync = function() {
                            var e = t.util.request(),
                                n = ["http" + (this.options.secure ? "s" : "") + ":/", this.options.host + ":" + this.options.port, this.options.resource, t.protocol, "", this.sessionid].join("/") + "/?disconnect=1";
                            e.open("GET", n, !1), e.send(null), this.onDisconnect("booted")
                        }, o.prototype.isXDomain = function() {
                            var e = n.location.port || ("https:" == n.location.protocol ? 443 : 80);
                            return this.options.host !== n.location.hostname || this.options.port != e
                        }, o.prototype.onConnect = function() {
                            this.connected || (this.connected = !0, this.connecting = !1, this.doBuffer || this.setBuffer(!1), this.emit("connect"))
                        }, o.prototype.onOpen = function() {
                            this.open = !0
                        }, o.prototype.onClose = function() {
                            this.open = !1, clearTimeout(this.heartbeatTimeoutTimer)
                        }, o.prototype.onPacket = function(e) {
                            this.of(e.endpoint).onPacket(e)
                        }, o.prototype.onError = function(e) {
                            e && e.advice && "reconnect" === e.advice && (this.connected || this.connecting) && (this.disconnect(), this.options.reconnect && this.reconnect()), this.publish("error", e && e.reason ? e.reason : e)
                        }, o.prototype.onDisconnect = function(e) {
                            var t = this.connected,
                                n = this.connecting;
                            this.connected = !1, this.connecting = !1, this.open = !1, (t || n) && (this.transport.close(), this.transport.clearTimeouts(), t && (this.publish("disconnect", e), "booted" != e && this.options.reconnect && !this.reconnecting && this.reconnect()))
                        }, o.prototype.reconnect = function() {
                            function e() {
                                if (n.connected) {
                                    for (var e in n.namespaces) n.namespaces.hasOwnProperty(e) && "" !== e && n.namespaces[e].packet({
                                        type: "connect"
                                    });
                                    n.publish("reconnect", n.transport.name, n.reconnectionAttempts)
                                }
                                clearTimeout(n.reconnectionTimer), n.removeListener("connect_failed", t), n.removeListener("connect", t), n.reconnecting = !1, delete n.reconnectionAttempts, delete n.reconnectionDelay, delete n.reconnectionTimer, delete n.redoTransports, n.options["try multiple transports"] = i
                            }

                            function t() {
                                return n.reconnecting ? n.connected ? e() : n.connecting && n.reconnecting ? n.reconnectionTimer = setTimeout(t, 1e3) : (n.reconnectionAttempts++ >= o ? n.redoTransports ? (n.publish("reconnect_failed"), e()) : (n.on("connect_failed", t), n.options["try multiple transports"] = !0, n.transports = n.origTransports, n.transport = n.getTransport(), n.redoTransports = !0, n.connect()) : (n.reconnectionDelay < r && (n.reconnectionDelay *= 2), n.connect(), n.publish("reconnecting", n.reconnectionDelay, n.reconnectionAttempts), n.reconnectionTimer = setTimeout(t, n.reconnectionDelay)), void 0) : void 0
                            }
                            this.reconnecting = !0, this.reconnectionAttempts = 0, this.reconnectionDelay = this.options["reconnection delay"];
                            var n = this,
                                o = this.options["max reconnection attempts"],
                                i = this.options["try multiple transports"],
                                r = this.options["reconnection limit"];
                            this.options["try multiple transports"] = !1, this.reconnectionTimer = setTimeout(t, this.reconnectionDelay), this.on("connect", t)
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports, this), function(e, t) {
                        function n(e, t) {
                            this.socket = e, this.name = t || "", this.flags = {}, this.json = new o(this, "json"), this.ackPackets = 0, this.acks = {}
                        }

                        function o(e, t) {
                            this.namespace = e, this.name = t
                        }
                        e.SocketNamespace = n, t.util.mixin(n, t.EventEmitter), n.prototype.$emit = t.EventEmitter.prototype.emit, n.prototype.of = function() {
                            return this.socket.of.apply(this.socket, arguments)
                        }, n.prototype.packet = function(e) {
                            return e.endpoint = this.name, this.socket.packet(e), this.flags = {}, this
                        }, n.prototype.send = function(e, t) {
                            var n = {
                                type: this.flags.json ? "json" : "message",
                                data: e
                            };
                            return "function" == typeof t && (n.id = ++this.ackPackets, n.ack = !0, this.acks[n.id] = t), this.packet(n)
                        }, n.prototype.emit = function(e) {
                            var t = Array.prototype.slice.call(arguments, 1),
                                n = t[t.length - 1],
                                o = {
                                    type: "event",
                                    name: e
                                };
                            return "function" == typeof n && (o.id = ++this.ackPackets, o.ack = "data", this.acks[o.id] = n, t = t.slice(0, t.length - 1)), o.args = t, this.packet(o)
                        }, n.prototype.disconnect = function() {
                            return "" === this.name ? this.socket.disconnect() : (this.packet({
                                type: "disconnect"
                            }), this.$emit("disconnect")), this
                        }, n.prototype.onPacket = function(e) {
                            function n() {
                                o.packet({
                                    type: "ack",
                                    args: t.util.toArray(arguments),
                                    ackId: e.id
                                })
                            }
                            var o = this;
                            switch (e.type) {
                                case "connect":
                                    this.$emit("connect");
                                    break;
                                case "disconnect":
                                    "" === this.name ? this.socket.onDisconnect(e.reason || "booted") : this.$emit("disconnect", e.reason);
                                    break;
                                case "message":
                                case "json":
                                    var i = ["message", e.data];
                                    "data" == e.ack ? i.push(n) : e.ack && this.packet({
                                        type: "ack",
                                        ackId: e.id
                                    }), this.$emit.apply(this, i);
                                    break;
                                case "event":
                                    var i = [e.name].concat(e.args);
                                    "data" == e.ack && i.push(n), this.$emit.apply(this, i);
                                    break;
                                case "ack":
                                    this.acks[e.ackId] && (this.acks[e.ackId].apply(this, e.args), delete this.acks[e.ackId]);
                                    break;
                                case "error":
                                    e.advice ? this.socket.onError(e) : "unauthorized" == e.reason ? this.$emit("connect_failed", e.reason) : this.$emit("error", e.reason)
                            }
                        }, o.prototype.send = function() {
                            this.namespace.flags[this.name] = !0, this.namespace.send.apply(this.namespace, arguments)
                        }, o.prototype.emit = function() {
                            this.namespace.flags[this.name] = !0, this.namespace.emit.apply(this.namespace, arguments)
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports), function(e, t, n) {
                        function o() {
                            t.Transport.apply(this, arguments)
                        }
                        e.websocket = o, t.util.inherit(o, t.Transport), o.prototype.name = "websocket", o.prototype.open = function() {
                            var e, o = t.util.query(this.socket.options.query),
                                i = this;
                            return e || (e = n.MozWebSocket || n.WebSocket), this.websocket = new e(this.prepareUrl() + o), this.websocket.onopen = function() {
                                i.onOpen(), i.socket.setBuffer(!1)
                            }, this.websocket.onmessage = function(e) {
                                i.onData(e.data)
                            }, this.websocket.onclose = function() {
                                i.onClose(), i.socket.setBuffer(!0)
                            }, this.websocket.onerror = function(e) {
                                i.onError(e)
                            }, this
                        }, o.prototype.send = t.util.ua.iDevice ? function(e) {
                            var t = this;
                            return setTimeout(function() {
                                t.websocket.send(e)
                            }, 0), this
                        } : function(e) {
                            return this.websocket.send(e), this
                        }, o.prototype.payload = function(e) {
                            for (var t = 0, n = e.length; n > t; t++) this.packet(e[t]);
                            return this
                        }, o.prototype.close = function() {
                            return this.websocket.close(), this
                        }, o.prototype.onError = function(e) {
                            this.socket.onError(e)
                        }, o.prototype.scheme = function() {
                            return this.socket.options.secure ? "wss" : "ws"
                        }, o.check = function() {
                            return "WebSocket" in n && !("__addTask" in WebSocket) || "MozWebSocket" in n
                        }, o.xdomainCheck = function() {
                            return !0
                        }, t.transports.push("websocket")
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this), function(e, t) {
                        function n() {
                            t.Transport.websocket.apply(this, arguments)
                        }
                        e.flashsocket = n, t.util.inherit(n, t.Transport.websocket), n.prototype.name = "flashsocket", n.prototype.open = function() {
                            var e = this,
                                n = arguments;
                            return WebSocket.__addTask(function() {
                                t.Transport.websocket.prototype.open.apply(e, n)
                            }), this
                        }, n.prototype.send = function() {
                            var e = this,
                                n = arguments;
                            return WebSocket.__addTask(function() {
                                t.Transport.websocket.prototype.send.apply(e, n)
                            }), this
                        }, n.prototype.close = function() {
                            return WebSocket.__tasks.length = 0, t.Transport.websocket.prototype.close.call(this), this
                        }, n.prototype.ready = function(e, o) {
                            function i() {
                                var t = e.options,
                                    i = t["flash policy port"],
                                    a = ["http" + (t.secure ? "s" : "") + ":/", t.host + ":" + t.port, t.resource, "static/flashsocket", "WebSocketMain" + (e.isXDomain() ? "Insecure" : "") + ".swf"];
                                n.loaded || ("undefined" == typeof WEB_SOCKET_SWF_LOCATION && (WEB_SOCKET_SWF_LOCATION = a.join("/")), 843 !== i && WebSocket.loadFlashPolicyFile("xmlsocket://" + t.host + ":" + i), WebSocket.__initialize(), n.loaded = !0), o.call(r)
                            }
                            var r = this;
                            return document.body ? i() : (t.util.load(i), void 0)
                        }, n.check = function() {
                            return "undefined" != typeof WebSocket && "__initialize" in WebSocket && swfobject ? swfobject.getFlashPlayerVersion().major >= 10 : !1
                        }, n.xdomainCheck = function() {
                            return !0
                        }, "undefined" != typeof window && (WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = !0), t.transports.push("flashsocket")
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports), "undefined" != typeof window) var swfobject = function() {
                        function e() {
                            if (!q) {
                                try {
                                    var e = R.getElementsByTagName("body")[0].appendChild(g("span"));
                                    e.parentNode.removeChild(e)
                                } catch (t) {
                                    return
                                }
                                q = !0;
                                for (var n = W.length, o = 0; n > o; o++) W[o]()
                            }
                        }

                        function t(e) {
                            q ? e() : W[W.length] = e
                        }

                        function n(e) {
                            if (typeof L.addEventListener != x) L.addEventListener("load", e, !1);
                            else if (typeof R.addEventListener != x) R.addEventListener("load", e, !1);
                            else if (typeof L.attachEvent != x) v(L, "onload", e);
                            else if ("function" == typeof L.onload) {
                                var t = L.onload;
                                L.onload = function() {
                                    t(), e()
                                }
                            } else L.onload = e
                        }

                        function o() {
                            F ? i() : r()
                        }

                        function i() {
                            var e = R.getElementsByTagName("body")[0],
                                t = g(j);
                            t.setAttribute("type", I);
                            var n = e.appendChild(t);
                            if (n) {
                                var o = 0;
                                ! function() {
                                    if (typeof n.GetVariable != x) {
                                        var i = n.GetVariable("$version");
                                        i && (i = i.split(" ")[1].split(","), z.pv = [parseInt(i[0], 10), parseInt(i[1], 10), parseInt(i[2], 10)])
                                    } else if (10 > o) return o++, setTimeout(arguments.callee, 10), void 0;
                                    e.removeChild(t), n = null, r()
                                }()
                            } else r()
                        }

                        function r() {
                            var e = B.length;
                            if (e > 0)
                                for (var t = 0; e > t; t++) {
                                    var n = B[t].id,
                                        o = B[t].callbackFn,
                                        i = {
                                            success: !1,
                                            id: n
                                        };
                                    if (z.pv[0] > 0) {
                                        var r = m(n);
                                        if (r)
                                            if (!y(B[t].swfVersion) || z.wk && z.wk < 312)
                                                if (B[t].expressInstall && s()) {
                                                    var p = {};
                                                    p.data = B[t].expressInstall, p.width = r.getAttribute("width") || "0", p.height = r.getAttribute("height") || "0", r.getAttribute("class") && (p.styleclass = r.getAttribute("class")), r.getAttribute("align") && (p.align = r.getAttribute("align"));
                                                    for (var l = {}, d = r.getElementsByTagName("param"), f = d.length, h = 0; f > h; h++) "movie" != d[h].getAttribute("name").toLowerCase() && (l[d[h].getAttribute("name")] = d[h].getAttribute("value"));
                                                    c(p, l, n, o)
                                                } else u(r), o && o(i);
                                                else w(n, !0), o && (i.success = !0, i.ref = a(n), o(i))
                                    } else if (w(n, !0), o) {
                                        var g = a(n);
                                        g && typeof g.SetVariable != x && (i.success = !0, i.ref = g), o(i)
                                    }
                                }
                        }

                        function a(e) {
                            var t = null,
                                n = m(e);
                            if (n && "OBJECT" == n.nodeName)
                                if (typeof n.SetVariable != x) t = n;
                                else {
                                    var o = n.getElementsByTagName(j)[0];
                                    o && (t = o)
                                }
                            return t
                        }

                        function s() {
                            return !U && y("6.0.65") && (z.win || z.mac) && !(z.wk && z.wk < 312)
                        }

                        function c(e, t, n, o) {
                            U = !0, _ = o || null, E = {
                                success: !1,
                                id: n
                            };
                            var i = m(n);
                            if (i) {
                                "OBJECT" == i.nodeName ? (k = p(i), C = null) : (k = i, C = n), e.id = M, (typeof e.width == x || !/%$/.test(e.width) && parseInt(e.width, 10) < 310) && (e.width = "310"), (typeof e.height == x || !/%$/.test(e.height) && parseInt(e.height, 10) < 137) && (e.height = "137"), R.title = R.title.slice(0, 47) + " - Flash Player Installation";
                                var r = z.ie && z.win ? ["Active"].concat("").join("X") : "PlugIn",
                                    a = "MMredirectURL=" + L.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + r + "&MMdoctitle=" + R.title;
                                if (typeof t.flashvars != x ? t.flashvars += "&" + a : t.flashvars = a, z.ie && z.win && 4 != i.readyState) {
                                    var s = g("div");
                                    n += "SWFObjectNew", s.setAttribute("id", n), i.parentNode.insertBefore(s, i), i.style.display = "none",
                                    function() {
                                        4 == i.readyState ? i.parentNode.removeChild(i) : setTimeout(arguments.callee, 10)
                                    }()
                                }
                                l(e, t, n)
                            }
                        }

                        function u(e) {
                            if (z.ie && z.win && 4 != e.readyState) {
                                var t = g("div");
                                e.parentNode.insertBefore(t, e), t.parentNode.replaceChild(p(e), t), e.style.display = "none",
                                function() {
                                    4 == e.readyState ? e.parentNode.removeChild(e) : setTimeout(arguments.callee, 10)
                                }()
                            } else e.parentNode.replaceChild(p(e), e)
                        }

                        function p(e) {
                            var t = g("div");
                            if (z.win && z.ie) t.innerHTML = e.innerHTML;
                            else {
                                var n = e.getElementsByTagName(j)[0];
                                if (n) {
                                    var o = n.childNodes;
                                    if (o)
                                        for (var i = o.length, r = 0; i > r; r++) 1 == o[r].nodeType && "PARAM" == o[r].nodeName || 8 == o[r].nodeType || t.appendChild(o[r].cloneNode(!0))
                                }
                            }
                            return t
                        }

                        function l(e, t, n) {
                            var o, i = m(n);
                            if (z.wk && z.wk < 312) return o;
                            if (i)
                                if (typeof e.id == x && (e.id = n), z.ie && z.win) {
                                    var r = "";
                                    for (var a in e) e[a] != Object.prototype[a] && ("data" == a.toLowerCase() ? t.movie = e[a] : "styleclass" == a.toLowerCase() ? r += ' class="' + e[a] + '"' : "classid" != a.toLowerCase() && (r += " " + a + '="' + e[a] + '"'));
                                    var s = "";
                                    for (var c in t) t[c] != Object.prototype[c] && (s += '<param name="' + c + '" value="' + t[c] + '" />');
                                    i.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + r + ">" + s + "</object>", J[J.length] = e.id, o = m(e.id)
                                } else {
                                    var u = g(j);
                                    u.setAttribute("type", I);
                                    for (var p in e) e[p] != Object.prototype[p] && ("styleclass" == p.toLowerCase() ? u.setAttribute("class", e[p]) : "classid" != p.toLowerCase() && u.setAttribute(p, e[p]));
                                    for (var l in t) t[l] != Object.prototype[l] && "movie" != l.toLowerCase() && d(u, l, t[l]);
                                    i.parentNode.replaceChild(u, i), o = u
                                }
                            return o
                        }

                        function d(e, t, n) {
                            var o = g("param");
                            o.setAttribute("name", t), o.setAttribute("value", n), e.appendChild(o)
                        }

                        function f(e) {
                            var t = m(e);
                            t && "OBJECT" == t.nodeName && (z.ie && z.win ? (t.style.display = "none", function() {
                                4 == t.readyState ? h(e) : setTimeout(arguments.callee, 10)
                            }()) : t.parentNode.removeChild(t))
                        }

                        function h(e) {
                            var t = m(e);
                            if (t) {
                                for (var n in t) "function" == typeof t[n] && (t[n] = null);
                                t.parentNode.removeChild(t)
                            }
                        }

                        function m(e) {
                            var t = null;
                            try {
                                t = R.getElementById(e)
                            } catch (n) {}
                            return t
                        }

                        function g(e) {
                            return R.createElement(e)
                        }

                        function v(e, t, n) {
                            e.attachEvent(t, n), V[V.length] = [e, t, n]
                        }

                        function y(e) {
                            var t = z.pv,
                                n = e.split(".");
                            return n[0] = parseInt(n[0], 10), n[1] = parseInt(n[1], 10) || 0, n[2] = parseInt(n[2], 10) || 0, t[0] > n[0] || t[0] == n[0] && t[1] > n[1] || t[0] == n[0] && t[1] == n[1] && t[2] >= n[2] ? !0 : !1
                        }

                        function b(e, t, n, o) {
                            if (!z.ie || !z.mac) {
                                var i = R.getElementsByTagName("head")[0];
                                if (i) {
                                    var r = n && "string" == typeof n ? n : "screen";
                                    if (o && (T = null, O = null), !T || O != r) {
                                        var a = g("style");
                                        a.setAttribute("type", "text/css"), a.setAttribute("media", r), T = i.appendChild(a), z.ie && z.win && typeof R.styleSheets != x && R.styleSheets.length > 0 && (T = R.styleSheets[R.styleSheets.length - 1]), O = r
                                    }
                                    z.ie && z.win ? T && typeof T.addRule == j && T.addRule(e, t) : T && typeof R.createTextNode != x && T.appendChild(R.createTextNode(e + " {" + t + "}"))
                                }
                            }
                        }

                        function w(e, t) {
                            if ($) {
                                var n = t ? "visible" : "hidden";
                                q && m(e) ? m(e).style.visibility = n : b("#" + e, "visibility:" + n)
                            }
                        }

                        function S(e) {
                            var t = /[\\\"<>\.;]/,
                                n = null != t.exec(e);
                            return n && typeof encodeURIComponent != x ? encodeURIComponent(e) : e
                        }
                        var k, C, _, E, T, O, x = "undefined",
                            j = "object",
                            A = "Shockwave Flash",
                            D = "ShockwaveFlash.ShockwaveFlash",
                            I = "application/x-shockwave-flash",
                            M = "SWFObjectExprInst",
                            N = "onreadystatechange",
                            L = window,
                            R = document,
                            P = navigator,
                            F = !1,
                            W = [o],
                            B = [],
                            J = [],
                            V = [],
                            q = !1,
                            U = !1,
                            $ = !0,
                            z = function() {
                                var e = typeof R.getElementById != x && typeof R.getElementsByTagName != x && typeof R.createElement != x,
                                    t = P.userAgent.toLowerCase(),
                                    n = P.platform.toLowerCase(),
                                    o = n ? /win/.test(n) : /win/.test(t),
                                    i = n ? /mac/.test(n) : /mac/.test(t),
                                    r = /webkit/.test(t) ? parseFloat(t.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : !1,
                                    a = !1,
                                    s = [0, 0, 0],
                                    c = null;
                                if (typeof P.plugins != x && typeof P.plugins[A] == j) c = P.plugins[A].description, !c || typeof P.mimeTypes != x && P.mimeTypes[I] && !P.mimeTypes[I].enabledPlugin || (F = !0, a = !1, c = c.replace(/^.*\s+(\S+\s+\S+$)/, "$1"), s[0] = parseInt(c.replace(/^(.*)\..*$/, "$1"), 10), s[1] = parseInt(c.replace(/^.*\.(.*)\s.*$/, "$1"), 10), s[2] = /[a-zA-Z]/.test(c) ? parseInt(c.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0);
                                else if (typeof L[["Active"].concat("Object").join("X")] != x) try {
                                    var u = new(window[["Active"].concat("Object").join("X")])(D);
                                    u && (c = u.GetVariable("$version"), c && (a = !0, c = c.split(" ")[1].split(","), s = [parseInt(c[0], 10), parseInt(c[1], 10), parseInt(c[2], 10)]))
                                } catch (p) {}
                                return {
                                    w3: e,
                                    pv: s,
                                    wk: r,
                                    ie: a,
                                    win: o,
                                    mac: i
                                }
                            }();
                        return function() {
                            z.w3 && ((typeof R.readyState != x && "complete" == R.readyState || typeof R.readyState == x && (R.getElementsByTagName("body")[0] || R.body)) && e(), q || (typeof R.addEventListener != x && R.addEventListener("DOMContentLoaded", e, !1), z.ie && z.win && (R.attachEvent(N, function() {
                                "complete" == R.readyState && (R.detachEvent(N, arguments.callee), e())
                            }), L == top && function() {
                                if (!q) {
                                    try {
                                        R.documentElement.doScroll("left")
                                    } catch (t) {
                                        return setTimeout(arguments.callee, 0), void 0
                                    }
                                    e()
                                }
                            }()), z.wk && function() {
                                return q ? void 0 : /loaded|complete/.test(R.readyState) ? (e(), void 0) : (setTimeout(arguments.callee, 0), void 0)
                            }(), n(e)))
                        }(),
                        function() {
                            z.ie && z.win && window.attachEvent("onunload", function() {
                                for (var e = V.length, t = 0; e > t; t++) V[t][0].detachEvent(V[t][1], V[t][2]);
                                for (var n = J.length, o = 0; n > o; o++) f(J[o]);
                                for (var i in z) z[i] = null;
                                z = null;
                                for (var r in swfobject) swfobject[r] = null;
                                swfobject = null
                            })
                        }(), {
                            registerObject: function(e, t, n, o) {
                                if (z.w3 && e && t) {
                                    var i = {};
                                    i.id = e, i.swfVersion = t, i.expressInstall = n, i.callbackFn = o, B[B.length] = i, w(e, !1)
                                } else o && o({
                                    success: !1,
                                    id: e
                                })
                            },
                            getObjectById: function(e) {
                                return z.w3 ? a(e) : void 0
                            },
                            embedSWF: function(e, n, o, i, r, a, u, p, d, f) {
                                var h = {
                                    success: !1,
                                    id: n
                                };
                                z.w3 && !(z.wk && z.wk < 312) && e && n && o && i && r ? (w(n, !1), t(function() {
                                    o += "", i += "";
                                    var t = {};
                                    if (d && typeof d === j)
                                        for (var m in d) t[m] = d[m];
                                    t.data = e, t.width = o, t.height = i;
                                    var g = {};
                                    if (p && typeof p === j)
                                        for (var v in p) g[v] = p[v];
                                    if (u && typeof u === j)
                                        for (var b in u) typeof g.flashvars != x ? g.flashvars += "&" + b + "=" + u[b] : g.flashvars = b + "=" + u[b];
                                    if (y(r)) {
                                        var S = l(t, g, n);
                                        t.id == n && w(n, !0), h.success = !0, h.ref = S
                                    } else {
                                        if (a && s()) return t.data = a, c(t, g, n, f), void 0;
                                        w(n, !0)
                                    }
                                    f && f(h)
                                })) : f && f(h)
                            },
                            switchOffAutoHideShow: function() {
                                $ = !1
                            },
                            ua: z,
                            getFlashPlayerVersion: function() {
                                return {
                                    major: z.pv[0],
                                    minor: z.pv[1],
                                    release: z.pv[2]
                                }
                            },
                            hasFlashPlayerVersion: y,
                            createSWF: function(e, t, n) {
                                return z.w3 ? l(e, t, n) : void 0
                            },
                            showExpressInstall: function(e, t, n, o) {
                                z.w3 && s() && c(e, t, n, o)
                            },
                            removeSWF: function(e) {
                                z.w3 && f(e)
                            },
                            createCSS: function(e, t, n, o) {
                                z.w3 && b(e, t, n, o)
                            },
                            addDomLoadEvent: t,
                            addLoadEvent: n,
                            getQueryParamValue: function(e) {
                                var t = R.location.search || R.location.hash;
                                if (t) {
                                    if (/\?/.test(t) && (t = t.split("?")[1]), null == e) return S(t);
                                    for (var n = t.split("&"), o = 0; o < n.length; o++)
                                        if (n[o].substring(0, n[o].indexOf("=")) == e) return S(n[o].substring(n[o].indexOf("=") + 1))
                                }
                                return ""
                            },
                            expressInstallCallback: function() {
                                if (U) {
                                    var e = m(M);
                                    e && k && (e.parentNode.replaceChild(k, e), C && (w(C, !0), z.ie && z.win && (k.style.display = "block")), _ && _(E)), U = !1
                                }
                            }
                        }
                    }();
                    ! function() {
                        if ("undefined" != typeof window && !window.WebSocket) {
                            var e = window.console;
                            if (e && e.log && e.error || (e = {
                                log: function() {},
                                error: function() {}
                            }), !swfobject.hasFlashPlayerVersion("10.0.0")) return e.error("Flash Player >= 10.0.0 is required."), void 0;
                            "file:" == location.protocol && e.error("WARNING: web-socket-js doesn't work in file:///... URL unless you set Flash Security Settings properly. Open the page via Web server i.e. http://..."), WebSocket = function(e, t, n, o, i) {
                                var r = this;
                                r.__id = WebSocket.__nextId++, WebSocket.__instances[r.__id] = r, r.readyState = WebSocket.CONNECTING, r.bufferedAmount = 0, r.__events = {}, t ? "string" == typeof t && (t = [t]) : t = [], setTimeout(function() {
                                    WebSocket.__addTask(function() {
                                        WebSocket.__flash.create(r.__id, e, t, n || null, o || 0, i || null)
                                    })
                                }, 0)
                            }, WebSocket.prototype.send = function(e) {
                                if (this.readyState == WebSocket.CONNECTING) throw "INVALID_STATE_ERR: Web Socket connection has not been established";
                                var t = WebSocket.__flash.send(this.__id, encodeURIComponent(e));
                                return 0 > t ? !0 : (this.bufferedAmount += t, !1)
                            }, WebSocket.prototype.close = function() {
                                this.readyState != WebSocket.CLOSED && this.readyState != WebSocket.CLOSING && (this.readyState = WebSocket.CLOSING, WebSocket.__flash.close(this.__id))
                            }, WebSocket.prototype.addEventListener = function(e, t) {
                                e in this.__events || (this.__events[e] = []), this.__events[e].push(t)
                            }, WebSocket.prototype.removeEventListener = function(e, t) {
                                if (e in this.__events)
                                    for (var n = this.__events[e], o = n.length - 1; o >= 0; --o)
                                        if (n[o] === t) {
                                            n.splice(o, 1);
                                            break
                                        }
                            }, WebSocket.prototype.dispatchEvent = function(e) {
                                for (var t = this.__events[e.type] || [], n = 0; n < t.length; ++n) t[n](e);
                                var o = this["on" + e.type];
                                o && o(e)
                            }, WebSocket.prototype.__handleEvent = function(e) {
                                "readyState" in e && (this.readyState = e.readyState), "protocol" in e && (this.protocol = e.protocol);
                                var t;
                                if ("open" == e.type || "error" == e.type) t = this.__createSimpleEvent(e.type);
                                else if ("close" == e.type) t = this.__createSimpleEvent("close");
                                else {
                                    if ("message" != e.type) throw "unknown event type: " + e.type;
                                    var n = decodeURIComponent(e.message);
                                    t = this.__createMessageEvent("message", n)
                                }
                                this.dispatchEvent(t)
                            }, WebSocket.prototype.__createSimpleEvent = function(e) {
                                if (document.createEvent && window.Event) {
                                    var t = document.createEvent("Event");
                                    return t.initEvent(e, !1, !1), t
                                }
                                return {
                                    type: e,
                                    bubbles: !1,
                                    cancelable: !1
                                }
                            }, WebSocket.prototype.__createMessageEvent = function(e, t) {
                                if (document.createEvent && window.MessageEvent && !window.opera) {
                                    var n = document.createEvent("MessageEvent");
                                    return n.initMessageEvent("message", !1, !1, t, null, null, window, null), n
                                }
                                return {
                                    type: e,
                                    data: t,
                                    bubbles: !1,
                                    cancelable: !1
                                }
                            }, WebSocket.CONNECTING = 0, WebSocket.OPEN = 1, WebSocket.CLOSING = 2, WebSocket.CLOSED = 3, WebSocket.__flash = null, WebSocket.__instances = {}, WebSocket.__tasks = [], WebSocket.__nextId = 0, WebSocket.loadFlashPolicyFile = function(e) {
                                WebSocket.__addTask(function() {
                                    WebSocket.__flash.loadManualPolicyFile(e)
                                })
                            }, WebSocket.__initialize = function() {
                                if (!WebSocket.__flash) {
                                    if (WebSocket.__swfLocation && (window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation), !window.WEB_SOCKET_SWF_LOCATION) return e.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf"), void 0;
                                    var t = document.createElement("div");
                                    t.id = "webSocketContainer", t.style.position = "absolute", WebSocket.__isFlashLite() ? (t.style.left = "0px", t.style.top = "0px") : (t.style.left = "-100px", t.style.top = "-100px");
                                    var n = document.createElement("div");
                                    n.id = "webSocketFlash", t.appendChild(n), document.body.appendChild(t), swfobject.embedSWF(WEB_SOCKET_SWF_LOCATION, "webSocketFlash", "1", "1", "10.0.0", null, null, {
                                        hasPriority: !0,
                                        swliveconnect: !0,
                                        allowScriptAccess: "always"
                                    }, null, function(t) {
                                        t.success || e.error("[WebSocket] swfobject.embedSWF failed")
                                    })
                                }
                            }, WebSocket.__onFlashInitialized = function() {
                                setTimeout(function() {
                                    WebSocket.__flash = document.getElementById("webSocketFlash"), WebSocket.__flash.setCallerUrl(location.href), WebSocket.__flash.setDebug( !! window.WEB_SOCKET_DEBUG);
                                    for (var e = 0; e < WebSocket.__tasks.length; ++e) WebSocket.__tasks[e]();
                                    WebSocket.__tasks = []
                                }, 0)
                            }, WebSocket.__onFlashEvent = function() {
                                return setTimeout(function() {
                                    try {
                                        for (var t = WebSocket.__flash.receiveEvents(), n = 0; n < t.length; ++n) WebSocket.__instances[t[n].webSocketId].__handleEvent(t[n])
                                    } catch (o) {
                                        e.error(o)
                                    }
                                }, 0), !0
                            }, WebSocket.__log = function(t) {
                                e.log(decodeURIComponent(t))
                            }, WebSocket.__error = function(t) {
                                e.error(decodeURIComponent(t))
                            }, WebSocket.__addTask = function(e) {
                                WebSocket.__flash ? e() : WebSocket.__tasks.push(e)
                            }, WebSocket.__isFlashLite = function() {
                                if (!window.navigator || !window.navigator.mimeTypes) return !1;
                                var e = window.navigator.mimeTypes["application/x-shockwave-flash"];
                                return e && e.enabledPlugin && e.enabledPlugin.filename ? e.enabledPlugin.filename.match(/flashlite/i) ? !0 : !1 : !1
                            }, window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION || (window.addEventListener ? window.addEventListener("load", function() {
                                WebSocket.__initialize()
                            }, !1) : window.attachEvent("onload", function() {
                                WebSocket.__initialize()
                            }))
                        }
                    }(),
                    function(e, t, n) {
                        function o(e) {
                            e && (t.Transport.apply(this, arguments), this.sendBuffer = [])
                        }

                        function i() {}
                        e.XHR = o, t.util.inherit(o, t.Transport), o.prototype.open = function() {
                            return this.socket.setBuffer(!1), this.onOpen(), this.get(), this.setCloseTimeout(), this
                        }, o.prototype.payload = function(e) {
                            for (var n = [], o = 0, i = e.length; i > o; o++) n.push(t.parser.encodePacket(e[o]));
                            this.send(t.parser.encodePayload(n))
                        }, o.prototype.send = function(e) {
                            return this.post(e), this
                        }, o.prototype.post = function(e) {
                            function t() {
                                4 == this.readyState && (this.onreadystatechange = i, r.posting = !1, 200 == this.status ? r.socket.setBuffer(!1) : r.onClose())
                            }

                            function o() {
                                this.onload = i, r.socket.setBuffer(!1)
                            }
                            var r = this;
                            this.socket.setBuffer(!0), this.sendXHR = this.request("POST"), n.XDomainRequest && this.sendXHR instanceof XDomainRequest ? this.sendXHR.onload = this.sendXHR.onerror = o : this.sendXHR.onreadystatechange = t, this.sendXHR.send(e)
                        }, o.prototype.close = function() {
                            return this.onClose(), this
                        }, o.prototype.request = function(e) {
                            var n = t.util.request(this.socket.isXDomain()),
                                o = t.util.query(this.socket.options.query, "t=" + +new Date);
                            if (n.open(e || "GET", this.prepareUrl() + o, !0), "POST" == e) try {
                                n.setRequestHeader ? n.setRequestHeader("Content-type", "text/plain;charset=UTF-8") : n.contentType = "text/plain"
                            } catch (i) {}
                            return n
                        }, o.prototype.scheme = function() {
                            return this.socket.options.secure ? "https" : "http"
                        }, o.check = function(e, o) {
                            try {
                                var i = t.util.request(o),
                                    r = n.XDomainRequest && i instanceof XDomainRequest,
                                    a = e && e.options && e.options.secure ? "https:" : "http:",
                                    s = n.location && a != n.location.protocol;
                                if (i && (!r || !s)) return !0
                            } catch (c) {}
                            return !1
                        }, o.xdomainCheck = function(e) {
                            return o.check(e, !0)
                        }
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),
                    function(e, t) {
                        function n() {
                            t.Transport.XHR.apply(this, arguments)
                        }
                        e.htmlfile = n, t.util.inherit(n, t.Transport.XHR), n.prototype.name = "htmlfile", n.prototype.get = function() {
                            this.doc = new(window[["Active"].concat("Object").join("X")])("htmlfile"), this.doc.open(), this.doc.write("<html></html>"), this.doc.close(), this.doc.parentWindow.s = this;
                            var e = this.doc.createElement("div");
                            e.className = "socketio", this.doc.body.appendChild(e), this.iframe = this.doc.createElement("iframe"), e.appendChild(this.iframe);
                            var n = this,
                                o = t.util.query(this.socket.options.query, "t=" + +new Date);
                            this.iframe.src = this.prepareUrl() + o, t.util.on(window, "unload", function() {
                                n.destroy()
                            })
                        }, n.prototype._ = function(e, t) {
                            e = e.replace(/\\\//g, "/"), this.onData(e);
                            try {
                                var n = t.getElementsByTagName("script")[0];
                                n.parentNode.removeChild(n)
                            } catch (o) {}
                        }, n.prototype.destroy = function() {
                            if (this.iframe) {
                                try {
                                    this.iframe.src = "about:blank"
                                } catch (e) {}
                                this.doc = null, this.iframe.parentNode.removeChild(this.iframe), this.iframe = null, CollectGarbage()
                            }
                        }, n.prototype.close = function() {
                            return this.destroy(), t.Transport.XHR.prototype.close.call(this)
                        }, n.check = function(e) {
                            if ("undefined" != typeof window && ["Active"].concat("Object").join("X") in window) try {
                                var n = new(window[["Active"].concat("Object").join("X")])("htmlfile");
                                return n && t.Transport.XHR.check(e)
                            } catch (o) {}
                            return !1
                        }, n.xdomainCheck = function() {
                            return !1
                        }, t.transports.push("htmlfile")
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports),
                    function(e, t, n) {
                        function o() {
                            t.Transport.XHR.apply(this, arguments)
                        }

                        function i() {}
                        e["xhr-polling"] = o, t.util.inherit(o, t.Transport.XHR), t.util.merge(o, t.Transport.XHR), o.prototype.name = "xhr-polling", o.prototype.heartbeats = function() {
                            return !1
                        }, o.prototype.open = function() {
                            var e = this;
                            return t.Transport.XHR.prototype.open.call(e), !1
                        }, o.prototype.get = function() {
                            function e() {
                                4 == this.readyState && (this.onreadystatechange = i, 200 == this.status ? (r.onData(this.responseText), r.get()) : r.onClose())
                            }

                            function t() {
                                this.onload = i, this.onerror = i, r.retryCounter = 1, r.onData(this.responseText), r.get()
                            }

                            function o() {
                                r.retryCounter++, !r.retryCounter || r.retryCounter > 3 ? r.onClose() : r.get()
                            }
                            if (this.isOpen) {
                                var r = this;
                                this.xhr = this.request(), n.XDomainRequest && this.xhr instanceof XDomainRequest ? (this.xhr.onload = t, this.xhr.onerror = o) : this.xhr.onreadystatechange = e, this.xhr.send(null)
                            }
                        }, o.prototype.onClose = function() {
                            if (t.Transport.XHR.prototype.onClose.call(this), this.xhr) {
                                this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = i;
                                try {
                                    this.xhr.abort()
                                } catch (e) {}
                                this.xhr = null
                            }
                        }, o.prototype.ready = function(e, n) {
                            var o = this;
                            t.util.defer(function() {
                                n.call(o)
                            })
                        }, t.transports.push("xhr-polling")
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),
                    function(e, t, n) {
                        function o() {
                            t.Transport["xhr-polling"].apply(this, arguments), this.index = t.j.length;
                            var e = this;
                            t.j.push(function(t) {
                                e._(t)
                            })
                        }
                        var i = n.document && "MozAppearance" in n.document.documentElement.style;
                        e["jsonp-polling"] = o, t.util.inherit(o, t.Transport["xhr-polling"]), o.prototype.name = "jsonp-polling", o.prototype.post = function(e) {
                            function n() {
                                o(), i.socket.setBuffer(!1)
                            }

                            function o() {
                                i.iframe && i.form.removeChild(i.iframe);
                                try {
                                    a = document.createElement('<iframe name="' + i.iframeId + '">')
                                } catch (e) {
                                    a = document.createElement("iframe"), a.name = i.iframeId
                                }
                                a.id = i.iframeId, i.form.appendChild(a), i.iframe = a
                            }
                            var i = this,
                                r = t.util.query(this.socket.options.query, "t=" + +new Date + "&i=" + this.index);
                            if (!this.form) {
                                var a, s = document.createElement("form"),
                                    c = document.createElement("textarea"),
                                    u = this.iframeId = "socketio_iframe_" + this.index;
                                s.className = "socketio", s.style.position = "absolute", s.style.top = "0px", s.style.left = "0px", s.style.display = "none", s.target = u, s.method = "POST", s.setAttribute("accept-charset", "utf-8"), c.name = "d", s.appendChild(c), document.body.appendChild(s), this.form = s, this.area = c
                            }
                            this.form.action = this.prepareUrl() + r, o(), this.area.value = t.JSON.stringify(e);
                            try {
                                this.form.submit()
                            } catch (p) {}
                            this.iframe.attachEvent ? a.onreadystatechange = function() {
                                "complete" == i.iframe.readyState && n()
                            } : this.iframe.onload = n, this.socket.setBuffer(!0)
                        }, o.prototype.get = function() {
                            var e = this,
                                n = document.createElement("script"),
                                o = t.util.query(this.socket.options.query, "t=" + +new Date + "&i=" + this.index);
                            this.script && (this.script.parentNode.removeChild(this.script), this.script = null), n.async = !0, n.src = this.prepareUrl() + o, n.onerror = function() {
                                e.onClose()
                            };
                            var r = document.getElementsByTagName("script")[0];
                            r.parentNode.insertBefore(n, r), this.script = n, i && setTimeout(function() {
                                var e = document.createElement("iframe");
                                document.body.appendChild(e), document.body.removeChild(e)
                            }, 100)
                        }, o.prototype._ = function(e) {
                            return this.onData(e), this.isOpen && this.get(), this
                        }, o.prototype.ready = function(e, n) {
                            var o = this;
                            return i ? (t.util.load(function() {
                                n.call(o)
                            }), void 0) : n.call(this)
                        }, o.check = function() {
                            return "document" in n
                        }, o.xdomainCheck = function() {
                            return !0
                        }, t.transports.push("jsonp-polling")
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this), "function" == typeof define && define.amd && define([], function() {
                        return io
                    })
                }()
            }, {}
        ],
        9: [
            function(e, t, n) {
                function o(e) {
                    return Array.isArray(e) || "object" == typeof e && "[object Array]" === Object.prototype.toString.call(e)
                }

                function i(e) {
                    "object" == typeof e && "[object RegExp]" === Object.prototype.toString.call(e)
                }

                function r(e) {
                    return "object" == typeof e && "[object Date]" === Object.prototype.toString.call(e)
                }
                e("events"), n.isArray = o, n.isDate = function(e) {
                    return "[object Date]" === Object.prototype.toString.call(e)
                }, n.isRegExp = function(e) {
                    return "[object RegExp]" === Object.prototype.toString.call(e)
                }, n.print = function() {}, n.puts = function() {}, n.debug = function() {}, n.inspect = function(e, t, c, u) {
                    function p(e, c) {
                        if (e && "function" == typeof e.inspect && e !== n && (!e.constructor || e.constructor.prototype !== e)) return e.inspect(c);
                        switch (typeof e) {
                            case "undefined":
                                return d("undefined", "undefined");
                            case "string":
                                var u = "'" + JSON.stringify(e).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                                return d(u, "string");
                            case "number":
                                return d("" + e, "number");
                            case "boolean":
                                return d("" + e, "boolean")
                        }
                        if (null === e) return d("null", "null");
                        var f = a(e),
                            h = t ? s(e) : f;
                        if ("function" == typeof e && 0 === h.length) {
                            if (i(e)) return d("" + e, "regexp");
                            var m = e.name ? ": " + e.name : "";
                            return d("[Function" + m + "]", "special")
                        }
                        if (r(e) && 0 === h.length) return d(e.toUTCString(), "date");
                        var g, v, y;
                        if (o(e) ? (v = "Array", y = ["[", "]"]) : (v = "Object", y = ["{", "}"]), "function" == typeof e) {
                            var b = e.name ? ": " + e.name : "";
                            g = i(e) ? " " + e : " [Function" + b + "]"
                        } else g = ""; if (r(e) && (g = " " + e.toUTCString()), 0 === h.length) return y[0] + g + y[1];
                        if (0 > c) return i(e) ? d("" + e, "regexp") : d("[Object]", "special");
                        l.push(e);
                        var w = h.map(function(t) {
                            var n, i;
                            if (e.__lookupGetter__ && (e.__lookupGetter__(t) ? i = e.__lookupSetter__(t) ? d("[Getter/Setter]", "special") : d("[Getter]", "special") : e.__lookupSetter__(t) && (i = d("[Setter]", "special"))), f.indexOf(t) < 0 && (n = "[" + t + "]"), i || (l.indexOf(e[t]) < 0 ? (i = null === c ? p(e[t]) : p(e[t], c - 1), i.indexOf("\n") > -1 && (i = o(e) ? i.split("\n").map(function(e) {
                                return "  " + e
                            }).join("\n").substr(2) : "\n" + i.split("\n").map(function(e) {
                                return "   " + e
                            }).join("\n"))) : i = d("[Circular]", "special")), "undefined" == typeof n) {
                                if ("Array" === v && t.match(/^\d+$/)) return i;
                                n = JSON.stringify("" + t), n.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (n = n.substr(1, n.length - 2), n = d(n, "name")) : (n = n.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), n = d(n, "string"))
                            }
                            return n + ": " + i
                        });
                        l.pop();
                        var S = 0,
                            k = w.reduce(function(e, t) {
                                return S++, t.indexOf("\n") >= 0 && S++, e + t.length + 1
                            }, 0);
                        return w = k > 50 ? y[0] + ("" === g ? "" : g + "\n ") + " " + w.join(",\n  ") + " " + y[1] : y[0] + g + " " + w.join(", ") + " " + y[1]
                    }
                    var l = [],
                        d = function(e, t) {
                            var n = {
                                bold: [1, 22],
                                italic: [3, 23],
                                underline: [4, 24],
                                inverse: [7, 27],
                                white: [37, 39],
                                grey: [90, 39],
                                black: [30, 39],
                                blue: [34, 39],
                                cyan: [36, 39],
                                green: [32, 39],
                                magenta: [35, 39],
                                red: [31, 39],
                                yellow: [33, 39]
                            }, o = {
                                    special: "cyan",
                                    number: "blue",
                                    "boolean": "yellow",
                                    undefined: "grey",
                                    "null": "bold",
                                    string: "green",
                                    date: "magenta",
                                    regexp: "red"
                                }[t];
                            return o ? "[" + n[o][0] + "m" + e + "[" + n[o][1] + "m" : e
                        };
                    return u || (d = function(e) {
                        return e
                    }), p(e, "undefined" == typeof c ? 2 : c)
                }, n.log = function() {}, n.pump = null;
                var a = Object.keys || function(e) {
                        var t = [];
                        for (var n in e) t.push(n);
                        return t
                    }, s = Object.getOwnPropertyNames || function(e) {
                        var t = [];
                        for (var n in e) Object.hasOwnProperty.call(e, n) && t.push(n);
                        return t
                    }, c = Object.create || function(e, t) {
                        var n;
                        if (null === e) n = {
                            __proto__: null
                        };
                        else {
                            if ("object" != typeof e) throw new TypeError("typeof prototype[" + typeof e + "] != 'object'");
                            var o = function() {};
                            o.prototype = e, n = new o, n.__proto__ = e
                        }
                        return "undefined" != typeof t && Object.defineProperties && Object.defineProperties(n, t), n
                    };
                n.inherits = function(e, t) {
                    e.super_ = t, e.prototype = c(t.prototype, {
                        constructor: {
                            value: e,
                            enumerable: !1,
                            writable: !0,
                            configurable: !0
                        }
                    })
                };
                var u = /%[sdj%]/g;
                n.format = function(e) {
                    if ("string" != typeof e) {
                        for (var t = [], o = 0; o < arguments.length; o++) t.push(n.inspect(arguments[o]));
                        return t.join(" ")
                    }
                    for (var o = 1, i = arguments, r = i.length, a = String(e).replace(u, function(e) {
                            if ("%%" === e) return "%";
                            if (o >= r) return e;
                            switch (e) {
                                case "%s":
                                    return String(i[o++]);
                                case "%d":
                                    return Number(i[o++]);
                                case "%j":
                                    return JSON.stringify(i[o++]);
                                default:
                                    return e
                            }
                        }), s = i[o]; r > o; s = i[++o]) a += null === s || "object" != typeof s ? " " + s : " " + n.inspect(s);
                    return a
                }
            }, {
                events: 10
            }
        ],
        4: [
            function(e, t) {
                function n(e) {
                    var t = this,
                        n = e || {};
                    this.config = {
                        debug: !1,
                        peerConnectionConfig: {
                            iceServers: [{
                                url: "stun:stun.l.google.com:19302"
                            }]
                        },
                        peerConnectionConstraints: {
                            optional: [{
                                DtlsSrtpKeyAgreement: !0
                            }]
                        },
                        receiveMedia: {
                            mandatory: {
                                OfferToReceiveAudio: !0,
                                OfferToReceiveVideo: !0
                            }
                        },
                        enableDataChannels: !0
                    };
                    var o;
                    this.screenSharingSupport = i.screenSharing, this.logger = function() {
                        return e.debug ? e.logger || console : e.logger || r
                    }();
                    for (o in n) this.config[o] = n[o];
                    i.support || this.logger.error("Your browser doesn't seem to support WebRTC"), this.peers = [], a.call(this, this.config), this.on("speaking", function() {
                        t.hardMuted || t.peers.forEach(function(e) {
                            if (e.enableDataChannels) {
                                var t = e.getDataChannel("hark");
                                if ("open" != t.readyState) return;
                                t.send(JSON.stringify({
                                    type: "speaking"
                                }))
                            }
                        })
                    }), this.on("stoppedSpeaking", function() {
                        t.hardMuted || t.peers.forEach(function(e) {
                            if (e.enableDataChannels) {
                                var t = e.getDataChannel("hark");
                                if ("open" != t.readyState) return;
                                t.send(JSON.stringify({
                                    type: "stoppedSpeaking"
                                }))
                            }
                        })
                    }), this.on("volumeChange", function(e) {
                        t.hardMuted || t.peers.forEach(function(t) {
                            if (t.enableDataChannels) {
                                var n = t.getDataChannel("hark");
                                if ("open" != n.readyState) return;
                                n.send(JSON.stringify({
                                    type: "volume",
                                    volume: e
                                }))
                            }
                        })
                    }), this.config.debug && this.on("*", function(e, n, o) {
                        var i;
                        i = t.config.logger === r ? console : t.logger, i.log("event:", e, n, o)
                    })
                }
                var o = e("util"),
                    i = e("webrtcsupport");
                e("wildemitter");
                var r = e("mockconsole"),
                    a = e("localmedia"),
                    s = e("./peer");
                o.inherits(n, a), n.prototype.createPeer = function(e) {
                    var t;
                    return e.parent = this, t = new s(e), this.peers.push(t), t
                }, n.prototype.removePeers = function(e, t) {
                    this.getPeers(e, t).forEach(function(e) {
                        e.end()
                    })
                }, n.prototype.getPeers = function(e, t) {
                    return this.peers.filter(function(n) {
                        return !(e && n.id !== e || t && n.type !== t)
                    })
                }, n.prototype.sendToAll = function(e, t) {
                    this.peers.forEach(function(n) {
                        n.send(e, t)
                    })
                }, n.prototype.sendDirectlyToAll = function(e, t, n) {
                    this.peers.forEach(function(o) {
                        o.enableDataChannels && o.sendDirectly(e, t, n)
                    })
                }, t.exports = n
            }, {
                "./peer": 11,
                localmedia: 12,
                mockconsole: 7,
                util: 9,
                webrtcsupport: 5,
                wildemitter: 3
            }
        ],
        13: [
            function(e, t) {
                var n = t.exports = {};
                n.nextTick = function() {
                    var e = "undefined" != typeof window && window.setImmediate,
                        t = "undefined" != typeof window && window.postMessage && window.addEventListener;
                    if (e) return function(e) {
                        return window.setImmediate(e)
                    };
                    if (t) {
                        var n = [];
                        return window.addEventListener("message", function(e) {
                            var t = e.source;
                            if ((t === window || null === t) && "process-tick" === e.data && (e.stopPropagation(), n.length > 0)) {
                                var o = n.shift();
                                o()
                            }
                        }, !0),
                        function(e) {
                            n.push(e), window.postMessage("process-tick", "*")
                        }
                    }
                    return function(e) {
                        setTimeout(e, 0)
                    }
                }(), n.title = "browser", n.browser = !0, n.env = {}, n.argv = [], n.binding = function() {
                    throw new Error("process.binding is not supported")
                }, n.cwd = function() {
                    return "/"
                }, n.chdir = function() {
                    throw new Error("process.chdir is not supported")
                }
            }, {}
        ],
        10: [
            function(e, t, n) {
                function o(e, t) {
                    if (e.indexOf) return e.indexOf(t);
                    for (var n = 0; n < e.length; n++)
                        if (t === e[n]) return n;
                    return -1
                }
                var i = e("__browserify_process");
                i.EventEmitter || (i.EventEmitter = function() {});
                var r = n.EventEmitter = i.EventEmitter,
                    a = "function" == typeof Array.isArray ? Array.isArray : function(e) {
                        return "[object Array]" === Object.prototype.toString.call(e)
                    }, s = 10;
                r.prototype.setMaxListeners = function(e) {
                    this._events || (this._events = {}), this._events.maxListeners = e
                }, r.prototype.emit = function(e) {
                    if ("error" === e && (!this._events || !this._events.error || a(this._events.error) && !this._events.error.length)) throw arguments[1] instanceof Error ? arguments[1] : new Error("Uncaught, unspecified 'error' event.");
                    if (!this._events) return !1;
                    var t = this._events[e];
                    if (!t) return !1;
                    if ("function" == typeof t) {
                        switch (arguments.length) {
                            case 1:
                                t.call(this);
                                break;
                            case 2:
                                t.call(this, arguments[1]);
                                break;
                            case 3:
                                t.call(this, arguments[1], arguments[2]);
                                break;
                            default:
                                var n = Array.prototype.slice.call(arguments, 1);
                                t.apply(this, n)
                        }
                        return !0
                    }
                    if (a(t)) {
                        for (var n = Array.prototype.slice.call(arguments, 1), o = t.slice(), i = 0, r = o.length; r > i; i++) o[i].apply(this, n);
                        return !0
                    }
                    return !1
                }, r.prototype.addListener = function(e, t) {
                    if ("function" != typeof t) throw new Error("addListener only takes instances of Function");
                    if (this._events || (this._events = {}), this.emit("newListener", e, t), this._events[e])
                        if (a(this._events[e])) {
                            if (!this._events[e].warned) {
                                var n;
                                n = void 0 !== this._events.maxListeners ? this._events.maxListeners : s, n && n > 0 && this._events[e].length > n && (this._events[e].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[e].length), console.trace())
                            }
                            this._events[e].push(t)
                        } else this._events[e] = [this._events[e], t];
                        else this._events[e] = t;
                    return this
                }, r.prototype.on = r.prototype.addListener, r.prototype.once = function(e, t) {
                    var n = this;
                    return n.on(e, function o() {
                        n.removeListener(e, o), t.apply(this, arguments)
                    }), this
                }, r.prototype.removeListener = function(e, t) {
                    if ("function" != typeof t) throw new Error("removeListener only takes instances of Function");
                    if (!this._events || !this._events[e]) return this;
                    var n = this._events[e];
                    if (a(n)) {
                        var i = o(n, t);
                        if (0 > i) return this;
                        n.splice(i, 1), 0 == n.length && delete this._events[e]
                    } else this._events[e] === t && delete this._events[e];
                    return this
                }, r.prototype.removeAllListeners = function(e) {
                    return 0 === arguments.length ? (this._events = {}, this) : (e && this._events && this._events[e] && (this._events[e] = null), this)
                }, r.prototype.listeners = function(e) {
                    return this._events || (this._events = {}), this._events[e] || (this._events[e] = []), a(this._events[e]) || (this._events[e] = [this._events[e]]), this._events[e]
                }, r.listenerCount = function(e, t) {
                    var n;
                    return n = e._events && e._events[t] ? "function" == typeof e._events[t] ? 1 : e._events[t].length : 0
                }
            }, {
                __browserify_process: 13
            }
        ],
        11: [
            function(e, t) {
                function n(e) {
                    var t = this;
                    this.id = e.id, this.parent = e.parent, this.type = e.type || "video", this.oneway = e.oneway || !1, this.sharemyscreen = e.sharemyscreen || !1, this.browserPrefix = e.prefix, this.stream = e.stream, this.enableDataChannels = void 0 === e.enableDataChannels ? this.parent.config.enableDataChannels : e.enableDataChannels, this.receiveMedia = e.receiveMedia || this.parent.config.receiveMedia, this.channels = {}, this.sid = e.sid || Date.now().toString(), this.pc = new r(this.parent.config.peerConnectionConfig, this.parent.config.peerConnectionConstraints), this.pc.on("ice", this.onIceCandidate.bind(this)), this.pc.on("offer", function(e) {
                        t.send("offer", e)
                    }), this.pc.on("answer", function(e) {
                        t.send("answer", e)
                    }), this.pc.on("addStream", this.handleRemoteStreamAdded.bind(this)), this.pc.on("addChannel", this.handleDataChannelAdded.bind(this)), this.pc.on("removeStream", this.handleStreamRemoved.bind(this)), this.pc.on("negotiationNeeded", this.emit.bind(this, "negotiationNeeded")), this.pc.on("iceConnectionStateChange", this.emit.bind(this, "iceConnectionStateChange")), this.pc.on("iceConnectionStateChange", function() {
                        switch (t.pc.iceConnectionState) {
                            case "failed":
                                "offer" === t.pc.pc.peerconnection.localDescription.type && (t.parent.emit("iceFailed", t), t.send("connectivityError"))
                        }
                    }), this.pc.on("signalingStateChange", this.emit.bind(this, "signalingStateChange")), this.logger = this.parent.logger, "screen" === e.type ? this.parent.localScreen && this.sharemyscreen && (this.logger.log("adding local screen stream to peer connection"), this.pc.addStream(this.parent.localScreen), this.broadcaster = e.broadcaster) : this.parent.localStreams.forEach(function(e) {
                        t.pc.addStream(e)
                    }), a.call(this), this.on("channelOpen", function(e) {
                        e.protocol === c && (e.onmessage = function(n) {
                            var o = JSON.parse(n.data),
                                i = new s.Receiver;
                            i.receive(o, e), t.emit("fileTransfer", o, i), i.on("receivedFile", function() {
                                i.channel.close()
                            })
                        })
                    }), this.on("*", function() {
                        t.parent.emit.apply(t.parent, arguments)
                    })
                }
                var o = e("util"),
                    i = e("webrtcsupport"),
                    r = e("rtcpeerconnection"),
                    a = e("wildemitter"),
                    s = e("filetransfer"),
                    c = "";
                o.inherits(n, a), n.prototype.handleMessage = function(e) {
                    var t = this;
                    this.logger.log("getting", e.type, e), e.prefix && (this.browserPrefix = e.prefix), "offer" === e.type ? (e.payload.sdp = e.payload.sdp.replace("a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1\r\n", ""), this.pc.handleOffer(e.payload, function(e) {
                        e || t.pc.answer(t.receiveMedia, function() {})
                    })) : "answer" === e.type ? this.pc.handleAnswer(e.payload) : "candidate" === e.type ? this.pc.processIce(e.payload) : "connectivityError" === e.type ? this.parent.emit("connectivityError", t) : "mute" === e.type ? this.parent.emit("mute", {
                        id: e.from,
                        name: e.payload.name
                    }) : "unmute" === e.type && this.parent.emit("unmute", {
                        id: e.from,
                        name: e.payload.name
                    })
                }, n.prototype.send = function(e, t) {
                    var n = {
                        to: this.id,
                        sid: this.sid,
                        broadcaster: this.broadcaster,
                        roomType: this.type,
                        type: e,
                        payload: t,
                        prefix: i.prefix
                    };
                    this.logger.log("sending", e, n), this.parent.emit("message", n)
                }, n.prototype.sendDirectly = function(e, t, n) {
                    var o = {
                        type: t,
                        payload: n
                    };
                    this.logger.log("sending via datachannel", e, t, o);
                    var i = this.getDataChannel(e);
                    return "open" != i.readyState ? !1 : (i.send(JSON.stringify(o)), !0)
                }, n.prototype._observeDataChannel = function(e) {
                    var t = this;
                    e.onclose = this.emit.bind(this, "channelClose", e), e.onerror = this.emit.bind(this, "channelError", e), e.onmessage = function(n) {
                        t.emit("channelMessage", t, e.label, JSON.parse(n.data), e, n)
                    }, e.onopen = this.emit.bind(this, "channelOpen", e)
                }, n.prototype.getDataChannel = function(e, t) {
                    if (!i.supportDataChannel) return this.emit("error", new Error("createDataChannel not supported"));
                    var n = this.channels[e];
                    return t || (t = {}), n ? n : (n = this.channels[e] = this.pc.createDataChannel(e, t), this._observeDataChannel(n), n)
                }, n.prototype.onIceCandidate = function(e) {
                    this.closed || (e ? this.send("candidate", e) : this.logger.log("End of candidates."))
                }, n.prototype.start = function() {
                    this.enableDataChannels && this.getDataChannel("simplewebrtc"), this.pc.offer(this.receiveMedia, function() {})
                }, n.prototype.icerestart = function() {
                    var e = this.receiveMedia;
                    e.mandatory.IceRestart = !0, this.pc.offer(e, function() {})
                }, n.prototype.end = function() {
                    this.closed || (this.pc.close(), this.handleStreamRemoved())
                }, n.prototype.handleRemoteStreamAdded = function(e) {
                    var t = this;
                    this.stream ? this.logger.warn("Already have a remote stream") : (this.stream = e.stream, this.stream.onended = function() {
                        t.end()
                    }, this.parent.emit("peerStreamAdded", this))
                }, n.prototype.handleStreamRemoved = function() {
                    this.parent.peers.splice(this.parent.peers.indexOf(this), 1), this.closed = !0, this.parent.emit("peerStreamRemoved", this)
                }, n.prototype.handleDataChannelAdded = function(e) {
                    this.channels[e.label] = e, this._observeDataChannel(e)
                }, n.prototype.sendFile = function(e) {
                    var t = new s.Sender,
                        n = this.getDataChannel("filetransfer" + (new Date).getTime(), {
                            protocol: c
                        });
                    return n.onopen = function() {
                        n.send(JSON.stringify({
                            size: e.size,
                            name: e.name
                        })), t.send(e, n)
                    }, n.onclose = function() {
                        console.log("sender received transfer"), t.emit("complete")
                    }, t
                }, t.exports = n
            }, {
                filetransfer: 15,
                rtcpeerconnection: 14,
                util: 9,
                webrtcsupport: 5,
                wildemitter: 3
            }
        ],
        16: [
            function(e, t) {
                var n = window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia || window.navigator.msGetUserMedia;
                t.exports = function(e, t) {
                    var o, i = 2 === arguments.length,
                        r = {
                            video: !0,
                            audio: !0
                        }, a = "PermissionDeniedError",
                        s = "ConstraintNotSatisfiedError";
                    if (i || (t = e, e = r), !n) return o = new Error("MediaStreamError"), o.name = "NotSupportedError", window.setTimeout(function() {
                        t(o)
                    }, 0);
                    var c = window.location.protocol;
                    return "http:" !== c && "https:" !== c ? (o = new Error("MediaStreamError"), o.name = "NotSupportedError", window.setTimeout(function() {
                        t(o)
                    }, 0)) : e.audio || e.video ? (localStorage && "true" === localStorage.useFirefoxFakeDevice && (e.fake = !0), n.call(window.navigator, e, function(e) {
                        t(null, e)
                    }, function(e) {
                        var n;
                        "string" == typeof e ? (n = new Error("MediaStreamError"), n.name = e === a ? a : s) : (n = e, n.name || (e.name = n[a] ? a : s)), t(n)
                    }), void 0) : (o = new Error("MediaStreamError"), o.name = "NoMediaRequestedError", window.setTimeout(function() {
                        t(o)
                    }, 0))
                }
            }, {}
        ],
        12: [
            function(e, t) {
                function n(e) {
                    c.call(this);
                    var t, n = this.config = {
                            autoAdjustMic: !1,
                            detectSpeakingEvents: !0,
                            media: {
                                audio: !0,
                                video: !0
                            },
                            logger: p
                        };
                    for (t in e) this.config[t] = e[t];
                    this.logger = n.logger, this._log = this.logger.log.bind(this.logger, "LocalMedia:"), this._logerror = this.logger.error.bind(this.logger, "LocalMedia:"), this.screenSharingSupport = r.screenSharing, this.localStreams = [], this.localScreens = [], r.support || this._logerror("Your browser does not support local media capture.")
                }
                var o = e("util"),
                    i = e("hark"),
                    r = e("webrtcsupport"),
                    a = e("getusermedia"),
                    s = e("getscreenmedia"),
                    c = e("wildemitter"),
                    u = e("mediastream-gain"),
                    p = e("mockconsole");
                o.inherits(n, c), n.prototype.start = function(e, t) {
                    var n = this,
                        o = e || this.config.media;
                    a(o, function(e, i) {
                        return e || (o.audio && n.config.detectSpeakingEvents && n.setupAudioMonitor(i, n.config.harkOptions), n.localStreams.push(i), n.config.autoAdjustMic && (n.gainController = new u(i), n.setMicIfEnabled(.5)), i.onended = function() {}, n.emit("localStream", i)), t ? t(e, i) : void 0
                    })
                }, n.prototype.stop = function(e) {
                    var t = this;
                    if (e) {
                        e.stop(), t.emit("localStreamStopped", e);
                        var n = t.localStreams.indexOf(e);
                        n > -1 && (t.localStreams = t.localStreams.splice(n, 1))
                    } else this.audioMonitor && (this.audioMonitor.stop(), delete this.audioMonitor), this.localStreams.forEach(function(e) {
                        e.stop(), t.emit("localStreamStopped", e)
                    }), this.localStreams = []
                }, n.prototype.startScreenShare = function(e) {
                    var t = this;
                    s(function(n, o) {
                        return n || (t.localScreens.push(o), o.onended = function() {
                            var e = t.localScreens.indexOf(o);
                            e > -1 && t.localScreens.splice(e, 1), t.emit("localScreenStopped", o)
                        }, t.emit("localScreen", o)), e ? e(n, o) : void 0
                    })
                }, n.prototype.stopScreenShare = function(e) {
                    e ? e.stop() : (this.localScreens.forEach(function(e) {
                        e.stop()
                    }), this.localScreens = [])
                }, n.prototype.mute = function() {
                    this._audioEnabled(!1), this.hardMuted = !0, this.emit("audioOff")
                }, n.prototype.unmute = function() {
                    this._audioEnabled(!0), this.hardMuted = !1, this.emit("audioOn")
                }, n.prototype.setupAudioMonitor = function(e, t) {
                    this._log("Setup audio");
                    var n, o = this.audioMonitor = i(e, t),
                        r = this;
                    o.on("speaking", function() {
                        r.emit("speaking"), r.hardMuted || r.setMicIfEnabled(1)
                    }), o.on("stopped_speaking", function() {
                        n && clearTimeout(n), n = setTimeout(function() {
                            r.emit("stoppedSpeaking"), r.hardMuted || r.setMicIfEnabled(.5)
                        }, 1e3)
                    }), o.on("volume_change", function(e, t) {
                        r.emit("volumeChange", e, t)
                    })
                }, n.prototype.setMicIfEnabled = function(e) {
                    this.config.autoAdjustMic && this.gainController.setGain(e)
                }, n.prototype.pauseVideo = function() {
                    this._videoEnabled(!1), this.emit("videoOff")
                }, n.prototype.resumeVideo = function() {
                    this._videoEnabled(!0), this.emit("videoOn")
                }, n.prototype.pause = function() {
                    this.mute(), this.pauseVideo()
                }, n.prototype.resume = function() {
                    this.unmute(), this.resumeVideo()
                }, n.prototype._audioEnabled = function(e) {
                    this.setMicIfEnabled(e ? 1 : 0), this.localStreams.forEach(function(t) {
                        t.getAudioTracks().forEach(function(t) {
                            t.enabled = !! e
                        })
                    })
                }, n.prototype._videoEnabled = function(e) {
                    this.localStreams.forEach(function(t) {
                        t.getVideoTracks().forEach(function(t) {
                            t.enabled = !! e
                        })
                    })
                }, n.prototype.isAudioEnabled = function() {
                    var e = !0;
                    return this.localStreams.forEach(function(t) {
                        t.getAudioTracks().forEach(function(t) {
                            e = e && t.enabled
                        })
                    }), e
                }, n.prototype.isVideoEnabled = function() {
                    var e = !0;
                    return this.localStreams.forEach(function(t) {
                        t.getVideoTracks().forEach(function(t) {
                            e = e && t.enabled
                        })
                    }), e
                }, n.prototype.startLocalMedia = n.prototype.start, n.prototype.stopLocalMedia = n.prototype.stop, Object.defineProperty(n.prototype, "localStream", {
                    get: function() {
                        return this.localStreams.length > 0 ? this.localStreams[0] : null
                    }
                }), Object.defineProperty(n.prototype, "localScreen", {
                    get: function() {
                        return this.localScreens.length > 0 ? this.localScreens[0] : null
                    }
                }), t.exports = n
            }, {
                getscreenmedia: 18,
                getusermedia: 16,
                hark: 17,
                "mediastream-gain": 19,
                mockconsole: 7,
                util: 9,
                webrtcsupport: 5,
                wildemitter: 3
            }
        ],
        20: [
            function(e, t, n) {
                ! function() {
                    function e(e) {
                        function t(t, n, o, i, r, a) {
                            for (; r >= 0 && a > r; r += e) {
                                var s = i ? i[r] : r;
                                o = n(o, t[s], s, t)
                            }
                            return o
                        }
                        return function(n, o, i, r) {
                            o = w(o, r, 4);
                            var a = !E(n) && b.keys(n),
                                s = (a || n).length,
                                c = e > 0 ? 0 : s - 1;
                            return arguments.length < 3 && (i = n[a ? a[c] : c], c += e), t(n, o, i, a, c, s)
                        }
                    }

                    function o(e) {
                        return function(t, n, o) {
                            n = S(n, o);
                            for (var i = null != t && t.length, r = e > 0 ? 0 : i - 1; r >= 0 && i > r; r += e)
                                if (n(t[r], r, t)) return r;
                            return -1
                        }
                    }

                    function i(e, t) {
                        var n = A.length,
                            o = e.constructor,
                            i = b.isFunction(o) && o.prototype || c,
                            r = "constructor";
                        for (b.has(e, r) && !b.contains(t, r) && t.push(r); n--;) r = A[n], r in e && e[r] !== i[r] && !b.contains(t, r) && t.push(r)
                    }
                    var r = this,
                        a = r._,
                        s = Array.prototype,
                        c = Object.prototype,
                        u = Function.prototype,
                        p = s.push,
                        l = s.slice,
                        d = c.toString,
                        f = c.hasOwnProperty,
                        h = Array.isArray,
                        m = Object.keys,
                        g = u.bind,
                        v = Object.create,
                        y = function() {}, b = function(e) {
                            return e instanceof b ? e : this instanceof b ? (this._wrapped = e, void 0) : new b(e)
                        };
                    "undefined" != typeof n ? ("undefined" != typeof t && t.exports && (n = t.exports = b), n._ = b) : r._ = b, b.VERSION = "1.8.2";
                    var w = function(e, t, n) {
                        if (void 0 === t) return e;
                        switch (null == n ? 3 : n) {
                            case 1:
                                return function(n) {
                                    return e.call(t, n)
                                };
                            case 2:
                                return function(n, o) {
                                    return e.call(t, n, o)
                                };
                            case 3:
                                return function(n, o, i) {
                                    return e.call(t, n, o, i)
                                };
                            case 4:
                                return function(n, o, i, r) {
                                    return e.call(t, n, o, i, r)
                                }
                        }
                        return function() {
                            return e.apply(t, arguments)
                        }
                    }, S = function(e, t, n) {
                            return null == e ? b.identity : b.isFunction(e) ? w(e, t, n) : b.isObject(e) ? b.matcher(e) : b.property(e)
                        };
                    b.iteratee = function(e, t) {
                        return S(e, t, 1 / 0)
                    };
                    var k = function(e, t) {
                        return function(n) {
                            var o = arguments.length;
                            if (2 > o || null == n) return n;
                            for (var i = 1; o > i; i++)
                                for (var r = arguments[i], a = e(r), s = a.length, c = 0; s > c; c++) {
                                    var u = a[c];
                                    t && void 0 !== n[u] || (n[u] = r[u])
                                }
                            return n
                        }
                    }, C = function(e) {
                            if (!b.isObject(e)) return {};
                            if (v) return v(e);
                            y.prototype = e;
                            var t = new y;
                            return y.prototype = null, t
                        }, _ = Math.pow(2, 53) - 1,
                        E = function(e) {
                            var t = e && e.length;
                            return "number" == typeof t && t >= 0 && _ >= t
                        };
                    b.each = b.forEach = function(e, t, n) {
                        t = w(t, n);
                        var o, i;
                        if (E(e))
                            for (o = 0, i = e.length; i > o; o++) t(e[o], o, e);
                        else {
                            var r = b.keys(e);
                            for (o = 0, i = r.length; i > o; o++) t(e[r[o]], r[o], e)
                        }
                        return e
                    }, b.map = b.collect = function(e, t, n) {
                        t = S(t, n);
                        for (var o = !E(e) && b.keys(e), i = (o || e).length, r = Array(i), a = 0; i > a; a++) {
                            var s = o ? o[a] : a;
                            r[a] = t(e[s], s, e)
                        }
                        return r
                    }, b.reduce = b.foldl = b.inject = e(1), b.reduceRight = b.foldr = e(-1), b.find = b.detect = function(e, t, n) {
                        var o;
                        return o = E(e) ? b.findIndex(e, t, n) : b.findKey(e, t, n), void 0 !== o && -1 !== o ? e[o] : void 0
                    }, b.filter = b.select = function(e, t, n) {
                        var o = [];
                        return t = S(t, n), b.each(e, function(e, n, i) {
                            t(e, n, i) && o.push(e)
                        }), o
                    }, b.reject = function(e, t, n) {
                        return b.filter(e, b.negate(S(t)), n)
                    }, b.every = b.all = function(e, t, n) {
                        t = S(t, n);
                        for (var o = !E(e) && b.keys(e), i = (o || e).length, r = 0; i > r; r++) {
                            var a = o ? o[r] : r;
                            if (!t(e[a], a, e)) return !1
                        }
                        return !0
                    }, b.some = b.any = function(e, t, n) {
                        t = S(t, n);
                        for (var o = !E(e) && b.keys(e), i = (o || e).length, r = 0; i > r; r++) {
                            var a = o ? o[r] : r;
                            if (t(e[a], a, e)) return !0
                        }
                        return !1
                    }, b.contains = b.includes = b.include = function(e, t, n) {
                        return E(e) || (e = b.values(e)), b.indexOf(e, t, "number" == typeof n && n) >= 0
                    }, b.invoke = function(e, t) {
                        var n = l.call(arguments, 2),
                            o = b.isFunction(t);
                        return b.map(e, function(e) {
                            var i = o ? t : e[t];
                            return null == i ? i : i.apply(e, n)
                        })
                    }, b.pluck = function(e, t) {
                        return b.map(e, b.property(t))
                    }, b.where = function(e, t) {
                        return b.filter(e, b.matcher(t))
                    }, b.findWhere = function(e, t) {
                        return b.find(e, b.matcher(t))
                    }, b.max = function(e, t, n) {
                        var o, i, r = -1 / 0,
                            a = -1 / 0;
                        if (null == t && null != e) {
                            e = E(e) ? e : b.values(e);
                            for (var s = 0, c = e.length; c > s; s++) o = e[s], o > r && (r = o)
                        } else t = S(t, n), b.each(e, function(e, n, o) {
                            i = t(e, n, o), (i > a || i === -1 / 0 && r === -1 / 0) && (r = e, a = i)
                        });
                        return r
                    }, b.min = function(e, t, n) {
                        var o, i, r = 1 / 0,
                            a = 1 / 0;
                        if (null == t && null != e) {
                            e = E(e) ? e : b.values(e);
                            for (var s = 0, c = e.length; c > s; s++) o = e[s], r > o && (r = o)
                        } else t = S(t, n), b.each(e, function(e, n, o) {
                            i = t(e, n, o), (a > i || 1 / 0 === i && 1 / 0 === r) && (r = e, a = i)
                        });
                        return r
                    }, b.shuffle = function(e) {
                        for (var t, n = E(e) ? e : b.values(e), o = n.length, i = Array(o), r = 0; o > r; r++) t = b.random(0, r), t !== r && (i[r] = i[t]), i[t] = n[r];
                        return i
                    }, b.sample = function(e, t, n) {
                        return null == t || n ? (E(e) || (e = b.values(e)), e[b.random(e.length - 1)]) : b.shuffle(e).slice(0, Math.max(0, t))
                    }, b.sortBy = function(e, t, n) {
                        return t = S(t, n), b.pluck(b.map(e, function(e, n, o) {
                            return {
                                value: e,
                                index: n,
                                criteria: t(e, n, o)
                            }
                        }).sort(function(e, t) {
                            var n = e.criteria,
                                o = t.criteria;
                            if (n !== o) {
                                if (n > o || void 0 === n) return 1;
                                if (o > n || void 0 === o) return -1
                            }
                            return e.index - t.index
                        }), "value")
                    };
                    var T = function(e) {
                        return function(t, n, o) {
                            var i = {};
                            return n = S(n, o), b.each(t, function(o, r) {
                                var a = n(o, r, t);
                                e(i, o, a)
                            }), i
                        }
                    };
                    b.groupBy = T(function(e, t, n) {
                        b.has(e, n) ? e[n].push(t) : e[n] = [t]
                    }), b.indexBy = T(function(e, t, n) {
                        e[n] = t
                    }), b.countBy = T(function(e, t, n) {
                        b.has(e, n) ? e[n]++ : e[n] = 1
                    }), b.toArray = function(e) {
                        return e ? b.isArray(e) ? l.call(e) : E(e) ? b.map(e, b.identity) : b.values(e) : []
                    }, b.size = function(e) {
                        return null == e ? 0 : E(e) ? e.length : b.keys(e).length
                    }, b.partition = function(e, t, n) {
                        t = S(t, n);
                        var o = [],
                            i = [];
                        return b.each(e, function(e, n, r) {
                            (t(e, n, r) ? o : i).push(e)
                        }), [o, i]
                    }, b.first = b.head = b.take = function(e, t, n) {
                        return null == e ? void 0 : null == t || n ? e[0] : b.initial(e, e.length - t)
                    }, b.initial = function(e, t, n) {
                        return l.call(e, 0, Math.max(0, e.length - (null == t || n ? 1 : t)))
                    }, b.last = function(e, t, n) {
                        return null == e ? void 0 : null == t || n ? e[e.length - 1] : b.rest(e, Math.max(0, e.length - t))
                    }, b.rest = b.tail = b.drop = function(e, t, n) {
                        return l.call(e, null == t || n ? 1 : t)
                    }, b.compact = function(e) {
                        return b.filter(e, b.identity)
                    };
                    var O = function(e, t, n, o) {
                        for (var i = [], r = 0, a = o || 0, s = e && e.length; s > a; a++) {
                            var c = e[a];
                            if (E(c) && (b.isArray(c) || b.isArguments(c))) {
                                t || (c = O(c, t, n));
                                var u = 0,
                                    p = c.length;
                                for (i.length += p; p > u;) i[r++] = c[u++]
                            } else n || (i[r++] = c)
                        }
                        return i
                    };
                    b.flatten = function(e, t) {
                        return O(e, t, !1)
                    }, b.without = function(e) {
                        return b.difference(e, l.call(arguments, 1))
                    }, b.uniq = b.unique = function(e, t, n, o) {
                        if (null == e) return [];
                        b.isBoolean(t) || (o = n, n = t, t = !1), null != n && (n = S(n, o));
                        for (var i = [], r = [], a = 0, s = e.length; s > a; a++) {
                            var c = e[a],
                                u = n ? n(c, a, e) : c;
                            t ? (a && r === u || i.push(c), r = u) : n ? b.contains(r, u) || (r.push(u), i.push(c)) : b.contains(i, c) || i.push(c)
                        }
                        return i
                    }, b.union = function() {
                        return b.uniq(O(arguments, !0, !0))
                    }, b.intersection = function(e) {
                        if (null == e) return [];
                        for (var t = [], n = arguments.length, o = 0, i = e.length; i > o; o++) {
                            var r = e[o];
                            if (!b.contains(t, r)) {
                                for (var a = 1; n > a && b.contains(arguments[a], r); a++);
                                a === n && t.push(r)
                            }
                        }
                        return t
                    }, b.difference = function(e) {
                        var t = O(arguments, !0, !0, 1);
                        return b.filter(e, function(e) {
                            return !b.contains(t, e)
                        })
                    }, b.zip = function() {
                        return b.unzip(arguments)
                    }, b.unzip = function(e) {
                        for (var t = e && b.max(e, "length").length || 0, n = Array(t), o = 0; t > o; o++) n[o] = b.pluck(e, o);
                        return n
                    }, b.object = function(e, t) {
                        for (var n = {}, o = 0, i = e && e.length; i > o; o++) t ? n[e[o]] = t[o] : n[e[o][0]] = e[o][1];
                        return n
                    }, b.indexOf = function(e, t, n) {
                        var o = 0,
                            i = e && e.length;
                        if ("number" == typeof n) o = 0 > n ? Math.max(0, i + n) : n;
                        else if (n && i) return o = b.sortedIndex(e, t), e[o] === t ? o : -1;
                        if (t !== t) return b.findIndex(l.call(e, o), b.isNaN);
                        for (; i > o; o++)
                            if (e[o] === t) return o;
                        return -1
                    }, b.lastIndexOf = function(e, t, n) {
                        var o = e ? e.length : 0;
                        if ("number" == typeof n && (o = 0 > n ? o + n + 1 : Math.min(o, n + 1)), t !== t) return b.findLastIndex(l.call(e, 0, o), b.isNaN);
                        for (; --o >= 0;)
                            if (e[o] === t) return o;
                        return -1
                    }, b.findIndex = o(1), b.findLastIndex = o(-1), b.sortedIndex = function(e, t, n, o) {
                        n = S(n, o, 1);
                        for (var i = n(t), r = 0, a = e.length; a > r;) {
                            var s = Math.floor((r + a) / 2);
                            n(e[s]) < i ? r = s + 1 : a = s
                        }
                        return r
                    }, b.range = function(e, t, n) {
                        arguments.length <= 1 && (t = e || 0, e = 0), n = n || 1;
                        for (var o = Math.max(Math.ceil((t - e) / n), 0), i = Array(o), r = 0; o > r; r++, e += n) i[r] = e;
                        return i
                    };
                    var x = function(e, t, n, o, i) {
                        if (!(o instanceof t)) return e.apply(n, i);
                        var r = C(e.prototype),
                            a = e.apply(r, i);
                        return b.isObject(a) ? a : r
                    };
                    b.bind = function(e, t) {
                        if (g && e.bind === g) return g.apply(e, l.call(arguments, 1));
                        if (!b.isFunction(e)) throw new TypeError("Bind must be called on a function");
                        var n = l.call(arguments, 2),
                            o = function() {
                                return x(e, o, t, this, n.concat(l.call(arguments)))
                            };
                        return o
                    }, b.partial = function(e) {
                        var t = l.call(arguments, 1),
                            n = function() {
                                for (var o = 0, i = t.length, r = Array(i), a = 0; i > a; a++) r[a] = t[a] === b ? arguments[o++] : t[a];
                                for (; o < arguments.length;) r.push(arguments[o++]);
                                return x(e, n, this, this, r)
                            };
                        return n
                    }, b.bindAll = function(e) {
                        var t, n, o = arguments.length;
                        if (1 >= o) throw new Error("bindAll must be passed function names");
                        for (t = 1; o > t; t++) n = arguments[t], e[n] = b.bind(e[n], e);
                        return e
                    }, b.memoize = function(e, t) {
                        var n = function(o) {
                            var i = n.cache,
                                r = "" + (t ? t.apply(this, arguments) : o);
                            return b.has(i, r) || (i[r] = e.apply(this, arguments)), i[r]
                        };
                        return n.cache = {}, n
                    }, b.delay = function(e, t) {
                        var n = l.call(arguments, 2);
                        return setTimeout(function() {
                            return e.apply(null, n)
                        }, t)
                    }, b.defer = b.partial(b.delay, b, 1), b.throttle = function(e, t, n) {
                        var o, i, r, a = null,
                            s = 0;
                        n || (n = {});
                        var c = function() {
                            s = n.leading === !1 ? 0 : b.now(), a = null, r = e.apply(o, i), a || (o = i = null)
                        };
                        return function() {
                            var u = b.now();
                            s || n.leading !== !1 || (s = u);
                            var p = t - (u - s);
                            return o = this, i = arguments, 0 >= p || p > t ? (a && (clearTimeout(a), a = null), s = u, r = e.apply(o, i), a || (o = i = null)) : a || n.trailing === !1 || (a = setTimeout(c, p)), r
                        }
                    }, b.debounce = function(e, t, n) {
                        var o, i, r, a, s, c = function() {
                                var u = b.now() - a;
                                t > u && u >= 0 ? o = setTimeout(c, t - u) : (o = null, n || (s = e.apply(r, i), o || (r = i = null)))
                            };
                        return function() {
                            r = this, i = arguments, a = b.now();
                            var u = n && !o;
                            return o || (o = setTimeout(c, t)), u && (s = e.apply(r, i), r = i = null), s
                        }
                    }, b.wrap = function(e, t) {
                        return b.partial(t, e)
                    }, b.negate = function(e) {
                        return function() {
                            return !e.apply(this, arguments)
                        }
                    }, b.compose = function() {
                        var e = arguments,
                            t = e.length - 1;
                        return function() {
                            for (var n = t, o = e[t].apply(this, arguments); n--;) o = e[n].call(this, o);
                            return o
                        }
                    }, b.after = function(e, t) {
                        return function() {
                            return --e < 1 ? t.apply(this, arguments) : void 0
                        }
                    }, b.before = function(e, t) {
                        var n;
                        return function() {
                            return --e > 0 && (n = t.apply(this, arguments)), 1 >= e && (t = null), n
                        }
                    }, b.once = b.partial(b.before, 2);
                    var j = !{
                        toString: null
                    }.propertyIsEnumerable("toString"),
                        A = ["valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
                    b.keys = function(e) {
                        if (!b.isObject(e)) return [];
                        if (m) return m(e);
                        var t = [];
                        for (var n in e) b.has(e, n) && t.push(n);
                        return j && i(e, t), t
                    }, b.allKeys = function(e) {
                        if (!b.isObject(e)) return [];
                        var t = [];
                        for (var n in e) t.push(n);
                        return j && i(e, t), t
                    }, b.values = function(e) {
                        for (var t = b.keys(e), n = t.length, o = Array(n), i = 0; n > i; i++) o[i] = e[t[i]];
                        return o
                    }, b.mapObject = function(e, t, n) {
                        t = S(t, n);
                        for (var o, i = b.keys(e), r = i.length, a = {}, s = 0; r > s; s++) o = i[s], a[o] = t(e[o], o, e);
                        return a
                    }, b.pairs = function(e) {
                        for (var t = b.keys(e), n = t.length, o = Array(n), i = 0; n > i; i++) o[i] = [t[i], e[t[i]]];
                        return o
                    }, b.invert = function(e) {
                        for (var t = {}, n = b.keys(e), o = 0, i = n.length; i > o; o++) t[e[n[o]]] = n[o];
                        return t
                    }, b.functions = b.methods = function(e) {
                        var t = [];
                        for (var n in e) b.isFunction(e[n]) && t.push(n);
                        return t.sort()
                    }, b.extend = k(b.allKeys), b.extendOwn = b.assign = k(b.keys), b.findKey = function(e, t, n) {
                        t = S(t, n);
                        for (var o, i = b.keys(e), r = 0, a = i.length; a > r; r++)
                            if (o = i[r], t(e[o], o, e)) return o
                    }, b.pick = function(e, t, n) {
                        var o, i, r = {}, a = e;
                        if (null == a) return r;
                        b.isFunction(t) ? (i = b.allKeys(a), o = w(t, n)) : (i = O(arguments, !1, !1, 1), o = function(e, t, n) {
                            return t in n
                        }, a = Object(a));
                        for (var s = 0, c = i.length; c > s; s++) {
                            var u = i[s],
                                p = a[u];
                            o(p, u, a) && (r[u] = p)
                        }
                        return r
                    }, b.omit = function(e, t, n) {
                        if (b.isFunction(t)) t = b.negate(t);
                        else {
                            var o = b.map(O(arguments, !1, !1, 1), String);
                            t = function(e, t) {
                                return !b.contains(o, t)
                            }
                        }
                        return b.pick(e, t, n)
                    }, b.defaults = k(b.allKeys, !0), b.clone = function(e) {
                        return b.isObject(e) ? b.isArray(e) ? e.slice() : b.extend({}, e) : e
                    }, b.tap = function(e, t) {
                        return t(e), e
                    }, b.isMatch = function(e, t) {
                        var n = b.keys(t),
                            o = n.length;
                        if (null == e) return !o;
                        for (var i = Object(e), r = 0; o > r; r++) {
                            var a = n[r];
                            if (t[a] !== i[a] || !(a in i)) return !1
                        }
                        return !0
                    };
                    var D = function(e, t, n, o) {
                        if (e === t) return 0 !== e || 1 / e === 1 / t;
                        if (null == e || null == t) return e === t;
                        e instanceof b && (e = e._wrapped), t instanceof b && (t = t._wrapped);
                        var i = d.call(e);
                        if (i !== d.call(t)) return !1;
                        switch (i) {
                            case "[object RegExp]":
                            case "[object String]":
                                return "" + e == "" + t;
                            case "[object Number]":
                                return +e !== +e ? +t !== +t : 0 === +e ? 1 / +e === 1 / t : +e === +t;
                            case "[object Date]":
                            case "[object Boolean]":
                                return +e === +t
                        }
                        var r = "[object Array]" === i;
                        if (!r) {
                            if ("object" != typeof e || "object" != typeof t) return !1;
                            var a = e.constructor,
                                s = t.constructor;
                            if (a !== s && !(b.isFunction(a) && a instanceof a && b.isFunction(s) && s instanceof s) && "constructor" in e && "constructor" in t) return !1
                        }
                        n = n || [], o = o || [];
                        for (var c = n.length; c--;)
                            if (n[c] === e) return o[c] === t;
                        if (n.push(e), o.push(t), r) {
                            if (c = e.length, c !== t.length) return !1;
                            for (; c--;)
                                if (!D(e[c], t[c], n, o)) return !1
                        } else {
                            var u, p = b.keys(e);
                            if (c = p.length, b.keys(t).length !== c) return !1;
                            for (; c--;)
                                if (u = p[c], !b.has(t, u) || !D(e[u], t[u], n, o)) return !1
                        }
                        return n.pop(), o.pop(), !0
                    };
                    b.isEqual = function(e, t) {
                        return D(e, t)
                    }, b.isEmpty = function(e) {
                        return null == e ? !0 : E(e) && (b.isArray(e) || b.isString(e) || b.isArguments(e)) ? 0 === e.length : 0 === b.keys(e).length
                    }, b.isElement = function(e) {
                        return !(!e || 1 !== e.nodeType)
                    }, b.isArray = h || function(e) {
                        return "[object Array]" === d.call(e)
                    }, b.isObject = function(e) {
                        var t = typeof e;
                        return "function" === t || "object" === t && !! e
                    }, b.each(["Arguments", "Function", "String", "Number", "Date", "RegExp", "Error"], function(e) {
                        b["is" + e] = function(t) {
                            return d.call(t) === "[object " + e + "]"
                        }
                    }), b.isArguments(arguments) || (b.isArguments = function(e) {
                        return b.has(e, "callee")
                    }), "function" != typeof / . / && "object" != typeof Int8Array && (b.isFunction = function(e) {
                        return "function" == typeof e || !1
                    }), b.isFinite = function(e) {
                        return isFinite(e) && !isNaN(parseFloat(e))
                    }, b.isNaN = function(e) {
                        return b.isNumber(e) && e !== +e
                    }, b.isBoolean = function(e) {
                        return e === !0 || e === !1 || "[object Boolean]" === d.call(e)
                    }, b.isNull = function(e) {
                        return null === e
                    }, b.isUndefined = function(e) {
                        return void 0 === e
                    }, b.has = function(e, t) {
                        return null != e && f.call(e, t)
                    }, b.noConflict = function() {
                        return r._ = a, this
                    }, b.identity = function(e) {
                        return e
                    }, b.constant = function(e) {
                        return function() {
                            return e
                        }
                    }, b.noop = function() {}, b.property = function(e) {
                        return function(t) {
                            return null == t ? void 0 : t[e]
                        }
                    }, b.propertyOf = function(e) {
                        return null == e ? function() {} : function(t) {
                            return e[t]
                        }
                    }, b.matcher = b.matches = function(e) {
                        return e = b.extendOwn({}, e),
                        function(t) {
                            return b.isMatch(t, e)
                        }
                    }, b.times = function(e, t, n) {
                        var o = Array(Math.max(0, e));
                        t = w(t, n, 1);
                        for (var i = 0; e > i; i++) o[i] = t(i);
                        return o
                    }, b.random = function(e, t) {
                        return null == t && (t = e, e = 0), e + Math.floor(Math.random() * (t - e + 1))
                    }, b.now = Date.now || function() {
                        return (new Date).getTime()
                    };
                    var I = {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#x27;",
                        "`": "&#x60;"
                    }, M = b.invert(I),
                        N = function(e) {
                            var t = function(t) {
                                return e[t]
                            }, n = "(?:" + b.keys(e).join("|") + ")",
                                o = RegExp(n),
                                i = RegExp(n, "g");
                            return function(e) {
                                return e = null == e ? "" : "" + e, o.test(e) ? e.replace(i, t) : e
                            }
                        };
                    b.escape = N(I), b.unescape = N(M), b.result = function(e, t, n) {
                        var o = null == e ? void 0 : e[t];
                        return void 0 === o && (o = n), b.isFunction(o) ? o.call(e) : o
                    };
                    var L = 0;
                    b.uniqueId = function(e) {
                        var t = ++L + "";
                        return e ? e + t : t
                    }, b.templateSettings = {
                        evaluate: /<%([\s\S]+?)%>/g,
                        interpolate: /<%=([\s\S]+?)%>/g,
                        escape: /<%-([\s\S]+?)%>/g
                    };
                    var R = /(.)^/,
                        P = {
                            "'": "'",
                            "\\": "\\",
                            "\r": "r",
                            "\n": "n",
                            "\u2028": "u2028",
                            "\u2029": "u2029"
                        }, F = /\\|'|\r|\n|\u2028|\u2029/g,
                        W = function(e) {
                            return "\\" + P[e]
                        };
                    b.template = function(e, t, n) {
                        !t && n && (t = n), t = b.defaults({}, t, b.templateSettings);
                        var o = RegExp([(t.escape || R).source, (t.interpolate || R).source, (t.evaluate || R).source].join("|") + "|$", "g"),
                            i = 0,
                            r = "__p+='";
                        e.replace(o, function(t, n, o, a, s) {
                            return r += e.slice(i, s).replace(F, W), i = s + t.length, n ? r += "'+\n((__t=(" + n + "))==null?'':_.escape(__t))+\n'" : o ? r += "'+\n((__t=(" + o + "))==null?'':__t)+\n'" : a && (r += "';\n" + a + "\n__p+='"), t
                        }), r += "';\n", t.variable || (r = "with(obj||{}){\n" + r + "}\n"), r = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + r + "return __p;\n";
                        try {
                            var a = new Function(t.variable || "obj", "_", r)
                        } catch (s) {
                            throw s.source = r, s
                        }
                        var c = function(e) {
                            return a.call(this, e, b)
                        }, u = t.variable || "obj";
                        return c.source = "function(" + u + "){\n" + r + "}", c
                    }, b.chain = function(e) {
                        var t = b(e);
                        return t._chain = !0, t
                    };
                    var B = function(e, t) {
                        return e._chain ? b(t).chain() : t
                    };
                    b.mixin = function(e) {
                        b.each(b.functions(e), function(t) {
                            var n = b[t] = e[t];
                            b.prototype[t] = function() {
                                var e = [this._wrapped];
                                return p.apply(e, arguments), B(this, n.apply(b, e))
                            }
                        })
                    }, b.mixin(b), b.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(e) {
                        var t = s[e];
                        b.prototype[e] = function() {
                            var n = this._wrapped;
                            return t.apply(n, arguments), "shift" !== e && "splice" !== e || 0 !== n.length || delete n[0], B(this, n)
                        }
                    }), b.each(["concat", "join", "slice"], function(e) {
                        var t = s[e];
                        b.prototype[e] = function() {
                            return B(this, t.apply(this._wrapped, arguments))
                        }
                    }), b.prototype.value = function() {
                        return this._wrapped
                    }, b.prototype.valueOf = b.prototype.toJSON = b.prototype.value, b.prototype.toString = function() {
                        return "" + this._wrapped
                    }, "function" == typeof define && define.amd && define("underscore", [], function() {
                        return b
                    })
                }.call(this)
            }, {}
        ],
        21: [
            function(e, t, n) {
                var o = e("./lib/tosdp"),
                    i = e("./lib/tojson");
                n.toIncomingSDPOffer = function(e) {
                    return o.toSessionSDP(e, {
                        role: "responder",
                        direction: "incoming"
                    })
                }, n.toOutgoingSDPOffer = function(e) {
                    return o.toSessionSDP(e, {
                        role: "initiator",
                        direction: "outgoing"
                    })
                }, n.toIncomingSDPAnswer = function(e) {
                    return o.toSessionSDP(e, {
                        role: "initiator",
                        direction: "incoming"
                    })
                }, n.toOutgoingSDPAnswer = function(e) {
                    return o.toSessionSDP(e, {
                        role: "responder",
                        direction: "outgoing"
                    })
                }, n.toIncomingMediaSDPOffer = function(e) {
                    return o.toMediaSDP(e, {
                        role: "responder",
                        direction: "incoming"
                    })
                }, n.toOutgoingMediaSDPOffer = function(e) {
                    return o.toMediaSDP(e, {
                        role: "initiator",
                        direction: "outgoing"
                    })
                }, n.toIncomingMediaSDPAnswer = function(e) {
                    return o.toMediaSDP(e, {
                        role: "initiator",
                        direction: "incoming"
                    })
                }, n.toOutgoingMediaSDPAnswer = function(e) {
                    return o.toMediaSDP(e, {
                        role: "responder",
                        direction: "outgoing"
                    })
                }, n.toCandidateSDP = o.toCandidateSDP, n.toMediaSDP = o.toMediaSDP, n.toSessionSDP = o.toSessionSDP, n.toIncomingJSONOffer = function(e, t) {
                    return i.toSessionJSON(e, {
                        role: "responder",
                        direction: "incoming",
                        creators: t
                    })
                }, n.toOutgoingJSONOffer = function(e, t) {
                    return i.toSessionJSON(e, {
                        role: "initiator",
                        direction: "outgoing",
                        creators: t
                    })
                }, n.toIncomingJSONAnswer = function(e, t) {
                    return i.toSessionJSON(e, {
                        role: "initiator",
                        direction: "incoming",
                        creators: t
                    })
                }, n.toOutgoingJSONAnswer = function(e, t) {
                    return i.toSessionJSON(e, {
                        role: "responder",
                        direction: "outgoing",
                        creators: t
                    })
                }, n.toIncomingMediaJSONOffer = function(e, t) {
                    return i.toMediaJSON(e, {
                        role: "responder",
                        direction: "incoming",
                        creator: t
                    })
                }, n.toOutgoingMediaJSONOffer = function(e, t) {
                    return i.toMediaJSON(e, {
                        role: "initiator",
                        direction: "outgoing",
                        creator: t
                    })
                }, n.toIncomingMediaJSONAnswer = function(e, t) {
                    return i.toMediaJSON(e, {
                        role: "initiator",
                        direction: "incoming",
                        creator: t
                    })
                }, n.toOutgoingMediaJSONAnswer = function(e, t) {
                    return i.toMediaJSON(e, {
                        role: "responder",
                        direction: "outgoing",
                        creator: t
                    })
                }, n.toCandidateJSON = i.toCandidateJSON, n.toMediaJSON = i.toMediaJSON, n.toSessionJSON = i.toSessionJSON
            }, {
                "./lib/tojson": 23,
                "./lib/tosdp": 22
            }
        ],
        14: [
            function(e, t) {
                function n(e, t) {
                    var n, o = this;
                    s.call(this), e = e || {}, e.iceServers = e.iceServers || [], this.enableChromeNativeSimulcast = !1, t && t.optional && "webkit" === r.prefix && null === navigator.appVersion.match(/Chromium\//) && t.optional.forEach(function(e) {
                        e.enableChromeNativeSimulcast && (o.enableChromeNativeSimulcast = !0)
                    }), this.enableMultiStreamHacks = !1, t && t.optional && t.optional.forEach(function(e) {
                        e.enableMultiStreamHacks && (o.enableMultiStreamHacks = !0)
                    }), this.restrictBandwidth = 0, t && t.optional && t.optional.forEach(function(e) {
                        e.andyetRestrictBandwidth && (o.restrictBandwidth = e.andyetRestrictBandwidth)
                    }), this.batchIceCandidates = 0, t && t.optional && t.optional.forEach(function(e) {
                        e.andyetBatchIce && (o.batchIceCandidates = e.andyetBatchIce)
                    }), this.batchedIceCandidates = [], this.assumeSetLocalSuccess = !1, t && t.optional && t.optional.forEach(function(e) {
                        e.andyetAssumeSetLocalSuccess && (o.assumeSetLocalSuccess = e.andyetAssumeSetLocalSuccess)
                    }), "moz" === r.prefix && t && t.optional && (this.wtFirefox = 0, t.optional.forEach(function(e) {
                        e.andyetFirefoxMakesMeSad && (o.wtFirefox = e.andyetFirefoxMakesMeSad, o.wtFirefox > 0 && (o.firefoxcandidatebuffer = []))
                    })), this.pc = new c(e, t), this.getLocalStreams = this.pc.getLocalStreams.bind(this.pc), this.getRemoteStreams = this.pc.getRemoteStreams.bind(this.pc), this.addStream = this.pc.addStream.bind(this.pc), this.removeStream = this.pc.removeStream.bind(this.pc), this.pc.on("*", function() {
                        o.emit.apply(o, arguments)
                    }), this.pc.onremovestream = this.emit.bind(this, "removeStream"), this.pc.onaddstream = this.emit.bind(this, "addStream"), this.pc.onnegotiationneeded = this.emit.bind(this, "negotiationNeeded"), this.pc.oniceconnectionstatechange = this.emit.bind(this, "iceConnectionStateChange"), this.pc.onsignalingstatechange = this.emit.bind(this, "signalingStateChange"), this.pc.onicecandidate = this._onIce.bind(this), this.pc.ondatachannel = this._onDataChannel.bind(this), this.localDescription = {
                        contents: []
                    }, this.remoteDescription = {
                        contents: []
                    }, this.config = {
                        debug: !1,
                        ice: {},
                        sid: "",
                        isInitiator: !0,
                        sdpSessionID: Date.now(),
                        useJingle: !1
                    };
                    for (n in e) this.config[n] = e[n];
                    this.config.debug && this.on("*", function() {
                        var t = e.logger || console;
                        t.log("PeerConnection event:", arguments)
                    }), this.hadLocalStunCandidate = !1, this.hadRemoteStunCandidate = !1, this.hadLocalRelayCandidate = !1, this.hadRemoteRelayCandidate = !1, this.hadLocalIPv6Candidate = !1, this.hadRemoteIPv6Candidate = !1, this._remoteDataChannels = [], this._localDataChannels = []
                }
                var o = e("underscore"),
                    i = e("util"),
                    r = e("webrtcsupport"),
                    a = e("sdp-jingle-json"),
                    s = e("wildemitter"),
                    c = e("traceablepeerconnection");
                i.inherits(n, s), Object.defineProperty(n.prototype, "signalingState", {
                    get: function() {
                        return this.pc.signalingState
                    }
                }), Object.defineProperty(n.prototype, "iceConnectionState", {
                    get: function() {
                        return this.pc.iceConnectionState
                    }
                }), n.prototype._role = function() {
                    return this.isInitiator ? "initiator" : "responder"
                }, n.prototype.addStream = function(e) {
                    this.localStream = e, this.pc.addStream(e)
                }, n.prototype._checkLocalCandidate = function(e) {
                    var t = a.toCandidateJSON(e);
                    "srflx" == t.type ? this.hadLocalStunCandidate = !0 : "relay" == t.type && (this.hadLocalRelayCandidate = !0), -1 != t.ip.indexOf(":") && (this.hadLocalIPv6Candidate = !0)
                }, n.prototype._checkRemoteCandidate = function(e) {
                    var t = a.toCandidateJSON(e);
                    "srflx" == t.type ? this.hadRemoteStunCandidate = !0 : "relay" == t.type && (this.hadRemoteRelayCandidate = !0), -1 != t.ip.indexOf(":") && (this.hadRemoteIPv6Candidate = !0)
                }, n.prototype.processIce = function(e, t) {
                    t = t || function() {};
                    var n = this;
                    if ("closed" === this.pc.signalingState) return t();
                    if (e.contents || e.jingle && e.jingle.contents) {
                        var i = o.pluck(this.remoteDescription.contents, "name"),
                            s = e.contents || e.jingle.contents;
                        s.forEach(function(e) {
                            var t = e.transport || {}, o = t.candidates || [],
                                s = i.indexOf(e.name),
                                c = e.name;
                            o.forEach(function(e) {
                                var t = a.toCandidateSDP(e) + "\r\n";
                                n.pc.addIceCandidate(new r.IceCandidate({
                                    candidate: t,
                                    sdpMLineIndex: s,
                                    sdpMid: c
                                }), function() {}, function(e) {
                                    n.emit("error", e)
                                }), n._checkRemoteCandidate(t)
                            })
                        })
                    } else {
                        if (e.candidate && 0 !== e.candidate.candidate.indexOf("a=") && (e.candidate.candidate = "a=" + e.candidate.candidate), this.wtFirefox && null !== this.firefoxcandidatebuffer && this.pc.localDescription && "offer" === this.pc.localDescription.type) return this.firefoxcandidatebuffer.push(e.candidate), t();
                        n.pc.addIceCandidate(new r.IceCandidate(e.candidate), function() {}, function(e) {
                            n.emit("error", e)
                        }), n._checkRemoteCandidate(e.candidate.candidate)
                    }
                    t()
                }, n.prototype.offer = function(e, t) {
                    var n = this,
                        i = 2 === arguments.length,
                        r = i ? e : {
                            mandatory: {
                                OfferToReceiveAudio: !0,
                                OfferToReceiveVideo: !0
                            }
                        };
                    return t = i ? t : e, t = t || function() {}, "closed" === this.pc.signalingState ? t("Already closed") : (this.pc.createOffer(function(e) {
                        var i = {
                            type: "offer",
                            sdp: e.sdp
                        };
                        n.assumeSetLocalSuccess && (n.emit("offer", i), t(null, i)), n.pc.setLocalDescription(e, function() {
                            var r;
                            n.config.useJingle && (r = a.toSessionJSON(e.sdp, {
                                role: n._role(),
                                direction: "outgoing"
                            }), r.sid = n.config.sid, n.localDescription = r, o.each(r.contents, function(e) {
                                var t = e.transport || {};
                                t.ufrag && (n.config.ice[e.name] = {
                                    ufrag: t.ufrag,
                                    pwd: t.pwd
                                })
                            }), i.jingle = r), i.sdp.split("\r\n").forEach(function(e) {
                                0 === e.indexOf("a=candidate:") && n._checkLocalCandidate(e)
                            }), n.assumeSetLocalSuccess || (n.emit("offer", i), t(null, i))
                        }, function(e) {
                            n.emit("error", e), t(e)
                        })
                    }, function(e) {
                        n.emit("error", e), t(e)
                    }, r), void 0)
                }, n.prototype.handleOffer = function(e, t) {
                    t = t || function() {};
                    var n = this;
                    if (e.type = "offer", e.jingle) {
                        if (this.enableChromeNativeSimulcast && e.jingle.contents.forEach(function(e) {
                            "video" === e.name && (e.description.googConferenceFlag = !0)
                        }), n.restrictBandwidth > 0 && e.jingle.contents.length >= 2 && "video" === e.jingle.contents[1].name) {
                            var o = e.jingle.contents[1],
                                i = o.description && o.description.bandwidth;
                            i || (e.jingle.contents[1].description.bandwidth = {
                                type: "AS",
                                bandwidth: n.restrictBandwidth.toString()
                            }, e.sdp = a.toSessionSDP(e.jingle, {
                                sid: n.config.sdpSessionID,
                                role: n._role(),
                                direction: "outgoing"
                            }))
                        }
                        e.sdp = a.toSessionSDP(e.jingle, {
                            sid: n.config.sdpSessionID,
                            role: n._role(),
                            direction: "incoming"
                        }), n.remoteDescription = e.jingle
                    }
                    e.sdp.split("\r\n").forEach(function(e) {
                        0 === e.indexOf("a=candidate:") && n._checkRemoteCandidate(e)
                    }), n.pc.setRemoteDescription(new r.SessionDescription(e), function() {
                        t()
                    }, t)
                }, n.prototype.answerAudioOnly = function(e) {
                    var t = {
                        mandatory: {
                            OfferToReceiveAudio: !0,
                            OfferToReceiveVideo: !1
                        }
                    };
                    this._answer(t, e)
                }, n.prototype.answerBroadcastOnly = function(e) {
                    var t = {
                        mandatory: {
                            OfferToReceiveAudio: !1,
                            OfferToReceiveVideo: !1
                        }
                    };
                    this._answer(t, e)
                }, n.prototype.answer = function(e, t) {
                    var n = 2 === arguments.length,
                        o = n ? t : e,
                        i = n ? e : {
                            mandatory: {
                                OfferToReceiveAudio: !0,
                                OfferToReceiveVideo: !0
                            }
                        };
                    this._answer(i, o)
                }, n.prototype.handleAnswer = function(e, t) {
                    t = t || function() {};
                    var n = this;
                    e.jingle && (e.sdp = a.toSessionSDP(e.jingle, {
                        sid: n.config.sdpSessionID,
                        role: n._role(),
                        direction: "incoming"
                    }), n.remoteDescription = e.jingle), e.sdp.split("\r\n").forEach(function(e) {
                        0 === e.indexOf("a=candidate:") && n._checkRemoteCandidate(e)
                    }), n.pc.setRemoteDescription(new r.SessionDescription(e), function() {
                        n.wtFirefox && window.setTimeout(function() {
                            n.firefoxcandidatebuffer.forEach(function(e) {
                                n.pc.addIceCandidate(new r.IceCandidate(e), function() {}, function(e) {
                                    n.emit("error", e)
                                }), n._checkRemoteCandidate(e.candidate)
                            }), n.firefoxcandidatebuffer = null
                        }, n.wtFirefox), t(null)
                    }, t)
                }, n.prototype.close = function() {
                    this.pc.close(), this._localDataChannels = [], this._remoteDataChannels = [], this.emit("close")
                }, n.prototype._answer = function(e, t) {
                    t = t || function() {};
                    var n = this;
                    if (!this.pc.remoteDescription) throw new Error("remoteDescription not set");
                    return "closed" === this.pc.signalingState ? t("Already closed") : (n.pc.createAnswer(function(e) {
                        var o = [];
                        if (n.enableChromeNativeSimulcast && (e.jingle = a.toSessionJSON(e.sdp, {
                            role: n._role(),
                            direction: "outgoing"
                        }), e.jingle.contents.length >= 2 && "video" === e.jingle.contents[1].name)) {
                            var i = e.jingle.contents[1].description.sourceGroups || [],
                                r = !1;
                            if (i.forEach(function(e) {
                                "SIM" == e.semantics && (r = !0)
                            }), !r && e.jingle.contents[1].description.sources.length) {
                                var s = JSON.parse(JSON.stringify(e.jingle.contents[1].description.sources[0]));
                                s.ssrc = "" + Math.floor(4294967295 * Math.random()), e.jingle.contents[1].description.sources.push(s), o.push(e.jingle.contents[1].description.sources[0].ssrc), o.push(s.ssrc), i.push({
                                    semantics: "SIM",
                                    sources: o
                                });
                                var c = JSON.parse(JSON.stringify(s));
                                c.ssrc = "" + Math.floor(4294967295 * Math.random()), e.jingle.contents[1].description.sources.push(c), i.push({
                                    semantics: "FID",
                                    sources: [s.ssrc, c.ssrc]
                                }), e.jingle.contents[1].description.sourceGroups = i, e.sdp = a.toSessionSDP(e.jingle, {
                                    sid: n.config.sdpSessionID,
                                    role: n._role(),
                                    direction: "outgoing"
                                })
                            }
                        }
                        var u = {
                            type: "answer",
                            sdp: e.sdp
                        };
                        n.assumeSetLocalSuccess && (n.emit("answer", u), t(null, u)), n.pc.setLocalDescription(e, function() {
                            if (n.config.useJingle) {
                                var o = a.toSessionJSON(e.sdp, {
                                    role: n._role(),
                                    direction: "outgoing"
                                });
                                o.sid = n.config.sid, n.localDescription = o, u.jingle = o
                            }
                            n.enableChromeNativeSimulcast && (u.jingle || (u.jingle = a.toSessionJSON(e.sdp, {
                                role: n._role(),
                                direction: "outgoing"
                            })), u.jingle.contents[1].description.sourceGroups || [], u.jingle.contents[1].description.sources.forEach(function(e, t) {
                                e.parameters = e.parameters.map(function(e) {
                                    return "msid" === e.key && (e.value += "-" + Math.floor(t / 2)), e
                                })
                            }), u.sdp = a.toSessionSDP(u.jingle, {
                                sid: n.sdpSessionID,
                                role: n._role(),
                                direction: "outgoing"
                            })), u.sdp.split("\r\n").forEach(function(e) {
                                0 === e.indexOf("a=candidate:") && n._checkLocalCandidate(e)
                            }), n.assumeSetLocalSuccess || (n.emit("answer", u), t(null, u))
                        }, function(e) {
                            n.emit("error", e), t(e)
                        })
                    }, function(e) {
                        n.emit("error", e), t(e)
                    }, e), void 0)
                }, n.prototype._onIce = function(e) {
                    var t = this;
                    if (e.candidate) {
                        var n = e.candidate,
                            i = {
                                candidate: {
                                    candidate: n.candidate,
                                    sdpMid: n.sdpMid,
                                    sdpMLineIndex: n.sdpMLineIndex
                                }
                            };
                        this._checkLocalCandidate(n.candidate);
                        var r = a.toCandidateJSON(n.candidate);
                        if (t.config.useJingle) {
                            if (n.sdpMid || (n.sdpMid = t.localDescription.contents[n.sdpMLineIndex].name), !t.config.ice[n.sdpMid]) {
                                var s = a.toSessionJSON(t.pc.localDescription.sdp, {
                                    role: t._role(),
                                    direction: "outgoing"
                                });
                                o.each(s.contents, function(e) {
                                    var n = e.transport || {};
                                    n.ufrag && (t.config.ice[e.name] = {
                                        ufrag: n.ufrag,
                                        pwd: n.pwd
                                    })
                                })
                            }
                            if (i.jingle = {
                                contents: [{
                                    name: n.sdpMid,
                                    creator: t._role(),
                                    transport: {
                                        transType: "iceUdp",
                                        ufrag: t.config.ice[n.sdpMid].ufrag,
                                        pwd: t.config.ice[n.sdpMid].pwd,
                                        candidates: [r]
                                    }
                                }]
                            }, t.batchIceCandidates > 0) return 0 === t.batchedIceCandidates.length && window.setTimeout(function() {
                                var e = {};
                                t.batchedIceCandidates.forEach(function(t) {
                                    t = t.contents[0], e[t.name] || (e[t.name] = t), e[t.name].transport.candidates.push(t.transport.candidates[0])
                                });
                                var n = {
                                    jingle: {
                                        contents: []
                                    }
                                };
                                Object.keys(e).forEach(function(t) {
                                    n.jingle.contents.push(e[t])
                                }), t.batchedIceCandidates = [], t.emit("ice", n)
                            }, t.batchIceCandidates), t.batchedIceCandidates.push(i.jingle), void 0
                        }
                        this.emit("ice", i)
                    } else this.emit("endOfCandidates")
                }, n.prototype._onDataChannel = function(e) {
                    var t = e.channel;
                    this._remoteDataChannels.push(t), this.emit("addChannel", t)
                }, n.prototype.createDataChannel = function(e, t) {
                    var n = this.pc.createDataChannel(e, t);
                    return this._localDataChannels.push(n), n
                }, n.prototype.getStats = function(e) {
                    "moz" === r.prefix ? this.pc.getStats(function(t) {
                        var n = [];
                        for (var o in t) "object" == typeof t[o] && n.push(t[o]);
                        e(null, n)
                    }, e) : this.pc.getStats(function(t) {
                        var n = [];
                        t.result().forEach(function(e) {
                            var t = {};
                            e.names().forEach(function(n) {
                                t[n] = e.stat(n)
                            }), t.id = e.id, t.type = e.type, t.timestamp = e.timestamp, n.push(t)
                        }), e(null, n)
                    })
                }, t.exports = n
            }, {
                "sdp-jingle-json": 21,
                traceablepeerconnection: 24,
                underscore: 20,
                util: 9,
                webrtcsupport: 5,
                wildemitter: 3
            }
        ],
        15: [
            function(e, t) {
                function n(e) {
                    i.call(this);
                    var t = e || {};
                    this.config = {
                        chunksize: 16384,
                        pacing: 0
                    };
                    var n;
                    for (n in t) this.config[n] = t[n];
                    this.file = null, this.channel = null
                }

                function o() {
                    i.call(this), this.receiveBuffer = [], this.received = 0, this.metadata = {}, this.channel = null
                }
                var i = e("wildemitter"),
                    r = e("util");
                r.inherits(n, i), n.prototype.send = function(e, t) {
                    var n = this;
                    this.file = e, this.channel = t;
                    var o = function(t) {
                        var i = new window.FileReader;
                        i.onload = function() {
                            return function(i) {
                                n.channel.send(i.target.result), n.emit("progress", t, e.size, i.target.result), e.size > t + i.target.result.byteLength ? window.setTimeout(o, n.config.pacing, t + n.config.chunksize) : (n.emit("progress", e.size, e.size, null), n.emit("sentFile"))
                            }
                        }(e);
                        var r = e.slice(t, t + n.config.chunksize);
                        i.readAsArrayBuffer(r)
                    };
                    window.setTimeout(o, 0, 0)
                }, r.inherits(o, i), o.prototype.receive = function(e, t) {
                    var n = this;
                    e && (this.metadata = e), this.channel = t, t.binaryType = "arraybuffer", this.channel.onmessage = function(e) {
                        var t = e.data.byteLength;
                        n.received += t, n.receiveBuffer.push(e.data), n.emit("progress", n.received, n.metadata.size, e.data), n.received === n.metadata.size ? (n.emit("receivedFile", new window.Blob(n.receiveBuffer), n.metadata), n.receiveBuffer = []) : n.received > n.metadata.size && (console.error("received more than expected, discarding..."), n.receiveBuffer = [])
                    }
                }, t.exports = {}, t.exports.support = window && window.File && window.FileReader && window.Blob, t.exports.Sender = n, t.exports.Receiver = o
            }, {
                util: 9,
                wildemitter: 3
            }
        ],
        18: [
            function(e, t) {
                var n = e("getusermedia"),
                    o = {};
                t.exports = function(e, t) {
                    var i, r = 2 === arguments.length,
                        a = r ? t : e;
                    if ("undefined" == typeof window || "http:" === window.location.protocol) return i = new Error("NavigatorUserMediaError"), i.name = "HTTPS_REQUIRED", a(i);
                    if (window.navigator.userAgent.match("Chrome")) {
                        var s = parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10),
                            c = 33,
                            u = !window.chrome.webstore;
                        if (window.navigator.userAgent.match("Linux") && (c = 35), u || s >= 26 && c >= s) e = r && e || {
                            video: {
                                mandatory: {
                                    googLeakyBucket: !0,
                                    maxWidth: window.screen.width,
                                    maxHeight: window.screen.height,
                                    maxFrameRate: 3,
                                    chromeMediaSource: "screen"
                                }
                            }
                        }, n(e, a);
                        else {
                            var p = window.setTimeout(function() {
                                return i = new Error("NavigatorUserMediaError"), i.name = "EXTENSION_UNAVAILABLE", a(i)
                            }, 1e3);
                            o[p] = [a, r ? constraint : null], window.postMessage({
                                type: "getScreen",
                                id: p
                            }, "*")
                        }
                    } else if (window.navigator.userAgent.match("Firefox")) {
                        var l = parseInt(window.navigator.userAgent.match(/Firefox\/(.*)/)[1], 10);
                        l >= 33 ? (e = r && e || {
                            video: {
                                mozMediaSource: "window",
                                mediaSource: "window"
                            }
                        }, n(e, function(e, t) {
                            if (a(e, t), !e) var n = t.currentTime,
                            o = window.setInterval(function() {
                                t || window.clearInterval(o), t.currentTime == n && (window.clearInterval(o), t.onended && t.onended()), n = t.currentTime
                            }, 500)
                        })) : (i = new Error("NavigatorUserMediaError"), i.name = "EXTENSION_UNAVAILABLE")
                    }
                }, window.addEventListener("message", function(e) {
                    if (e.origin == window.location.origin)
                        if ("gotScreen" == e.data.type && o[e.data.id]) {
                            var t = o[e.data.id],
                                i = t[1],
                                r = t[0];
                            if (delete o[e.data.id], "" === e.data.sourceId) {
                                var a = new Error("NavigatorUserMediaError");
                                a.name = "PERMISSION_DENIED", r(a)
                            } else i = i || {
                                audio: !1,
                                video: {
                                    mandatory: {
                                        chromeMediaSource: "desktop",
                                        maxWidth: window.screen.width,
                                        maxHeight: window.screen.height,
                                        maxFrameRate: 3
                                    },
                                    optional: [{
                                        googLeakyBucket: !0
                                    }, {
                                        googTemporalLayeredScreencast: !0
                                    }]
                                }
                            }, i.video.mandatory.chromeMediaSourceId = e.data.sourceId, n(i, r)
                        } else "getScreenPending" == e.data.type && window.clearTimeout(e.data.id)
                })
            }, {
                getusermedia: 16
            }
        ],
        19: [
            function(e, t) {
                function n(e) {
                    if (this.support = o.webAudio && o.mediaStream, this.gain = 1, this.support) {
                        var t = this.context = new o.AudioContext;
                        this.microphone = t.createMediaStreamSource(e), this.gainFilter = t.createGain(), this.destination = t.createMediaStreamDestination(), this.outputStream = this.destination.stream, this.microphone.connect(this.gainFilter), this.gainFilter.connect(this.destination), e.addTrack(this.outputStream.getAudioTracks()[0]), e.removeTrack(e.getAudioTracks()[0])
                    }
                    this.stream = e
                }
                var o = e("webrtcsupport");
                n.prototype.setGain = function(e) {
                    this.support && (this.gainFilter.gain.value = e, this.gain = e)
                }, n.prototype.getGain = function() {
                    return this.gain
                }, n.prototype.off = function() {
                    return this.setGain(0)
                }, n.prototype.on = function() {
                    this.setGain(1)
                }, t.exports = n
            }, {
                webrtcsupport: 5
            }
        ],
        17: [
            function(e, t) {
                function n(e, t) {
                    var n = -1 / 0;
                    e.getFloatFrequencyData(t);
                    for (var o = 4, i = t.length; i > o; o++) t[o] > n && t[o] < 0 && (n = t[o]);
                    return n
                }
                var o = e("wildemitter"),
                    i = window.AudioContext || window.webkitAudioContext,
                    r = null;
                t.exports = function(e, t) {
                    var a = new o;
                    if (!i) return a;
                    var t = t || {}, s = t.smoothing || .1,
                        c = t.interval || 50,
                        u = t.threshold,
                        p = t.play,
                        l = t.history || 10,
                        d = !0;
                    r || (r = new i);
                    var f, h, m;
                    m = r.createAnalyser(), m.fftSize = 512, m.smoothingTimeConstant = s, h = new Float32Array(m.fftSize), e.jquery && (e = e[0]), e instanceof HTMLAudioElement || e instanceof HTMLVideoElement ? (f = r.createMediaElementSource(e), "undefined" == typeof p && (p = !0), u = u || -50) : (f = r.createMediaStreamSource(e), u = u || -50), f.connect(m), p && m.connect(r.destination), a.speaking = !1, a.setThreshold = function(e) {
                        u = e
                    }, a.setInterval = function(e) {
                        c = e
                    }, a.stop = function() {
                        d = !1, a.emit("volume_change", -100, u), a.speaking && (a.speaking = !1, a.emit("stopped_speaking"))
                    }, a.speakingHistory = [];
                    for (var g = 0; l > g; g++) a.speakingHistory.push(0);
                    var v = function() {
                        setTimeout(function() {
                            if (d) {
                                var e = n(m, h);
                                a.emit("volume_change", e, u);
                                var t = 0;
                                if (e > u && !a.speaking) {
                                    for (var o = a.speakingHistory.length - 3; o < a.speakingHistory.length; o++) t += a.speakingHistory[o];
                                    t >= 2 && (a.speaking = !0, a.emit("speaking"))
                                } else if (u > e && a.speaking) {
                                    for (var o = 0; o < a.speakingHistory.length; o++) t += a.speakingHistory[o];
                                    0 == t && (a.speaking = !1, a.emit("stopped_speaking"))
                                }
                                a.speakingHistory.shift(), a.speakingHistory.push(0 + (e > u)), v()
                            }
                        }, c)
                    };
                    return v(), a
                }
            }, {
                wildemitter: 3
            }
        ],
        22: [
            function(e, t, n) {
                var o = e("./senders");
                n.toSessionSDP = function(e, t) {
                    t.role || "initiator", t.direction || "outgoing";
                    var o = t.sid || e.sid || Date.now(),
                        i = t.time || Date.now(),
                        r = ["v=0", "o=- " + o + " " + i + " IN IP4 0.0.0.0", "s=-", "t=0 0"],
                        a = e.groups || [];
                    a.forEach(function(e) {
                        r.push("a=group:" + e.semantics + " " + e.contents.join(" "))
                    });
                    var s = e.contents || [];
                    return s.forEach(function(e) {
                        r.push(n.toMediaSDP(e, t))
                    }), r.join("\r\n") + "\r\n"
                }, n.toMediaSDP = function(e, t) {
                    var i = [],
                        r = t.role || "initiator",
                        a = t.direction || "outgoing",
                        s = e.description,
                        c = e.transport,
                        u = s.payloads || [],
                        p = c && c.fingerprints || [],
                        l = [];
                    if ("datachannel" == s.descType ? (l.push("application"), l.push("1"), l.push("DTLS/SCTP"), c.sctp && c.sctp.forEach(function(e) {
                        l.push(e.number)
                    })) : (l.push(s.media), l.push("1"), s.encryption && s.encryption.length > 0 || p.length > 0 ? l.push("UDP/TLS/RTP/SAVP") : l.push("UDP/TLS/RTP/SAVP"), u.forEach(function(e) {
                        l.push(e.id)
                    })), i.push("m=" + l.join(" ")), i.push("c=IN IP4 0.0.0.0"), s.bandwidth && s.bandwidth.type && s.bandwidth.bandwidth && i.push("b=" + s.bandwidth.type + ":" + s.bandwidth.bandwidth), "rtp" == s.descType && i.push("a=rtcp:1 IN IP4 0.0.0.0"), c) {
                        c.ufrag && i.push("a=ice-ufrag:" + c.ufrag), c.pwd && i.push("a=ice-pwd:" + c.pwd);
                        var d = !1;
                        p.forEach(function(e) {
                            i.push("a=fingerprint:" + e.hash + " " + e.value), e.setup && !d && i.push("a=setup:" + e.setup)
                        }), c.sctp && c.sctp.forEach(function(e) {
                            i.push("a=sctpmap:" + e.number + " " + e.protocol + " " + e.streams)
                        })
                    }
                    "rtp" == s.descType && i.push("a=" + (o[r][a][e.senders] || "sendrecv")), i.push("a=mid:" + e.name), s.mux && i.push("a=rtcp-mux");
                    var f = s.encryption || [];
                    f.forEach(function(e) {
                        i.push("a=crypto:" + e.tag + " " + e.cipherSuite + " " + e.keyParams + (e.sessionParams ? " " + e.sessionParams : ""))
                    }), s.googConferenceFlag && i.push("a=x-google-flag:conference"), u.forEach(function(e) {
                        var t = "a=rtpmap:" + e.id + " " + e.name + "/" + e.clockrate;
                        if (e.channels && "1" != e.channels && (t += "/" + e.channels), i.push(t), e.parameters && e.parameters.length) {
                            var n = ["a=fmtp:" + e.id],
                                o = [];
                            e.parameters.forEach(function(e) {
                                o.push((e.key ? e.key + "=" : "") + e.value)
                            }), n.push(o.join(";")), i.push(n.join(" "))
                        }
                        e.feedback && e.feedback.forEach(function(t) {
                            "trr-int" === t.type ? i.push("a=rtcp-fb:" + e.id + " trr-int " + (t.value ? t.value : "0")) : i.push("a=rtcp-fb:" + e.id + " " + t.type + (t.subtype ? " " + t.subtype : ""))
                        })
                    }), s.feedback && s.feedback.forEach(function(e) {
                        "trr-int" === e.type ? i.push("a=rtcp-fb:* trr-int " + (e.value ? e.value : "0")) : i.push("a=rtcp-fb:* " + e.type + (e.subtype ? " " + e.subtype : ""))
                    });
                    var h = s.headerExtensions || [];
                    h.forEach(function(e) {
                        i.push("a=extmap:" + e.id + (e.senders ? "/" + o[r][a][e.senders] : "") + " " + e.uri)
                    });
                    var m = s.sourceGroups || [];
                    m.forEach(function(e) {
                        i.push("a=ssrc-group:" + e.semantics + " " + e.sources.join(" "))
                    });
                    var g = s.sources || [];
                    g.forEach(function(e) {
                        for (var t = 0; t < e.parameters.length; t++) {
                            var n = e.parameters[t];
                            i.push("a=ssrc:" + (e.ssrc || s.ssrc) + " " + n.key + (n.value ? ":" + n.value : ""))
                        }
                    });
                    var v = c.candidates || [];
                    return v.forEach(function(e) {
                        i.push(n.toCandidateSDP(e))
                    }), i.join("\r\n")
                }, n.toCandidateSDP = function(e) {
                    var t = [];
                    t.push(e.foundation), t.push(e.component), t.push(e.protocol.toUpperCase()), t.push(e.priority), t.push(e.ip), t.push(e.port);
                    var n = e.type;
                    return t.push("typ"), t.push(n), ("srflx" === n || "prflx" === n || "relay" === n) && e.relAddr && e.relPort && (t.push("raddr"), t.push(e.relAddr), t.push("rport"), t.push(e.relPort)), e.tcpType && "TCP" == e.protocol.toUpperCase() && (t.push("tcptype"), t.push(e.tcpType)), t.push("generation"), t.push(e.generation || "0"), "a=candidate:" + t.join(" ")
                }
            }, {
                "./senders": 25
            }
        ],
        23: [
            function(e, t, n) {
                var o = e("./senders"),
                    i = e("./parsers"),
                    r = Math.random();
                n._setIdCounter = function(e) {
                    r = e
                }, n.toSessionJSON = function(e, t) {
                    var o, r = t.creators || [],
                        a = t.role || "initiator",
                        s = t.direction || "outgoing",
                        c = e.split("\r\nm=");
                    for (o = 1; o < c.length; o++) c[o] = "m=" + c[o], o !== c.length - 1 && (c[o] += "\r\n");
                    var u = c.shift() + "\r\n",
                        p = i.lines(u),
                        l = {}, d = [];
                    for (o = 0; o < c.length; o++) d.push(n.toMediaJSON(c[o], u, {
                        role: a,
                        direction: s,
                        creator: r[o] || "initiator"
                    }));
                    l.contents = d;
                    var f = i.findLines("a=group:", p);
                    return f.length && (l.groups = i.groups(f)), l
                }, n.toMediaJSON = function(e, t, r) {
                    var a = r.creator || "initiator",
                        s = r.role || "initiator",
                        c = r.direction || "outgoing",
                        u = i.lines(e),
                        p = i.lines(t),
                        l = i.mline(u[0]),
                        d = {
                            creator: a,
                            name: l.media,
                            description: {
                                descType: "rtp",
                                media: l.media,
                                payloads: [],
                                encryption: [],
                                feedback: [],
                                headerExtensions: []
                            },
                            transport: {
                                transType: "iceUdp",
                                candidates: [],
                                fingerprints: []
                            }
                        };
                    "application" == l.media && (d.description = {
                        descType: "datachannel"
                    }, d.transport.sctp = []);
                    var f = d.description,
                        h = d.transport,
                        m = i.findLine("a=mid:", u);
                    if (m && (d.name = m.substr(6)), i.findLine("a=sendrecv", u, p) ? d.senders = "both" : i.findLine("a=sendonly", u, p) ? d.senders = o[s][c].sendonly : i.findLine("a=recvonly", u, p) ? d.senders = o[s][c].recvonly : i.findLine("a=inactive", u, p) && (d.senders = "none"), "rtp" == f.descType) {
                        var g = i.findLine("b=", u);
                        g && (f.bandwidth = i.bandwidth(g));
                        var v = i.findLine("a=ssrc:", u);
                        v && (f.ssrc = v.substr(7).split(" ")[0]);
                        var y = i.findLines("a=rtpmap:", u);
                        y.forEach(function(e) {
                            var t = i.rtpmap(e);
                            t.parameters = [], t.feedback = [];
                            var n = i.findLines("a=fmtp:" + t.id, u);
                            n.forEach(function(e) {
                                t.parameters = i.fmtp(e)
                            });
                            var o = i.findLines("a=rtcp-fb:" + t.id, u);
                            o.forEach(function(e) {
                                t.feedback.push(i.rtcpfb(e))
                            }), f.payloads.push(t)
                        });
                        var b = i.findLines("a=crypto:", u, p);
                        b.forEach(function(e) {
                            f.encryption.push(i.crypto(e))
                        }), i.findLine("a=rtcp-mux", u) && (f.mux = !0);
                        var w = i.findLines("a=rtcp-fb:*", u);
                        w.forEach(function(e) {
                            f.feedback.push(i.rtcpfb(e))
                        });
                        var S = i.findLines("a=extmap:", u);
                        S.forEach(function(e) {
                            var t = i.extmap(e);
                            t.senders = o[s][c][t.senders], f.headerExtensions.push(t)
                        });
                        var k = i.findLines("a=ssrc-group:", u);
                        f.sourceGroups = i.sourceGroups(k || []);
                        var C = i.findLines("a=ssrc:", u);
                        f.sources = i.sources(C || []), i.findLine("a=x-google-flag:conference", u, p) && (f.googConferenceFlag = !0)
                    }
                    var _ = i.findLines("a=fingerprint:", u, p),
                        E = i.findLine("a=setup:", u, p);
                    _.forEach(function(e) {
                        var t = i.fingerprint(e);
                        E && (t.setup = E.substr(8)), h.fingerprints.push(t)
                    });
                    var T = i.findLine("a=ice-ufrag:", u, p),
                        O = i.findLine("a=ice-pwd:", u, p);
                    if (T && O) {
                        h.ufrag = T.substr(12), h.pwd = O.substr(10), h.candidates = [];
                        var x = i.findLines("a=candidate:", u, p);
                        x.forEach(function(e) {
                            h.candidates.push(n.toCandidateJSON(e))
                        })
                    }
                    if ("datachannel" == f.descType) {
                        var j = i.findLines("a=sctpmap:", u);
                        j.forEach(function(e) {
                            var t = i.sctpmap(e);
                            h.sctp.push(t)
                        })
                    }
                    return d
                }, n.toCandidateJSON = function(e) {
                    var t = i.candidate(e.split("\r\n")[0]);
                    return t.id = (r++).toString(36).substr(0, 12), t
                }
            }, {
                "./parsers": 26,
                "./senders": 25
            }
        ],
        26: [
            function(e, t, n) {
                n.lines = function(e) {
                    return e.split("\r\n").filter(function(e) {
                        return e.length > 0
                    })
                }, n.findLine = function(e, t, n) {
                    for (var o = e.length, i = 0; i < t.length; i++)
                        if (t[i].substr(0, o) === e) return t[i];
                    if (!n) return !1;
                    for (var r = 0; r < n.length; r++)
                        if (n[r].substr(0, o) === e) return n[r];
                    return !1
                }, n.findLines = function(e, t, n) {
                    for (var o = [], i = e.length, r = 0; r < t.length; r++) t[r].substr(0, i) === e && o.push(t[r]);
                    if (o.length || !n) return o;
                    for (var a = 0; a < n.length; a++) n[a].substr(0, i) === e && o.push(n[a]);
                    return o
                }, n.mline = function(e) {
                    for (var t = e.substr(2).split(" "), n = {
                            media: t[0],
                            port: t[1],
                            proto: t[2],
                            formats: []
                        }, o = 3; o < t.length; o++) t[o] && n.formats.push(t[o]);
                    return n
                }, n.rtpmap = function(e) {
                    var t = e.substr(9).split(" "),
                        n = {
                            id: t.shift()
                        };
                    return t = t[0].split("/"), n.name = t[0], n.clockrate = t[1], n.channels = 3 == t.length ? t[2] : "1", n
                }, n.sctpmap = function(e) {
                    var t = e.substr(10).split(" "),
                        n = {
                            number: t.shift(),
                            protocol: t.shift(),
                            streams: t.shift()
                        };
                    return n
                }, n.fmtp = function(e) {
                    for (var t, n, o, i = e.substr(e.indexOf(" ") + 1).split(";"), r = [], a = 0; a < i.length; a++) t = i[a].split("="), n = t[0].trim(), o = t[1], n && o ? r.push({
                        key: n,
                        value: o
                    }) : n && r.push({
                        key: "",
                        value: n
                    });
                    return r
                }, n.crypto = function(e) {
                    var t = e.substr(9).split(" "),
                        n = {
                            tag: t[0],
                            cipherSuite: t[1],
                            keyParams: t[2],
                            sessionParams: t.slice(3).join(" ")
                        };
                    return n
                }, n.fingerprint = function(e) {
                    var t = e.substr(14).split(" ");
                    return {
                        hash: t[0],
                        value: t[1]
                    }
                }, n.extmap = function(e) {
                    var t = e.substr(9).split(" "),
                        n = {}, o = t.shift(),
                        i = o.indexOf("/");
                    return i >= 0 ? (n.id = o.substr(0, i), n.senders = o.substr(i + 1)) : (n.id = o, n.senders = "sendrecv"), n.uri = t.shift() || "", n
                }, n.rtcpfb = function(e) {
                    var t = e.substr(10).split(" "),
                        n = {};
                    return n.id = t.shift(), n.type = t.shift(), "trr-int" === n.type ? n.value = t.shift() : n.subtype = t.shift() || "", n.parameters = t, n
                }, n.candidate = function(e) {
                    var t;
                    t = 0 === e.indexOf("a=candidate:") ? e.substring(12).split(" ") : e.substring(10).split(" ");
                    for (var n = {
                        foundation: t[0],
                        component: t[1],
                        protocol: t[2].toLowerCase(),
                        priority: t[3],
                        ip: t[4],
                        port: t[5],
                        type: t[7],
                        generation: "0"
                    }, o = 8; o < t.length; o += 2) "raddr" === t[o] ? n.relAddr = t[o + 1] : "rport" === t[o] ? n.relPort = t[o + 1] : "generation" === t[o] ? n.generation = t[o + 1] : "tcptype" === t[o] && (n.tcpType = t[o + 1]);
                    return n.network = "1", n
                }, n.sourceGroups = function(e) {
                    for (var t = [], n = 0; n < e.length; n++) {
                        var o = e[n].substr(13).split(" ");
                        t.push({
                            semantics: o.shift(),
                            sources: o
                        })
                    }
                    return t
                }, n.sources = function(e) {
                    for (var t = [], n = {}, o = 0; o < e.length; o++) {
                        var i = e[o].substr(7).split(" "),
                            r = i.shift();
                        if (!n[r]) {
                            var a = {
                                ssrc: r,
                                parameters: []
                            };
                            t.push(a), n[r] = a
                        }
                        i = i.join(" ").split(":");
                        var s = i.shift(),
                            c = i.join(":") || null;
                        n[r].parameters.push({
                            key: s,
                            value: c
                        })
                    }
                    return t
                }, n.groups = function(e) {
                    for (var t, n = [], o = 0; o < e.length; o++) t = e[o].substr(8).split(" "), n.push({
                        semantics: t.shift(),
                        contents: t
                    });
                    return n
                }, n.bandwidth = function(e) {
                    var t = e.substr(2).split(":"),
                        n = {};
                    return n.type = t.shift(), n.bandwidth = t.shift(), n
                }
            }, {}
        ],
        25: [
            function(e, t) {
                t.exports = {
                    initiator: {
                        incoming: {
                            initiator: "recvonly",
                            responder: "sendonly",
                            both: "sendrecv",
                            none: "inactive",
                            recvonly: "initiator",
                            sendonly: "responder",
                            sendrecv: "both",
                            inactive: "none"
                        },
                        outgoing: {
                            initiator: "sendonly",
                            responder: "recvonly",
                            both: "sendrecv",
                            none: "inactive",
                            recvonly: "responder",
                            sendonly: "initiator",
                            sendrecv: "both",
                            inactive: "none"
                        }
                    },
                    responder: {
                        incoming: {
                            initiator: "sendonly",
                            responder: "recvonly",
                            both: "sendrecv",
                            none: "inactive",
                            recvonly: "responder",
                            sendonly: "initiator",
                            sendrecv: "both",
                            inactive: "none"
                        },
                        outgoing: {
                            initiator: "recvonly",
                            responder: "sendonly",
                            both: "sendrecv",
                            none: "inactive",
                            recvonly: "initiator",
                            sendonly: "responder",
                            sendrecv: "both",
                            inactive: "none"
                        }
                    }
                }
            }, {}
        ],
        24: [
            function(e, t) {
                function n(e) {
                    return {
                        type: e.type,
                        sdp: e.sdp
                    }
                }

                function o(e) {
                    var t = {
                        label: e.id
                    };
                    return e.getAudioTracks().length && (t.audio = e.getAudioTracks().map(function(e) {
                        return e.id
                    })), e.getVideoTracks().length && (t.video = e.getVideoTracks().map(function(e) {
                        return e.id
                    })), t
                }

                function i(e, t) {
                    var n = this;
                    s.call(this), this.peerconnection = new a.PeerConnection(e, t), this.trace = function(e, t) {
                        n.emit("PeerConnectionTrace", {
                            time: new Date,
                            type: e,
                            value: t || ""
                        })
                    }, this.onicecandidate = null, this.peerconnection.onicecandidate = function(e) {
                        n.trace("onicecandidate", e.candidate), null !== n.onicecandidate && n.onicecandidate(e)
                    }, this.onaddstream = null, this.peerconnection.onaddstream = function(e) {
                        n.trace("onaddstream", o(e.stream)), null !== n.onaddstream && n.onaddstream(e)
                    }, this.onremovestream = null, this.peerconnection.onremovestream = function(e) {
                        n.trace("onremovestream", o(e.stream)), null !== n.onremovestream && n.onremovestream(e)
                    }, this.onsignalingstatechange = null, this.peerconnection.onsignalingstatechange = function(e) {
                        n.trace("onsignalingstatechange", n.signalingState), null !== n.onsignalingstatechange && n.onsignalingstatechange(e)
                    }, this.oniceconnectionstatechange = null, this.peerconnection.oniceconnectionstatechange = function(e) {
                        n.trace("oniceconnectionstatechange", n.iceConnectionState), null !== n.oniceconnectionstatechange && n.oniceconnectionstatechange(e)
                    }, this.onnegotiationneeded = null, this.peerconnection.onnegotiationneeded = function(e) {
                        n.trace("onnegotiationneeded"), null !== n.onnegotiationneeded && n.onnegotiationneeded(e)
                    }, n.ondatachannel = null, this.peerconnection.ondatachannel = function(e) {
                        n.trace("ondatachannel", e), null !== n.ondatachannel && n.ondatachannel(e)
                    }, this.getLocalStreams = this.peerconnection.getLocalStreams.bind(this.peerconnection), this.getRemoteStreams = this.peerconnection.getRemoteStreams.bind(this.peerconnection)
                }
                var r = e("util"),
                    a = e("webrtcsupport"),
                    s = e("wildemitter");
                r.inherits(i, s), Object.defineProperty(i.prototype, "signalingState", {
                    get: function() {
                        return this.peerconnection.signalingState
                    }
                }), Object.defineProperty(i.prototype, "iceConnectionState", {
                    get: function() {
                        return this.peerconnection.iceConnectionState
                    }
                }), Object.defineProperty(i.prototype, "localDescription", {
                    get: function() {
                        return this.peerconnection.localDescription
                    }
                }), Object.defineProperty(i.prototype, "remoteDescription", {
                    get: function() {
                        return this.peerconnection.remoteDescription
                    }
                }), i.prototype.addStream = function(e) {
                    this.trace("addStream", o(e)), this.peerconnection.addStream(e)
                }, i.prototype.removeStream = function(e) {
                    this.trace("removeStream", o(e)), this.peerconnection.removeStream(e)
                }, i.prototype.createDataChannel = function(e, t) {
                    return this.trace("createDataChannel", e, t), this.peerconnection.createDataChannel(e, t)
                }, i.prototype.setLocalDescription = function(e, t, o) {
                    var i = this;
                    this.trace("setLocalDescription", n(e)), this.peerconnection.setLocalDescription(e, function() {
                        i.trace("setLocalDescriptionOnSuccess"), t()
                    }, function(e) {
                        i.trace("setLocalDescriptionOnFailure", e), o(e)
                    })
                }, i.prototype.setRemoteDescription = function(e, t, o) {
                    var i = this;
                    this.trace("setRemoteDescription", n(e)), this.peerconnection.setRemoteDescription(e, function() {
                        i.trace("setRemoteDescriptionOnSuccess"), t()
                    }, function(e) {
                        i.trace("setRemoteDescriptionOnFailure", e), o(e)
                    })
                }, i.prototype.close = function() {
                    this.trace("stop"), null !== this.statsinterval && (window.clearInterval(this.statsinterval), this.statsinterval = null), "closed" != this.peerconnection.signalingState && this.peerconnection.close()
                }, i.prototype.createOffer = function(e, t, o) {
                    var i = this;
                    this.trace("createOffer", o), this.peerconnection.createOffer(function(t) {
                        i.trace("createOfferOnSuccess", n(t)), e(t)
                    }, function(e) {
                        i.trace("createOfferOnFailure", e), t(e)
                    }, o)
                }, i.prototype.createAnswer = function(e, t, o) {
                    var i = this;
                    this.trace("createAnswer", o), this.peerconnection.createAnswer(function(t) {
                        i.trace("createAnswerOnSuccess", n(t)), e(t)
                    }, function(e) {
                        i.trace("createAnswerOnFailure", e), t(e)
                    }, o)
                }, i.prototype.addIceCandidate = function(e, t, n) {
                    var o = this;
                    this.trace("addIceCandidate", e), this.peerconnection.addIceCandidate(e, function() {
                        t && t()
                    }, function(e) {
                        o.trace("addIceCandidateOnFailure", e), n && n(e)
                    })
                }, i.prototype.getStats = function(e, t) {
                    navigator.mozGetUserMedia ? this.peerconnection.getStats(null, e, t) : this.peerconnection.getStats(e)
                }, t.exports = i
            }, {
                util: 9,
                webrtcsupport: 5,
                wildemitter: 3
            }
        ]
    }, {}, [1])(1)
});
