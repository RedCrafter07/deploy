docker stop reddeploy-mongo reddeploy-cm reddeploy-web reddeploy-scm
docker rm reddeploy-mongo reddeploy-cm reddeploy-web reddeploy-scm

docker volume prune -f

docker network prune -f