#!/bin/bash
# Program:
#       This program slipt pttwebcrawler job.
# History:
# 2015/07/16	VBird	First release
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:~/bin
export PATH
read -p "Please input board name: " bn
read -p "Please input page per json: " n
read -p "Please input begin page index: " bi
read -p "Please input end page index: " ei
loop=$(((($ei - $bi) / $n) + 1))
dir=./ptt-web-crawler/PttWebCrawler
echo "loop: $loop"
echo "begin index: $bi"
echo "end index: $ei"
cd $dir
for((i=0;i<$loop;i++))
do
    ni=$((($bi + $n) - 1))
    if [ "$ni" -gt "$ei" ]
    then
        ni=$ei
    fi
    echo "current page index: $bi to $ni"
    python crawler.py -b $bn -i $bi $ni
    bi=$(($ni + 1))
done
exit 0