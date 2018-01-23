
var socket;
var cookieName = Math.floor(Math.random() * 1000).toString();
var sessionToken = "";

var gameStart = () => {};
var gameUpdate = () => {};

let getCookie = (cname) => {
    // var name = cname + "=";
    // var decodedCookie = decodeURIComponent(document.cookie);
    // var ca = decodedCookie.split(';');
    // for (var i = 0; i < ca.length; i++) {
    //   var c = ca[i];
    //   while (c.charAt(0) == ' ') {
    //     c = c.substring(1);
    //   }
    //   if (c.indexOf(name) == 0) {
    //     return c.substring(name.length, c.length);
    //   }
    // }
    // return "";
    return cookieName;
};

let setCookie = (cname, cvalue) => {
    // document.cookie = cname + "=" + cvalue;
    cookieName = cvalue;
};

let hashInner = (s) => {
    let hash = 17;
    for (let i = 0; i < s.length; i++) {
        hash = (hash * 23) + s.charCodeAt(i);
    }
    return hash;
}

let generateHashFunction = (token) => (s) => hashInner(token + s);

let setDisplayName = (displayName) => {
    setCookie("name", displayName);
};

let acceptModal = () => {
    let chosenName = $("#modal_name_input").val();
    setDisplayName(chosenName);
};

let openConnection = () => {
    socket = new io();

    // Set up event listeners
    socket.on("connect", () => {
        console.log(socket.id);

        // Create new session or join existing one
        let sessionToken = window.location.pathname.slice(1)

        if (sessionToken === "") {
            socket.emit("session.new", { name: getCookie("name") });
        } else {
            sessionToken = sessionToken;
            socket.emit("session.join", { name: getCookie("name"), sessionToken: sessionToken });
        }
    });

    socket.on("session.new.response", (data) => {
        console.log("created session " + data.sessionToken);
        sessionToken = data.sessionToken;

        // Set host controls to be visible
        $("#host-controls").removeClass("hidden");

        // Add join link
        let joinUrl = window.location.href.replace(window.location.path, "") + data.sessionToken;
        $("#join-link").val(joinUrl);
    })

    socket.on("session.join.response", (data) => {
        let message = `joined session, host:${data.hostName}`;
        console.log(message);

        // Remove host controls
        $("#host-controls").remove();

        addFeedStatus(message);
    })

    socket.on("session.close", () => {
        console.log("session.close");
        socket.close();
        socket = null;
    })

    socket.on("connection.check", (data) => {
        console.log(`Connection check initiated by ${data.initiatedById}`);
    })

    socket.on("feed.add.status", (data) => {
        console.log("feed.add.status");
        addFeedStatus(data.message);
    })

    socket.on("feed.add.chat", (data) => {
        console.log("feed.add.chat");
        addFeedChat(data.senderName, data.senderIsHost, data.message);
    })

    socket.on("game.initialise", (data) => {
        console.log("game.initialise");
        console.log(`- type:${data.type}`);

        let game = {};
        switch (data.type) {
            case "horses":
                game = horsesGame(generateHashFunction(sessionToken), data);
                break;
        
            default:
                break;
        }

        gameStart = game.gameStart;
        gameUpdate = game.gameUpdate;
    })

    socket.on("game.start", (data) => {
        console.log("game.start");
        gameStart(data);
    })

    socket.on("game.update", (data) => {
        console.log("game.update");
        gameUpdate(data);
    })
}

let initiateConnectionCheck = () => {
    socket.emit("connection.check");
}

let addFeedStatus = (message) => {
    let newElement = $("<div>").addClass("feed-element").append($("<i>").text(message));
    $("#feed-body").append(newElement);
}

let addFeedChat = (senderName, senderIsHost, message) => {
    let newElement = $("<div>").addClass("feed-element");
    newElement.append($("<b>").text(senderName + (senderIsHost ? " (Host)" : "") + ": "));
    newElement.append(document.createTextNode(message));
    $("#feed-body").append(newElement);
}

let copyJoinLinkToClipboard = () => {
    $("#join-link").prop("disabled", false);
    document.querySelector('#join-link').select();
    document.execCommand("copy");
    $("#join-link").prop("disabled", true);
}

let openJoinLinkInNewWindow = () => {
    window.open($("#join-link").val(), "");
}

let sendChatMessage = (message) => {
    socket.emit("chat.send", { message: message });
}

$(document).ready(() => {
    // Set up display name modal behaviour
    $('#modal_name').modal({
        dismissible: false,
        complete: () => {
            openConnection();
        }
    });

    // Set up chat submit behaviour
    $("#feed-chat-input").keypress((e) => {
        if (e.which == 10 || e.which == 13) {
            console.log($("#feed-chat-input").val());
            sendChatMessage($("#feed-chat-input").val());
            $("#feed-chat-input").val("");
        }
    })

    // Set up game start button
    $("#begin-game").click(() => {
        socket.emit("game.start", { 
            gameType: "horses" 
        });
    });

    // Check if display name has already been set
    let cookieName = getCookie("name");
    if (cookieName === "") {
        $("#modal_name").modal("open");
    } else {
        openConnection();
    }

    let s = Snap("#game-div");
    s.clear();
    s.text(s.node.clientWidth / 2, 100, "Waiting for host to begin game...");
});