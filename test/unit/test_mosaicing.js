'use strict';

describe('mosaicing', () => {
    afterEach(function () {
        cleanup();
    });

    it('mosaic', function () {
        // ported from https://github.com/libvips/nip2/tree/master/share/nip2/data/examples/1_point_mosaic

        let mosaiced_image;

        for (let i = 0; i < Helpers.MOSAIC_FILES.length; i += 2) {
            const files = Helpers.MOSAIC_FILES.slice(i, i + 2);
            const marks = Helpers.MOSAIC_MARKS.slice(i, i + 2);

            const im = vips.Image.newFromFile(files[0]);
            const sec_im = vips.Image.newFromFile(files[1]);

            const horizontal_part = im.mosaic(sec_im, vips.Direction.horizontal,
                marks[0][0], marks[0][1], marks[1][0], marks[1][1]);

            if (mosaiced_image) {
                const vertical_marks = Helpers.MOSAIC_VERTICAL_MARKS.slice(i - 2, i);
                mosaiced_image = mosaiced_image.mosaic(horizontal_part, vips.Direction.vertical,
                    vertical_marks[1][0], vertical_marks[1][1],
                    vertical_marks[0][0], vertical_marks[0][1]);
            } else {
                mosaiced_image = horizontal_part;
            }
        }

        mosaiced_image = mosaiced_image.globalbalance();

        // Uncomment to see the output
        //const outBuffer = new Uint8Array(mosaiced_image.writeToBuffer('.jpg'));
        //const blob = new Blob([outBuffer], {type: 'image/jpeg'});
        //const blobURL = URL.createObjectURL(blob);
        //const img = document.createElement('img');
        //img.src = blobURL;
        //document.body.appendChild(img);

        // hard to test much more than this
        expect(mosaiced_image.width).to.equal(1005);
        expect(mosaiced_image.height).to.equal(1295);
        expect(mosaiced_image.interpretation).to.equal('b-w');
        expect(mosaiced_image.format).to.equal('float');
        expect(mosaiced_image.bands).to.equal(1);
    });
});
