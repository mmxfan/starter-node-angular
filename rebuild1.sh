#!/bin/bash

cd /lab/kaldi/egs/sre10/v3/ &> /dev/null

#enroll部分现有模型的个数
f1=`wc -l enroll/spk2utt | cut -f1 -d " "`
#test部分现有trial的个数
f2=`wc -l test/trials | cut -f1 -d " "`

if [ $f1 -gt $f2 ]
then
	numf=`expr $f1 - $f2`
	utt=(`tail -n ${numf} enroll/spk2utt | cut -f1 -d ' '`)

	for i in ${utt[@]}
	do 
		echo "$i spk0test-m" >> test/trials""
	done
fi
cd - &> /dev/null

