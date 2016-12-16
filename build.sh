#!/usr/bin/env bash

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

echo -e "Meteor app building script\n"
rm -rf out >.logerror 2>&1 || {
        sayfail
        cat ./.logerror
        rm ./.logerror
        exit 1
        }

echo -en "-Building meteor production app\t"
meteor build out >.logerror 2>&1 || {
        sayfail
        cat ./.logerror
        rm ./.logerror
        exit 1
        }
sayok
rm ./.logerror >/dev/null
echo -e "\n\nThe output archive is in the \033[37mout\033[0m folder"
echo -e "[\033[32mSUCCESS\033[0m]"
exit 0