data="$1"

# Encode the data as a compressed base64 encoded string
encoded=$(echo "$data" | gzip -9 | base64 -w0)

# Change letters around so payload can be put in a url
encoded=${encoded//+/-}
encoded=${encoded////_}

# Padding is not needed
encoded=${encoded//=}

# Print the encoded string
echo "$encoded"
