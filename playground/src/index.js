import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript';
import 'monaco-editor/esm/vs/basic-languages/html/html';
import 'monaco-editor/esm/vs/basic-languages/css/css';

import {PLAY_SAMPLES} from './samples';
import './css/playground.css';

var isMac = /Mac/i.test(navigator.userAgent);

var editor = null;
var data = {
    js: {
        model: null,
        state: null
    },
    css: {
        model: null,
        state: null
    },
    html: {
        model: null,
        state: null
    }
};

var runIframe = null;
var vipsInitialized = false;

function load() {

    function layout() {
        var WIDTH = window.innerWidth;
        var HEIGHT = window.innerHeight;
        var INNER_PADDING = 15 * 2;

        var TITLE_HEIGHT = 60;
        var SWITCHER_HEIGHT = 30;
        var TABS_HEIGHT = 20;
        var FOOTER_HEIGHT = 110;

        var MIN_CONTAINER_WIDTH = 250;
        var MIN_CONTAINER_HEIGHT = 350;

        var CONTAINER_WIDTH = Math.max(MIN_CONTAINER_WIDTH, Math.floor(WIDTH / 2) - INNER_PADDING);
        var CONTAINER_HEIGHT = Math.max(MIN_CONTAINER_HEIGHT, HEIGHT - TITLE_HEIGHT - SWITCHER_HEIGHT - TABS_HEIGHT - FOOTER_HEIGHT - INNER_PADDING);

        tabArea.style.boxSizing = 'border-box';
        tabArea.style.height = TABS_HEIGHT + 'px';

        editorContainer.style.boxSizing = 'border-box';
        editorContainer.style.width = CONTAINER_WIDTH + 'px';
        editorContainer.style.height = CONTAINER_HEIGHT + 'px';

        if (editor) {
            editor.layout({
                width: CONTAINER_WIDTH - 2,
                height: CONTAINER_HEIGHT - 1
            });
        }
    }

    function changeTab(selectedTabNode, desiredModelId) {
        for (var i = 0; i < tabArea.childNodes.length; i++) {
            var child = tabArea.childNodes[i];
            if (/tab/.test(child.className)) {
                child.className = 'tab';
            }
        }
        selectedTabNode.className = 'tab active';

        var currentState = editor.saveViewState();

        var currentModel = editor.getModel();
        if (currentModel === data.js.model) {
            data.js.state = currentState;
        } else if (currentModel === data.css.model) {
            data.css.state = currentState;
        } else if (currentModel === data.html.model) {
            data.html.state = currentState;
        }

        editor.setModel(data[desiredModelId].model);
        editor.restoreViewState(data[desiredModelId].state);
        editor.focus();
    }


    // create the typing side
    var typingContainer = document.createElement('div');
    typingContainer.className = 'typing-container';

    var tabArea = (function () {
        var tabArea = document.createElement('div');
        tabArea.className = 'tab-area';

        var jsTab = document.createElement('span');
        jsTab.className = 'tab active';
        jsTab.appendChild(document.createTextNode('JavaScript'));
        jsTab.onclick = function () {
            changeTab(jsTab, 'js');
        };
        tabArea.appendChild(jsTab);

        var cssTab = document.createElement('span');
        cssTab.className = 'tab';
        cssTab.appendChild(document.createTextNode('CSS'));
        cssTab.onclick = function () {
            changeTab(cssTab, 'css');
        };
        tabArea.appendChild(cssTab);

        var htmlTab = document.createElement('span');
        htmlTab.className = 'tab';
        htmlTab.appendChild(document.createTextNode('HTML'));
        htmlTab.onclick = function () {
            changeTab(htmlTab, 'html');
        };
        tabArea.appendChild(htmlTab);

        var runLabel = 'Press ' + (isMac ? 'CMD + return' : 'CTRL + Enter') + ' to run the code.';
        var runBtn = document.createElement('button');
        runBtn.className = 'action run';
        runBtn.setAttribute('role', 'button');
        runBtn.setAttribute('aria-label', runLabel);
        runBtn.appendChild(document.createTextNode('Run'));
        runBtn.onclick = function () {
            run();
        };
        tabArea.appendChild(runBtn);

        return tabArea;
    })();

    var editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';

    typingContainer.appendChild(tabArea);
    typingContainer.appendChild(editorContainer);

    var runContainer = document.createElement('div');
    runContainer.className = 'run-container';

    var sampleSwitcher = document.getElementById('sample-switcher');
    var sampleChapter;
    PLAY_SAMPLES.forEach(function (sample) {
        if (!sampleChapter || sampleChapter.label !== sample.chapter) {
            sampleChapter = document.createElement('optgroup');
            sampleChapter.label = sample.chapter;
            sampleChapter.label = sample.chapter;
            sampleSwitcher.appendChild(sampleChapter);
        }
        var sampleOption = document.createElement('option');
        sampleOption.value = sample.id;
        sampleOption.appendChild(document.createTextNode(sample.name));
        sampleChapter.appendChild(sampleOption);
    });

    var LOADED_SAMPLES = [];

    function findLoadedSample(sampleId) {
        for (var i = 0; i < LOADED_SAMPLES.length; i++) {
            var sample = LOADED_SAMPLES[i];
            if (sample.id === sampleId) {
                return sample;
            }
        }
        return null;
    }

    function findSamplePath(sampleId) {
        for (var i = 0; i < PLAY_SAMPLES.length; i++) {
            var sample = PLAY_SAMPLES[i];
            if (sample.id === sampleId) {
                return sample.path;
            }
        }
        return null;
    }

    function loadSample(sampleId, callback) {
        var sample = findLoadedSample(sampleId);
        if (sample) {
            return callback(null, sample);
        }

        var samplePath = findSamplePath(sampleId);
        if (!samplePath) {
            return callback(new Error('sample not found'));
        }

        samplePath = 'samples/' + samplePath;

        var js = xhr(samplePath + '/sample.js').then(function (response) {
            return response.responseText
        });
        var css = xhr(samplePath + '/sample.css').then(function (response) {
            return response.responseText
        });
        var html = xhr(samplePath + '/sample.html').then(function (response) {
            return response.responseText
        });
        Promise.all([js, css, html]).then(function (_) {
            var js = _[0];
            var css = _[1];
            var html = _[2];
            LOADED_SAMPLES.push({
                id: sampleId,
                js: js,
                css: css,
                html: html
            });
            return callback(null, findLoadedSample(sampleId));
        }, function (err) {
            callback(err, null);
        });
    }

    sampleSwitcher.onchange = function () {
        var sampleId = sampleSwitcher.options[sampleSwitcher.selectedIndex].value;
        window.location.hash = sampleId;
    };

    var playgroundContainer = document.getElementById('playground');

    layout();
    window.onresize = layout;

    playgroundContainer.appendChild(typingContainer);
    playgroundContainer.appendChild(runContainer);

    data.js.model = monaco.editor.createModel('console.log("wasm-vips is awesome!")', 'javascript');
    data.css.model = monaco.editor.createModel('css', 'css');
    data.html.model = monaco.editor.createModel('html', 'html');

    editor = monaco.editor.create(editorContainer, {
        model: data.js.model,
        minimap: {
            enabled: false
        }
    });

    var currentToken = 0;

    function parseHash(firstTime) {
        var sampleId = window.location.hash.replace(/^#/, '');
        if (!sampleId) {
            sampleId = PLAY_SAMPLES[0].id;
        }

        if (firstTime) {
            for (var i = 0; i < sampleSwitcher.options.length; i++) {
                var opt = sampleSwitcher.options[i];
                if (opt.value === sampleId) {
                    sampleSwitcher.selectedIndex = i;
                    break;
                }
            }
        }

        var myToken = (++currentToken);
        loadSample(sampleId, function (err, sample) {
            if (err) {
                alert('Sample not found! ' + err.message);
                return;
            }
            if (myToken !== currentToken) {
                return;
            }
            data.js.model.setValue(sample.js);
            data.html.model.setValue(sample.html);
            data.css.model.setValue(sample.css);
            editor.setScrollTop(0);
            run();
        });
    }

    window.onhashchange = parseHash;
    parseHash(true);

    function run() {
        doRun(runContainer);
    }

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
    window.addEventListener('keydown', function keyDown(ev) {
        if ((isMac && !ev.metaKey) || !ev.ctrlKey) {
            return;
        }

        if (ev.shiftKey || ev.altKey || ev.keyCode !== 13) {
            return;
        }

        ev.preventDefault();
        run();
    });
}

function doRun(runContainer) {
    var getLang = function (lang) {
        return data[lang].model.getValue();
    };

    if (!runIframe) {
        // Load new iframe
        runIframe = document.createElement('iframe');
        runIframe.id = 'runner';
        runIframe.src = 'playground-runner.html';
        runIframe.className = 'run-iframe';
        runIframe.style.boxSizing = 'border-box';
        runIframe.style.height = '100%';
        runIframe.style.width = '100%';
        runIframe.style.border = '1px solid lightgrey';
        runIframe.frameborder = '0';
        runContainer.appendChild(runIframe);

        window.addEventListener('message', function (e) {
            if (e.source === runIframe.contentWindow) {
                vipsInitialized = true;
                runIframe.contentWindow.postMessage({
                    js: getLang('js'),
                    html: getLang('html'),
                    css: getLang('css')
                });
            }
        });
    } else if (vipsInitialized) {
        runIframe.contentWindow.postMessage({
            js: getLang('js'),
            html: getLang('html'),
            css: getLang('css')
        });
    }
}

function xhr(url) {
    var req = null;
    return new Promise(function (c, e) {
        req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (req._canceled) {
                return;
            }

            if (req.readyState === 4) {
                if ((req.status >= 200 && req.status < 300) || req.status === 1223) {
                    c(req);
                } else {
                    e(req);
                }
                req.onreadystatechange = function () {
                };
            }
        };

        req.open("GET", url, true);
        req.responseType = "";

        req.send(null);
    }, function () {
        req._canceled = true;
        req.abort();
    });
}

window.onload = function () {
    xhr('../lib/vips.d.ts').then(function (response) {
        monaco.languages.typescript.javascriptDefaults.addExtraLib(response.responseText, 'ts:vips.d.ts');
    });

    load();
};
