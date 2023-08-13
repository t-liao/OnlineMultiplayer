const mapData = {
    minX: 1,
    maxX: 19,
    minY: 1,
    maxY: 14,
    blockedSpaces: {
        //shop
        "1x1": true, "1x2": true, "1x3": true, "2x1": true, "2x2": true, "2x3": true, 
        "3x1": true, "3x2": true, "3x3": true, "4x1": true, "4x2": true, "4x3": true,
        "5x1": true, "5x2": true, "5x3": true, "6x1": true, "6x2": true, "6x3": true,

        // middle bench
        "9x2": true, "10x2": true, "11x2": true,

        //right bench
        "15x3": true, "16x3": true, "17x3": true,

        //pond
        "7x6": true, "8x6": true, "9x6": true, "10x6": true, "11x6": true, 

        "5x7": true, "6x7": true, "7x7": true, "8x7": true, "9x7": true, 
        "10x7": true, "11x7": true, "12x7": true, "13x7": true, 

        "4x8": true, "5x8": true, "6x8": true, "7x8": true, "8x8": true, "9x8": true, 
        "10x8": true, "11x8": true, "12x8": true, "13x8": true, "14x8": true, "15x8": true, 

        "3x9": true, "4x9": true, "5x9": true, "6x9": true, "7x9": true, "8x9": true, "9x9": true, 
        "10x9": true, "11x9": true, "12x9": true, "13x9": true, "14x9": true, "15x9": true, "16x9": true, 

        "3x10": true, "4x10": true, "5x10": true, "6x10": true, "7x10": true, "8x10": true, "9x10": true, 
        "10x10": true, "11x10": true, "12x10": true, "13x10": true, "14x10": true, "15x10": true, "16x10": true, 

        "4x11": true, "5x11": true, "6x11": true, "7x11": true, "8x11": true, "9x11": true, 
        "10x11": true, "11x11": true, "12x11": true, "13x11": true, "14x11": true, "15x11": true,

        "6x12": true, "7x12": true, "8x12": true, "9x12": true, 
        "10x12": true, "11x12": true, "12x12": true,
    },
};

function isSolid(x,y) {

    const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];
    return (
      blockedNextSpace ||
      x >= mapData.maxX ||
      x < mapData.minX ||
      y >= mapData.maxY ||
      y < mapData.minY  
    )
}

function getRandomSafeSpot() {
    
    randx = Math.floor(Math.random() * (mapData.maxX - mapData.minX + 1)) + mapData.minX;
    randy = Math.floor(Math.random() * (mapData.maxY - mapData.minY + 1)) + mapData.minY;

    if (!isSolid(randx,randy)) {
        return {x: randx, y: randy};
    } 
    return getRandomSafeSpot();
}

function getRandomBobberSafeSpot() {
    const minBX = 3;
    const maxBX = 17;
    const minBY = 6;
    const maxBY = 12;
    randx = Math.floor(Math.random() * (maxBX - minBX + 1)) + minBX;
    randy = Math.floor(Math.random() * (maxBY -minBY + 1)) + minBY;

    if (isSolid(randx,randy)) {
        return {xBob: randx, yBob: randy};
    } 
    return getRandomBobberSafeSpot();
}

// Options for Player Colors... these are in the same order as our sprite sheet
const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];

function createName() {
    const prefix = randomFromArray([
      "COOL",
      "SUPER",
      "HIP",
      "SMUG",
      "COOL",
      "SILKY",
      "GOOD",
      "SAFE",
      "DEAR",
      "WARM",
      "RICH",
      "LONG",
      "DARK",
      "SOFT",
      "BUFF",
      "DOPE",
    ]);
    const animal = randomFromArray([
      "BEAR",
      "DOG",
      "CAT",
      "FOX",
      "LAMB",
      "LION",
      "BOAR",
      "GOAT",
      "ANT",
      "SEAL",
      "PUMA",
      "MULE",
      "BULL",
      "BIRD",
      "BUG",
    ]);
    return `${prefix} ${animal}`;
}

