git pull

cd packages/

cd config/ && docker build -t reddeploy/config:latest -f Dockerfile.dev . && cd ..
cd container-management/ && docker build -t reddeploy/cm:latest . && cd ..
cd system-container-management/ && docker build -t reddeploy/scm:latest -f Dockerfile.dev . && cd ..
cd web/ && docker build -t reddeploy/web:latest . && cd ..
cd proxy/ && docker build -t reddeploy/proxy:latest . && cd ..

cd ../

echo "All images built successfully"

exit 0