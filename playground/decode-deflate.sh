#!/usr/bin/env bash

encoded="$1"

# Restore - and _ to + and /
encoded=${encoded//-/+}
encoded=${encoded//_//}

# Add padding if necessary
encoded="$encoded==="
encoded=${encoded:0:${#encoded}&-4}

# Decode the base64 encoded Deflate-compressed data
data=$(printf "\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\x00" | cat - <(echo "$encoded" | base64 -d) | gzip -dc 2>/dev/null)

# Print the decoded data
echo "$data"
