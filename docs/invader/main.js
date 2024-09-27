title = "INVADER";

description = `
[f] AIM [j] FIRE
`;

characters = [
  `

  

  
  ll
`,
  `
  
  
  ll
  
  ll
`,
  `
  ll
  
  ll
  
  ll
`,
];

const G = {
  WIDTH: 96,
  HEIGHT: 37,
  DIGITS: 6,
  TICKS: 120,
  DISP_Y: 26
}

options = {
  viewSize: { x: G.WIDTH, y: G.HEIGHT },
  isPlayingBgm: true,
  audioSeed: 3
};

let digits; 
let addTicks;
let currentNum;
let zanki;
let messageTicks; 
let previousNum; 
let ufoFlag;
let missileNum;
let stage; 
let messageStatus;
let invaders;

function stageInit() {
  messageStatus = "StageStart";
  digits = [];
  addTicks = 0;
  currentNum = 0;
  previousNum = 0;
  invaders = 0;
  ufoFlag = false;
  messageTicks = G.TICKS;
  missileNum = stage.missileNum();  
}

function gameInit() {
  stage = new Stage(1,1);
  zanki = 3;
}

function update() {
  if (ticks === 0) {
    gameInit();
    stageInit();
  }
  displayStats();

  if (messageStatus) {
    showMessage();
    return;
  }

  addTicks--;
  if (addTicks < 0) {
    if (ufoFlag) {
      digits.push(10);
      ufoFlag = false;
    } else {
      digits.push(rndi(1, 10));
    }
    addTicks = stage.ticks();
  }
  
  let p = vec((G.DIGITS-2) * 6 , G.DISP_Y);
  color("black");

  if (currentNum < 10) {
    text(currentNum.toString(), p);
  } else {
    text("n", p);
  }

  p = vec((G.DIGITS-1) * 6 , G.DISP_Y);
  char(String.fromCharCode("a".charCodeAt(0) + zanki - 1), p);

  if (keyboard.code['KeyF'].isJustPressed || (input.isJustPressed && input.pos.x < (G.WIDTH/2))) {
    if (currentNum == 10) {
      currentNum = 0;
    } else {
      currentNum++;
    }
  } else if (keyboard.code['KeyJ'].isJustPressed || (input.isJustPressed && input.pos.x > (G.WIDTH/2))) {
    let index = digits.indexOf(Number(currentNum));
    missileNum--;

    if (missileNum == -1) {
      play("lucky");
      end();
      return;
    }

    if (index !== -1) {
      play("click");
      if (previousNum !== 10 && currentNum !== 10) {
        if (previousNum + currentNum === 10) {
          ufoFlag = true;
        }
      }
      
      p = vec((G.DIGITS-1) * 6 , G.DISP_Y);
      if (currentNum === 10) {
        addScore(300, p);
      } else {
        let base = 10 * (6-digits.length) + 10;
        addScore(base + 10 * index, p);
      }

      previousNum = currentNum;
      digits.splice(index, 1);

      invaders++;
      if (invaders >= stage.invaderNum()) {
        play("random");
        messageStatus = "StageClear";
      }
    } else {
      play("laser");
    }
  }

  digits.forEach((d, i) => {
    let p = vec(G.WIDTH - (G.DIGITS - 2) * 6 - (digits.length - i) * 6, G.DISP_Y);
    color("black");
    if (d === 10) {
      text("n", p);
    } else {
      text(d.toString(), p);
    }
  });

  if (digits.length >= G.DIGITS + 1 && messageStatus != "Invaded") {
    play("explosion");
    zanki--;
    if (zanki == 0) {
      end();
      return;
    }
    messageStatus = "Invaded";
  }
}

function displayMessage(msg) {
  color("black");
  text(msg, (G.WIDTH - msg.length * 6)/2, G.DISP_Y - 6);
}

function displayStats() {
  color("black");
  let msg = stage.invaderNum() - invaders + "/" + missileNum.toString();
  text(msg, (G.WIDTH - msg.length * 6) , G.DISP_Y + 7 );  
}

function showMessage() {
  messageTicks -= 1;  

  if (messageTicks < 0) {
    switch (messageStatus) {
    case "StageStart":
      break;
    
    case "StageClear":
      stage.stage++;
      if (stage.stage > 6) {
        if (stage.round === 2) {
          messageTicks = G.TICKS;
          messageStatus = "Complete"; 
          displayMessage("Completed");
          return
        } else {
          stage.stage = 1;
          stage.round++;
        }
      }
      stageInit();
      return;
    
    case "Invaded":
      digits = [];
      break;
            
    case "Complete":
      end();
      gameInit();
      stageInit();
      return;
    }
    messageStatus = null;
    messageTicks = G.TICKS;
  } else {
    switch (messageStatus) {
      case "StageStart":
        displayMessage("Stage" + stage.round.toString() + "-" + stage.stage.toString());
        break;
      case "Complete":
        displayMessage("All Stages clear");
        break;
      case "StageClear":
        displayMessage("Stage" + stage.round.toString() + "-" + stage.stage.toString() + " clear");
        break;
      case "Invaded":
        displayMessage("Invaded!");
        break;
    }
  }
}

class Stage {
  constructor(stage, round) {
    this.stage = stage;
    this.round = round;
    // invaders, missiles, ticks
    this._condition =  [[16, 30, 90], [20, 30, 80], [25, 35, 75], [30, 40, 60], [40, 50, 50], [50, 55, 45]];
  }
 
  invaderNum() {
    return this._condition[this.stage-1][0];
  }

  missileNum() {
    return this._condition[this.stage-1][1];   
  }

  ticks() {
    return floor(this._condition[this.stage-1][2] / (this.round === 1 ? 1 : 1.5)); 
  }

}
