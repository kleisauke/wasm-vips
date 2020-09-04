'use strict';

const Chai = require('chai');
const Mocha = require('mocha');

const Helpers = require('./helpers');
const Vips = require('../../lib/node/vips.js');

global.assert = Chai.assert;
global.expect = Chai.expect;
global.Helpers = Helpers;

// Monkey-patch run method
const run = Mocha.prototype.run;

Mocha.prototype.run = function (done) {
    const self = this;

    const options = {
        preRun: (module) => {
            module['EMBIND_AUTOMATIC_DELETELATER'] = true;
            module.setDelayFunction(fn => global.cleanup = fn);

            // Handy for debugging
            // module.ENV.G_MESSAGES_DEBUG = 'VIPS';

            // Hide warning messages
            module.ENV.VIPS_WARNING = '0';
        }
    };

    // Create a vips instance before the actual run()
    Vips(options).then(instance => {
        global.vips = instance;

        // Call the actual run()
        run.call(self, function () {
            // All tests have been completed with a result code
            done.apply(this, arguments);

            // We need to call exit by ourselves.
            // TODO(kleisauke): This is very awkward, can we remove this requirement for Node?
            vips._exit(0);
        });
    });
};
