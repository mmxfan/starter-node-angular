#!/bin/bash

# wavfile路径
# wavfile_path="/lab/kaldi/egs/sre10/v3/enroll/wavfile.txt"
# #spk序号
# spk_index=`tail -n1 "$wavfile_path" | cut -f1 -d ' ' | cut -c4-8`
# #序号增加1
# spk_index=`expr $spk_index + 1`
# #序号补零至5位
# spk_index=`printf "%05d\n" $spk_index`
# spk_num="spk"$spk_index
# #输出行内容
# line_output=$spk_num" "$2" "$3" A"
# echo $line_output >> $wavfile_path
if [ -f $1 ]; then
    du -h $1 | cut -f1
	
else
	echo "$0 received: $1"
fi

# enroll_file_path="/lab/kaldi/egs/sre10/v3/enroll.sh"
# source $enroll_file_path