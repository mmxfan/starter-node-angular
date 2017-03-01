#!/bin/bash

# wavfile="speech.wav"
if [ -f $1 ]; then
    du -h $1 | cut -f1
else
	echo "$0 received: $1"
fi
