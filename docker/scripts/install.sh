docker volume create reddeploy_config
docker pull ghcr.io/redcrafter07/reddeploy/config
docker run -p 9272:9272 --rm -v /var/run/docker.sock:/var/run/docker.sock -v reddeploy_config:/data --name reddeploy_config ghcr.io/redcrafter07/reddeploy/config