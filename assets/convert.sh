#!/usr/bin/bash

gifs='*.gif'
for gif in $gifs
do
    png=$(echo $gif | sed 's/\.gif$/.png/')
    convert $gif $png
done
