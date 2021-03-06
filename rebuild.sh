#!/bin/bash

# enroll 目录路径
enroll_path="/lab/kaldi/egs/sre10/v3/enroll/"
#删除enroll目录下的spk2gender  spk2utt  trials  utt2spk  wav.scp
cd $enroll_path &> /dev/null
echo "Deleting files under enroll folder."
rm -f spk2gender spk2utt trials utt2spk wav.scp vad.scp feats.scp

cd /lab/kaldi/egs/sre10/v3/ &> /dev/null
source enroll.sh
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