//Misc Helpers
function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function getKeyString(x, y) {
    return `${x}x${y}`;
}
// function that executes when the game is opened
(function () {

    let playerId;
    let playerRef;
    let players = {};
    let playerElements = {};
    let playerBobberElements = {};
    let coins = {};
    let coinElements = {};

    const gameContainer = document.querySelector(".game-container");
    const playerNameInput = document.querySelector("#player-name");
    const playerColorButton = document.querySelector("#player-color");

    const upButton = document.getElementById("up key");
    const leftButton = document.getElementById("left key");
    const rightButton = document.getElementById("right key");
    const downButton = document.getElementById("down key");
    const aButton = document.getElementById("A key");

    function placeCoin() {
        const { x, y } = getRandomSafeSpot();
        const coinRef = firebase.database().ref(`coins/${getKeyString(x, y)}`);
        coinRef.set({
          x,
          y,
        })
    
        const coinTimeouts = [2000, 3000, 4000, 5000];
        setTimeout(() => {
          placeCoin();
        }, randomFromArray(coinTimeouts));
    }

    function attemptGrabCoin(x, y) {
        const key = getKeyString(x, y);
        if (coins[key]) {
          // Remove this key from data, then uptick Player's coin count
          firebase.database().ref(`coins/${key}`).remove();
          playerRef.update({
            coins: players[playerId].coins + 1,
          })
        }
    }

    function handleArrowPress(xChange=0, yChange=0) {
        const newX = players[playerId].x + xChange;
        const newY = players[playerId].y + yChange;
        if (!isSolid(newX, newY)) {
          //move to the next space
          players[playerId].x = newX;
          players[playerId].y = newY;
          if (xChange === 1) {
            players[playerId].direction = "right";
          }
          if (xChange === -1) {
            players[playerId].direction = "left";
          }
          playerRef.set(players[playerId]);
          
          if (!players[playerId].rod){
            playerRef.update({
                xBob: players[playerId].x,
                yBob: players[playerId].y,
            })
          }
          
          attemptGrabCoin(newX, newY);
        }
    }

    function handleRod() {
        let {xBob, yBob} = getRandomBobberSafeSpot();
    
        if (players[playerId].rod){
            xBob = players[playerId].x;
            yBob = players[playerId].y;
            
        }

        playerRef.update({
            rod: !players[playerId].rod,
            xBob,
            yBob,
        })
    }

    function initGame() {
        
        new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1))
        new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1))
        new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0))
        new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0))
        new KeyPressListener("KeyA", () => handleRod())

        upButton.addEventListener("click", () => handleArrowPress(0, -1))
        leftButton.addEventListener("click", () => handleArrowPress(-1, 0))
        rightButton.addEventListener("click", () => handleArrowPress(1, 0))
        downButton.addEventListener("click", () => handleArrowPress(0, 1))
        

        const allPlayersRef = firebase.database().ref(`players`);
        const allCoinsRef = firebase.database().ref(`coins`);
        
        
        allPlayersRef.on("value", (snapshot) => {
            //listener that sets call back whenever value of ref changes
            players = snapshot.val() || {};
            Object.keys(players).forEach((key) => {
                const characterState = players[key];
                let el = playerElements[key];
                let Bel = playerBobberElements[key];
                // Now update the DOM
                el.querySelector(".Character_name").innerText = characterState.name;
                el.querySelector(".Character_coins").innerText = characterState.coins;
                el.setAttribute("data-color", characterState.color);
                el.setAttribute("data-direction", characterState.direction);
                const left = 16 * characterState.x + "px";
                const top = 16 * characterState.y - 4 + "px";
                const leftB = (16 * characterState.xBob + 4) + "px";
                const topB = (16 * characterState.yBob + 4) + "px";
                if (characterState.rod){
                    el.querySelector(".Character_rod").style.display = 'block';
                    Bel.querySelector('.bobber').style.display = 'block';
                    Bel.querySelector(".bobber").classList.add('animate');
                } else {
                    el.querySelector(".Character_rod").style.display = 'none';
                    Bel.querySelector('.bobber').style.display = 'none';
                    Bel.querySelector(".bobber").classList.remove('animate');
                }
                Bel.style.transform = `translate3d(${leftB}, ${topB}, 0)`;
                el.style.transform = `translate3d(${left}, ${top}, 0)`;
            })

        })

        allPlayersRef.on("child_added", (snapshot) => {
            //fires when new node is added
            //new to client, (so when joining a lobby with 2 others, this will fire for the 2 instances)
            const addedPlayer = snapshot.val();
            const characterElement = document.createElement("div");
            characterElement.classList.add("Character", "grid-cell");
            if (addedPlayer.id === playerId) {
                characterElement.classList.add("you");
            }
            characterElement.innerHTML = (`
                <div class="Character_shadow grid-cell"></div>
                <div class="Character_sprite grid-cell"></div>
                <div class="Character_name-container">
                    <span class="Character_name"></span>
                    <span class="Character_coins">0</span>
                </div>
                <div class="Character_you-arrow"></div>
                <div class="Character_rod"></div>
            `);
            
            const bobberElement = document.createElement("div");
            bobberElement.innerHTML = (`
                <div class="bobber"></div>
            `);

            playerElements[addedPlayer.id] = characterElement;
            playerBobberElements[addedPlayer.id] = bobberElement;

            //Add Initial state
            characterElement.querySelector(".Character_name").innerText = addedPlayer.name;
            characterElement.querySelector(".Character_coins").innerText = addedPlayer.coins;
            characterElement.setAttribute("data-color", addedPlayer.color);
            characterElement.setAttribute("data-direction", addedPlayer.direction);
            //grid size = 16
            const left = 16 * addedPlayer.x + "px";
            const top = 16 * addedPlayer.y - 4 + "px";
            const leftB = (16 * addedPlayer.xBob + 4)  + "px";
            const topB = (16 * addedPlayer.yBob + 4 )  + "px";
            if (addedPlayer.rod){
                characterElement.querySelector(".Character_rod").style.display = 'block';
                bobberElement.querySelector('.bobber').style.display = 'block';
                bobberElement.querySelector(".bobber").classList.add('animate');
            } else if (!(addedPlayer.rod))  {
                characterElement.querySelector(".Character_rod").style.display = 'none';
                bobberElement.querySelector('.bobber').style.display = 'none';
                bobberElement.querySelector(".bobber").classList.remove('animate');
            }
            bobberElement.style.position = 'absolute';
            bobberElement.style.transition = 'transform 0.4s';
            bobberElement.style.transform = `translate3d(${leftB}, ${topB}, 0)`;

            characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;

            gameContainer.appendChild(characterElement);
            gameContainer.appendChild(bobberElement);

        })
        //Remove character DOM element after they leave
        allPlayersRef.on("child_removed", (snapshot) => {
            const removedKey = snapshot.val().id;
            gameContainer.removeChild(playerElements[removedKey]);
            delete playerElements[removedKey];
            gameContainer.removeChild(playerBobberElements[removedKey]);
            delete playerBobberElements[removedKey];
        })

    
        //This block will remove coins from local state when Firebase `coins` value updates
        allCoinsRef.on("value", (snapshot) => {
            coins = snapshot.val() || {};
        });
        //
    
        allCoinsRef.on("child_added", (snapshot) => {
            const coin = snapshot.val();
            const key = getKeyString(coin.x, coin.y);
            coins[key] = true;
    
            // Create the DOM Element
            const coinElement = document.createElement("div");
            coinElement.classList.add("Coin", "grid-cell");
            coinElement.innerHTML = `
            <div class="Coin_shadow grid-cell"></div>
            <div class="Coin_sprite grid-cell"></div>
            `;
    
            // Position the Element
            const left = 16 * coin.x + "px";
            const top = 16 * coin.y - 4 + "px";
            coinElement.style.transform = `translate3d(${left}, ${top}, 0)`;
    
            // Keep a reference for removal later and add to DOM
            coinElements[key] = coinElement;
            gameContainer.appendChild(coinElement);
        })

        allCoinsRef.on("child_removed", (snapshot) => {
            const {x,y} = snapshot.val();
            const keyToRemove = getKeyString(x,y);
            gameContainer.removeChild( coinElements[keyToRemove] );
            delete coinElements[keyToRemove];
        })
  

        //Updates player name with text input
        playerNameInput.addEventListener("change", (e) => {
            const newName = e.target.value || createName();
            playerNameInput.value = newName;
            playerRef.update({
                name: newName
            })
        })

        //Update player color on button click
        playerColorButton.addEventListener("click", () => {
            const mySkinIndex = playerColors.indexOf(players[playerId].color);
            const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
            playerRef.update({
                color: nextColor
            })
        })


        //Update player rod on button click
        aButton.addEventListener("click", () => {
            handleRod();
        })


        //Place my first coin
        //placeCoin();
    }

    firebase.auth().onAuthStateChanged((user) => {
        console.log(user)
        if(user){
            //You're logged in!
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);


            const name = createName();
            playerNameInput.value = name;
            
            const {x, y} = getRandomSafeSpot();
            

            playerRef.set({
                id: playerId,
                name,
                direction: "right",
                color: randomFromArray(playerColors),
                rod: false,
                x,
                y,
                xBob: x,
                yBob: y,
                coins: 0,
            })

            //when browser disconnect from session, we want to remove it.
            playerRef.onDisconnect().remove();

            initGame();

        } else {
            //you're logged out.
        }
    })

    firebase.auth().signInAnonymously().catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorCode, errorMessage);
      });


}) ();