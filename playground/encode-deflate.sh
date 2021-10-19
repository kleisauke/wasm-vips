#!/usr/bin/env bash

data="$1"

# Encode the data as a Deflate-compressed base64 encoded string
encoded=$(echo "$data" | gzip --no-name --best | tail --bytes=+11 | head --bytes=-8 | base64 -w0)

# Change letters around so payload can be put in a url
encoded=${encoded//+/-}
encoded=${encoded////_}

# Padding is not needed
encoded=${encoded//=}

# Print the encoded string
echo "$encoded"
