# RedDeploy

RedDeploy - a simple deployment solution for your projects

## NOTICE: This Project is work in progress! It's not ready for use yet!

## This is a monorepo!

This repository contains the following packages:

- **Config** - The config container, ran before installation
- **Updater** - The updater for easy RedDeploy updates
- **Web** - The web interface, including front- and backend
- **Container Management** - The container management container to handle the deployed containers
- **Proxy** - The proxy container, ran on top of Nginx or Nginx Proxy Manager, handles routing for projects
- **System Container Management** - The system container management, or scm, which handles the starting of needed system containers (Web, CM, Proxy, DB)

### As well as...

- **The installation script** - for running the config container
- And many more!
