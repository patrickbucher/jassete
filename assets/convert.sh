#!/usr/bin/bash

for gif in *.gif
do
    png=$(echo $gif | sed 's/\.gif$/.png/')
    convert $gif $png
done

for svg in *.svg
do
    png=$(echo $gif | sed 's/\.svg$/.png/')
    convert $svg -resize 250x -transparent white $png
done

