clear 
printf "\n\n🥝 🥝 🥝 🥝 🥝 🥝\n"
printf "🦄 --- You are currently in this folder: \n🦄 ---> $(pwd) \n\n"
printf "🍊 --- What is the path to the root folder that ./src/components? \n🍊 ---> e.g. ./frontend"
printf "\n🥝 🥝 🥝 🥝 🥝 🥝\n\n"
varRoot=./
read varRoot
echo Opening the directory: $varRoot 

#
# @description change to dir 
# @tutorial https://stackoverflow.com/questions/3349105/how-to-set-current-working-directory-to-the-directory-of-the-script 
#
cd $varRoot
ls 
pwd 


#
# @name docker-compose
# @description docker-compose file that contains basic frontend, backend and postgres DB
#
wget https://gist.githubusercontent.com/Domnom/f0f0b54130bac3836ba8fc8f2baf7838/raw/741c5a19ab70aba4b2d543e17108da2f8756d91d/docker-compose.yml --output-document=docker-compose.yml