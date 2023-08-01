# RedDeploy

RedDeploy - a simple deployment solution for your projects

## This is a monorepo!

This repository contains the following packages:

- **Config** - The config container, ran before installation
- **Web** - The web interface, including front- and backend
- **Container Management** - The container management container to handle the deployed containers
- **Proxy** - The proxy container, ran on top of Nginx, handles routing for projects
- **Updater** - The updater for easy RedDeploy updates

### As well as...

- **The docker compose file** - ran by the config container to start the other containers
- **The installation script** - for running the config container
- And many more!
