rm -rf *
wget --no-check-certificate https://github.com/justinrporter/snhc-web/archive/master.zip
unzip master
rm -r master
mv snhc-web-master/app/* .
mv snhc-web-master/update.sh .
