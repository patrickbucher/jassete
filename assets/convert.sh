#!/usr/bin/bash

function gif_to_png() {
    for gif in *.gif
    do
        png=$(echo $gif | sed 's/\.gif$/.png/')
        convert $gif $png
    done
}

function svg_to_png() {
    for svg in *.svg
    do
        png=$(echo $svg | sed 's/\.svg$/.png/')
        convert $svg -transparent white $png
    done
}

if [ "$1" = "gif" ]
then
    gif_to_png
elif [ "$1" = "svg" ]
then
    svg_to_png
fi

