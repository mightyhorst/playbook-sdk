#!/bin/bash 
clear 
printf "\n\n🥝🥝🥝\n"
printf "🥝 You are currently in this folder: \n $(pwd) \n"
printf "🥝 What is the path to the root folder that ./src/components? e.g. ./frontend"
printf "\n🥝🥝🥝\n\n"
varRoot=./
read varRoot
echo Opening the directory: $varRoot 

#
# @name Sxd Folder
# @description Fodler to scaffolders
#
# COMPONENT_SXD_FOLDER="$(pwd)/components"
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
COMPONENT_SXD_FOLDER="$CURRENT_DIR/components"



#
# @description change to dir 
# @tutorial https://stackoverflow.com/questions/3349105/how-to-set-current-working-directory-to-the-directory-of-the-script 
#
cd $varRoot/src/components
pwd 
ls 



#
# @name Folder
# @description create component folder  
#
printf "\n\n🍋🍋🍋\n"
printf "What name of the component? e.g. Cards --> /cards/Card.component.tsx"
printf "\n🍋🍋🍋\n\n"
txtComponentName=""
read txtComponentName
txtComponentFileName=$(echo $txtComponentName | tr 'A-Z' 'a-z')

#
# @name Create Folder
# @description create component folder  
#
echo "Creating folder: $txtComponentFileName" 
rm -r $txtComponentFileName 2>/dev/null 
mkdir $txtComponentFileName
cd $txtComponentFileName
pwd 


#
# @name Sxd Component
# @description Scaffold the component
#       look for {txtComponentName} in the file and replace with the component name 
# @usage 
#    sed "s/FIND/REPLACE/g" INPUT_FILE > OUTPUTFILE
COMPONENT_SXD_FILE=$COMPONENT_SXD_FOLDER/component.tsx.template
sed "s/{txtComponentName}/$txtComponentName/g" $COMPONENT_SXD_FILE > $txtComponentName.component.tsx



#
# @name Sxd BDD
# @description Scaffold the BDD
#       look for {txtComponentName} in the file and replace with the component name 
#
BDD_SXD_FILE=$COMPONENT_SXD_FOLDER/component.bdd.tsx.template
sed "s/{txtComponentName}/$txtComponentName/g" $BDD_SXD_FILE > $txtComponentName.bdd.tsx





#
# @name Sxd container
# @description Scaffold the container
#       look for {txtComponentName} in the file and replace with the component name 
#
CONTAINER_SXD_FILE=$COMPONENT_SXD_FOLDER/component.container.tsx.template
sed "s/{txtComponentName}/$txtComponentName/g" $CONTAINER_SXD_FILE > $txtComponentName.container.tsx





#
# @name Sxd playbook
# @description Scaffold the playbook
#       look for {txtComponentName} in the file and replace with the component name 
#
PLAYBOOK_SXD_FILE=$COMPONENT_SXD_FOLDER/component.playbook.mdx.template
sed "s/{txtComponentName}/$txtComponentName/g" $PLAYBOOK_SXD_FILE > $txtComponentName.playbook.mdx



#
# @name Sxd Redux
# @description Scaffold the Redux
#       look for {txtComponentName} in the file and replace with the component name 
#
REDUX_SXD_FILE=$COMPONENT_SXD_FOLDER/component.redux.tsx.template
sed "s/{txtComponentName}/$txtComponentName/g" $REDUX_SXD_FILE > $txtComponentName.redux.tsx





#
# @name Sxd Stories
# @description Scaffold the Stories
#       look for {txtComponentName} in the file and replace with the component name 
#
STORIES_SXD_FILE=$COMPONENT_SXD_FOLDER/component.stories.tsx.template
sed "s/{txtComponentName}/$txtComponentName/g" $STORIES_SXD_FILE > $txtComponentName.stories.tsx





#
# @name Sxd Styles
# @description Scaffold the Styles
#       look for {txtComponentName} in the file and replace with the component name 
#
STYLES_SXD_FILE=$COMPONENT_SXD_FOLDER/component.styles.tsx.template
sed "s/{txtComponentName}/$txtComponentName/g" $STYLES_SXD_FILE > $txtComponentName.styles.tsx





#
# @name Sxd Unit Test
# @description Scaffold the Unit Test
#       look for {txtComponentName} in the file and replace with the component name 
#
TEST_SXD_FILE=$COMPONENT_SXD_FOLDER/component.test.tsx.template
sed "s/{txtComponentName}/$txtComponentName/g" $TEST_SXD_FILE > $txtComponentName.test.tsx






#
# @name 
# @description 
#



#
# @name 
# @description 
#
