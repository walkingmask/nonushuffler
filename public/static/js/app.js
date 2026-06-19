const DIC_URL = "/static/dict/";

var tokenizer = null;
var tokens = [];
var stopWords = [];
var inputText = "";
var shuffledText = "";
var finish = false;

var titleEl = document.getElementById("title");
var loadingMessageAreaEl = document.getElementById("loadingMessageArea");
var loadingMessageEl = document.getElementById("loadingMessage");
var inputAreaEl = document.getElementById("inputArea");
var inputTextEl = document.getElementById("inputText");
var stopWordsEl = document.getElementById("stopWords");
var tokenizeButtonEl = document.getElementById("tokenizeButton");
var outputAreaEl = document.getElementById("outputArea");
var outputTextEl = document.getElementById("outputText");
var copyButtonEl = document.getElementById("copyButton");
var backButtonEl = document.getElementById("backButton");

// Start building kuromoji tokenizer
kuromoji.builder({ dicPath: DIC_URL }).build(function (error, _tokenizer) {
    if (error != null) {
        console.log(error);
    }
    tokenizer = _tokenizer;
});

// Shuffle title
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
(function shuffleTitle() {
    setTimeout(() => {
        titleEl.innerHTML = titleEl.innerText[0] == "名" ? "シャッフラー名詞" : "名詞シャッフラー";
        shuffleTitle();
    }, getRandomInt(10)*1000);
})();

// Wait loading
(function waitLoadingTokenizer() {
    let waitLoop = setInterval(() => {
        loadingMessageEl.innerText += '.';
        if (tokenizer) {
            loadingMessageAreaEl.style.display = "none";
            inputAreaEl.style.display = "";
            clearInterval(waitLoop);
        }
    }, 1000);
})();

// Auto resize textarea
inputTextEl.addEventListener("keyup", (e) => {
    inputTextEl.style.cssText = 'height:' + inputTextEl.scrollHeight + 'px';
});
inputTextEl.addEventListener("input", (e) => {
    inputTextEl.style.cssText = 'height:' + inputTextEl.scrollHeight + 'px';
});

// Setup cpoy button
copyButtonEl.addEventListener("click", () => {
    outputTextEl.select();
    document.execCommand("copy");
});

// Setup back tutton
backButtonEl.addEventListener("click", () => {
    outputArea.style.display = "none";
    inputArea.style.display = "";
});

// Kuromoji tokenizer
function tokenize() {
    return new Promise((resolve, reject) => {
        if (inputText == "" || tokenizer == null) {
            tokens = [];
            reject();
            return;
        }

        try {
            tokens = tokenizer.tokenize(inputText);
            resolve();
        }
        catch (e) {
            console.log(e);
            tokens = [];
            reject();
        }
    });
}

// Filtering nonu or not
function nonuFilter() {
    return new Promise(resolve => {
        let head = tokens[0].pos == "名詞" ? "nonus" : "others";

        let nonus = [];
        let others = [];
        let nonuBuffer = "";
        let otherBuffer = "";

        for (let token in tokens) {
            let pos = tokens[token].pos;
            let surface = tokens[token].surface_form;

            if (pos == "名詞" && ! stopWords.includes(surface)) {
                if (otherBuffer.length > 0) {
                    others.push(otherBuffer);
                    otherBuffer = "";
                }
                nonuBuffer += surface;
            }
            else {
                if (nonuBuffer.length > 0) {
                    nonus.push(nonuBuffer);
                    nonuBuffer = "";
                }
                otherBuffer += surface;
            }
        }

        if (nonuBuffer.length > 0) nonus.push(nonuBuffer);
        if (otherBuffer.length > 0) others.push(otherBuffer);

        resolve({"head": head, "nonus": nonus, "others": others});
    });
}

// Shuffle nonus array
function shuffleNonus(wordsDict) {
    return new Promise(resolve => {
        let nonus = wordsDict["nonus"];
        for(let i = nonus.length - 1; i > 0; i--){
            let r = Math.floor(Math.random() * (i + 1));
            let tmp = nonus[i];
            nonus[i] = nonus[r];
            nonus[r] = tmp;
        }
        wordsDict["nonus"] = nonus;
        resolve(wordsDict);
    });
}

// Rejoin nouns and others to single string
function rebuildText(wordsDict) {
    return new Promise(resolve => {
        let head = wordsDict["head"];
        let nonus = wordsDict["nonus"];
        let others = wordsDict["others"];

        let leader = head == "nonus" ? nonus : others;
        let follower = head == "nonus" ? others : nonus;

        shuffledText = "";

        for (let word in leader) {
            shuffledText += leader[word];
            if (follower[word]) shuffledText += follower[word];
        }
        resolve();
    });
}

// Main
async function run() {
    await tokenize();
    let wordsDict = await nonuFilter();
    wordsDict = await shuffleNonus(wordsDict);
    await rebuildText(wordsDict);
    finish = true;
}

// Waiting run
function waitRun() {
    return new Promise(resolve => {
        let waitLoop = setInterval(() => {
            if (finish) {
                clearInterval(waitLoop);
                resolve();
            }
        }, 10);
    });
}

function getInputText() {
    return new Promise(resolve => {
        inputText = inputTextEl.value;
        resolve();
    });
}

function getStopWords() {
    return new Promise (resolve => {
        stopWords = stopWordsEl.value;
        stopWords = stopWords.split(",");
        resolve();
    });
}

function setOutputText() {
    return new Promise(resolve => {
        outputTextEl.value = shuffledText;
        resolve();
    });
}

// Start run
tokenizeButtonEl.addEventListener("click", async (e) => {
    await getInputText();
    await getStopWords();
    finish = false;
    run();
    await waitRun();
    setOutputText();
    inputAreaEl.style.display = "none";
    outputAreaEl.style.display = "";
    outputTextEl.style.cssText = 'height:' + outputTextEl.scrollHeight + 'px';
});
