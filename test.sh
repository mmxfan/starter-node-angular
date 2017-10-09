#!/bin/bash
. cmd.sh
. path.sh
set -e
testdir=test
mfccdir=`pwd`/mfcc
vaddir=`pwd`/mfcc
##train_cmd="run.pl --mem 4G"
#wavlist file name: wavfile.txt
#format example:
#spkid gender wavfilename
#1001 m fn01.wav A
#1002 f fn02.wav A
#...
inputfn=wavfile.txt
stage=0
#prepare the wav/gender/spk/utt scp file for enroll
if [ $stage -lt 1 ]; then
    if [ -f $testdir/$inputfn ]; then
        perl -e '
        use File::Basename;
        ($db_base, $fn)=@ARGV;
        $out_dir = $db_base;
        open(WAVLIST, "<", "$db_base/$fn") or die "cannot open wav list";
        open(GNDR,">", "$out_dir/spk2gender") or die "Could not open the output file $out_dir/spk2gender";
        open(SPKR,">", "$out_dir/utt2spk") or die "Could not open the output file $out_dir/utt2spk";
        open(WAV,">", "$out_dir/wav.scp") or die "Could not open the output file $out_dir/wav.scp";
        open(TRIALS,">", "$out_dir/trials") or die "Could not open the output file $out_dir/trails";
        %spk2gender = ();
        %utt2spk = ();
        while(<WAVLIST>) {
          chomp;
          $sph = $_;
          ($spkr, $gender, $wav, $side) = split(" ", $sph);
          $raw_basename = $wav;
          $raw_basename =~ s/\.wav$// || die "bad basename $raw_basename";
          $spkr = $spkr . "-" . $gender;
          $uttId = $spkr . "-" . $raw_basename . "_" . $side; # prefix spkr-id to utt-id to ensure sorted order.
          $utt2spk{$uttId} = $spkr;
          print WAV "$uttId /lab/nodejs/starter-node-angular/wav/$wav\n";
          print SPKR "$uttId $spkr\n";
          if ( not exists($spk2gender{$spkr}) ) { 
            $spk2gender{$spkr} = $gender;
            print GNDR "$spkr $gender\n";
            }
        }
        foreach my $spkr ( keys %spk2gender ){
            # while( ($uttId, $spkru) = each %utt2spk ){
            #    if ( $spkru eq $spkr ) {
            #    #    print TRIALS $spkr . " " .$spkru. " " .  $uttId . " " . "Target\n"
			#		print TRIALS "test " .$spkru. " " .  $uttId . " " . "Target\n"
            #    }
            #    else {
            #    #    print TRIALS $spkr . " " .$spkru. " " .  $uttId . " " . "NonTarget\n"
            #    }
			#}
			print TRIALS "test " .$spkru. " " . "\n"
        }
        close(GNDR) || die;
        close(SPKR) || die;
        close(WAV) || die;
        close(TRIALS) || die;
        close(WAVLIST) || die;
        if (system(
          "utils/utt2spk_to_spk2utt.pl $out_dir/utt2spk >$out_dir/spk2utt") != 0) {
          die "Error creating spk2utt file in directory $out_dir";
        }
        system("utils/fix_data_dir.sh $out_dir");
        if (system("utils/validate_data_dir.sh --no-text --no-feats $out_dir") != 0) {
          die "Error validating directory $out_dir";
        }
        ' $testdir $inputfn || exit 1;
    fi
fi
#compute mfcc and vad
if [ $stage -lt 2 ]; then
steps/make_mfcc.sh --mfcc-config conf/mfcc.conf --nj 1 --cmd "$train_cmd" \
  $testdir exp/make_mfcc $mfccdir
utils/fix_data_dir.sh $testdir
sid/compute_vad_decision.sh --nj 1 --cmd "$train_cmd" \
  $testdir exp/make_vad $vaddir
utils/fix_data_dir.sh $testdir
fi
plda_ivec_dir=plda
scores_dir=scores
enroll_ivec_dir=exp/ivectors_enroll
test_ivec_dir=exp/ivectors_test
trials=$testdir/trials
# Extract i-vectors using full.ie.
if [ $stage -lt 3 ]; then
sid/extract_ivectors01.sh --nj 1 --cmd "$train_cmd -l mem_free=6G,ram_free=6G" \
  $plda_ivec_dir $testdir $test_ivec_dir
fi
# Create a gender independent PLDA model and do scoring.
if [ $stage -lt 4 ]; then
for f in ${plda_ivec_dir}/mean.vec ${plda_ivec_dir}/plda ; do
    [ ! -f $f ] && echo "No such file $f" && exit 1;
  done
mkdir -p $scores_dir/log
run.pl $scores_dir/log/plda_scoring_test.log \
   ivector-plda-scoring --normalize-length=true \
   --num-utts=ark:${enroll_ivec_dir}/num_utts.ark \
   "ivector-copy-plda --smoothing=0.0 ${plda_ivec_dir}/plda - |" \
   "ark:ivector-subtract-global-mean ${plda_ivec_dir}/mean.vec scp:${enroll_ivec_dir}/spk_ivector.scp ark:- | ivector-normalize-length ark:- ark:- |" \
   "ark:ivector-normalize-length scp:${test_ivec_dir}/spk_ivector.scp ark:- | ivector-subtract-global-mean ${plda_ivec_dir}/mean.vec ark:- ark:- | ivector-normalize-length ark:- ark:- |" \
   "cat '$trials' | cut -d\  --fields=1,2 |" $scores_dir/plda_scores_test || exit 1;    
fi
if [ $stage -lt 5 ]; then
echo target scores:
cat scores/plda_scores_test | awk '$1==$2' | awk 'BEGIN {min=99999}{if ($3+0 < min+0) min=$3} END {print "min: ", min}'
cat scores/plda_scores_test | awk '$1==$2' | awk 'BEGIN {max=-99999}{if ($3+0 > max+0) max=$3} END {print "max: ", max}'
echo nontarget scores:
cat scores/plda_scores_test | awk '$1!=$2' | awk 'BEGIN {min=99999}{if ($3+0 < min+0) min=$3} END {print "min: ", min}'
cat scores/plda_scores_test | awk '$1!=$2' | awk 'BEGIN {max=-99999}{if ($3+0 > max+0) max=$3} END {print "max: ", max}'
fi