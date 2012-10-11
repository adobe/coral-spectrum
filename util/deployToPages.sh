#!/usr/bin/env sh

pagesLoc="../../CoralUI-pages"

cwd=`pwd`

# Build
echo "Performing release build..."
grunt release

echo "Copying build files..."
cp -rp build/* $pagesLoc

cd $pagesLoc

# Copy zip files as latest
for file in `find . | grep cui.*zip`; do
	newName=${file/[0-9].[0-9].[0-9]/latest}
	echo "Copying $file to releases/$newName..."
	cp $file releases/$newName
done

# Move zip files
echo "Moving zip files to release/..."
mv *.zip releases/

echo "Committing and pushing to git..."
git add -A
git commit -m "Updated CUI"
git push origin gh-pages

cd $cwd
