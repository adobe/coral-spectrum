#!/usr/bin/env sh

pagesLoc="../CoralUI-pages"

# Get out of util folder
cd ..

# Build
echo "Performing release build..."
grunt release

echo "Copying build files..."
cp -rp build/* $pagesLoc

# Copy zip files as latest
for file in `find ./build/ | grep cui.*zip`; do
  filename=$(basename "$fullfile")
  
	newName=${filename/[0-9].[0-9].[0-9]/latest}
	echo "Copying $file to releases/$newName..."
	cp $file $pagesLoc/releases/$newName
done

# Get into the pages folder
cd $pagesLoc

# Move zip files
echo "Moving zip files to release/..."
mv *.zip releases/

echo "Committing and pushing to git..."
git add -A
git commit -m "Updated CUI"
git push origin gh-pages

cd $cwd
