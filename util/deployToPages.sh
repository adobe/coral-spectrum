#!/usr/bin/env sh

# Get out of util folder, create dir locations
cd ..
coralRoot=$PWD

echo -e "\n<root> path: $coralRoot"
pagesLoc="$coralRoot/CoralUI-pages"
echo -e "<gh-pages> path: $pagesLoc"

#create the temporary pages dir
mkdir $pagesLoc
git clone git@git.corp.adobe.com:Coral/CoralUI.git $pagesLoc
cd $pagesLoc
git checkout gh-pages

# Build
echo -e "\nPerforming 'grunt release' in <root>\n"
cd ..
grunt release

echo "Copying <root>/build/* to <gh-pages>/*"
cp -rp build/* $pagesLoc

# rename the zip output as latest
for file in `find ./build | grep cui.*zip`; do
  # match just the file name
  filename=${file##*/}
  # snip the extension off
  nameOnly=${filename%.zip}
  # get rid of cui and we have the release version 
  version=${nameOnly##cui-}
  #replace the version number with 'latest' for guide link
  newName=${filename/[0-9].[0-9].[0-9]/latest}

  echo "Copying <root>/build/$filename to <gh-pages>/releases/$newName"
  cp $file $pagesLoc/releases/$newName
done

echo "Release version parsed is $version"

# move zip files
echo "Moving zip files to upright and locked position"
cd $pagesLoc
mv -v *.zip releases/

# update gh-pages on github
echo "Committing and pushing to git ..."
git add -A
git commit -m "Updated for CoralUI release $version"
git push origin gh-pages

# clean up
echo "Cleaning up <gh-pages> temporary directory"
cd $coralRoot
rm -rf $pagesLoc
echo "Finished release $version successfully!"
