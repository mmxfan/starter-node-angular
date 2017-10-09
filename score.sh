#!/bin/bash

cd /lab/kaldi/egs/sre10/v3/ &> /dev/null
source  test.sh

#获取最高分的spk ID
scsc=`tail -n 1 scores/testResults | cut -d " " -f 3`
spkid=`cat scores/plda_scores_test | grep -e ${scsc} | cut -d " " -f 1`
echo "$spkid = $scsc" > scores/testscorespkid
cd - &> /dev/null
