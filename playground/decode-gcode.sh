encoded="$1"

# Restore - and _ to + and /
encoded=${encoded//-/+}
encoded=${encoded//_//}

# Add padding if necessary
encoded="$encoded==="
encoded=${encoded:0:${#encoded}&-4}

# Decode the base64 encoded compressed data
data=$(echo "$encoded" | base64 -d | gunzip -c)

# Print the decoded data
echo "$data"
