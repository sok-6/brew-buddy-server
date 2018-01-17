
var socket;
var cookieName = "123";

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
            socket.emit("session.join", { name: getCookie("name"), sessionToken: sessionToken });
        }
    });

    socket.on("session.new.response", (data) => {
        console.log("created session " + data.sessionToken);

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
}

let initiateConnectionCheck = () => {
    socket.emit("connection.check");
}

let addFeedStatus = (message) => {
    let newElement = $("<div>").addClass("feed-element").append($("<i>").text(message));
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

$(document).ready(() => {
    // Set up display name modal behaviour
    $('#modal_name').modal({
        dismissible: false,
        complete: () => {
            openConnection();
        }
    });

    // Check if display name has already been set
    let cookieName = getCookie("name");
    if (cookieName === "") {
        $("#modal_name").modal("open");
    } else {
        openConnection();
    }
});