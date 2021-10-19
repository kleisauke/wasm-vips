# wasm-vips playground

A playground for experimenting with wasm-vips. View it online here:  
https://kleisauke.github.io/wasm-vips/playground/

## `{en,de}code-deflate.sh` usage

```bash
$ ./encode-deflate.sh '["console.log(\"wasm-vips is awesome!\");","",""]'
i1ZKzs8rzs9J1cvJT9eIUSpPLM7VLcssKFbILFZILE8tzs9NVYxR0rRW0lECoVgA
$ ./decode-deflate.sh i1ZKzs8rzs9J1cvJT9eIUSpPLM7VLcssKFbILFZILE8tzs9NVYxR0rRW0lECoVgA
["console.log(\"wasm-vips is awesome!\");","",""]
# Visit https://kleisauke.github.io/wasm-vips/playground/?deflate=i1ZKzs8rzs9J1cvJT9eIUSpPLM7VLcssKFbILFZILE8tzs9NVYxR0rRW0lECoVgA
```
