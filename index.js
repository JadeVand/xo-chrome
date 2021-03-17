
window.addEventListener('DOMContentLoaded', (event) => {
//

    function move(yposition, xposition, xo) {
        //120 == x
        //111 == o
        var e = null;
        let tiles = document.getElementsByClassName("xofieldtile");
        for (var index = 0; index < tiles.length; ++index) {
            if (parseInt(tiles[index].getAttribute("y"), 10) == yposition &&
                parseInt(tiles[index].getAttribute("x"), 10) == xposition) {
                e = tiles[index];
                break;
            }
        }

        if (xo == 120) {
            //draw x
            let cross = document.createElement("div");
            cross.classList.add("tileCross");
            e.appendChild(cross);

        } else {
            //draw o
            let cross = document.createElement("div");
            cross.classList.add("tileCircle");
            e.appendChild(cross);
        }
    }

    let wss = new WebSocket("wss://cynosure.pw:8070");
    wss.onopen = function () {}
    wss.onmessage = function (message) {
        let packet = JSON.parse(message.data);
        packethandler(packet);
    }

    function tileclicked(element) {
        let y = element.target.getAttribute("y");
        let x = element.target.getAttribute("x");
        wss.send(JSON.stringify({
            packetid: "move",
            yposition: parseInt(y, 10),
            xposition: parseInt(x, 10)
        }));
    }

    function initgame() {
        let tiles = document.getElementsByClassName("xofieldtile");
        for (var index = 0; index < tiles.length; ++index) {
            while (tiles[index].lastChild) {
                tiles[index].removeChild(tiles[index].lastChild);
            }

            tiles[index].addEventListener("click", tileclicked);
        }
        document.getElementById("state").textContent = "Turn:";
    }
    var id = null;

    function packethandler(packet) {
        switch (packet.packetid) {
            case "id": {
                id = packet.userid;
            }
            break;
        case "liveplayers": {
            liveplayers = packet.count;
            document.getElementById("playercount").textContent = "Players online: " +liveplayers;
        }
        break;
        case "ingame": {
            initgame();
            let nextplayerturn = packet.nextplayerturn;
            if (id == nextplayerturn) {
                //my turn
                document.getElementById("state").textContent = "Turn: Yours";
            } else {
                //apponent turn
                document.getElementById("state").textContent = "Turn: Apponent";
            }
        }
        break;
        case "move": {
            let yposition = packet.yposition;
            let xposition = packet.xposition;
            let xo = packet.xo;

            move(yposition, xposition, xo);
            let nextplayerturn = packet.nextplayerturn;
            if (id == nextplayerturn) {
                //my turn
                document.getElementById("state").textContent = "Turn: Yours";
            } else {
                //apponent turn
                document.getElementById("state").textContent = "Turn: Apponent";
            }
            if (packet.winner == "true") {
                //game over
                //display results

                let winnerid = packet.winnerid;
                if (id == winnerid) {
                    //you won
                    document.getElementById("state").textContent = "Winner!";
                } else {
                    //apponent won
                    document.getElementById("state").textContent = "Loser!";
                }

                setTimeout(() => {
                    wss.send(JSON.stringify({packetid:"rejoin"}));
                }, 3000);
            }else if(packet.winner == "draw"){
                document.getElementById("state").textContent = "Draw!";
                setTimeout(() => {
                    wss.send(JSON.stringify({packetid:"rejoin"}));
                }, 3000);
            }
        }
        }
    }
});