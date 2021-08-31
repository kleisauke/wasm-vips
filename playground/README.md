# wasm-vips playground

A playground for experimenting with wasm-vips. View it online here:  
https://kleisauke.github.io/wasm-vips/playground/

## `{en,de}code-gcode.sh` usage

```bash
$ ./encode-gcode.sh '["console.log(\"wasm-vips is awesome!\");","",""]'
H4sIAAAAAAACA4tWSs7PK87PSdXLyU_XiFEqTyzO1S3LLChWyCxWSCxPLc7PTVWMUdK0VtJRAqFYLgDf5n3-MgAAAA
$ ./decode-gcode.sh H4sIAAAAAAACA4tWSs7PK87PSdXLyU_XiFEqTyzO1S3LLChWyCxWSCxPLc7PTVWMUdK0VtJRAqFYLgDf5n3-MgAAAA
["console.log(\"wasm-vips is awesome!\");","",""]
# Visit https://kleisauke.github.io/wasm-vips/playground/?gcode=H4sIAAAAAAACA4tWSs7PK87PSdXLyU_XiFEqTyzO1S3LLChWyCxWSCxPLc7PTVWMUdK0VtJRAqFYLgDf5n3-MgAAAA
```
