set -e

pwd

cd /home/arkits/software/chaddi-discord/stage

yarn

pm2 restart "chaddi-discord"

# pm2 start --name "chaddi-discord" npm -- start