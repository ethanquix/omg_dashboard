#!/usr/bin/env bash

nohup="false"

export RETHINK_URL=''
export MONGO_URL=''
export PORT=''
export ROOT_URL=''

sayok () {
echo -e "[\033[32mok\033[0m]";
}

sayfail () {
echo -e "[\033[31mfail\033[0m]";
}

# Test if we can store error in .logerror file
touch .logerror 2>&1 || {
        sayfail
        echo "Can't create .logerror"
        exit 1
      }
rm ./.logerror >/dev/null

clear

echo -en "\nCreation of server folder\t" >.logerror 2>&1 || {
        sayfail
        cat ./.logerror
        rm ./.logerror
        exit 1
        }
sayok

echo -en "\nCreation of prod folder\t"
mkdir prod >.logerror 2>&1 || {
        sayfail
        cat ./.logerror
        rm ./.logerror
        exit 1
        }
sayok

echo -en "\nExtracting archive to prod\t"
tar -xvf out/omg_dashboard.tar.gz -C prod/ >.logerror 2>&1 || {
        sayfail
        cat ./.logerror
        rm ./.logerror
        exit 1
        }
sayok

mv prod/bundle/* prod/
rm -rf prod/bundle

echo -en "\nNPM Install (can take some time\t"
npm install prod/programs/server
sayok

echo -en "\nThere is a bug with fibers need to install them globally and then copy to node_modules\t"
npm install fibers@1.0.15 >.logerror 2>&1 || {
        sayfail
        cat ./.logerror
        rm ./.logerror
        exit 1
        }
sayok

cp /usr/lib/node_modules/fibers/ prod/programs/server/node_modules/fibers -r

if [ ${nohup} = "true" ]
then
    echo -en "\nLaunching app\t"
    meteor node prod/main.js >.logerror 2>&1 || {
        sayfail
        cat ./.logerror
        rm ./.logerror
        exit 1
        }
sayok
else
    echo -e "\nLaunch with nohup"
    nohup meteor node prod/main.js 2>&1 out.log
fi
exit 0