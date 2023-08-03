docker stop reddeploy-mongo reddeploy-cm reddeploy-web reddeploy-scm reddeploy-proxy
docker rm reddeploy-mongo reddeploy-cm reddeploy-web reddeploy-scm reddeploy-proxy

docker volume prune -f -a

docker network prune -f